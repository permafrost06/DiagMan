import type { Config } from 'drizzle-kit';

export default {
	schema: './database/schema.ts',
	out: './migrations',
	driver: 'turso',
	breakpoints: false,
} as Config;
