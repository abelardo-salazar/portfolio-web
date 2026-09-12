const SITE_URL = "https://portfolio-web-rouge-tau.vercel.app";

export const siteConfig = {
  name: "Abelardo Salazar",
  url: SITE_URL,
  ogImage: `${SITE_URL}/og-image.png`,
  email: "abelardosalazar94@gmail.com",
  description: {
    es: "Portafolio profesional de Abelardo Salazar, especializado en React, Next.js y Sistemas de Diseño.",
    en: "Professional portfolio of Abelardo Salazar, specialized in React, Next.js, and Design Systems.",
  },
  links: {
    github: "https://github.com/abelardo-salazar",
    linkedin: "https://www.linkedin.com/in/abelardo-salazar/",
  },
  keywords: ["React", "Next.js", "TypeScript", "Design Systems"],
};

export type SiteConfig = typeof siteConfig;
