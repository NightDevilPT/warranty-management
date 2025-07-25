"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
} from "@workspace/ui/components/sidebar.js";
import { HeaderSection } from "../atoms/sidebar/header-section.js";
import { NavigationGroup } from "../atoms/sidebar/navigation-group.js";
import { SidebarContainerProps } from "@workspace/ui/types/sidebar.interface.js";
import { Separator } from "@workspace/ui/components/separator.js";

export function SidebarContainer({
	children,
	header,
	footer,
	navbarItems = [],
	trigger,
	onLanguageChange,
}: SidebarContainerProps) {
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				{trigger}
				<SidebarHeader>{header}</SidebarHeader>
				<Separator />
				<SidebarContent>
					<NavigationGroup items={navbarItems} />
				</SidebarContent>
				<Separator />
				<SidebarFooter>{footer}</SidebarFooter>
			</Sidebar>
			<SidebarInset className="w-full h-screen grid grid-rows-[60px_1fr]">
				<HeaderSection onLanguageChange={onLanguageChange} />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
