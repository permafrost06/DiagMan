import { z } from 'zod';

export const reportTemplateSchema = z.object({
	id: z.string().optional(),
	name: z.string().nonempty(),
	type: z.enum(['histo', 'cyto']),
	organ: z.string().nonempty(),
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
});
