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
	contact: z.string().regex(/^\d*$/, 'Must only contain numbers'),
	specimen: z.string(),
	referer: z.string(),
	delivery_date: z.coerce.date(),
	tests: z.array(z.string()).min(1),
	prices: z.array(z.coerce.number().nonnegative()).min(1),
	discount: z.coerce.number().nonnegative(),
	advance: z.coerce.number().nonnegative(),
	complementary: z.coerce.boolean(),
	timestamp: z.coerce.number().nonnegative(),
});

export const reportSchema = z.object({
	id: z.string().nonempty(),
	diagnosis: z.string().optional(),
	indication: z.string().optional(),
	microscopic_description: z.string().optional(),
	anatomical_source: z.string().optional(),
	gross_description: z.string().optional(),
	embedded_sections: z.string().optional(),
	paraffin_blocks: z.string().optional(),
	clinical_info: z.string().optional(),
	asp_note: z.string().optional(),
	slides_made: z.coerce.number().int().min(0).default(0),
	slides_stained: z.coerce.number().int().min(0).default(0),
	note: z.string().optional(),
	locked: z.coerce.boolean(),
});
