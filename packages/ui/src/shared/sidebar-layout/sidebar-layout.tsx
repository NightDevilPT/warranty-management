"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
} from "@workspace/ui/components/sidebar";
import * as React from "react";
import { Separator } from "@workspace/ui/components/separator";
import { useTheme } from "@workspace/ui/context/theme-context";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import HeaderSection from "@workspace/ui/shared/header-section/header-section";
import { NavMain } from "@workspace/ui/shared/sidebar-layout/nav-main/nav-main";

export interface ISidebarRoutes {
	id: string;
	label: string;
	icon: React.ElementType;
	href?: string;
	child?: ISidebarRoutes[];
}

interface ILayoutProviderProps {
	children: React.ReactNode;
	header: React.ReactNode;
	footer: React.ReactNode;
	sidebarRoute: ISidebarRoutes[];
	groupLabel: string;
}

export function LayoutProvider({
	footer,
	header,
	children,
	sidebarRoute,
	groupLabel,
}: ILayoutProviderProps) {
	const { sidebarVariant, sidebarCollapsible } = useTheme();
	return (
		<SidebarProvider>
			<Sidebar variant={sidebarVariant} collapsible={sidebarCollapsible}>
				<SidebarHeader className="h-[60px]">{header}</SidebarHeader>
				<Separator />
				<SidebarContent>
					<NavMain items={sidebarRoute} groupLabel={groupLabel} />
				</SidebarContent>
				<SidebarFooter>{footer}</SidebarFooter>
			</Sidebar>
			<SidebarInset className={`grid grid-rows-[60px_1px_1fr]`}>
				<HeaderSection />
				<Separator />
				<ScrollArea
					className={`h-[calc(100vh-61px)] px-5 overflow-hidden overflow-y-auto`}
				>
					{children}
				</ScrollArea>
			</SidebarInset>
		</SidebarProvider>
	);
}
