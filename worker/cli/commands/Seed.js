/* eslint-disable no-undef */
const { faker } = require('@faker-js/faker');
const { Spinner } = require('cli-spinner');
const { records, random, getRandomGender } = require('../../database/seeder/records');
const { sqlite, insertRow } = require('../db');

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

const seedPatients = async (count = 100) => {
	const stopMaxIdSpinner = spinner('Getting initial data...');
	const { rows } = await sqlite.execute('SELECT id FROM `patients` ORDER BY id DESC LIMIT 1');
	let maxId = 0;
	if (rows.length) {
		maxId = parseInt(rows[0].id.replaceAll(/[^0-9]/g, ''));
	}
	const { rows: tests } = await sqlite.execute('SELECT id FROM `tests`');
	stopMaxIdSpinner();

	if (!tests.length) {
		console.log('Please add some tests first!');
		return;
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
		const date = ref.date.split('-').reverse().join('-');
		const row = {
			id: (maxId + i + 1).toString().padStart(5, '0'),
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
			delivery_date: faker.date.future(date + 'T00:00:00.000Z'),
			tests: getTests(),
			discount: Math.round(Math.random() * 1000),
			advance: Math.round(Math.random() * 1000),
		};

		await insertRow('patients', row);
		if (i % 5 === 0) {
			await insertRow('reports', {
				id: row.id,
				aspiration_note: ref.aspNote,
				microscopic_examination: ref.me,
				impression: ref.impression,
			});
		}
	}

	stopGenSpinner();
	console.log(`Inserted ${count} rows!`);
};

function run() {
	seedPatients(2);
}
exports.run = run;
