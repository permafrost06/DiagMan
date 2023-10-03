import { IRequest, RouteHandler, RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests, syncTests } from './routes/med-test';
import { getUser, logOut, login, register, verifyPin } from './routes/auth';
import { assignToken, assignUser, ensureAdmin } from './middlewares/auth';
import { addPatient, listPatients, syncPatients } from './routes/patients';
import { finalizeReport } from './routes/reports';
import { addUser, deleteUser, getUsers, updateUser } from './routes/users';

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
	router.post('/tests/sync', syncTests);
	router.delete('/tests/:id', withParams, deleteTest);

	router.post('/patients/sync', syncPatients);
	router.post('/patients', addPatient);
	router.get('/patients', listPatients);

	router.post('/reports', finalizeReport);
};
export default buildRouter;
