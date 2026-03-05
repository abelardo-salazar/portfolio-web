import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Geist_Mono } from "next/font/google";
import "@abelardo-salazar/core-ui-design-system/style.css";
import "../globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { getMessages, getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Toast } from "@/components/ui-wrapper";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: `${siteConfig.name} | ${t("title")}`,
    },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "es-VE": "/es",
        "en-US": "/en",
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
  const messages = await getMessages({ locale });
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Toast />
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
