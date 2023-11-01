/* eslint-disable no-undef */
const { config } = require('dotenv');
const { createClient } = require('@libsql/client/web');
const { readdirSync, readFileSync } = require('fs');

const MIGRATIONS_PATH = './migrations';

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
	await createMigrationsTable();
	const allMigrations = readdirSync(MIGRATIONS_PATH)
		.filter((path) => path.endsWith('.sql'))
		.sort();
	let migrations = [];
	try {
		const res = await db.execute('SELECT * FROM `migrations`');
		const done = res.rows.map((row) => row.name);
		migrations = allMigrations.filter((file) => done.indexOf(file) === -1);
	} catch (error) {
		console.error(error.message || error);
		return;
	}
	if (migrations.length === 0) {
		console.log('Everything is up to date!');
		return;
	}
	for (let i = 0; i < migrations.length; i++) {
		await applyMigration(migrations[i]);
	}
}

async function createMigrationsTable() {
	await db.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            timestamp DATETIME NOT NULL
        ) 
    `);
}

async function applyMigration(file) {
	process.stdout.write(`[...] ${file}\r`);
	const sql = readFileSync(`${MIGRATIONS_PATH}/${file}`).toString();
	await db.executeMultiple(sql);
	await db.execute({
		sql: 'INSERT INTO `migrations` (name, timestamp) VALUES (?, ?)',
		args: [file, Math.floor(Date.now() / 1000)],
	});
	process.stdout.write(`[DONE] ${file}\n`);
}

main();
