"use client";

import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import { SupportedLanguage } from "@workspace/ui/i18n/config";
import { ThemeSwitcher } from "@workspace/ui/shared/atoms/color-change";
import { LanguageSwitcher } from "@workspace/ui/shared/atoms/theme-toggle/language-switcher";

export default function Home() {
	const { t } = useTranslation();
	const router = useRouter();
	const pathname = usePathname();

	const handleLanguageChange = (languageCode: SupportedLanguage) => {
		const newPath = pathname.replace(/^\/[a-z]{2}/, `/${languageCode}`);
		router.push(newPath);
	};

	return (
		<div className="p-4">
			<h1 className="text-primary">{t("welcome")}</h1>
			<LanguageSwitcher onLanguageChange={handleLanguageChange} />
			<ThemeSwitcher />
		</div>
	);
}
