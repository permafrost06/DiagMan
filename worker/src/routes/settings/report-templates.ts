import { getLibsqlClient, getUpdateQuery, insertRow } from '../../db/conn';
import { RequestHandler } from '../../router';
import { validateFormData } from '../../utils/helpers';
import { reportTemplateSchema } from '../../forms/report-templates';

export const addReportTemplate: RequestHandler = async ({ request, env, res }) => {
	const data = await validateFormData(request, reportTemplateSchema);

	const db = getLibsqlClient(env);

	if (data.id) {
		const { sql, args } = getUpdateQuery('report_templates', data);
		args.push(data.id);
		await db.execute({
			sql: sql + ' WHERE id = ?',
			args,
		});
		res.setRows([data]);
		res.setMsg('Report Template updated successfully!');
	} else {
		const addded = await insertRow(db, 'report_templates', data);
		res.setRows([
			{
				id: addded.lastInsertRowid?.toString(),
				...data,
			},
		]);
		res.setMsg('Report Template added successfully!');
	}
};

export const listReportTemplates: RequestHandler = async ({ env, res, query }) => {
	const db = getLibsqlClient(env);

	const organ = query['organ'] as string;
	const search = query['search']?.toString().trim();
	const notIn = query['not-in']?.toString();
	const limit = parseInt(query['limit']?.toString() || '0');

	let where = '';
	const args: Array<string | number> = [];

	if (organ) {
		where += ` AND organ=?`;
		args.push(organ);
	}

	if (notIn) {
		where += ` AND NOT EXISTS (
			SELECT *
			FROM json_each(?)
			WHERE json_each.value = report_templates.id
		) `;
		args.push(notIn);
	}

	if (search) {
		where += ' AND name LIKE CONCAT("%", ?, "%")';
		args.push(search);
	}

	if (where) {
		where = ' WHERE ' + where.substring(5);
	}

	const qres = await db.execute({
		sql: 'SELECT * FROM `report_templates` ' + where + (limit > 0 ? ` LIMIT ${limit}` : ''),
		args,
	});
	res.setRows(qres.rows);
};

export const deleteReportTemplate: RequestHandler = async ({ env, res, params }) => {
	const db = getLibsqlClient(env);
	const { rowsAffected } = await db.execute({
		sql: 'DELETE FROM `report_templates` WHERE id=?',
		args: [params.id],
	});
	res.setMsg('Report Template deleted successfully!');
	res.setData({
		deleted: rowsAffected,
	});
};

export const listOrgans: RequestHandler = async ({ env, res, query }) => {
	const db = getLibsqlClient(env);

	const search = query['search']?.toString().trim();
	const limit = parseInt(query['limit']?.toString() || '0');

	let where = '';
	const args: Array<any> = [];
	if (search) {
		where = 'WHERE organ LIKE CONCAT("%", ?, "%")';
		args.push(search);
	}

	const qres = await db.execute({
		sql: 'SELECT DISTINCT organ FROM `report_templates` ' + where + (limit > 0 ? ` LIMIT ${limit}` : ''),
		args,
	});
	res.setRows(qres.rows);
};
