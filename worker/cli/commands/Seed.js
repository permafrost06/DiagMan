/* eslint-disable no-undef */
const { faker } = require('@faker-js/faker');
const { Spinner } = require('cli-spinner');
const { records, random, getRandomGender } = require('../../database/seeder/records');
const { sqlite, insertRow } = require('../db');
const { tests: sTests } = require('../../database/seeder/tests_data');

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

// eslint-disable-next-line no-unused-vars
const seedTests = async () => {
	const stopGenSpinner = spinner('Inserting rows...');

	for (let i = 0; i < sTests.length; i++) {
		const test = sTests[i];
		const row = {
			name: test.name,
			type: test.type.toLowerCase(),
			price: test.cost,
			size: test.size.toLowerCase(),
			status: ['active', 'updated', 'deleted'][Math.round(Math.random() * 2)],
		};
		await insertRow('tests', row);
	}

	stopGenSpinner();
	console.log(`Inserted ${sTests.length} tests!`);
};

const seedPatients = async (count = 100) => {
	const stopMaxIdSpinner = spinner('Getting initial data...');
	const { rows } = await sqlite.execute('SELECT id FROM `patients` ORDER BY id DESC LIMIT 1');
	let maxId = 0;
	if (rows.length) {
		maxId = parseInt(rows[0].id.replaceAll(/[^0-9]/g, ''));
	}
	const { rows: tests } = await sqlite.execute('SELECT id FROM `tests`');
	stopMaxIdSpinner();

	if (!tests.length || tests.length < sTests.length) {
		await seedTests();
		return await seedPatients(count);
	}

	const getTests = (total = 3) => {
		total = Math.min(tests.length, Math.max(1, total));
		const r = [];
		for (let i = 0; i < total; i++) {
			const rId = tests[random(tests.length)].id;
			if (r.indexOf(rId) === -1) {
				r.push(rId);
			}
		}
		return JSON.stringify(r);
	};

	const stopGenSpinner = spinner('Inserting rows...');

	for (let i = 0; i < count; i++) {
		const ref = records[random()];
		const date = new Date(ref.date.split('-').reverse().join('-'));
		const row = {
			id: 'ZZZ-' + (maxId + i + 1).toString().padStart(5, '0'),
			type: ['histo', 'cyto'][Math.round(Math.random())],
			status: ['draft', 'pending', 'complete', 'locked'][Math.round(Math.random() * 3)],
			name: ref.patientName,
			sample_collection_date: date,
			entry_date: date,
			age: parseInt(ref.age),
			gender: getRandomGender(),
			contact: faker.phone.number(),
			specimen: ref.specimen,
			referer: ref.referer,
			delivery_date: faker.date.future(date),
			tests: getTests(),
			discount: Math.round(Math.random() * 1000),
			advance: Math.round(Math.random() * 1000),
		};
		try {
			if (i % 5 === 0) {
				await insertRow('reports', {
					id: row.id,
					aspiration_note: ref.aspNote,
					microscopic_examination: ref.me,
					impression: ref.impression,
				});
				row.status = 'complete';
			}

			await insertRow('patients', row);
		} catch (_error) {
			console.log('Failed: ', row.id);
		}
	}

	stopGenSpinner();
	console.log(`Inserted ${count} patients!`);
};

function run() {
	seedPatients(50);
}
exports.run = run;
