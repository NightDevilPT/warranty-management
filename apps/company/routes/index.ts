import {
	LayoutDashboard,
	FileText,
	Building2,
	Users,
	Settings,
} from "lucide-react";
import { ISidebarRoutes } from "@workspace/ui/shared/sidebar-layout/sidebar-layout";

export const SidebarRoutes: ISidebarRoutes[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		href: "/admin",
	},
	{
		id: "product-schemas",
		label: "Form Schemas",
		icon: FileText,
		child: [
			{
				id: "create-schema",
				label: "Create Schema",
				icon: FileText,
				href: "/admin/product-schemas/create",
			},
			{
				id: "manage-schemas",
				label: "Manage Schemas",
				icon: FileText,
				href: "/admin/product-schemas",
			},
		],
	},
	{
		id: "companies",
		label: "Companies",
		icon: Building2,
		child: [
			{
				id: "onboard-company",
				label: "Onboard Company",
				icon: Building2,
				href: "/admin/companies/onboard",
			},
			{
				id: "manage-companies",
				label: "Manage Companies",
				icon: Building2,
				href: "/admin/companies",
			},
		],
	},
	{
		id: "personas",
		label: "Personas",
		icon: Users,
		child: [
			{
				id: "define-persona",
				label: "Define Persona",
				icon: Users,
				href: "/admin/personas/define",
			},
			{
				id: "manage-personas",
				label: "Manage Personas",
				icon: Users,
				href: "/admin/personas",
			},
		],
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		href: "/admin/settings",
	},
];
