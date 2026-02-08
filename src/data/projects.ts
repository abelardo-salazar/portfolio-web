import { Project } from "@/types/data";

export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    slug: "core-ui-system",
    year: "2026",
    title: {
      es: "Core UI Design System",
      en: "Core UI Design System",
    },
    description: {
      es: "Librería de componentes privada optimizada para rendimiento y accesibilidad.",
      en: "Private component library optimized for performance and accessibility.",
    },
    tags: ["React 19", "Radix UI", "CSS4"],
    image: "/projects/core-ui.jpg",
    featured: true,
    link: "https://github.com/abelardo-salazar",
  },
  {
    id: "proj-2",
    slug: "personal-portfolio",
    year: "2025",
    title: {
      es: "Portafolio Personal",
      en: "Personal Portfolio",
    },
    description: {
      es: "Mi sitio web personal construido con Next.js y Tailwind CSS.",
      en: "My personal website built with Next.js and Tailwind CSS.",
    },
    tags: ["Next.js 14", "Tailwind CSS", "TypeScript"],
    image: "/projects/portfolio.jpg",
    featured: true,
    link: "https://abelardo-salazar.dev",
  },
];
