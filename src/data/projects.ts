import { Project } from "@/types/data";

export const PROJECTS: Project[] = [
  {
    id: "1",
    slug: "quantum-ecommerce",
    year: "2024",
    title: { es: "Quantum E-commerce", en: "Quantum E-commerce" },
    description: {
      es: "Plataforma de comercio electrónico de alto rendimiento.",
      en: "High-performance e-commerce platform.",
    },
    tags: ["Next.js", "TypeScript", "Stripe"],
    featured: true,
    images: ["/image.png", "/image.png", "/image.png"],
    features: {
      es: ["Checkout optimizado", "Sincronización en tiempo real"],
      en: ["Optimized checkout", "Real-time sync"],
    },
    challenges: {
      es: ["Optimización de Core Web Vitals"],
      en: ["Core Web Vitals optimization"],
    },
  },
  {
    id: "2",
    slug: "ai-task-manager",
    year: "2023",
    title: { es: "AI Task Manager", en: "AI Task Manager" },
    description: {
      es: "Gestor de tareas inteligente con IA.",
      en: "Smart task manager with AI.",
    },
    tags: ["React", "OpenAI", "Zustand"],
    featured: false,
    images: ["/image.png", "/image.png"],
    features: {
      es: ["Categorización automática"],
      en: ["Automatic categorization"],
    },
  },
  {
    id: "3",
    slug: "crypto-vault-v2",
    year: "2023",
    github: "Lorem",
    link: "Lorem",
    title: { es: "CryptoVault V2", en: "CryptoVault V2" },
    description: {
      es: "Dashboard de activos digitales.",
      en: "Digital asset dashboard.",
    },
    tags: ["Web3.js", "Next.js", "Chart.js"],
    featured: true,
    images: ["/image.png", "/image.png", "/image.png", "/image.png"],
    features: {
      es: ["Conector de billeteras"],
      en: ["Wallet connector"],
    },
  },
];
