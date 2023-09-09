import { z } from 'zod';

export const testSchema = z.object({
	id: z.preprocess((val: any) => parseInt(val), z.number().min(0)).optional(),
	name: z.string().nonempty(),
	price: z.preprocess((val: any) => parseInt(val), z.number().min(0)),
	size: z.enum(['small', 'medium', 'large', 'complex', '']),
	status: z.enum(['active', 'updated', 'deleted']).default('active'),
});
