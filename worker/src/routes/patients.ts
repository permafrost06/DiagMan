import { generateInsertQuery, getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { limitOperations, validateFormData, validateObject } from '../utils/helpers';
import { patientSchema } from '../forms/patients';
import { Client } from '@libsql/client';

const replaceTestID = async (db: Client, tests: number[], id: number, price: number): Promise<[number, bigint]> => {
	const sql = `
		INSERT INTO \`tests\` (name, price, size, type, status)
		SELECT name, ${price}, size, type, 'active' FROM \`tests\` WHERE id = ${id}
	`;
	const { lastInsertRowid } = await db.execute(sql);
	if (!lastInsertRowid) {
		throw new Error(id.toString());
	}
	const newId = lastInsertRowid;
	tests.push(newId.toString() as any);
	const idx = tests.findIndex((tid) => tid == id);
	if (idx > -1) {
		tests.splice(idx, 1);
	}
	return [id, newId];
};

const updateTestPrices = async (db: Client, tests: number[], prices: Record<number, number>): Promise<[Record<string, any>[], number]> => {
	const { rows } = await db.execute({
		sql: `
		  SELECT * FROM \`tests\` WHERE EXISTS (
			SELECT * 
			FROM json_each(?) 
			WHERE json_each.value = tests.id
		  )
		`,
		args: [JSON.stringify(tests)],
	});

	let total = 0;

	const misMatch: Promise<[number, bigint]>[] = [];

	rows.forEach((test: any, idx: number) => {
		const price = parseInt(test.price);
		const price2 = prices[test.id] * 100;
		total += price2;
		if (price !== price2) {
			misMatch.push(replaceTestID(db, tests, test.id, price2));
			rows[idx] = {
				...rows[idx],
				price: price2,
			};
		}
	});

	const err = (await Promise.allSettled(misMatch)).reduce((prev, cur) => {
		if (cur.status === 'rejected') {
			prev += cur.reason + ', ';
		} else {
			const test = rows.findIndex((t) => t.id == cur.value[0]);
			if (test > -1) {
				rows[test] = {
					...rows[test],
					id: cur.value[1].toString(),
				};
			}
		}
		return prev;
	}, '');

	if (err) {
		throw new Error('Failed to update tests: ' + err);
	}

	return [rows, total];
};

export const addOrUpdatePatient: RequestHandler = async ({ request, env, res, params }) => {
	const data = await validateFormData(request, patientSchema, ['tests'], ['test_price']);
	const db = getLibsqlClient(env);

	// ZOD does not support only date validation yet
	['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
		data[key] = data[key].getTime();
	});

	if (data.complementary) {
		data.total = 0;
		data.advance = 0;
		data.discount = 0;
	} else
		try {
			const [tests, total] = await updateTestPrices(db, data.tests, data.test_price);
			res.setData({ tests });
			data.total = total;
			data.advance *= 100;
			data.discount *= 100;
		} catch (err: any) {
			res.error(err.message);
		}

	delete data.test_price;
	data.tests = JSON.stringify(data.tests);

	try {
		if (!params.id) {
			const { rows } = await db.execute({
				sql: 'SELECT id FROM `patients` WHERE id = ? LIMIT 1',
				args: [data.id],
			});
			if (rows.length > 0) {
				res.error('The ID is already taken!', 422, {
					field: {
						id: ['The ID is already taken!'],
					},
				});
			}

			data.timestamp = Date.now();
			await insertRow(db, 'patients', data);
			res.setMsg('Patient added successfully!');
		} else {
			const { sql, args } = getUpdateQuery('patients', data);
			args.push(decodeURIComponent(params.id));
			await db.execute({
				sql: sql + ' WHERE id = ?',
				args,
			});
			res.setMsg('Patient updated successfully!');
		}
		res.setRows([data]);

		await db.execute({
			sql: `
				INSERT INTO \`misc_strings\` (name, data)
				SELECT 'referer', :data
				WHERE NOT EXISTS(
					SELECT id FROM \`misc_strings\` WHERE name = "referer" AND data = :data
				)
			`,
			args: {
				data: data.referer.trim(),
			},
		});
	} catch (error: any) {
		if (error.code === 'SQLITE_CONSTRAINT') {
			res.error('This patient id already exists!');
		} else {
			throw error;
		}
	}
};

export const listPatients: RequestHandler = async ({ env, res, url }) => {
	const limit = 10;
	const search = new URL(url).searchParams;
	const filterSchema = {
		id: /^([a-zA-Z0-9\s,_-]+)$/,
		name: /^([a-zA-Z0-9\s_]+)$/,
		type: /^([a-zA-Z0-9\s_]+)$/,
		delivery_date: /^([0-9\s/-]+)$/,
		status: /^([a-zA-Z0-9\s_]+)$/,
	};

	let page = parseInt(search.get('page') || '1');
	if (page < 1) {
		page = 1;
	}
	const offset = (page - 1) * limit;
	let orderBy = search.get('order_by') || 'id';
	// @ts-ignore
	if (!filterSchema[orderBy]) {
		orderBy = 'id';
	}
	let order = search.get('order') || 'desc';
	if (order !== 'desc' && order !== 'asc') {
		order = 'desc';
	}

	let where = '';
	const args: any[] = [];

	const id = search.get('id');
	if (id && filterSchema.id.test(id)) {
		where += ' AND p.id LIKE CONCAT("%", ?, "%")';
		args.push(id);
	}

	const name = search.get('name');
	if (name && filterSchema.name.test(name)) {
		where += ' AND p.name LIKE CONCAT("%", ?, "%")';
		args.push(name);
	}

	const type = search.get('type');
	if (type && filterSchema.type.test(type)) {
		where += ' AND p.type LIKE CONCAT("%", ?, "%")';
		args.push(type);
	}

	const status = search.get('status');
	if (status && filterSchema.status.test(status)) {
		where += ' AND p.status LIKE CONCAT("%", ?, "%")';
		args.push(status);
	}

	if (search.get('delivered') != '1') {
		where += ' AND p.status != "delivered"';
	}

	const all = search.get('all');
	if (all?.trim()) {
		where += ' AND (p.id LIKE CONCAT("%", ?, "%") OR p.name LIKE CONCAT("%", ?, "%") OR p.type LIKE CONCAT("%", ?, "%"))';
		args.push(all);
		args.push(all);
		args.push(all);
	}
	if (where) {
		where = 'WHERE ' + where.substring(5);
	}

	const db = getLibsqlClient(env);
	const qres = await db.execute({
		sql: `
			SELECT p.*, r.id AS is_reported, r.locked FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id
			${where}
			ORDER BY p.${orderBy} ${order} LIMIT ${limit} OFFSET ${offset}
		`,
		args,
	});

	const { rows: info } = await db.execute({
		sql: `SELECT COUNT(id) AS total FROM \`patients\` AS p ${where}`,
		args,
	});
	res.setRows(qres.rows);
	res.pageParams(page, info[0].total || (0 as any), limit);
};

export const getPatient: RequestHandler = async ({ env, res, params }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: 'SELECT * FROM `patients` WHERE id = ? LIMIT 1',
		args: [decodeURIComponent(params.id)],
	});

	if (rows.length === 0) {
		res.error('The patient does not exist!', 404);
	}

	const { rows: tests } = await db.execute({
		sql: `
		  SELECT * FROM \`tests\` WHERE EXISTS (
			SELECT * 
			FROM json_each(?) 
			WHERE json_each.value = tests.id
		  )
		`,
		args: [rows[0].tests],
	});

	res.setRows([{ ...rows[0], tests }]);
};

export const syncPatients: RequestHandler = async ({ env, res, request }) => {
	const body = (await request.json()) as any;
	const queries: any[] = [];

	const total = (body.insert?.length || 0) + (body.update?.length || 0) + (body.remove?.length || 0);

	if (total > 100) {
		res.error('Operation limit exceeded!');
	}

	if (body.insert) {
		const insert = body.insert;
		for (let i = 0; i < insert.length; i++) {
			limitOperations(queries);
			const data = await validateObject(insert[i], patientSchema);

			data.advance *= 100;
			data.discount *= 100;

			queries.push(generateInsertQuery('patients', data));
		}
	}

	if (queries.length === 0) {
		res.setMsg('No operation to perform!');
		return;
	}

	const db = getLibsqlClient(env);
	await db.batch(queries, 'deferred');
	res.setMsg(`${queries.length} operations performed in the tests table!`);
};

export const deletePatient: RequestHandler = async ({ env, res, params }) => {
	const db = getLibsqlClient(env);
	const { rowsAffected } = await db.execute({
		sql: 'DELETE FROM `patients` WHERE id=?',
		args: [decodeURIComponent(params.id)],
	});
	res.setData({
		deleted: rowsAffected,
	});
};
