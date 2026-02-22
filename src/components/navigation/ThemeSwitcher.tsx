"use client";

import {
  Switch,
  Text,
  Skeleton,
} from "@abelardo-salazar/core-ui-design-system";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useThemeManager } from "@/hooks/use-theme-manager";

export const ThemeSwitcher = () => {
  const t = useTranslations("ThemeSwitcher");
  const { isDark, toggleTheme, isMounted } = useThemeManager();

  if (!isMounted) {
    return <Skeleton className="w-40 h-8 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-3">
      <Sun
        className={`w-4 h-4 transition-colors ${!isDark ? "text-primary" : "text-base-content/30"}`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label={t("toggle_theme")}
      />
      <Moon
        className={`w-4 h-4 transition-colors ${isDark ? "text-primary" : "text-base-content/30"}`}
      />

      <Text size="sm" className="ml-2 font-medium">
        {isDark ? t("dark") : t("light")}
      </Text>
    </div>
  );
};
