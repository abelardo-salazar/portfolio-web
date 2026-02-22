"use client";

import { Button, Text } from "@abelardo-salazar/core-ui-design-system";
import { useLocaleManager } from "@/hooks/use-locale-manager";

export const LanguageSwitcher = () => {
  const { currentLocale, switchLocale, locales } = useLocaleManager();

  return (
    <div className="space-y-3 w-full">
      <Text size="sm" weight="medium" className="opacity-70">
        Idioma / Language
      </Text>
      <div className="flex gap-2">
        {locales.map((locale) => (
          <Button
            key={locale.id}
            variant={currentLocale === locale.id ? "secondary" : "outline"}
            size="sm"
            fullWidth
            onClick={() => switchLocale(locale.id)}
            className="font-medium"
          >
            {locale.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
