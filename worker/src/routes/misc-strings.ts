import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';

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

export const deleteMiscString: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	await db.execute({
		sql: `DELETE FROM \`misc_strings\` WHERE id = ?`,
		args: [params.id],
	});
	res.setMsg('Deleted successfully!');
};
