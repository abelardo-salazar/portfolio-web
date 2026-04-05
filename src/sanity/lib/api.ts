import { client } from "./client";
import { experiencesQuery, projectsQuery } from "./queries";
import { groq } from "next-sanity";
import {
  Project,
  Experience,
  SkillData,
  ProfileData,
  CertificationData,
} from "@/types/data";

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

export const skillsQuery = groq`*[_type == "skills"][0] {
  technical,
  soft,
  languages
}`;

export const getSkills = async (): Promise<SkillData | null> => {
  return await client.fetch(skillsQuery, {}, { next: { tags: ["skills"] } });
};

export const profileQuery = groq`*[_type == "profile"][0] {
  bio,
  "image": image.asset->url
}`;

export const getProfile = async (): Promise<ProfileData | null> => {
  return await client.fetch(profileQuery, {}, { next: { tags: ["profile"] } });
};

export const getCertifications = async (): Promise<CertificationData[]> => {
  const query = groq`*[_type == "certification"] | order(date desc) {
    _id,
    title,
    issuer,
    date,
    credentialId,
    url,
    description,
    skills
  }`;

  return await client.fetch(query, {}, { next: { tags: ["certification"] } });
};
