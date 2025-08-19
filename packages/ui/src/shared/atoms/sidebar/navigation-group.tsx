"use client";

import React from "react";
import {
	SidebarGroup,
	SidebarGroupLabel,
} from "@workspace/ui/components/sidebar.tsx";
import { SidebarNavbarItemsProps } from "@workspace/ui/types/sidebar.interface.tsx";
import { NavbarItems } from "./navbar-items.tsx";

interface NavigationGroupProps {
	items: SidebarNavbarItemsProps[];
}

export function NavigationGroup({ items }: NavigationGroupProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Navigation</SidebarGroupLabel>
			<NavbarItems items={items} />
		</SidebarGroup>
	);
}
