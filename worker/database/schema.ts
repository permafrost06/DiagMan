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
	id: integer('id').primaryKey({
		autoIncrement: true,
	}),
	phone_no: text('phone_no'),
	name: text('name'),
	age: text('age'),
	gender: text('gender', {
		enum: ['male', 'female'],
	}),
	contact: text('contact'),
	type: text('type', {
		enum: ['histo', 'cyto'],
	}),
	status: text('status', {
		enum: ['draft', 'pending', 'locked', 'complete'],
	}),
	sample_collection_date: text('sample_collection_date'),
	entry_date: text('entry_date'),
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
