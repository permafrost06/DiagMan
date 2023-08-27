import { Router } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, listTests } from './routes/med-test';

export interface RequestEvent {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
}
export const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Content-type': 'application/json',
};

export type RequestHandler = (event: RequestEvent) => Record<string, any> | undefined;

export const buildRouter = () => {
	const router = Router();
	/**
	 * All routes should be listed here
	 */

	router.post('/tests', addTest);
	router.get('/tests', listTests);

	router.all('*', ({ res }: RequestEvent) => {
		return res.json({
			headers: DEFAULT_HEADERS,
		});
	});

	return router;
};
export default buildRouter;
