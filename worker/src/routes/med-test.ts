import { z } from 'zod';
import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

const testSchema = z.object({
	id: z.preprocess((val: any) => parseInt(val), z.number().min(0)).optional(),
	name: z.string().nonempty(),
	price: z.preprocess((val: any) => parseInt(val), z.number().min(0)),
	size: z.enum(['small', 'medium', 'large', 'complex']),
	status: z.enum(['active', 'updated', 'deleted']).default('active'),
});

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

export const listTests: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const qres = await db.execute('SELECT * FROM `tests` WHERE status="active"');
	res.setRows(qres.rows);
};