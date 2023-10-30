/* eslint-disable no-undef */
const { existsSync } = require('fs');
const path = require('path');
const { config } = require('dotenv');

config({
	path: '.dev.vars',
});

async function main() {
	const args = process.argv;
	args.splice(0, 2);
	if (args.length === 0) {
		console.log('No command is provided!');
		return;
	}
	let fileName = args[0];
	let filePath = path.join(__dirname, 'commands', fileName + '.js');
	if (!existsSync(filePath)) {
		fileName = fileName[0].toUpperCase() + fileName.substring(1);
		filePath = path.join(__dirname, 'commands', fileName + '.js');
		if (!existsSync(filePath)) {
			console.log(`Command ${args[0]} does not exist!`);
			return;
		}
	}

	const cmd = await import('file:///' + filePath);
	if (typeof cmd.run !== 'function') {
		throw new Error(`Invalid export \`run\` from ${filePath}`);
	}
	args.splice(0, 1);
	cmd.run(args);
}
main();
