import { z } from 'zod';

export const testSchema = z.object({
	id: z.preprocess((val: any) => parseInt(val), z.number().min(0)).optional(),
	name: z.string().nonempty(),
	type: z.enum(['cyto', 'histo']),
	size: z.enum(['small', 'medium', 'large', 'complex', '']),
	price: z.coerce.number().min(1),
	status: z.enum(['active', 'updated', 'deleted']).default('active'),
});
