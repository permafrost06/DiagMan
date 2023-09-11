import { sqliteTable, text, integer, numeric, blob } from 'drizzle-orm/sqlite-core';

export const tests = sqliteTable('tests', {
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	name: text('name'),
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
		enum: ['draft', 'pending', 'locked', 'complete'],
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
	discount: numeric('discount'),
	advance: numeric('advance'),
	timestamp: integer('timestamp', {
		mode: 'timestamp',
	}),
});

export const reports = sqliteTable('reports', {
	id: text('id').primaryKey(),
	aspiration_note: text('aspiration_note'),
	gross_examination: text('gross_examination'),
	microscopic_examination: text('microscopic_examination'),
	impression: text('impression'),
	note: text('note'),
});