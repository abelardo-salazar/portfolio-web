export interface Project {
  id: string;
  slug: string;
  year: string;
  title: Record<"es" | "en", string>;
  description: Record<"es" | "en", string>;
  tags: string[];
  link?: string;
  github?: string;
  image: string;
  featured: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: Record<"es" | "en", string>;
  period: string;
  current: boolean;
  description: Record<"es" | "en", string[]>;
  skills: string[];
}
