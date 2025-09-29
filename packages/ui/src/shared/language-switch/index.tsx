// components/LanguageSwitcher.tsx
"use client";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@workspace/ui/components/command";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ILanguage, useTheme } from "@workspace/ui/context/theme-context";

// Define supported languages with their metadata
const SUPPORTED_LANGUAGES = {
	[ILanguage.EN]: {
		name: "English",
		flag: "🇺🇸",
		nativeName: "English",
	},
	[ILanguage.FR]: {
		name: "French",
		flag: "🇫🇷",
		nativeName: "Français",
	},
	[ILanguage.ES]: {
		name: "Spanish",
		flag: "🇪🇸",
		nativeName: "Español",
	},
	// Japanese
	[ILanguage.JA]: {
		name: "Japanese",
		flag: "🇯🇵", // JP flag; may display as “JP” on some platforms
		nativeName: "日本語", // Nihongo
	},
	[ILanguage.DE]: {
		name: "German",
		flag: "🇩🇪",
		nativeName: "Deutsch",
	},
} as const;

interface LanguageSwitcherProps {
	variant?: "default" | "outline" | "ghost" | "link";
	size?: "default" | "sm" | "lg" | "icon";
	showFlag?: boolean;
	showText?: boolean;
	className?: string;
	align?: "center" | "start" | "end";
}

export function LanguageSwitcher({
	variant = "ghost",
	size = "default",
	showFlag = true,
	showText = true,
	className,
	align = "end",
}: LanguageSwitcherProps) {
	const { language, setLanguage, isLoading } = useTheme();
	const [open, setOpen] = useState(false);

	const currentLanguage = SUPPORTED_LANGUAGES[language];

	const handleLanguageChange = (languageCode: ILanguage) => {
		setLanguage(languageCode);
		setOpen(false);
	};

	if (isLoading) {
		return (
			<Button
				variant={variant}
				size={size}
				className={cn(
					"justify-between gap-2",
					size === "icon" ? "w-10 px-0" : "px-3",
					className
				)}
				disabled
			>
				<div className="flex items-center gap-2">
					{size !== "icon" && <Globe className="h-4 w-4 shrink-0" />}
					{showFlag && <span>🌐</span>}
					{showText && size !== "icon" && (
						<span className="truncate">Loading...</span>
					)}
				</div>
			</Button>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					role="combobox"
					aria-expanded={open}
					className={cn(
						"justify-between gap-2",
						size === "icon" ? "w-10 px-0" : "px-3",
						className
					)}
				>
					<div className="flex items-center gap-2">
						{size !== "icon" && (
							<Globe className="h-4 w-4 shrink-0" />
						)}
						{showFlag && <span>{currentLanguage.flag}</span>}
						{showText && size !== "icon" && (
							<span className="truncate">
								{currentLanguage.name}
							</span>
						)}
					</div>
					{size !== "icon" && (
						<ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[200px] p-0"
				align={align}
				sideOffset={5}
			>
				<Command>
					<CommandInput placeholder="Search languages..." />
					<CommandList className="max-h-[300px] overflow-y-auto">
						<CommandEmpty>No language found</CommandEmpty>
						<CommandGroup>
							{Object.entries(SUPPORTED_LANGUAGES).map(
								([code, { name, flag }]) => (
									<CommandItem
										key={code}
										value={`${code}-${name}`}
										onSelect={() =>
											handleLanguageChange(
												code as ILanguage
											)
										}
										className="cursor-pointer gap-2"
									>
										<span className="text-lg">{flag}</span>
										<span>{name}</span>
										<Check
											className={cn(
												"ml-auto h-4 w-4",
												language === code
													? "opacity-100"
													: "opacity-0"
											)}
										/>
									</CommandItem>
								)
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
