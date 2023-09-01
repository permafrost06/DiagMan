import { z } from 'zod';
import { getLibsqlClient, insertRow } from '../db/conn';
import { RequestHandler } from '../router';
import { validateFormData, validateObject } from '../utils/helpers';
import { JSONError } from '../utils/Response';

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

const reportSchema = z.object({
	id: strNum,
	aspiration_note: z.string().nonempty(),
	impression: z.string().nonempty(),
	note: z.string().nonempty(),
	gross_examination: z.string().optional(),
	microscopic_examination: z.string().optional(),
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
		throw new JSONError('Invalid patient!', {}, 422);
	}

	const patient = rows[0];

	if (patient.is_reported) {
		throw new JSONError('The patient already recieved the report!', {}, 422);
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
