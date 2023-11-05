import { z } from 'zod';
import { JSONError } from './Response';

export const getFormError = (err: z.typeToFlattenedError<any, any>): string => {
	let error: string | undefined = err.formErrors[0];
	if (!error && err.fieldErrors) {
		const keys = Object.keys(err.fieldErrors);
		error = err.fieldErrors[keys[0]]?.[0] + ` in ${keys[0]} `;
		if (keys.length > 1) {
			error += ` (+${keys.length - 1} more fields)`;
		}
	}
	if (!error) {
		error = 'Some fields have invalid data!';
	}
	return error;
};

const parseObjectField = (key: string, value: any, body: Record<string, any>) => {
	const parts = key.split(/\[|\]/).filter(Boolean);
	let parent = body;
	for (let i = 0; i < parts.length - 1; i++) {
		if (!parent[parts[i]]) {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	const lastKey = parts[parts.length - 1];
	parent[lastKey] = value;
};

export const validateFormData = async <T extends z.ZodRawShape>(
	request: Request,
	schema: z.ZodObject<T>,
	arrays: string[] = [],
	objects: string[] = []
): Promise<Record<string, any> | never> => {
	const formData = await request.formData();
	const body: Record<string, any> = {};

	arrays.forEach((key) => {
		body[key] = formData.getAll(key);
		formData.delete(key);
	});

	let adder = (value: any, key: any) => {
		body[key] = value;
	};

	if (objects.length > 0) {
		const regex = new RegExp('^(' + objects.join('|') + ')\\[');
		adder = (value, key) => {
			if (regex.test(key)) {
				parseObjectField(key, value, body);
			} else {
				body[key] = value;
			}
		};
	}
	formData.forEach(adder);
	return await validateObject<Record<string, any>>(body, schema);
};

export const validateObject = async <T extends z.ZodRawShape>(body: T, schema: z.ZodObject<T>): Promise<Record<string, any> | never> => {
	const res = schema.safeParse(body);

	if (!res.success) {
		const err = res.error.flatten();
		throw new JSONError(getFormError(err), 422, {
			form: err.formErrors,
			field: err.fieldErrors,
		});
	}
	return res.data;
};

export interface CookieOptions {
	expires?: string | Date;
	path?: string;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: 'None' | 'Strict' | 'Lax' | 'Secure';
}

export const createCookieHeader = (name: string, value: string, options: CookieOptions = {}): string => {
	// Encode the name and value
	const encodedName = encodeURIComponent(name);
	const encodedValue = encodeURIComponent(value);

	// Build the cookie string
	let cookieString = `${encodedName}=${encodedValue}`;

	// Add optional properties
	if (options.expires) {
		if (options.expires instanceof Date) {
			cookieString += `; expires=${options.expires.toUTCString()}`;
		} else {
			throw new Error('Invalid "expires" option. It should be a Date object.');
		}
	}

	if (options.path) {
		cookieString += `; path=${options.path}`;
	}

	if (options.domain) {
		cookieString += `; domain=${options.domain}`;
	}

	if (options.secure) {
		cookieString += '; secure';
	}

	if (options.httpOnly) {
		cookieString += '; HttpOnly';
	}

	if (options.sameSite) {
		cookieString += `; SameSite=${options.sameSite}`;
	}

	return cookieString;
};

export const limitOperations = (queries: any[], limit = 100): void | never => {
	if (queries.length > limit) {
		throw new JSONError('Operation limit exceeded!', 422);
	}
};
