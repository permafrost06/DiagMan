import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';
import { testSchema } from '../forms/test';

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
	const qres = await db.execute({
		sql: 'INSERT INTO `tests` (name, price, size, status) VALUES (:name, :price, :size, :status)',
		args: data,
	});

	res.setRows([
		{
			id: qres.lastInsertRowid?.toString(),
			...data,
		},
	]);
};

export const listTests: RequestHandler = async ({ env, res, query }) => {
	const db = getLibsqlClient(env);
	const allStatus = ['active', 'updated', 'deleted'] as any[];

	const status = allStatus[allStatus.indexOf(query['status'])];

	let where = '';

	if (status) {
		where += `WHERE status='${status}'`;
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
