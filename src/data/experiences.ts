import { Experience } from "@/types/data";

export const EXPERIENCES: Experience[] = [
  {
    id: "exp-1",
    company: "Empresa Tech",
    role: {
      es: "Senior Frontend Engineer",
      en: "Senior Frontend Engineer",
    },
    period: "2024 - Present",
    current: true,
    description: {
      es: [
        "Liderazgo en el desarrollo de sistemas de diseño con React 19.",
        "Optimización de Core Web Vitals en un 40%.",
      ],
      en: [
        "Leading design system development with React 19.",
        "Core Web Vitals optimization by 40%.",
      ],
    },
    skills: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "exp-2",
    company: "Startup Innovadora",
    role: {
      es: "Frontend Engineer",
      en: "Frontend Engineer",
    },
    period: "2021 - 2024",
    current: false,
    description: {
      es: [
        "Desarrollo de interfaces escalables con React y Redux.",
        "Implementación de pruebas unitarias y de integración.",
      ],
      en: [
        "Built scalable interfaces with React and Redux.",
        "Implemented unit and integration testing.",
      ],
    },
    skills: ["React", "Redux", "Jest"],
  },
];
