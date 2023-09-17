import { Client } from '@libsql/client';
import { getLibsqlClient, insertRow } from '../db/conn';
import { registerForm } from '../forms/auth';
import { RequestHandler } from '../router';
import { JSONError } from '../utils/Response';
import { validateFormData } from '../utils/helpers';
import { compareSync, hashSync } from 'bcryptjs';

export const register: RequestHandler = async ({ request, env, res, token }) => {
	const data = await validateFormData(request, registerForm);
	if (data.password !== data.confirm_password) {
		throw new JSONError('Passwords did not match');
	}

	const db = getLibsqlClient(env);

	const { rows } = await db.execute('SELECT * FROM `users` LIMIT 1');
	if (rows.length > 0) {
		res.error('Adding user is blocked!');
	}

	delete data.confirm_password;
	data.password = hashSync(data.password, 12);
	data.role = 'admin';

	const { lastInsertRowid } = await insertRow(db, 'users', data);
	data.id = lastInsertRowid?.toString();
	res.setRows([data]);
	res.setMsg('Registration successful!');
	const newToken = await addSession(db, data, token);
	res.setData({ token: newToken });
};

async function addSession(db: Client, user: Record<string, any>, oldToken?: string): Promise<string> {
	let token: string;
	let exists: boolean = true;
	let maxTry = 5;
	do {
		token = user.id + crypto.getRandomValues(new Int32Array(16)).reduce((prev, num) => prev + num.toString(36), '');
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

	if (oldToken) {
		operations.push(
			db.execute({
				sql: 'DELETE FROM `sessions` WHERE token = ?',
				args: [oldToken],
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
	return token;
}

export const login: RequestHandler = async ({ request, res, token, env }) => {
	const body = await request.formData();
	const email = body.get('email');
	const pass = body.get('password');
	const db = getLibsqlClient(env);
	const {
		rows: [user],
	} = await db.execute({
		sql: 'SELECT * FROM `users` WHERE email = ? LIMIT 1',
		args: [email],
	});
	if (!user || !pass || !compareSync(pass, user.password!.toString())) {
		res.error('Invalid email or password!');
	}

	const newToken = await addSession(db, user, token);
	res.setMsg('Login successful!');
	res.setData({ token: newToken });
};

export const logOut: RequestHandler = async ({ res, env, token }) => {
	if (!token) {
		res.error('Not logged in!');
	}
	const db = getLibsqlClient(env);
	await db.execute({
		sql: 'DELETE FROM `sessions` WHERE token = ?',
		args: [token!],
	});
	res.setMsg('Logged out successfully!');
};

export const getUser: RequestHandler = async ({ res, user }) => {
	if (!user) {
		res.setMsg('Not logged in!');
		return;
	}
	res.setRows([user]);
};
