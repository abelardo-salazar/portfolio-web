import { PROJECTS } from "@/data/projects";
import { Project } from "@/types/data";

export const getProjectBySlug = async (
  slug: string,
): Promise<Project | undefined> => {
  return PROJECTS.find((p) => p.slug === slug);
};

export const getAllProjectSlugs = async () => {
  return PROJECTS.map((p) => p.slug);
};
