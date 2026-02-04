"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch, Text } from "@abelardo-salazar/core-ui-design-system";
import { Moon, Sun } from "lucide-react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3">
      <Sun className="w-4 h-4 text-base-content/50" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="w-4 h-4 text-base-content/50" />
      <Text size="sm" className="ml-2 hidden md:block">
        Modo {isDark ? "Oscuro" : "Claro"}
      </Text>
    </div>
  );
};
