"use client";

import * as React from "react";
import { GiBorderedShield } from "react-icons/gi";
import { cn } from "@workspace/ui/lib/utils";

export interface LogoProps {
	size?: number | string; // Allow number (px) or string (e.g., '2rem')
	className?: string;
}

export const Logo: React.FC<LogoProps> = React.memo(
	({ size = "2rem", className }) => {
		return (
			<GiBorderedShield
				className={cn("text-primary", className)}
				style={{ width: size, height: size }}
			/>
		);
	}
);

Logo.displayName = "Logo";
