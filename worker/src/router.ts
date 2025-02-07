import { IRequest, RouteHandler, RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests, syncTests } from './routes/med-test';
import { getUser, logOut, login, register, verifyPin } from './routes/auth';
import { assignToken, assignUser, ensureAdmin, ensureUser } from './middlewares/auth';
import { addOrUpdatePatient, deletePatient, getAutoId, getPatient, listPatients, syncPatients } from './routes/patients';
import { deliverReport, finalizeReport, getReport, toggleReportLock, unDeliverReport } from './routes/reports';
import { addUser, deleteUser, getUsers, updateUser } from './routes/users';
import { changeName, changePassword, changePin } from './routes/settings/account';
import { addReportTemplate, deleteReportTemplate, listOrgans, listReportTemplates } from './routes/settings/report-templates';
import { addOrUpdateMiscString, deleteMiscString, listMiscStrings } from './routes/misc-strings';
import { getFinances } from './routes/finances';
import { sendPatientSms } from './routes/sms';

export interface RequestEvent {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
	token?: string;
	user?: {
		id: bigint;
		name: string;
		email: string;
		role: 'admin' | 'cashier';
		pin: string;
		password: string;
	};
}
export type RequestHandler = RouteHandler<IRequest & RequestEvent>;

export const buildRouter = (router: RouterType) => {
	router.all('*', assignToken);

	router.get('/auth', assignUser, getUser);
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/verify', assignUser, verifyPin);
	router.post('/auth/logout', logOut);

	router.get('/users', ensureAdmin, getUsers);
	router.post('/users/add', ensureAdmin, addUser);
	router.post('/users/update', ensureAdmin, updateUser);
	router.delete('/users/:id', withParams, ensureAdmin, deleteUser);

	router.post('/tests', addTest);
	router.get('/tests', listTests);
	router.post('/tests/sync', ensureUser, syncTests);
	router.delete('/tests/:id', withParams, ensureUser, deleteTest);

	router.get('/patient-autoid', getAutoId);

	router.post('/patients/sync', syncPatients);
	router.post('/patients/:id?', ensureUser, addOrUpdatePatient);
	router.delete('/patients/:id', ensureUser, deletePatient);
	router.get('/patients/:id', getPatient);
	router.get('/patients', listPatients);

	router.post('/reports/deliver/:id', ensureUser, deliverReport);
	router.post('/reports/un-deliver/:id', ensureUser, unDeliverReport);
	router.post('/reports/lock/:id', ensureAdmin, toggleReportLock);
	router.get('/reports/:id', getReport);
	router.post('/reports', ensureUser, finalizeReport);

	router.get('/settings/report-templates/organs', listOrgans);
	router.get('/settings/report-templates', listReportTemplates);
	router.post('/settings/report-templates', ensureUser, addReportTemplate);
	router.post('/settings/report-templates/:id', ensureUser, deleteReportTemplate);

	router.post('/settings/account/name', ensureUser, changeName);
	router.post('/settings/account/pin', ensureUser, changePin);
	router.post('/settings/account/password', ensureUser, changePassword);

	router.get('/misc', listMiscStrings);
	router.post('/misc/:id?', ensureUser, addOrUpdateMiscString);
	router.post('/misc/remove/:id', ensureUser, deleteMiscString);

	router.get('/finances', getFinances);

	router.post('/sms/:id', ensureUser, sendPatientSms);
};
export default buildRouter;
