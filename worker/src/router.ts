import { RouterType, withParams } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, deleteTest, listTests } from './routes/med-test';
import { addRecord, listRecords } from './routes/records';

export interface RequestEvent extends Record<string, any> {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
}
export type RequestHandler = (event: RequestEvent) => Record<string, any> | undefined;

export const buildRouter = (router: RouterType) => {
	router.post('/tests', addTest);
	router.get('/tests', listTests);
	router.delete('/tests/:id', withParams, deleteTest as any);

	router.post('/records', addRecord);
	router.get('/records', listRecords);
};
export default buildRouter;
