"use client";

import { ROUTES } from "@/routes/route";
import { SupportedLanguage } from "@workspace/ui/i18n/config";
import { I18nProvider } from "@workspace/ui/providers/I18n-provider";
import { ThemeProvider } from "@workspace/ui/providers/theme-provider";
import { ClickSpark } from "@workspace/ui/shared/atoms/click-spark";
import { SidebarContainer } from "@workspace/ui/shared/molecules/sidebar-container";
import { Home, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export function RootProvider({
	children,
	locale,
}: {
	children: React.ReactNode;
	locale: any;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const handleLanguageChange = (languageCode: SupportedLanguage) => {
		const newPath = pathname.replace(/^\/[a-z]{2}/, `/${languageCode}`);
		router.push(newPath);
	};
	return (
		<ThemeProvider>
			<ClickSpark
				sparkColor="text-primary"
				sparkSize={10}
				sparkRadius={15}
				sparkCount={8}
				duration={400}
			>
				<I18nProvider lng={locale}>
					<SidebarContainer
						header={<div></div>}
						footer={<div>Footer Content</div>}
						navbarItems={ROUTES}
						onLanguageChange={handleLanguageChange}
					>
						{children}
					</SidebarContainer>
				</I18nProvider>
			</ClickSpark>
		</ThemeProvider>
	);
}
