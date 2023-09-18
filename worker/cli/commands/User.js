/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
'use strict';

const { input, select } = require('@inquirer/prompts');
const { z } = require('zod');
const { Spinner } = require('cli-spinner');
const { hashSync } = require('bcryptjs');

const { insertRow, sqlite, getUpdateQuery } = require('../db');

const getInput = async (config, schema) => {
	if (typeof config === 'string') {
		config = { message: config };
	}

	if (schema) {
		config.validate = (res) => {
			const parsed = schema.safeParse(res);
			if (!parsed.success) {
				return parsed.error.flatten().formErrors[0];
			}
			return true;
		};
	}
	return await input(config);
};

const spinner = (text) => {
	const spinner = new Spinner(`%s ${text}`);
	spinner.setSpinnerString('⣾⣽⣻⢿⡿⣟⣯⣷');
	spinner.start();
	return () => {
		spinner.stop();
		process.stdout.write('\r' + ''.padStart(text.length + 2, ' '));
		process.stdout.write('\r');
	};
};

const add = async () => {
	const name = await getInput('Name:', z.string().nonempty());
	const email = await getInput('Email:', z.string().email().nonempty());
	const password = await getInput('Password:', z.string().min(4));
	const role = await select({
		message: 'User Role:',
		choices: [
			{
				name: 'Cashier',
				value: 'cashier',
			},
			{
				name: 'Admin',
				value: 'admin',
			},
		],
	});

	const stop = spinner('Adding user to database...');

	const user = { name, email, password: hashSync(password, 12), role };

	const { lastInsertRowid } = await insertRow('users', user);
	user.id = lastInsertRowid.toString();
	user.password = password;

	stop();
	console.log('[OK] User is added successfully: ');
	console.log(user);
};
const update = async (options) => {
	const id = parseInt(options[1]);
	if (!id) {
		console.log('No id is provided!');
		return;
	}
	const stopGet = spinner('Getting user info..');
	const { rows } = await sqlite.execute('SELECT * FROM `users` WHERE id = ' + id);
	stopGet();
	if (rows.length == 0) {
		console.log('Invalid user id!');
		return;
	}
	const [user] = rows;
	const name = await getInput(
		{
			message: 'Name:',
			default: user.name,
		},
		z.string().nonempty()
	);
	const email = await getInput(
		{
			message: 'Email:',
			default: user.email,
		},
		z.string().email().nonempty()
	);
	const password = await getInput('Password:', z.string());
	const role = await select({
		message: 'User Role:',
		choices: [
			{
				name: 'Cashier',
				value: 'cashier',
			},
			{
				name: 'Admin',
				value: 'admin',
			},
		],
	});

	const stopLoader = spinner('Updating user...');

	const updated = {
		name,
		email,
		role,
	};
	if (password.length > 0) {
		updated.password = hashSync(password, 12);
	}

	const { sql, args } = getUpdateQuery('users', updated);
	args.push(user.id);

	if (password.length > 0) {
		updated.password = password;
	}

	const { rowsAffected } = await sqlite.execute({
		sql: sql + ' WHERE id = ?',
		args,
	});
	stopLoader();
	if (rowsAffected === 0) {
		console.log('No changes were made');
		return;
	}

	console.log('[DONE] User updated successfully!');
	console.log(updated);
};
const remove = async (options) => {
	options.splice(0, 1);
	if (options.length === 0) {
		console.log('No id provided to delete!');
		return;
	}
	const ids = options.join(',');
	if (/[^0-9,]/.test(ids)) {
		console.log('Non numeric id is not supported!');
		return;
	}
	const stopSpinner = spinner('Deleting...');
	const { rowsAffected } = await sqlite.execute(`DELETE FROM \`users\` WHERE id IN (${ids})`);
	stopSpinner();
	console.log(`[DONE] ${rowsAffected} users are removed!`);
};
const get = async (options) => {
	const page = Math.max(1, parseInt(options[1]) || 0);

	const stop = spinner('Getting users...');
	const { rows } = await sqlite.execute(`SELECT * FROM \`users\` ORDER BY id DESC LIMIT 10 OFFSET ${10 * (page - 1)}`);
	stop();
	console.log(`[DONE] ${rows.length} rows returned (Page: ${page}):`);
	console.log(rows);
};

function run(options) {
	switch (options[0].toLowerCase()) {
		case 'add':
		case '-a':
			add(options);
			break;
		case 'update':
		case '-u':
			update(options);
			break;
		case 'delete':
		case '-d':
			remove(options);
			break;
		case 'get':
		case '-g':
			get(options);
			break;
		default:
			console.log('No operation!');
	}
}
exports.run = run;
