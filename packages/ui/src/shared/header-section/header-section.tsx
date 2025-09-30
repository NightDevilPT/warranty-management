"use client";

import { Separator } from "@workspace/ui/components/separator";
import { useTheme } from "@workspace/ui/context/theme-context";
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar";
import { LanguageSwitcher } from "@workspace/ui/shared/language-switch/index";
import { ThemeToggle } from "@workspace/ui/shared/theme-toggle/theme-toggle";
import { RouteBreadcrumb } from "@workspace/ui/shared/route-breadcrumb/route-breadcrumb";

const HeaderSection = () => {
	const { state } = useSidebar();
	const { setSidebarState } = useTheme();
	return (
		<header
			className={`w-full h-full flex justify-between items-center gap-5 px-5 py-4`}
		>
			<div className={`flex justify-center items-center gap-4 h-full`}>
				<SidebarTrigger
					onClick={() => {
						setSidebarState(
							state === "collapsed" ? "expanded" : "collapsed"
						);
					}}
				/>
				<Separator orientation={"vertical"} />
				<RouteBreadcrumb />
			</div>
			<div className="w-auto h-auto flex justify-center items-center gap-4">
				<LanguageSwitcher showText={false} variant={"outline"} />
				<ThemeToggle />
			</div>
		</header>
	);
};

export default HeaderSection;
