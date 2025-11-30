import { getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { reportSchema } from '../forms/patients';
import { RequestHandler } from '../router';
import { validateFormData } from '../utils/helpers';

export const finalizeReport: RequestHandler = async ({ request, env, res, user }) => {
	const data = await validateFormData(request, reportSchema);
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT p.*, r.locked, r.id AS rid FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id WHERE p.id=? LIMIT 1`,
		args: [data.id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}

	const patient = rows[0];

	// Convert empty or whitespace-only strings to null for all fields
	const fieldsToCheck = [
		'diagnosis',
		'indication',
		'microscopic_description',
		'anatomical_source',
		'gross_description',
		'embedded_sections',
		'paraffin_blocks',
		'clinical_info',
		'asp_note',
		'slides_made',
		'slides_stained',
		'note',
	];

	for (const field of fieldsToCheck) {
		if (data[field] !== undefined && data[field] !== null) {
			const value = String(data[field]).trim();
			if (value === '' || value === '{}') {
				data[field] = null as any;
			}
		}
	}

	// Additionally, ensure type-specific fields are null
	if (patient.type === 'histo') {
		data.asp_note = null as any;
	} else if (patient.type === 'cyto') {
		data.gross_description = null as any;
	}

	const isComplete = isReportComplete(data);

	if (patient.rid) {
		if (patient.locked && user!.role !== 'admin') {
			res.error("This report is locked, you don't have permission to update this!", 403);
		}
		const { sql, args } = getUpdateQuery('reports', data);
		args.push(patient.id as any);
		await db.execute({
			sql: sql + ` WHERE id = ?`,
			args,
		});
		res.setMsg('Report updated successfully!');
	} else {
		await insertRow(db, 'reports', data);
		res.setMsg('Report added successfully!');
	}
	await db.execute({
		sql: 'UPDATE `patients` SET status = ? WHERE id = ?',
		args: [isComplete ? 'complete' : 'pending', patient.id],
	});
	res.setRows([
		{
			locked: !!data.locked,
		},
	]);
};

export const getReport: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `
		  SELECT *,
			(
				SELECT GROUP_CONCAT(json_extract(value, '$.name'), ', ')
				FROM json_each(p.tests)
			) as test_names
		  FROM \`patients\` AS p
		  LEFT JOIN \`reports\` AS r ON r.id = p.id
		  WHERE p.id=? LIMIT 1
		`,
		args: [decodeURIComponent(params.id)],
	});
	if (rows.length === 0) {
		res.error('The patient does not exist!', 404);
	}
	res.setRows(rows);
};

export const toggleReportLock: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	const id = decodeURIComponent(params.id);
	const { rows } = await db.execute({
		sql: `SELECT p.*, r.locked, r.id AS rid FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id WHERE p.id=? LIMIT 1`,
		args: [id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}

	const patient = rows[0];

	const data = {
		locked: patient.locked ? 0 : 1,
	};

	if (patient.rid) {
		const { sql, args } = getUpdateQuery('reports', data);
		args.push(patient.id as any);
		await db.execute({
			sql: sql + ` WHERE id = ?`,
			args,
		});
	} else {
		res.error('Please add the report first!');
	}
	res.setMsg(`Report ${data.locked ? 'locked' : 'unlocked'} successfully!`);
};

export const lockReportOn: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	const id = decodeURIComponent(params.id);
	const { rows } = await db.execute({
		sql: `SELECT p.*, r.locked, r.id AS rid FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id WHERE p.id=? LIMIT 1`,
		args: [id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}

	const patient = rows[0];

	if (patient.rid) {
		const data = {
			locked: 1,
		};
		const { sql, args } = getUpdateQuery('reports', data);
		args.push(patient.id as any);
		await db.execute({
			sql: sql + ` WHERE id = ?`,
			args,
		});
		res.setMsg('Report locked successfully!');
	} else {
		res.error('Please add the report first!');
	}
};

export const deliverReport: RequestHandler = async ({ res, env, params }) => {
	const id = decodeURIComponent(params.id);
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT * FROM \`patients\` WHERE id=? LIMIT 1`,
		args: [id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}
	await db.execute({
		sql: 'UPDATE `patients` SET status = "delivered" WHERE id = ?',
		args: [id],
	});
	res.setMsg(`Report delivered successfully!`);
};

export const unDeliverReport: RequestHandler = async ({ res, env, params }) => {
	const id = decodeURIComponent(params.id);
	const db = getLibsqlClient(env);

	const { rows } = await db.execute({
		sql: 'SELECT * FROM `reports` WHERE id = ?',
		args: [id],
	});

	const status = rows.length > 0 && isReportComplete(rows[0]) ? 'complete' : 'pending';

	await db.execute({
		sql: 'UPDATE `patients` SET status = ? WHERE id = ?',
		args: [status, id],
	});
	res.setMsg(`Unmarked as delivered successfully!`);
	res.setData({ status });
};

export const listReportTemplatesFromReports: RequestHandler = async ({ env, res, url }) => {
	const search = new URL(url).searchParams;
	const limit = Math.max(Math.min(parseInt(search.get('limit') || '10'), 50), 5);
	const filterSchema = {
		diagnosis: /^([a-zA-Z0-9\s_]+)$/,
		type: /^(cyto|histo)$/,
	};

	let page = parseInt(search.get('page') || '1');
	if (page < 1) {
		page = 1;
	}
	const offset = (page - 1) * limit;

	let where = '';
	const args: any[] = [];

	// Exclude hidden templates
	where += ' AND (r.hidden IS NULL OR r.hidden = 0)';

	const diagnosis = search.get('diagnosis');
	if (diagnosis && filterSchema.diagnosis.test(diagnosis)) {
		where += ' AND r.diagnosis LIKE CONCAT("%", ?, "%")';
		args.push(diagnosis);
	}

	const type = search.get('type');
	if (type && filterSchema.type.test(type)) {
		if (type === 'cyto') {
			where += ' AND r.asp_note IS NOT NULL AND r.asp_note != ""';
		} else if (type === 'histo') {
			where += ' AND r.gross_description IS NOT NULL AND r.gross_description != ""';
		}
	}

	const hideAutogen = search.get('hideAutogen');
	if (hideAutogen === 'true') {
		where += ' AND (r.autogen IS NULL OR r.autogen = 0 OR r.favorite != 0)';
	}

	if (where) {
		where = 'WHERE ' + where.substring(5);
	}

	const db = getLibsqlClient(env);
	const qres = await db.execute({
		sql: `
			SELECT r.* FROM \`reports\` AS r
			${where}
			ORDER BY r.favorite DESC, r.autogen ASC LIMIT ${limit} OFFSET ${offset}
		`,
		args,
	});

	const { rows: info } = await db.execute({
		sql: `SELECT COUNT(id) AS total FROM \`reports\` AS r ${where}`,
		args,
	});
	res.setRows(qres.rows);
	res.pageParams(page, info[0].total || (0 as any), limit);
};

export const hideReportTemplate: RequestHandler = async ({ env, res, params }) => {
	const templateId = decodeURIComponent(params.id);
	const db = getLibsqlClient(env);

	// Check if template exists
	const { rows } = await db.execute({
		sql: 'SELECT id FROM `reports` WHERE id = ? LIMIT 1',
		args: [templateId],
	});

	if (rows.length === 0) {
		res.error('Template not found!', 404);
		return;
	}

	// Update the hidden field to 'true'
	await db.execute({
		sql: 'UPDATE `reports` SET hidden = 1 WHERE id = ?',
		args: [templateId],
	});

	res.setMsg('Template hidden successfully!');
};

export const favoriteReportTemplate: RequestHandler = async ({ env, res, params }) => {
	const templateId = decodeURIComponent(params.id);
	const db = getLibsqlClient(env);

	// Check if template exists
	const { rows } = await db.execute({
		sql: 'SELECT id FROM `reports` WHERE id = ? LIMIT 1',
		args: [templateId],
	});

	if (rows.length === 0) {
		res.error('Template not found!', 404);
		return;
	}

	// Update the favorite field to true
	await db.execute({
		sql: 'UPDATE `reports` SET favorite = 1 WHERE id = ?',
		args: [templateId],
	});

	res.setMsg('Template added to favorites successfully!');
};

export const unfavoriteReportTemplate: RequestHandler = async ({ env, res, params }) => {
	const templateId = decodeURIComponent(params.id);
	const db = getLibsqlClient(env);

	// Check if template exists
	const { rows } = await db.execute({
		sql: 'SELECT id FROM `reports` WHERE id = ? LIMIT 1',
		args: [templateId],
	});

	if (rows.length === 0) {
		res.error('Template not found!', 404);
		return;
	}

	// Update the favorite field to false
	await db.execute({
		sql: 'UPDATE `reports` SET favorite = 0 WHERE id = ?',
		args: [templateId],
	});

	res.setMsg('Template removed from favorites successfully!');
};

function isReportComplete(report: Record<string, any>): boolean {
	const aspOrGrossExists = report.asp_note != null || report.gross_description != null;

	if (aspOrGrossExists && report.microscopic_description != null && report.diagnosis != null) {
		return true;
	}

	return false;
}
