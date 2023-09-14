import { CookieOptions, createCookieHeader } from './helpers';

export class JSONError extends Error {
	__json_error_saad = true;
	status: number;
	body: any;

	constructor(message: string, status: number = 422, body: any = {}) {
		super(message);
		this.status = status;
		this.body = body;
	}
}

export default class JSONResponse {
	headers: Headers = new Headers();
	body: Record<string, any> = {
		success: true,
	};
	status = 200;

	error(message: string, status = 422, body: any = {}): never {
		throw new JSONError(message, body, status);
	}

	setMsg(message: string): JSONResponse {
		this.body.message = message;
		return this;
	}

	setRows(rows: any): JSONResponse {
		this.body.rows = rows;
		return this;
	}

	setData(data: any): JSONResponse {
		this.body.data = data;
		return this;
	}

	pageParams(page: number, total: number, perPage: number): JSONResponse {
		this.body.pagination = {
			total,
			page,
			maxPage: Math.ceil(total / perPage),
		};
		return this;
	}

	setCookie(name: string, value: string, options: CookieOptions = {}): JSONResponse {
		this.headers.append('Set-Cookie', createCookieHeader(name, value, options));
		return this;
	}

	json(options?: ResponseInit) {
		options = options || {};
		options.headers = this.headers;
		return new Response(JSON.stringify(this.body), options);
	}
}
