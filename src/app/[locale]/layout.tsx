import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Ubuntu } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { SkipToContent, Toast } from "@abelardo-salazar/core-ui-design-system";
import "@abelardo-salazar/core-ui-design-system/style.css";
import "../globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Ligth, Regular, Medium, Bold
  variable: "--font-ubuntu", // Ideal si usas Tailwind
  display: "swap",
});
const baseUrl = siteConfig.url;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: `${siteConfig.name} | ${t("title")}`,
    },
    description: t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "es-VE": `${baseUrl}/es`,
        "en-US": `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_VE" : "en_US",
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name,
      // images: [
      //   {
      //     url: "/og-image.png",
      //     width: 1200,
      //     height: 630,
      //     alt: "Abelardo Salazar Portfolio",
      //   },
      // ],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const tToast = await getTranslations({ locale, namespace: "Toast" });
  const tNavbar = await getTranslations({ locale, namespace: "Navbar" });
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${ubuntu.className} antialiased flex flex-col min-h-screen`}
      >
        <SkipToContent>{tNavbar("skipToContent")}</SkipToContent>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <Navbar />
            {/* tabIndex lets the skip link move focus here, not just scroll.
                It is a skip target, not a control, so no focus outline. */}
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-grow focus:outline-none"
            >
              {children}
            </main>
            <Toast containerAriaLabel={tToast("containerLabel")} />
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
