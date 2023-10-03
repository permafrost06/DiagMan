import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';

export const assignToken: RequestHandler = (event) => {
	const authToken = event.request.headers.get('Authorization')?.substring(7);
	if (!authToken) {
		return;
	}
	event.token = authToken;
};

export const assignUser: RequestHandler = async (event) => {
	if (!event.token) {
		return;
	}
	const db = getLibsqlClient(event.env);
	const { rows } = await db.execute({
		sql: 'SELECT u.* FROM `sessions` AS s INNER JOIN `users` AS u ON u.id = s.user_id WHERE s.token = ? LIMIT 1',
		args: [event.token],
	});

	if (rows.length > 0) {
		event.user = rows[0] as any;
	}
};

export const ensureAdmin: RequestHandler = async (event) => {
	await assignUser(event);
	if (!event.user || event.user.role !== 'admin') {
		event.res.error('You are not authorized to perform this operation!', 401);
	}
};
