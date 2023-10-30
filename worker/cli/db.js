/* eslint-disable no-undef */
const { createClient } = require('@libsql/client/web');

const url = process.env.TURSO_DB_URL?.trim();
if (url === undefined) {
	throw new Error('TURSO_DB_URL env var is not defined');
}

const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (authToken === undefined) {
	throw new Error('TURSO_AUTH_TOKEN env var is not defined');
}

const db = createClient({ url, authToken });

const generateInsertQuery = (table, data) => {
	let cols = '',
		vals = '';
	for (const col in data) {
		cols += ', ' + col;
		vals += ', :' + col;
	}
	cols = cols.substring(2);
	vals = vals.substring(2);
	const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${vals})`;
	return {
		sql,
		args: data,
	};
};

const insertRow = async (table, data) => {
	return await db.execute(generateInsertQuery(table, data));
};

const getUpdateQuery = (table, data) => {
	const args = [];
	let updates = '';
	for (const col in data) {
		updates += ', ' + col + ' = ?';
		args.push(data[col]);
	}
	updates = updates.substring(2);

	const sql = `UPDATE \`${table}\` SET ${updates}`;
	return {
		sql,
		args,
	};
};

const getUpdateQueryObj = (table, data) => {
	let updates = '';
	for (const col in data) {
		updates += ', ' + col + ' = :';
	}
	updates = updates.substring(2);

	const sql = `UPDATE \`${table}\` SET ${updates}`;
	return {
		sql,
		args: data,
	};
};

exports.sqlite = db;
exports.insertRow = insertRow;
exports.generateInsertQuery = generateInsertQuery;
exports.getUpdateQuery = getUpdateQuery;
exports.getUpdateQueryObj = getUpdateQueryObj;
