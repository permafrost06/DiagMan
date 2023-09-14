import { z } from 'zod';
import { getLibsqlClient, insertRow } from '../db/conn';
import { reportSchema } from '../forms/patients';
import { RequestHandler } from '../router';
import { JSONError } from '../utils/Response';
import { validateFormData, validateObject } from '../utils/helpers';

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
