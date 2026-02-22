import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useThemeManager = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return {
    theme: resolvedTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
    isMounted: mounted,
  };
};
