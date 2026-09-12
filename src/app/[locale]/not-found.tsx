import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  Container,
  Heading,
  Text,
  Button,
} from "@abelardo-salazar/core-ui-design-system";

// Boundary for notFound() calls thrown *inside* an already-valid [locale]
// segment (e.g. an unknown project slug in [slug]/page.tsx). The parent
// layout has already resolved a valid locale by the time this renders, so
// unlike the root not-found.tsx this one can render localized copy. This
// file doesn't receive the [locale] route param directly, so the locale is
// read via getLocale() instead of params.
export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "NotFound" });

  return (
    <main className="min-h-screen flex items-center justify-center pt-32 pb-20">
      <Container size="md" className="text-center space-y-6">
        <Heading level="h1" className="text-4xl md:text-6xl font-extrabold">
          404
        </Heading>
        <Heading level="h2" className="text-xl">
          {t("title")}
        </Heading>
        <Text size="lg" className="text-base-content">
          {t("description")}
        </Text>
        <Button asChild>
          <Link href={`/${locale}`}>{t("backHome")}</Link>
        </Button>
      </Container>
    </main>
  );
}
