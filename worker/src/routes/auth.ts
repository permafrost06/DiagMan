import { Client } from '@libsql/client';
import { getLibsqlClient, insertRow } from '../db/conn';
import { registerForm } from '../forms/auth';
import { RequestHandler } from '../router';
import { JSONError } from '../utils/Response';
import { validateFormData } from '../utils/helpers';
import { hashSync } from 'bcrypt';

const AUTH_TOOKEN_KEY = '__token_auth';

export const register: RequestHandler = async ({ request, env, res, cookies }) => {
	const data = await validateFormData(request, registerForm);
	if (data.password !== data.confirm_password) {
		throw new JSONError('Passwords did not match');
	}

	delete data.confirm_password;
	data.password = hashSync(data.password, 12);

	const db = getLibsqlClient(env);
	const { lastInsertRowid } = await insertRow(db, 'users', data);
	data.id = lastInsertRowid?.toString();
	res.setRows([data]);
	res.setMsg('Registration successful!');
	await addSession(cookies, request, db, data);
};

async function addSession(cookies: any, req: Request, db: Client, user: Record<string, any>) {
	let token: string;
	let exists: boolean = true;
	let maxTry = 5;
	do {
		token = crypto.getRandomValues(new Int32Array(16)).reduce((prev, num) => prev + num.toString(36), '');
		const { rows } = await db.execute({
			sql: 'SELECT * FROM `sessions` WHERE token=? LIMIT 1',
			args: [token],
		});
		exists = rows.length > 0;
		maxTry--;
	} while (exists && maxTry > 0);

	if (exists && maxTry <= 0) {
		// This should never be executed. But it's here just in case.
		throw new JSONError('Something went wrong! Please try again...', 500);
	}

	const operations: Promise<any>[] = [];

	if (cookies[AUTH_TOOKEN_KEY]) {
		operations.push(
			db.execute({
				sql: 'DELETE FROM `sessions` WHERE token = ?',
				args: [cookies[AUTH_TOOKEN_KEY]],
			})
		);
	}

	operations.push(
		insertRow(db, 'sessions', {
			user_id: user.id,
			token,
		})
	);

	await Promise.all(operations);
	// TODO: Set cookie
}
