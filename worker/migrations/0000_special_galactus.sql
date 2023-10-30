CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text,
	`status` text,
	`name` text,
	`sample_collection_date` text,
	`entry_date` text,
	`age` numeric,
	`gender` text,
	`contact` text,
	`specimen` text,
	`referer` text,
	`delivery_date` text,
	`tests` blob,
	`discount` numeric,
	`advance` numeric,
	`timestamp` integer
);

CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`aspiration_note` text,
	`gross_examination` text,
	`microscopic_examination` text,
	`impression` text,
	`note` text
);

CREATE TABLE `tests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`price` numeric,
	`size` text,
	`status` text
);
