import { z } from "zod";

export const miscStringSchema = z.object({
	name: z.string(),
	data: z.string(),
});
