// @ts-expect-error to types for cookies
import { parse } from 'cookie';
import { RequestHandler } from '../router';

export const assignCookies: RequestHandler = (event) => {
	event.cookies = parse(event.request.headers.get('Cookie') || '');
};
