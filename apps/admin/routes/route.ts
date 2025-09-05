import { SupportedLanguage } from "@workspace/ui/i18n/config";
import { Home, Settings } from "lucide-react";

export const ROUTES = (language: SupportedLanguage) => [
	{
		title: "Dashboard",
		url: `/${language}/dashboard`,
		icon: Home,
	},
	{
		title: "Settings",
		url: `/${language}/settings`,
		icon: Settings,
	},
];
