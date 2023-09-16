import { z } from 'zod';

export const userForm = z.object({
	name: z.string().nonempty(),
	email: z.string().email(),
	password: z.string().nonempty(),
	role: z.enum(['admin', 'cashier']),
});

export const userUpdateForm = z.object({
	id: z.coerce.number(),
	name: z.string().nonempty(),
	email: z.string().email(),
	password: z.string().optional(),
	role: z.enum(['admin', 'cashier']),
});
