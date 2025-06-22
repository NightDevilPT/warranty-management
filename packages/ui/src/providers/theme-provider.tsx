"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme as useNextTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

export enum ThemeMode {
	LIGHT = "light",
	DARK = "dark",
	SYSTEM = "system",
}

export enum ThemeColor {
	DEFAULT = "default",
	ROSE = "rose",
	ORANGE = "orange",
	GREEN = "green",
	BLUE = "blue",
	YELLOW = "yellow",
	VIOLET = "violet",
}

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultMode?: ThemeMode;
	defaultColor?: ThemeColor;
	storageKey?: string;
};

type ThemeContextType = {
	mode: ThemeMode;
	color: ThemeColor;
	setMode: (mode: ThemeMode) => void;
	setColor: (color: ThemeColor) => void;
};

const ThemeContext = createContext<ThemeContextType>({
	mode: ThemeMode.LIGHT,
	color: ThemeColor.DEFAULT,
	setMode: () => null,
	setColor: () => null,
});

export function ThemeProvider({
	children,
	defaultMode = ThemeMode.SYSTEM,
	defaultColor = ThemeColor.DEFAULT,
	storageKey = "ui-theme",
	...props
}: ThemeProviderProps) {
	const [color, setColor] = useState<ThemeColor>(defaultColor);
	const [mounted, setMounted] = useState(false);

	// Set color from localStorage after mount to avoid hydration mismatch
	useEffect(() => {
		const storedColor = localStorage.getItem(
			`${storageKey}-color`
		) as ThemeColor;
		if (storedColor) {
			setColor(storedColor);
		}
		setMounted(true);
	}, [storageKey]);

	// Apply color class to document
	useEffect(() => {
		const root = document.documentElement;
		Object.values(ThemeColor).forEach((c) => root.classList.remove(c));
		if (color !== ThemeColor.DEFAULT) {
			root.classList.add(color);
		}
		localStorage.setItem(`${storageKey}-color`, color);
	}, [color, storageKey]);

	// Prevent rendering children until mounted to ensure consistent rendering
	if (!mounted) {
		return null;
	}

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme={defaultMode}
			enableSystem={defaultMode === ThemeMode.SYSTEM}
			storageKey={`${storageKey}-mode`}
			{...props}
		>
			<ThemeContextProvider
				storageKey={storageKey}
				defaultMode={defaultMode}
				color={color}
				setColor={setColor}
			>
				{children}
			</ThemeContextProvider>
		</NextThemesProvider>
	);
}

function ThemeContextProvider({
	children,
	storageKey,
	defaultMode,
	color,
	setColor,
}: {
	children: React.ReactNode;
	storageKey: string;
	defaultMode: ThemeMode;
	color: ThemeColor;
	setColor: (color: ThemeColor) => void;
}) {
	const { theme, setTheme } = useNextTheme();

	const contextValue = {
		mode: (theme as ThemeMode) || defaultMode,
		color,
		setMode: (mode: ThemeMode) => setTheme(mode),
		setColor,
	};

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
