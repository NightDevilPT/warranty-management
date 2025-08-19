"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar.tsx";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@workspace/ui/components/collapsible.tsx";
import { SidebarNavbarItemsProps } from "@workspace/ui/types/sidebar.interface.ts";

interface NavbarItemsProps {
	items: SidebarNavbarItemsProps[];
}

export function NavbarItems({ items }: NavbarItemsProps) {
	return (
		<SidebarMenu>
			{items.map((item) => (
				<Collapsible
					key={item.title}
					asChild
					defaultOpen={item.isActive}
					className="group/collapsible"
				>
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton
								tooltip={item.title}
								isActive={item.isActive}
							>
								{item.icon && <item.icon className="h-4 w-4" />}
								<span>{item.title}</span>
								{item.items && (
									<ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								)}
							</SidebarMenuButton>
						</CollapsibleTrigger>
						{item.items && (
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton asChild>
												<a href={subItem.url}>
													<span>{subItem.title}</span>
												</a>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						)}
					</SidebarMenuItem>
				</Collapsible>
			))}
		</SidebarMenu>
	);
}
