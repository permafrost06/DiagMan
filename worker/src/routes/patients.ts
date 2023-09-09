import { z } from 'zod';
import { getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData, validateObject } from '../utils/helpers';
import { JSONError } from '../utils/Response';
import { patientSchema, reportSchema } from '../forms/patients';

export const addPatient: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, patientSchema, ['tests']);
	data.tests = JSON.stringify(data.tests);
	const db = getLibsqlClient(env);

	// ZOD does not support only date validation yet
	['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
		data[key] = data[key].substring(0, 10);
	});

	try {
		await insertRow(db, 'patients', data);
	} catch (error: any) {
		if (error.code === 'SQLITE_CONSTRAINT') {
			throw new JSONError('This patient id already exists!');
		} else {
			throw error;
		}
	}
	res.setData(data);
};

export const listPatients: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const qres = await db.execute(`
		SELECT *, EXISTS(
			SELECT 1 FROM \`reports\` WHERE id = p.id
		) AS is_reported FROM \`patients\` AS p
	`);
	res.setRows(qres.rows);
};

export const finalizeReport: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, reportSchema);
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT *, EXISTS(
			SELECT 1 FROM \`reports\` WHERE id = p.id
		) AS is_reported FROM \`patients\` AS p WHERE id=? LIMIT 1`,
		args: [data.id],
	});
	if (rows.length === 0) {
		throw new JSONError('Invalid patient!');
	}

	const patient = rows[0];

	if (patient.is_reported) {
		throw new JSONError('The patient already recieved the report!');
	}

	if (patient.type === 'cyto') {
		// prettier-ignore
		await validateObject(data, z.object({
			gross_examination: z.string().nonempty()
		}));
	} else {
		// prettier-ignore
		await validateObject(data, z.object({
			microscopic_examination: z.string().nonempty()
		}));
	}
	await insertRow(db, 'reports', data);
	res.setMsg('Report finalized successfully!');
};