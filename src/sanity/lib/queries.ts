import { groq } from "next-sanity";

// Shared by the list and the detail page so both always return the same Project shape.
export const projectProjection = groq`{
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
  challenges,
  lighthouse
}`;

export const projectsQuery = groq`*[_type == "project"] | order(startDate desc, year desc) ${projectProjection}`;

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0] ${projectProjection}`;

export const experiencesQuery = groq`*[_type == "experience"] | order(current desc, startDate desc) {
  "id": _id,
  company,
  role,
  period,
  current,
  description,
  skills
}`;
