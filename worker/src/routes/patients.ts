import { getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';
import { JSONError } from '../utils/Response';
import { patientSchema } from '../forms/patients';

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
