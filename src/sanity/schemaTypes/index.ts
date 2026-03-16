import { type SchemaTypeDefinition } from "sanity";
import { experienceType } from "./experience";
import { projectType } from "./project";
import { skillsType } from "./skills";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, experienceType, skillsType],
};
