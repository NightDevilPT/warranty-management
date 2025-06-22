"use client";

import i18n from "../i18n/i18n.js";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../i18n/config.js";

interface I18nProviderProps {
	children: React.ReactNode;
	lng?: SupportedLanguage; // Initial language from server
}

export function I18nProvider({ children, lng }: I18nProviderProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);

		// Run only on client side
		if (typeof window !== "undefined") {
			const savedLanguage = localStorage.getItem("i18nextLng");
			const availableLanguages = Object.keys(
				SUPPORTED_LANGUAGES
			) as SupportedLanguage[];

			// Use saved language if valid, otherwise fallback to server-provided language or default
			const languageToUse = availableLanguages.includes(
				savedLanguage as SupportedLanguage
			)
				? savedLanguage
				: lng || i18n.options.lng || "en";

			if (languageToUse && i18n.language !== languageToUse) {
				i18n.changeLanguage(languageToUse);
			}
		}
	}, [lng]);

	// Prevent hydration mismatch by rendering nothing until mounted
	if (!mounted) {
		return null;
	}

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
