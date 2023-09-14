import { generateInsertQuery, getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { limitOperations, validateFormData, validateObject } from '../utils/helpers';
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
	res.setRows([data]);
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

export const syncPatients: RequestHandler = async ({ env, res, request }) => {
	const body = (await request.json()) as any;
	const queries: any[] = [];

	const total = (body.insert?.length || 0) + (body.update?.length || 0) + (body.remove?.length || 0);

	if (total > 100) {
		throw new JSONError('Operation limit exceeded!');
	}

	if (body.insert) {
		const insert = body.insert;
		for (let i = 0; i < insert.length; i++) {
			limitOperations(queries);
			const data = await validateObject(insert[i], patientSchema);
			// ZOD does not support only date validation yet
			['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
				data[key] = data[key].substring(0, 10);
			});

			queries.push(generateInsertQuery('patients', data));
		}
	}

	if (queries.length === 0) {
		res.setMsg('No operation to perform!');
		return;
	}

	const db = getLibsqlClient(env);
	await db.batch(queries, 'deferred');
	res.setMsg(`${queries.length} operations performed in the tests table!`);
};
