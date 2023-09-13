import { IRequest, RouteHandler, RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests, syncTests } from './routes/med-test';
import { addPatient, listPatients, finalizeReport } from './routes/patients';
import { login, register } from './routes/auth';
import { assignCookies } from './middlewares/auth';

export interface RequestEvent {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
	cookies: Record<string, string>;
}
export type RequestHandler = RouteHandler<IRequest & RequestEvent>;

export const buildRouter = (router: RouterType) => {
	router.all('*', assignCookies);

	router.get('/auth/register', register);
	router.get('/auth/login', login);

	router.post('/tests', addTest);
	router.get('/tests', listTests);
	router.post('/tests/sync', syncTests);
	router.delete('/tests/:id', withParams, deleteTest);

	router.post('/patients', addPatient);
	router.get('/patients', listPatients);

	router.post('/reports', finalizeReport);
};
export default buildRouter;
