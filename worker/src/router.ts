import { IRequest, RouteHandler, RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests } from './routes/med-test';
import { addPatient, listPatients, finalizeReport } from './routes/patients';

export interface RequestEvent {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
}
export type RequestHandler = RouteHandler<IRequest & RequestEvent>;

export const buildRouter = (router: RouterType) => {
	router.post('/tests', addTest);
	router.get('/tests', listTests);
	router.delete('/tests/:id', withParams, deleteTest);

	router.post('/patients', addPatient);
	router.get('/patients', listPatients);

	router.post('/reports', finalizeReport);
};
export default buildRouter;
