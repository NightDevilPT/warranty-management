"use client";
import { Button } from "@workspace/ui/components/button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu.js";
import { ThemeColor, ThemeMode, useTheme } from "@workspace/ui/providers/theme-provider.js";
import { Sun, Moon, Palette } from "lucide-react";


export function ThemeSwitcher() {
	const { mode, color, setMode, setColor } = useTheme();

	const colors = [
		{ name: "Default", value: ThemeColor.DEFAULT },
		{ name: "Rose", value: ThemeColor.ROSE },
		{ name: "Orange", value: ThemeColor.ORANGE },
		{ name: "Green", value: ThemeColor.GREEN },
		{ name: "Blue", value: ThemeColor.BLUE },
		{ name: "Yellow", value: ThemeColor.YELLOW },
		{ name: "Violet", value: ThemeColor.VIOLET },
	];

	const toggleDarkMode = () => {
		setMode(mode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK);
	};

	return (
		<div className="flex gap-2">
			<Button variant="ghost" size="icon" onClick={toggleDarkMode}>
				{mode === ThemeMode.DARK ? (
					<Moon className="h-4 w-4" />
				) : (
					<Sun className="h-4 w-4" />
				)}
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<Palette className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{colors.map((t) => (
						<DropdownMenuItem
							key={t.value}
							onClick={() => setColor(t.value)}
						>
							{t.name}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
