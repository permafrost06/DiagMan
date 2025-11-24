import { getLibsqlClient, getUpdateQuery } from "../db/conn";
import { RequestHandler } from "../router";
import { sendSms } from "../utils/sms";

export const sendPatientSms: RequestHandler = async ({ env, res, params }) => {
	if (!params.id) {
		res.error('Patient id is required!', 400);
		return;
	}

	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: 'SELECT contact, data FROM `patients` LEFT JOIN `misc_strings` ON `misc_strings`.name = "sms" WHERE `patients`.id=? LIMIT 1',
		args: [params.id],
	});

	if (rows.length === 0) {
		res.error('Patient not found!', 404);
		return;
	}

	const patient: {
		contact?: string,
		data?: string
	} = rows[0] as any;

	if (!patient.contact || !/^\d{11}$/.test(patient.contact)) {
		res.error('Patient phone not found!', 404);
		return;
	}

	if (!patient.data) {
		res.error('Please add the text first!', 400);
		return;
	}

	const smsError = await sendSms(env, patient.contact, patient.data);

	if (smsError) {
		res.error(smsError);
		return;
	}

	const {sql, args} = getUpdateQuery('patients', {
		sms_sent: 1,
	});

	args.push(params.id);

	await db.execute({
		sql: sql + ' WHERE id=?',
		args,
	});

	res.setMsg('SMS sent successfully!');

};
