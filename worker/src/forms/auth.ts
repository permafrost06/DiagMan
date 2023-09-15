import { z } from 'zod';

export const registerForm = z.object({
	name: z.string().nonempty(),
	email: z.string().email(),
	password: z.string().nonempty(),
	confirm_password: z.string().nonempty(),
});
