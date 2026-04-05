import { defineField, defineType } from "sanity";

export const experienceType = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "object",
      fields: [
        { name: "es", title: "Spanish", type: "string" },
        { name: "en", title: "English", type: "string" },
      ],
    }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: "e.g., '2021 - Present' or 'Jan 2020 - Dec 2021'",
    }),
    defineField({
      name: "startDate",
      title: "Start Date (For sorting only)",
      type: "date",
      options: { dateFormat: "YYYY-MM" },
    }),
    defineField({
      name: "current",
      title: "Current Job",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "description",
      title: "Description (Achievements)",
      type: "object",
      fields: [
        {
          name: "es",
          title: "Spanish",
          type: "array",
          of: [{ type: "string" }],
        },
        {
          name: "en",
          title: "English",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: {
      title: "role.en",
      subtitle: "company",
    },
  },
});
