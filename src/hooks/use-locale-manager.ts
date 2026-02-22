"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export const useLocaleManager = () => {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;

    const newPath = segments.join("/") || `/${newLocale}`;
    router.push(newPath);
  };

  return {
    currentLocale,
    switchLocale,
    locales: [
      { id: "es", label: "Español" },
      { id: "en", label: "English" },
    ],
  };
};
