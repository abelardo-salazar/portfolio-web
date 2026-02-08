import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const baseLocale = locale || "es";

  return {
    locale: baseLocale,
    messages: (await import(`../../messages/${baseLocale}.json`)).default,
  };
});
