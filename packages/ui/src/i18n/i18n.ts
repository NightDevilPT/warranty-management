import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };
import { defaultLocale } from "./config.ts";
//   import fr from './locales/fr.json' assert { type: "json" };
//   import de from './locales/de.json' assert { type: "json" };
//   import hi from './locales/hi.json' assert { type: "json" };
//   import it from './locales/it.json' assert { type: "json" };
//   import ja from './locales/ja.json' assert { type: "json" };
//   import ko from './locales/ko.json' assert { type: "json" };
//   import pt from './locales/pt.json' assert { type: "json" };
//   import th from './locales/th.json' assert { type: "json" };
//   import tr from './locales/tr.json' assert { type: "json" };
//   import vi from './locales/vi.json' assert { type: "json" };
//   import zh from './locales/zh.json' assert { type: "json" };

const resources = {
	// de: { translation: de },
	en: { translation: en },
	es: { translation: es },
	// fr: { translation: fr },
	// hi: { translation: hi },
	// it: { translation: it },
	// ja: { translation: ja },
	// ko: { translation: ko },
	// pt: { translation: pt },
	// th: { translation: th },
	// tr: { translation: tr },
	// vi: { translation: vi },
	// zh: { translation: zh },
};

i18n.use(initReactI18next).init({
	resources,
	lng: defaultLocale,
	fallbackLng: defaultLocale,
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
