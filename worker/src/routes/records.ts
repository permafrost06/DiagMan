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
	patient_name: z.string(),
	sample_collection_date: stringDate,
	entry_date: stringDate,
	age: strNum,
	gender: z.enum(['male', 'female']),
	contact_no: z.string(),
	specimen: z.string(),
	referer: z.string(),
	delivery_date: stringDate,
	tests: z.array(z.string()),
	discount: strNum,
	advance: strNum,
	due: strNum,
	aspiration_note_gross_examination: z.string(),
	microscopic_examination: z.string(),
	impression: z.string(),
	note: z.string(),
});

export const addRecord: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, formSchema, ['tests']);
	data.tests = JSON.stringify(data.tests);
	const db = getLibsqlClient(env);
	const row = await insertRow(db, 'records', data);
	data.id = row.lastInsertRowid;
	res.setData(data);
};

export const listRecords: RequestHandler = async ({ env, res }) => {
	const db = getLibsqlClient(env);
	const qres = await db.execute('SELECT * FROM `records`');
	res.setRows(qres.rows);
};
