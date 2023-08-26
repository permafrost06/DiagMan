import { z } from 'zod';
import { getLibsqlClient } from '../db/conn';
import { Env } from '../worker';

const testSchema = z.object({
	name: z.string().nonempty(),
	price: z.preprocess((val: any) => parseInt(val), z.number().min(0)),
	size: z.enum(['small', 'medium', 'large', 'complex']),
});

export const addTest = async (req: Request, env: Env) => {
	const fd = await req.formData();
	const data: Record<string, any> = {};
	let success = true;
	const body: Record<string, any> = {};

	fd.forEach((value, key) => {
		data[key] = value;
	});

	const safeData = testSchema.safeParse(data);
	if (!safeData.success) {
		success = false;
		const fErr = safeData.error.flatten();
		body.fields = fErr.fieldErrors;
		body.message = fErr.formErrors[0];
		return {
			success,
			body,
		};
	}

	const db = getLibsqlClient(env);

	const res = await db.execute({
		sql: 'INSERT INTO `tests` (name, price, size) VALUES (:name, :price, :size)',
		args: safeData.data,
	});
	body.data = {
		id: res.lastInsertRowid?.toString(),
		...safeData.data,
	};
	return {
		success,
		body,
		message: 'Test added successfully!'
	};
};

export const listTests = async (_req: Request, env: Env) => {
	const db = getLibsqlClient(env);
	const res = await db.execute('SELECT * FROM `tests`');
	return {
		success: true,
		body: {
			rows: res.rows,
		},
	};
};
