import { json, Router, type RouterType } from 'itty-router';
import buildRouter, { RequestEvent } from './router';
import JSONResponse from './utils/Response';

const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Content-type': 'application/json',
};

export interface Env {
	TURSO_DB_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	router?: RouterType;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (env.router === undefined) {
			const router = Router();
			buildRouter(router);
			router.all('*', ({ res }: RequestEvent) => {
				return res.json({
					headers: DEFAULT_HEADERS,
				});
			});
			env.router = router;
		}

		const req: RequestEvent = {
			request,
			url: request.url,
			method: request.method,
			env,
			res: new JSONResponse(),
			cookies: {},
		};

		try {
			const res = await env.router.handle(req);
			return json(res, {
				headers: DEFAULT_HEADERS,
			});
		} catch (error: any) {
			const res: any = error.__json_error_saad ? error.body : {};
			res.message = error.message;
			return json(res, {
				headers: DEFAULT_HEADERS,
				status: error.status || 500,
			});
		}
	},
};
