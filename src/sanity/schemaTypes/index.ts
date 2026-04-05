import { type SchemaTypeDefinition } from "sanity";
import { experienceType } from "./experience";
import { projectType } from "./project";
import { skillsType } from "./skills";
import { profileType } from "./profile";
import { certificationType } from "./certification";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    projectType,
    experienceType,
    skillsType,
    profileType,
    certificationType,
  ],
};
