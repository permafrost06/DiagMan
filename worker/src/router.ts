import { IRequest, RouteHandler, RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests, syncTests } from './routes/med-test';
import { addPatient, listPatients, finalizeReport } from './routes/patients';
import { getUser, logOut, login, register } from './routes/auth';
import { assignToken, assignUser } from './middlewares/auth';

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
	};
}
export type RequestHandler = RouteHandler<IRequest & RequestEvent>;

export const buildRouter = (router: RouterType) => {
	router.all('*', assignToken);

	router.get('/auth', assignUser, getUser);
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logOut);

	router.post('/tests', addTest);
	router.get('/tests', listTests);
	router.post('/tests/sync', syncTests);
	router.delete('/tests/:id', withParams, deleteTest);

	router.post('/patients', addPatient);
	router.get('/patients', listPatients);

	router.post('/reports', finalizeReport);
};
export default buildRouter;
