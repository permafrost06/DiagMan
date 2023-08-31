import { Client as LibsqlClient, ResultSet, createClient } from '@libsql/client/web';
import { Env } from '../worker';

export const getLibsqlClient = (env: Env): LibsqlClient => {
	const url = env.TURSO_DB_URL?.trim();
	if (url === undefined) {
		throw new Error('TURSO_DB_URL env var is not defined');
	}

	const authToken = env.TURSO_AUTH_TOKEN?.trim();
	if (authToken === undefined) {
		throw new Error('TURSO_AUTH_TOKEN env var is not defined');
	}

	return createClient({ url, authToken });
};

export const insertRow = async (db: LibsqlClient, table: string, data: Record<string, any>): Promise<ResultSet> => {
	let cols = '',
		vals = '';
	for (const col in data) {
		cols += ', ' + col;
		vals += ', :' + col;
	}
	cols = cols.substring(2);
	vals = vals.substring(2);
	const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${vals})`;
	return await db.execute({
		sql,
		args: data,
	});
};
