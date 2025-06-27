import { type LucideIcon } from "lucide-react";

export interface SidebarNavbarItemsProps {
	title: string;
	icon?: LucideIcon;
	url: string;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
}

export interface SidebarContainerProps {
	children?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	navbarItems?: SidebarNavbarItemsProps[];
	trigger?: React.ReactNode;
	onLanguageChange?: (languageCode: string) => void;
}
