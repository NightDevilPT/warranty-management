const dictionaries = {
	en: () => import("./locales/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: keyof typeof dictionaries) => {
	const languageDict = await dictionaries[locale]();
	return languageDict;
};
