export interface Project {
  id: string;
  slug: string;
  year: string;
  title: Record<"es" | "en", string>;
  description: Record<"es" | "en", string>;
  tags: string[];
  link?: string;
  github?: string;
  images: string[];
  featured: boolean;
  features?: Record<"es" | "en", string[]>;
  challenges?: Record<"es" | "en", string[]>;
  lighthouse?: ProjectLighthouseData | null;
}

// Hand-entered snapshot of a Lighthouse run against `link`, not a live measurement.
export interface ProjectLighthouseData {
  measuredAt: string; // YYYY-MM-DD
  formFactor: "mobile" | "desktop";
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
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

export interface SkillData {
  technical: {
    name: string;
    level: string;
  }[];
  soft: Record<"es" | "en", string>[];
  languages: {
    name: Record<"es" | "en", string>;
    level: string;
  }[];
}

export interface ProfileData {
  bio: Record<"es" | "en", string[]>;
  image?: string;
}

export interface CertificationData {
  _id: string;
  title: Record<"es" | "en", string>;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
  description?: Record<"es" | "en", string>;
  skills?: string[];
}
