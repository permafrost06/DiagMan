import { sqliteTable, text, integer, numeric, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	email: text('email').unique(),
	name: text('name'),
	password: text('password'),
	pin: integer('pin'),
	role: text('role'),
});

export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	user_id: integer('user_id'),
	token: text('token'),
	remember: integer('remember'),
});

export const tests = sqliteTable('tests', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	name: text('name'),
	type: text('type', {
		enum: ['histo', 'cyto'],
	}),
	price: numeric('price'),
	size: text('size', {
		enum: ['small', 'medium', 'large', 'complex'],
	}),
	status: text('status', {
		enum: ['active', 'updated', 'deleted'],
	}),
});

export const patients = sqliteTable('patients', {
	id: text('id').primaryKey(),
	type: text('type', {
		enum: ['histo', 'cyto'],
	}),
	status: text('status', {
		enum: ['draft', 'pending', 'locked', 'complete', 'delivered'],
	}),
	name: text('name'),
	sample_collection_date: text('sample_collection_date'),
	entry_date: text('entry_date'),
	age: numeric('age'),
	gender: text('gender', {
		enum: ['male', 'female'],
	}),
	contact: text('contact'),
	specimen: text('specimen'),
	referer: text('referer'),
	delivery_date: text('delivery_date'),
	tests: blob('tests', {
		mode: 'json',
	}),
	total: numeric('total'),
	complementary: integer('complementary'),
	discount: numeric('discount'),
	advance: numeric('advance'),
	sms_sent: integer('sms_sent'),
	timestamp: integer('timestamp', {
		mode: 'timestamp',
	}),
});

export const reports = sqliteTable('reports', {
	id: text('id').primaryKey(),

	diagnosis: text('diagnosis'),
	indication: text('indication'),
	microscopic_description: text('microscopic_description'),

	// Histo specific
	anatomical_source: text('anatomical_source'),
	gross_description: text('gross_description'),
	embedded_sections: text('embedded_sections'),
	paraffin_blocks: text('paraffin_blocks'),

	// Cyto Specific
	clinical_info: text('clinical_info'),
	asp_note: text('asp_note'),
	slides_made: text('slides_made'),
	slides_stained: text('slides_stained'),

	note: text('note'),
	locked: numeric('locked'),

	autogen: integer('autogen').default(0),
	hidden: integer('hidden').default(0),
});

export const reportTemplates = sqliteTable('report_templates', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	name: text('name'),
	type: text('type', {
		enum: ['histo', 'cyto'],
	}),
	organ: text('organ'),

	diagnosis: text('diagnosis'),
	indication: text('indication'),
	microscopic_description: text('microscopic_description'),

	// Histo specific
	anatomical_source: text('anatomical_source'),
	gross_description: text('gross_description'),
	embedded_sections: text('embedded_sections'),
	paraffin_blocks: text('paraffin_blocks'),

	// Cyto Specific
	clinical_info: text('clinical_info'),
	asp_note: text('asp_note'),
	slides_made: text('slides_made'),
	slides_stained: text('slides_stained'),

	note: text('note'),
});

export const miscStrings = sqliteTable('misc_strings', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	name: text('name'),
	data: text('data'),
});
