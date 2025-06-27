"use client";

import React from "react";
import {
	SidebarGroup,
	SidebarGroupLabel,
} from "@workspace/ui/components/sidebar.js";
import { SidebarNavbarItemsProps } from "@workspace/ui/types/sidebar.interface.js";
import { NavbarItems } from "./navbar-items.js";

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
