"use client";

import React from "react";
import { Separator } from "@workspace/ui/components/separator.js";
import { LanguageSwitcher } from "../theme-toggle/language-switcher.js";
import { ThemeSwitcher } from "../theme-toggle/theme-toggle.js";
import { SidebarTrigger } from "@workspace/ui/components/sidebar.js";

interface HeaderSectionProps {
	onLanguageChange?: (languageCode: string) => void;
}

export function HeaderSection({ onLanguageChange }: HeaderSectionProps) {
	return (
		<header className="flex justify-between pr-5 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
			</div>
			<div className="w-auto h-auto flex justify-center items-center gap-2">
				<LanguageSwitcher
					size="sm"
					variant="ghost"
					showFlag={false}
					onLanguageChange={onLanguageChange}
				/>
				<ThemeSwitcher />
			</div>
		</header>
	);
}
