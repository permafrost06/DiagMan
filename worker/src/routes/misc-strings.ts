import { z } from 'zod';
import { getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { miscStringSchema } from '../forms/others';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

export const listMiscStrings: RequestHandler = async ({ env, res, query }) => {
	const db = getLibsqlClient(env);

	const search = query['search']?.toString().trim();
	const endSearch = query['end-search']?.toString().trim();
	const name = query['name']?.toString();
	const limit = parseInt(query['limit']?.toString() || '0');

	let where = '';
	const args: Array<any> = [];
	if (name) {
		where += ' AND name = ?';
		args.push(name);
	}

	if (search) {
		where += ' AND data LIKE CONCAT("%", ?, "%")';
		args.push(search);
	}

	if (endSearch) {
		where += ' AND data LIKE CONCAT(?, "%")';
		args.push(endSearch);
	}

	if (where) {
		where = 'WHERE ' + where.substring(5);
	}

	const qres = await db.execute({
		sql: 'SELECT * FROM `misc_strings` ' + where + (limit > 0 ? ` LIMIT ${limit}` : ''),
		args,
	});
	res.setRows(qres.rows);
};

export const addOrUpdateMiscString: RequestHandler = async ({ request, env, res, params }) => {
	const data = await validateFormData(request, miscStringSchema);
	const db = getLibsqlClient(env);

	if (params.id) {
		const { sql, args } = getUpdateQuery('misc_strings', data);
		args.push(params.id);
		await db.execute({
			sql: sql + ' WHERE id = ?',
			args,
		});
		res.setMsg('Misc string updated successfully!');
	} else {
		const { lastInsertRowid } = await insertRow(db, 'misc_strings', data);
		data.id = lastInsertRowid?.toString();
		res.setMsg('Misc string added successfully!');
	}
	res.setData(data);
};

export const saveNamedString: RequestHandler = async ({ request, env, res, query, user }) => {
	const data = await validateFormData(request, z.object({
		data: z.string(),
	}));

	let name = query['name']?.toString();
	if (!name || !user) {
		res.error('Name is required!', 422);
		return;
	}

	const scope = query['scope']?.toString();
	if (scope == 'user') {
		name = `${name}_${user.id}`;
	}



	const db = getLibsqlClient(env);


	const qres = await db.execute({
		sql: 'SELECT id FROM `misc_strings` WHERE name = ? LIMIT 1',
		args: [name],
	});

	if (qres.rows.length > 0) {
		const { sql, args } = getUpdateQuery('misc_strings', data);
		args.push(qres.rows[0].id!.toString());
		await db.execute({
			sql: sql + ' WHERE id = ?',
			args,
		});
		res.setMsg('Option updated successfully!');
	} else {
		const { lastInsertRowid } = await insertRow(db, 'misc_strings', {
			name,
			data: data.data,
		});
		data.id = lastInsertRowid?.toString();
		res.setMsg('Option added successfully!');
	}


	res.setData(data);
};

export const getNamedString: RequestHandler = async ({ env, res, query, user }) => {
	let name = query['name']?.toString();
	if (!name) {
		res.error('Name is required!', 422);
		return;
	}

	const scope = query['scope']?.toString();
	if (scope == 'user' && user) {
		name = `${name}_${user.id}`;
	}

	const db = getLibsqlClient(env);
	const qres = await db.execute({
		sql: 'SELECT data FROM `misc_strings` WHERE name = ? LIMIT 1',
		args: [name],
	});

	if (qres.rows.length > 0) {
		res.setData(qres.rows[0].data);
	} else {
		res.error('Option not found!', 404);
	}
};

export const deleteMiscString: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	await db.execute({
		sql: `DELETE FROM \`misc_strings\` WHERE id = ?`,
		args: [params.id],
	});
	res.setMsg('Deleted successfully!');
};
