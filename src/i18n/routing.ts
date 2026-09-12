import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for the app's supported locales. Consumed by the
 * middleware (src/proxy.ts) and by i18n/request.ts so both always agree on
 * what's valid — see the [locale] 500 postmortem: having this list live only
 * inside the middleware config let src/i18n/request.ts trust the raw URL
 * segment instead of validating against it.
 */
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "es",
});
