"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button, Text } from "@abelardo-salazar/core-ui-design-system";

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath || `/${newLocale}`);
  };

  return (
    <div className="space-y-2">
      <Text size="sm" weight="medium">
        Idioma / Language
      </Text>
      <div className="flex gap-2">
        <Button
          variant={locale === "es" ? "secondary" : "outline"}
          size="sm"
          fullWidth
          onClick={() => switchLanguage("es")}
        >
          Español
        </Button>
        <Button
          variant={locale === "en" ? "secondary" : "outline"}
          size="sm"
          fullWidth
          onClick={() => switchLanguage("en")}
        >
          English
        </Button>
      </div>
    </div>
  );
};
