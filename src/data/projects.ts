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
];
