import { z } from 'zod';

export const patientSchema = z.object({
	id: z.string().nonempty(),
	type: z.enum(['histo', 'cyto']),
	status: z.enum(['draft', 'pending', 'locked', 'complete']),
	name: z.string().nonempty(),
	sample_collection_date: z.coerce.date(),
	entry_date: z.coerce.date(),
	age: z.coerce.number().positive(),
	gender: z.enum(['male', 'female']),
	contact: z.string(),
	specimen: z.string(),
	referer: z.string(),
	delivery_date: z.coerce.date(),
	tests: z.array(z.string()).min(1),
	discount: z.coerce.number().nonnegative(),
	advance: z.coerce.number().positive(),
});

export const reportSchema = z.object({
	id: z.string().nonempty(),
	aspiration_note: z.string().nonempty(),
	impression: z.string().nonempty(),
	note: z.string().nonempty(),
	gross_examination: z.string().optional(),
	microscopic_examination: z.string().optional(),
});
