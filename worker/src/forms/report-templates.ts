import { z } from 'zod';

export const reportTemplateSchema = z.object({
	id: z.string().optional(),
	name: z.string().nonempty(),
	organ: z.string().nonempty(),
	aspiration_note: z.string().optional(),
	gross_examination: z.string().optional(),
	impression: z.string().optional(),
	microscopic_examination: z.string().optional(),
	note: z.string().optional(),
});
