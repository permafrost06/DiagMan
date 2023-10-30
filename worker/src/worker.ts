import { json, Router, type RouterType } from 'itty-router';
import buildRouter, { RequestEvent } from './router';
import JSONResponse from './utils/Response';

const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Content-type': 'application/json',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (env.router === undefined) {
			const router = Router();
			buildRouter(router);
			router.all('*', ({ res }: RequestEvent) => {
				for (const name in DEFAULT_HEADERS) {
					// @ts-ignore
					res.headers.append(name, DEFAULT_HEADERS[name]);
				}
				return res.json();
			});
			env.router = router;
		}

		const req: RequestEvent = {
			request,
			url: request.url,
			method: request.method,
			env,
			res: new JSONResponse(),
		};

		try {
			const res = await env.router.handle(req);
			return json(res, {
				headers: DEFAULT_HEADERS,
			});
		} catch (error: any) {
			if (!error.__json_error_saad) {
				console.error(error);
			}
			const res: any = error.__json_error_saad ? error.body : {};
			res.message = error.message;
			return json(res, {
				headers: DEFAULT_HEADERS,
				status: error.status || 500,
			});
		}
	},
};
