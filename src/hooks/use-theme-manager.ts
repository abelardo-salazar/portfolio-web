import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export const useThemeManager = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // false during SSR and hydration, true afterwards: resolvedTheme is only
  // known on the client, so callers must not render theme-dependent markup
  // until then.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

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
