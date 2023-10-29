CREATE TABLE `report_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`type` text,
	`organ` text,
	`aspiration_note` text,
	`gross_examination` text,
	`microscopic_examination` text,
	`impression` text,
	`note` text
);
