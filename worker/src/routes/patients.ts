import { generateInsertQuery, getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { limitOperations, validateFormData, validateObject } from '../utils/helpers';
import { JSONError } from '../utils/Response';
import { patientSchema } from '../forms/patients';

export const addOrUpdatePatient: RequestHandler = async ({ request, env, res, params }) => {
	const data = await validateFormData(request, patientSchema, ['tests']);
	data.tests = JSON.stringify(data.tests);
	const db = getLibsqlClient(env);

	// ZOD does not support only date validation yet
	['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
		data[key] = data[key].getTime();
	});

	const { rows } = await db.execute({
		sql: `
		  SELECT SUM(price) AS total FROM \`tests\` WHERE EXISTS (
			SELECT * 
			FROM json_each(?) 
			WHERE json_each.value = tests.id
		  )
		`,
		args: [data.tests],
	});

	const total = parseInt(rows[0]?.total?.toString() || '0');

	if (total <= 0) {
		res.error('Invalid tests selected!');
	}

	data.total = total;

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
	} catch (error: any) {
		if (error.code === 'SQLITE_CONSTRAINT') {
			throw new JSONError('This patient id already exists!');
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
		where += 'id LIKE CONCAT("%", ?, "%")';
		args.push(id);
	}

	const name = search.get('name');
	if (name && filterSchema.name.test(name)) {
		if (where) {
			where += ' AND ';
		}
		where += 'name LIKE CONCAT("%", ?, "%")';
		args.push(name);
	}

	const type = search.get('type');
	if (type && filterSchema.type.test(type)) {
		if (where) {
			where += ' AND ';
		}
		where += 'type  LIKE CONCAT("%", ?, "%")';
		args.push(type);
	}

	const status = search.get('status');
	if (status && filterSchema.status.test(status)) {
		if (where) {
			where += ' AND ';
		}
		where += 'status LIKE CONCAT("%", ?, "%")';
		args.push(status);
	}

	const all = search.get('all');
	if (all?.trim()) {
		if (where) {
			where += ' AND ';
		}
		where += '(name LIKE CONCAT("%", ?, "%") OR type LIKE CONCAT("%", ?, "%") OR delivery_date LIKE CONCAT("%", ?, "%"))';
		args.push(all);
		args.push(all);
		args.push(all);
	}

	const db = getLibsqlClient(env);
	const qres = await db.execute({
		sql: `
			SELECT *, EXISTS(
				SELECT 1 FROM \`reports\` WHERE id = p.id
			) AS is_reported FROM \`patients\` AS p
			${where ? ' WHERE ' + where : ''}
			ORDER BY ${orderBy} ${order} LIMIT ${limit} OFFSET ${offset}
		`,
		args,
	});

	const { rows: info } = await db.execute({
		sql: `SELECT COUNT(id) AS total FROM \`patients\` ${where ? ' WHERE ' + where : ''}`,
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
		throw new JSONError('Operation limit exceeded!');
	}

	if (body.insert) {
		const insert = body.insert;
		for (let i = 0; i < insert.length; i++) {
			limitOperations(queries);
			const data = await validateObject(insert[i], patientSchema);
			// ZOD does not support only date validation yet
			['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
				data[key] = data[key].substring(0, 10);
			});

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
