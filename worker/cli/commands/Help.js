/* eslint-disable no-undef */

function run() {
	console.log('Available commands:\n\n');
	console.log('user [arg1, arg2, ...]\n');
	console.log('  -a/add');
	console.log('      = add a new user\n');
	console.log('  -u/update <id>');
	console.log('      = update the user of id = <id>\n');
	console.log('  -d/delete [id1, id2, ...]');
	console.log('      = delete the users of ids provided\n');
	console.log('  -g/get <page>');
	console.log('      = get 10 users from page <page>\n\n');
	console.log('seed');
	console.log('      = seed some test data');
}
exports.run = run;
