/* eslint-disable no-undef */
const { config } = require('dotenv');
const { createClient } = require('@libsql/client/web');
const { readdirSync, readFileSync, existsSync, writeFileSync } = require('fs');

const MIGRATIONS_PATH = './migrations';
const COMPLETED_PATH = MIGRATIONS_PATH + '/meta/_completed.json';

config({
	path: '.dev.vars',
});

const url = process.env.TURSO_DB_URL?.trim();
if (url === undefined) {
	throw new Error('TURSO_DB_URL env var is not defined');
}

const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (authToken === undefined) {
	throw new Error('TURSO_AUTH_TOKEN env var is not defined');
}

const db = createClient({ url, authToken });

async function main() {
	const allMigrations = readdirSync(MIGRATIONS_PATH)
		.filter((path) => path.endsWith('.sql'))
		.sort();
	const completedMigrations = existsSync(COMPLETED_PATH) ? JSON.parse(readFileSync(COMPLETED_PATH).toString()) : [];

	const migrations = allMigrations.filter((file) => completedMigrations.indexOf(file) === -1);

	if (migrations.length === 0) {
		console.log('Everything is up to date!');
		return;
	}
	for (let i = 0; i < migrations.length; i++) {
		try {
			await applyMigration(migrations[i]);
			completedMigrations.push(migrations[i]);
		} catch (error) {
			writeFileSync(COMPLETED_PATH, JSON.stringify(completedMigrations));
			console.log(error);
			return;
		}
	}
	writeFileSync(COMPLETED_PATH, JSON.stringify(completedMigrations));
}

async function applyMigration(file) {
	process.stdout.write(`[...] ${file}\r`);
	const sql = readFileSync(`./migrations/${file}`).toString();
	await db.executeMultiple(sql);
	process.stdout.write(`[DONE] ${file}\n`);
}

main();
