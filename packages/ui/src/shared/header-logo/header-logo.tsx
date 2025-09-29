"use client";

import { ShieldCheck } from "lucide-react";
import { Label } from "@workspace/ui/components/label";
import { useSidebar } from "@workspace/ui/components/sidebar";

interface IHeaderLogoProps {
	title?: string;
	subtitle?: string;
}

const HeaderLogo = ({ title, subtitle }: IHeaderLogoProps) => {
	const { state } = useSidebar();
	return (
		<div
			className={`w-full h-auto grid grid-cols-[40px_1fr] ${state === "collapsed" && "grid-cols-1 place-content-center place-items-center"}`}
		>
			<div
				className={`w-full h-full flex justify-center items-center border-2 rounded-md border-primary/50`}
			>
				<ShieldCheck className="!h-8 text-primary" />
			</div>

			<div
				className={`ml-3 overflow-hidden transition-all duration-300 text-nowrap ${state === "expanded" ? "w-full" : "w-0 hidden"}`}
			>
				<Label className="text-base">
					{title || "Warranty System"}
				</Label>
				<Label className="text-xs text-muted-foreground">
					{subtitle || "Manage your warranties"}
				</Label>
			</div>
		</div>
	);
};

export default HeaderLogo;
