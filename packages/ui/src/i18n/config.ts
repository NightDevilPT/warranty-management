export const SUPPORTED_LANGUAGES: Record<
	string,
	{ name: string; flag: string }
> = {
	// de: { name: "Deutsch", flag: "🇩🇪" },
	en: { name: "English", flag: "🇺🇳" },
	es: { name: "Español", flag: "🇪🇸" },
	fr: { name: "Français", flag: "🇫🇷" },
	// hi: { name: "हिन्दी", flag: "🇮🇳" },
	// it: { name: "Italiano", flag: "🇮🇹" },
	// ja: { name: "日本語", flag: "🇯🇵" },
	// ko: { name: "한국어", flag: "🇰🇷" },
	// pt: { name: "Português", flag: "🇵🇹" },
	// th: { name: "ไทย", flag: "🇹🇭" },
	// tr: { name: "Türkçe", flag: "🇹🇷" },
	// vi: { name: "Tiếng Việt", flag: "🇻🇳" },
	// zh: { name: "中文", flag: "🇨🇳" },
};

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const defaultLocale: SupportedLanguage = "en";
