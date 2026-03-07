import { type SchemaTypeDefinition } from "sanity";
import { experienceType } from "./experience";
import { projectType } from "./project";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, experienceType],
};
