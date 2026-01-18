// email-builder.interface.ts
export interface EmailTemplateData {
	[key: string]: string | number | boolean | Date;
}

export interface EmailTemplateOptions {
	title: string;
	subtitle?: string;
	previewText?: string;
	showLogo?: boolean;
	includeSocialLinks?: boolean;
}

export interface WarrantyDetail {
	label: string;
	value: string;
}

export interface TimelineItem {
	date: string;
	title: string;
	description: string;
}

export interface FeatureItem {
	icon: string;
	text: string;
}

export interface EmailSection {
	type: 'header' | 'greeting' | 'message' | 'button' | 'info' | 'warning' |
	'alert' | 'action' | 'warranty' | 'timeline' | 'features' |
	'divider' | 'footer' | 'custom';
	content: string;
	data?: EmailTemplateData;
}

export interface EmailTemplate {
	options: EmailTemplateOptions;
	sections: EmailSection[];
	styles: string;
	variables?: EmailTemplateData;
}

export interface BuiltEmail {
	html: string;
	text: string; // Plain text version
	subject: string;
	previewText?: string;
}