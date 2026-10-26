import { groq } from "next-sanity";

export const projectsQuery = groq`*[_type == "project"] | order(startDate desc, year desc) {
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

export const experiencesQuery = groq`*[_type == "experience"] | order(current desc, startDate desc) {
  "id": _id,
  company,
  role,
  period,
  current,
  description,
  skills
}`;
