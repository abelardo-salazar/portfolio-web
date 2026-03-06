import { siteConfig } from "@/config/site";

export const downloadCV = (locale: string) => {
  const fileName =
    locale === "es"
      ? `CV_${siteConfig.name.replace(" ", "_")}_ES.pdf`
      : `CV_${siteConfig.name.replace(" ", "_")}_EN.pdf`;
  const filePath = `/cv-${locale}.pdf`;

  const link = document.createElement("a");
  link.href = filePath;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
