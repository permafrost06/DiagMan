import { getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { limitOperations, validateFormData, validateObject } from '../utils/helpers';
import { testSchema } from '../forms/test';
import { JSONError } from '../utils/Response';

export const addTest: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, testSchema);

	const db = getLibsqlClient(env);
	if (data.id) {
		await db.execute({
			sql: "UPDATE `tests` SET status='updated' WHERE id=?",
			args: [data.id],
		});
		res.setData({
			updated: data.id,
		});
		delete data.id;
	}
	if (!data.size) {
		data.size = null;
	}
	const qres = await insertRow(db, 'tests', data);

	res.setRows([
		{
			id: qres.lastInsertRowid?.toString(),
			...data,
		},
	]);

	res.setMsg('Test added successfully!');
};

export const listTests: RequestHandler = async ({ env, res, query }) => {
	const db = getLibsqlClient(env);
	const allStatus = ['active', 'updated', 'deleted'] as any[];
	const allTypes = ['cyto', 'histo'] as any[];
	const allSizes = ['small', 'medium', 'large'] as any[];

	const status = allStatus[allStatus.indexOf(query['status'])];
	const type = allTypes[allTypes.indexOf(query['type'])];
	const size = allSizes[allSizes.indexOf(query['size'])];
	const price = parseInt(query['price'] as any);

	let where = "WHERE status='active'";

	if (status) {
		where += ` AND status='${status}'`;
	}

	if (type) {
		where += ` AND type='${type}'`;
	}

	if (size) {
		where += ` AND size='${size}'`;
	}

	if (price > 0) {
		where += ` AND price='${price}'`;
	}

	const qres = await db.execute('SELECT * FROM `tests` ' + where);
	res.setRows(qres.rows);
};

export const deleteTest: RequestHandler = async ({ env, res, id }) => {
	const db = getLibsqlClient(env);
	const { rowsAffected } = await db.execute({
		sql: "UPDATE `tests` SET status='deleted' WHERE id=?",
		args: [id],
	});
	res.setData({
		deleted: rowsAffected,
	});
};

export const syncTests: RequestHandler = async ({ env, res, request }) => {
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
			delete insert[i].id;
			queries.push({
				sql: 'INSERT INTO `tests` (name, price, size, status) VALUES (:name, :price, :size, :status)',
				args: await validateObject(insert[i], testSchema),
			});
		}
	}

	if (body.update) {
		const update = body.update;
		for (const id in update) {
			limitOperations(queries);
			delete update[id].id;
			queries.push({
				sql: "UPDATE `tests` SET status = 'updated' WHERE id = ?",
				args: [id],
			});
			queries.push({
				sql: 'INSERT INTO `tests` (name, price, size, status) VALUES (:name, :price, :size, :status)',
				args: await validateObject(update[id], testSchema),
			});
		}
	}

	if (body.remove) {
		const del = body.remove;
		for (const id of del) {
			limitOperations(queries);
			queries.push({
				sql: "UPDATE `tests` SET status = 'deleted' WHERE id = ?",
				args: [id],
			});
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
