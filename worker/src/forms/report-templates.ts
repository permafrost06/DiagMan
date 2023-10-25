import { z } from 'zod';

export const reportTemplateSchema = z.object({
	id: z.string().nonempty(),
	name: z.string().nonempty(),
	organ: z.string().nonempty(),
	aspiration_note: z.string().optional(),
	gross_examination: z.string().optional(),
	impression: z.string().nonempty(),
	microscopic_examination: z.string().nonempty(),
	note: z.string().optional(),
});
