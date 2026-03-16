import { defineField, defineType } from "sanity";

export const skillsType = defineType({
  name: "skills",
  title: "Skills & Languages",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Document Title (Internal)",
      type: "string",
      initialValue: "My Skills Configuration",
      description: "Solo necesitas un documento de este tipo.",
    }),
    defineField({
      name: "technical",
      title: "Technical Skills",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Skill Name",
              type: "string",
              description: "Ej: React, Next.js, TypeScript, Tailwind CSS",
            },
            {
              name: "level",
              title: "Proficiency Level",
              type: "string",
              options: {
                list: [
                  { title: "Expert", value: "expert" },
                  { title: "Proficient", value: "proficient" },
                  { title: "Competent", value: "competent" },
                  { title: "Advanced Beginner", value: "beginner" },
                  { title: "Novice", value: "novice" },
                ],
              },
            },
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "level",
            },
          },
        },
      ],
    }),
    defineField({
      name: "soft",
      title: "Soft Skills (Competencias Transversales)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "es", title: "Spanish", type: "string" },
            { name: "en", title: "English", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "languages",
      title: "Languages",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Language Name",
              type: "object",
              fields: [
                { name: "es", title: "Spanish", type: "string" },
                { name: "en", title: "English", type: "string" },
              ],
            },
            {
              name: "level",
              title: "Level",
              type: "string",
              options: {
                list: [
                  { title: "Nativo / Native", value: "native" },
                  { title: "C1 Advanced", value: "c1" },
                  { title: "B2 Upper Intermediate", value: "b2" },
                  { title: "B1 Intermediate", value: "b1" },
                  { title: "A2 Elementary", value: "a2" },
                  { title: "A1 Beginner", value: "a1" },
                ],
              },
              description: "Ej: Nativo, C1 Advanced, B2 Upper Intermediate",
            },
          ],
          preview: {
            select: {
              title: "name.es",
              subtitle: "level",
            },
          },
        },
      ],
    }),
  ],
});
