import { hashSync } from 'bcryptjs';
import { getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { userForm, userUpdateForm } from '../forms/users';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

export const addUser: RequestHandler = async ({ env, request, res }) => {
	const data = await validateFormData(request, userForm);
	const db = getLibsqlClient(env);

	const { rows } = await db.execute({
		sql: 'SELECT * FROM `users` WHERE email = ? LIMIT 1',
		args: [data.email],
	});

	if (rows.length > 0) {
		res.error('This email is already taken!');
	}

	data.password = hashSync(data.password, 12);

	const { lastInsertRowid } = await insertRow(db, 'users', data);
	data.id = lastInsertRowid?.toString();
	res.setRows([data]);
	res.setMsg('User added successfully!');
};

export const updateUser: RequestHandler = async ({ env, request, res }) => {
	const data = await validateFormData(request, userUpdateForm);
	const db = getLibsqlClient(env);

	const { rows } = await db.execute({
		sql: 'SELECT * FROM `users` WHERE email = ? AND id != ? LIMIT 1',
		args: [data.email, data.id],
	});

	if (rows.length > 0) {
		res.error('This email is already taken!');
	}

	if (data.password) {
		data.password = hashSync(data.password, 12);
	} else if (typeof data.password !== 'undefined') {
		delete data.password;
	}

	const { sql, args } = getUpdateQuery('users', data);
	args.push(data.id);

	await db.execute({
		sql: sql + ' WHERE id=?',
		args,
	});
	res.setRows([data]);
	res.setMsg('User updated successfully!');
};

export const deleteUser: RequestHandler = async ({ env, res, params }) => {
	const db = getLibsqlClient(env);
	const { rowsAffected } = await db.execute({
		sql: 'DELETE FROM `users` WHERE id=?',
		args: [params.id],
	});
	res.setMsg('User deleted successfully!');
	res.setData({
		deleted: rowsAffected,
	});
};

export const getUsers: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute('SELECT * FROM `users`');
	res.setRows(rows);
};
