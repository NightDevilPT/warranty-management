"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@workspace/ui/i18n/config.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover.tsx";
import { Button } from "@workspace/ui/components/button.tsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command.tsx";
import { cn } from "@workspace/ui/lib/utils.ts";

interface LanguageSwitcherProps {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	showFlag?: boolean;
	showText?: boolean;
	className?: string;
	onLanguageChange?: (languageCode: SupportedLanguage) => void;
}

export function LanguageSwitcher({
	variant = "outline",
	size = "default",
	showFlag = true,
	showText = true,
	className,
	onLanguageChange,
}: LanguageSwitcherProps) {
	const { i18n } = useTranslation();
	const [open, setOpen] = useState(false);
	const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en");

	useEffect(() => {
		setCurrentLang(i18n.language as SupportedLanguage);
	}, [i18n.language]);

	const currentLanguage = SUPPORTED_LANGUAGES[currentLang];

	const handleLanguageChange = (languageCode: SupportedLanguage) => {
		i18n.changeLanguage(languageCode);
		localStorage.setItem("i18nextLng", languageCode);
		setCurrentLang(languageCode);
		setOpen(false);
		if (onLanguageChange) {
			onLanguageChange(languageCode);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					role="combobox"
					aria-expanded={open}
					className={cn("justify-between", className)}
				>
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4" />
						{showFlag && <span>{currentLanguage?.flag}</span>}
						{showText && <span>{currentLanguage?.name}</span>}
					</div>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0">
				<Command>
					<CommandInput placeholder="Search languages..." />
					<CommandList>
						<CommandEmpty>No languages found.</CommandEmpty>
						<CommandGroup>
							{Object.entries(SUPPORTED_LANGUAGES).map(
								([code, language]) => (
									<CommandItem
										key={code}
										value={code}
										onSelect={() =>
											handleLanguageChange(
												code as SupportedLanguage
											)
										}
										className="cursor-pointer"
									>
										<div className="flex items-center gap-2 flex-1">
											<span>{language.flag}</span>
											<span>{language.name}</span>
										</div>
										<Check
											className={cn(
												"ml-auto h-4 w-4",
												currentLang === code
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
