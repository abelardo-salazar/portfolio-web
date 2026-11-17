"use client";

import {
  SwitchField,
  Skeleton,
} from "@abelardo-salazar/core-ui-design-system";
import { useTranslations } from "next-intl";
import { useThemeManager } from "@/hooks/use-theme-manager";

export const ThemeSwitcher = () => {
  const t = useTranslations("ThemeSwitcher");
  const { isDark, toggleTheme, isMounted } = useThemeManager();

  if (!isMounted) {
    // Same footprint as the SwitchField row, so hydration doesn't shift the layout.
    return <Skeleton className="h-12 w-full" />;
  }

  // Fixed label: the switch itself announces on/off, a changing name would confuse.
  return (
    <SwitchField
      label={t("dark_mode")}
      checked={isDark}
      onCheckedChange={toggleTheme}
    />
  );
};
