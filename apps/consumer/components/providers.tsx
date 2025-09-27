"use client";

import * as React from "react";
import { ThemeContextProvider } from "@workspace/ui/context/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
	return <ThemeContextProvider>{children}</ThemeContextProvider>;
}
