import {
	SUPPORTED_LANGUAGES,
	SupportedLanguage,
} from "@workspace/ui/i18n/config";
import { I18nProvider } from "@workspace/ui/providers/I18n-provider";
import { ThemeProvider } from "@workspace/ui/providers/theme-provider";
import { ClickSpark } from "@workspace/ui/shared/atoms/click-spark";

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
	return (
		<ThemeProvider>
			<ClickSpark
				sparkColor="text-primary"
				sparkSize={10}
				sparkRadius={15}
				sparkCount={8}
				duration={400}
			>
				<I18nProvider lng={locale}>{children}</I18nProvider>
			</ClickSpark>
		</ThemeProvider>
	);
}
