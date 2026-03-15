import { cache } from "react";
import { client } from "./client";
import { experiencesQuery, projectsQuery } from "./queries";
import { groq } from "next-sanity";
import { Project, Experience } from "@/types/data";

export const getExperiences = cache(async (): Promise<Experience[]> => {
  return await client.fetch(experiencesQuery);
});

export const getProjects = cache(async (): Promise<Project[]> => {
  return await client.fetch(projectsQuery);
});

export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  const projects = await getProjects();
  return projects.filter((project) => project.featured);
});

export const getProjectBySlug = cache(
  async (slug: string): Promise<Project | null> => {
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

    return await client.fetch(query, { slug });
  },
);
