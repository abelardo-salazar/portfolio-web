import { cache } from "react";
import { client } from "./client";
import { experiencesQuery, projectsQuery } from "./queries";
import { groq } from "next-sanity";
import { Project, Experience } from "@/types/data";

export const getExperiences = async (): Promise<Experience[]> => {
  return await client.fetch(
    experiencesQuery,
    {},
    { next: { tags: ["experience"] } },
  );
};

export const getProjects = async (): Promise<Project[]> => {
  return await client.fetch(projectsQuery, {}, { next: { tags: ["project"] } });
};

export const getFeaturedProjects = async (): Promise<Project[]> => {
  const projects = await getProjects();
  return projects.filter((project) => project.featured);
};

export const getProjectBySlug = async (
  slug: string,
): Promise<Project | null> => {
  const query = groq`*[_type == "project" && slug.current == $slug][0] {
    "id": _id,
    "slug": slug.current,
    year,
    title,
    description,
    tags,
    link,
    github,
    "images": images[].asset->url,
    featured,
    features,
    challenges
  }`;

  return await client.fetch(
    query,
    { slug },
    { next: { tags: ["project", `project-${slug}`] } },
  );
};
