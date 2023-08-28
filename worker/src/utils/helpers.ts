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

export const validateFormData = async <T extends z.ZodRawShape>(
	request: Request,
	schema: z.ZodObject<T>
): Promise<Record<string, any> | never> => {
	const formData = await request.formData();
	const body: Record<string, any> = {};

	formData.forEach((value, key) => {
		const old = body[key];
		if (!old) {
			body[key] = value;
		} else if (!Array.isArray(old)) {
			body[key] = [old, value];
		} else {
			old.push(value);
		}
	});
	return await validateObject<Record<string, any>>(body, schema);
};

export const validateObject = async <T extends z.ZodRawShape>(body: T, schema: z.ZodObject<T>): Promise<Record<string, any> | never> => {
	const res = schema.safeParse(body);

	if (!res.success) {
		const err = res.error.flatten();
		throw new JSONError(
			getFormError(err),
			{
				form: err.formErrors,
				field: err.fieldErrors,
			},
			422
		);
	}
	return res.data;
};
