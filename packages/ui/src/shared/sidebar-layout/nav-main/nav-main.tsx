"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { ISidebarRoutes } from "@workspace/ui/shared/sidebar-layout/sidebar-layout";

interface NavMainProps {
	items: ISidebarRoutes[];
	groupLabel: string;
}

export function NavMain({ items, groupLabel }: NavMainProps) {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible
						key={item.id}
						asChild
						defaultOpen={false}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							{/* Show dropdown when collapsed and item has children */}
							{isCollapsed &&
							item.child &&
							item.child.length > 0 ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton
											tooltip={item.label}
											className="flex items-center justify-between w-full"
										>
											<div className="flex items-center">
												{item.icon && (
													<item.icon className="h-5 w-5 mr-2" />
												)}
												{!isCollapsed && (
													<span>{item.label}</span>
												)}
											</div>
											{!isCollapsed && item.child && (
												<ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											)}
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-48"
										align="start"
										side="right"
										sideOffset={5}
									>
										{/* Main item as link if it has href */}
										{item.href ? (
											<DropdownMenuItem asChild>
												<Link
													href={item.href}
													className="cursor-pointer"
												>
													<div className="flex items-center">
														{item.icon && (
															<item.icon className="h-4 w-4 mr-2" />
														)}
														<span>
															{item.label}
														</span>
													</div>
												</Link>
											</DropdownMenuItem>
										) : (
											<div className="px-2 py-1.5 text-sm font-semibold flex items-center">
												{item.icon && (
													<item.icon className="h-4 w-4 mr-2" />
												)}
												<span>{item.label}</span>
											</div>
										)}

										{/* Show children items */}
										{item.child &&
											item.child.length > 0 && (
												<>
													{item.href && (
														<div className="h-px bg-border my-1" />
													)}
													{item.child.map(
														(subItem) => (
															<DropdownMenuItem
																key={subItem.id}
																asChild
															>
																<Link
																	href={
																		subItem.href!
																	}
																	className="cursor-pointer pl-6"
																>
																	<div className="flex items-center">
																		{subItem.icon && (
																			<subItem.icon className="h-4 w-4 mr-2" />
																		)}
																		<span>
																			{
																				subItem.label
																			}
																		</span>
																	</div>
																</Link>
															</DropdownMenuItem>
														)
													)}
												</>
											)}
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								/* Normal behavior when expanded or no children */
								<>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.label}
											className="flex items-center justify-between"
											asChild={!!item.href && !item.child}
										>
											{item.href && !item.child ? (
												<Link href={item.href}>
													<div className="flex items-center">
														{item.icon && (
															<item.icon className="h-5 w-5 mr-2" />
														)}
														<span>
															{item.label}
														</span>
													</div>
												</Link>
											) : (
												<div className="flex items-center justify-between w-full">
													<div className="flex items-center">
														{item.icon && (
															<item.icon className="h-5 w-5 mr-2" />
														)}
														<span>
															{item.label}
														</span>
													</div>
													{item.child && (
														<ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
													)}
												</div>
											)}
										</SidebarMenuButton>
									</CollapsibleTrigger>
									{item.child && (
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.child.map((subItem) => (
													<SidebarMenuSubItem
														key={subItem.id}
													>
														<SidebarMenuSubButton
															asChild
														>
															<Link
																href={
																	subItem.href!
																}
															>
																{subItem.icon && (
																	<subItem.icon className="h-4 w-4 mr-2" />
																)}
																<span>
																	{
																		subItem.label
																	}
																</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									)}
								</>
							)}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
