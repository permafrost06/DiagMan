import { z } from 'zod';

const stringDate = z.preprocess(
	(arg) => (typeof arg === 'string' && arg.length === 10 ? `${arg}T00:00:00.000Z` : arg),
	z.string().datetime()
);
const strNum = z.preprocess((val: any) => parseInt(val), z.number().min(0));

export const patientSchema = z.object({
	id: z.string().nonempty(),
	type: z.enum(['histo', 'cyto']),
	status: z.enum(['draft', 'pending', 'locked', 'complete']),
	name: z.string(),
	sample_collection_date: stringDate,
	entry_date: stringDate,
	age: strNum,
	gender: z.enum(['male', 'female']),
	contact: z.string(),
	specimen: z.string(),
	referer: z.string(),
	delivery_date: stringDate,
	tests: z.array(z.string()),
	discount: strNum,
	advance: strNum,
});

export const reportSchema = z.object({
	id: z.string().nonempty(),
	aspiration_note: z.string().nonempty(),
	impression: z.string().nonempty(),
	note: z.string().nonempty(),
	gross_examination: z.string().optional(),
	microscopic_examination: z.string().optional(),
});
