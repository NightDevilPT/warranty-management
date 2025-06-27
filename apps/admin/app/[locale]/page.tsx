"use client";

import { useTranslation } from "react-i18next";

export default function Home() {
	const { t } = useTranslation();

	return (
		<div className="p-4">
			<h1 className="text-primary">{t("general.welcome")}</h1>
		</div>
	);
}
