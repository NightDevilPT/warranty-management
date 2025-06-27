import { Home, Settings } from "lucide-react";

export const ROUTES = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
		items: [
			{
				title: "Overview",
				url: "/dashboard/overview",
			},
			{ title: "Stats", url: "/dashboard-stats" },
		],
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
];
