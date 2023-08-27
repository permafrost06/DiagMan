import { z } from 'zod';
import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

const testSchema = z.object({
	name: z.string().nonempty(),
	price: z.preprocess((val: any) => parseInt(val), z.number().min(0)),
	size: z.enum(['small', 'medium', 'large', 'complex']),
});

export const addTest: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, testSchema);

	const db = getLibsqlClient(env);

	const qres = await db.execute({
		sql: 'INSERT INTO `tests` (name, price, size) VALUES (:name, :price, :size)',
		args: data,
	});
	res.setData({
		id: qres.lastInsertRowid?.toString(),
		...data,
	});
};

export const listTests: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const qres = await db.execute('SELECT * FROM `tests`');
	res.setRows(qres.rows);
};
