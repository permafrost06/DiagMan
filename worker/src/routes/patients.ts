import { z } from 'zod';
import { getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

const stringDate = z.preprocess(
	(arg) => (typeof arg === 'string' && arg.length === 10 ? `${arg}T00:00:00.000Z` : arg),
	z.string().datetime()
);
const strNum = z.preprocess((val: any) => parseInt(val), z.number().min(0));

const formSchema = z.object({
	type: z.enum(['histo', 'cyto']),
	status: z.enum(['draft', 'pending', 'locked', 'complete']),
	name: z.string(),
	sample_collection_date: stringDate,
	entry_date: stringDate,
	age: strNum,
	gender: z.enum(['male', 'female']),
	contact: z.string(),
	specimen: z.string(),
	referer: z.string(),
	delivery_date: stringDate,
	tests: z.array(z.string()),
	discount: strNum,
	advance: strNum,
});

export const addPatient: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, formSchema, ['tests']);
	data.tests = JSON.stringify(data.tests);
	const db = getLibsqlClient(env);

	// ZOD does not support only date validation yet
	['sample_collection_date', 'entry_date', 'delivery_date'].forEach((key) => {
		data[key] = data[key].substring(0, 10);
	});

	const row = await insertRow(db, 'patients', data);
	data.id = row.lastInsertRowid?.toString();
	res.setData(data);
};

export const listPatients: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const qres = await db.execute('SELECT * FROM `patients`');
	res.setRows(qres.rows);
};
