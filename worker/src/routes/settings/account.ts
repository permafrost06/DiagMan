import { z } from 'zod';
import { getLibsqlClient } from '../../db/conn';
import { RequestHandler } from '../../router';
import { validateFormData } from '../../utils/helpers';
import { compareSync, hashSync } from 'bcryptjs';

export const changeName: RequestHandler = async ({ request, env, res, user }) => {
	const data = await validateFormData(
		request,
		z.object({
			name: z.string().min(4).max(50),
		})
	);

	const db = getLibsqlClient(env);
	await db.execute({
		sql: 'UPDATE `users` SET name = ? WHERE id = ?',
		args: [data.name, user!.id],
	});

	res.setMsg('Name updated successfully!');
	res.setData(data);
};

export const changePin: RequestHandler = async ({ request, env, res, user }) => {
	const data = await validateFormData(
		request,
		z
			.object({
				'current-pin': z.coerce.string().nonempty(),
				'new-pin': z.coerce.number().min(1000).max(999999),
				confirm: z.coerce.number(),
			})
			.refine((data) => data['current-pin'] == user!.pin || compareSync(data['current-pin'], user!.password), {
				message: 'Current PIN is incorrect!',
			})
			.refine((data) => data['new-pin'] === data.confirm, {
				message: 'Confirm PIN did not match!',
			}) as any
	);

	const db = getLibsqlClient(env);
	await db.execute({
		sql: 'UPDATE `users` SET pin = ? WHERE id = ?',
		args: [data['new-pin'], user!.id],
	});
	res.setMsg('PIN updated successfully!');
	res.setData({ pin: data['new-pin'] });
};

export const changePassword: RequestHandler = async ({ request, env, res, user }) => {
	const data = await validateFormData(
		request,
		z
			.object({
				'current-password': z.string().min(4).max(100),
				'new-password': z.string().min(4).max(100),
				confirm: z.string().min(4).max(100),
			})
			.refine((data) => compareSync(data['current-password'], user!.password), {
				message: 'Current password is incorrect!',
			})
			.refine((data) => data['new-password'] === data.confirm, {
				message: 'Confirm password did not match!',
			}) as any
	);

	const db = getLibsqlClient(env);
	await db.execute({
		sql: 'UPDATE `users` SET password = ? WHERE id = ?',
		args: [hashSync(data['new-password'], 12), user!.id],
	});
	res.setMsg('Password updated successfully!');
};
