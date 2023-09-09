import { json } from 'itty-router';

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
	res: Record<string, any> = {
		success: true,
	};
	status = 200;

	error(message: string, body: any, status = 422): never {
		throw new JSONError(message, body, status);
	}

	setMsg(message: string): JSONResponse {
		this.res.message = message;
		return this;
	}

	setRows(rows: any): JSONResponse {
		this.res.rows = rows;
		return this;
	}

	setData(data: any): JSONResponse {
		this.res.data = data;
		return this;
	}

	pageParams(page: number, total: number, perPage: number): JSONResponse {
		this.res.pagination = {
			total,
			page,
			maxPage: Math.ceil(total / perPage),
		};
		return this;
	}

	json(options?: ResponseInit) {
		return json(this.res, options);
	}
}
