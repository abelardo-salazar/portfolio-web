"use client";

import { useTranslations } from "next-intl";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@abelardo-salazar/core-ui-design-system";
import { useLocaleManager } from "@/hooks/use-locale-manager";

export const LanguageSwitcher = () => {
  const t = useTranslations("Footer");
  const { currentLocale, switchLocale, locales } = useLocaleManager();

  return (
    <ToggleGroup
      type="single"
      value={currentLocale}
      onValueChange={switchLocale}
      aria-label={t("language")}
      className="w-full"
    >
      {locales.map((locale) => (
        // lang lets screen readers pronounce each name in its own language.
        <ToggleGroupItem
          key={locale.id}
          value={locale.id}
          lang={locale.id}
          className="flex-1"
        >
          {locale.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
