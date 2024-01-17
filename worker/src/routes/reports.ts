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
			  SELECT
				GROUP_CONCAT(tests.name, ', ')
			  FROM tests
			  WHERE EXISTS (
				SELECT *
				FROM json_each(p.tests)
				WHERE json_each.value = tests.id
			  )
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

	const status = rows.length > 1 && isReportComplete(rows[0]) ? 'complete' : 'pending';

	await db.execute({
		sql: 'UPDATE `patients` SET status = ? WHERE id = ?',
		args: [status, id],
	});
	res.setMsg(`Unmarked as delivered successfully!`);
	res.setData({ status });
};

function isReportComplete(report: Record<string, any>): boolean {
	const quillFields = [
		'diagnosis',
		'indication',
		'microscopic_description',
		'anatomical_source',
		'gross_description',
		'clinical_info',
		'asp_note',
	];
	try {
		for (const colName of quillFields) {
			const ops = JSON.parse((report[colName] as any) || '{}')?.ops;
			if (ops.length > 1 || ops[0]?.insert !== '\n') {
				return true;
			}
		}
	} catch (_) {
		// Empty
	}

	const numFields = ['embedded_sections', 'paraffin_blocks', 'slides_made', 'slides_stained'];
	for (const colName of numFields) {
		if (parseInt(report[colName] as any) > 0) {
			return true;
		}
	}
	return false;
}
