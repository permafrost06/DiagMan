CREATE TABLE `report_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`type` text,
	`organ` text,
	`diagnosis` text,
	`indication` text,
	`microscopic_description` text,
	`anatomical_source` text,
	`gross_description` text,
	`embedded_sections` text,
	`paraffin_blocks` text,
	`clinical_info` text,
	`asp_note` text,
	`slides_made` text,
	`slides_stained` text,
	`note` text
);

CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`diagnosis` text,
	`indication` text,
	`microscopic_description` text,
	`anatomical_source` text,
	`gross_description` text,
	`embedded_sections` text,
	`paraffin_blocks` text,
	`clinical_info` text,
	`asp_note` text,
	`slides_made` text,
	`slides_stained` text,
	`note` text,
	`locked` numeric
);
