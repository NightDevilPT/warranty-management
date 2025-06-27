import {
	SUPPORTED_LANGUAGES,
	SupportedLanguage,
} from "@workspace/ui/i18n/config";
import { RootProvider } from "@/components/providers/root-provider";

export async function generateStaticParams() {
	return Object.keys(SUPPORTED_LANGUAGES).map((locale) => ({ locale }));
}

export default function RootLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode;
	params: { locale: SupportedLanguage };
}) {
	return <RootProvider locale={locale}>{children}</RootProvider>;
}
