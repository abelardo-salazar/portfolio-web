import { defineField, defineType } from "sanity";

export const certificationType = defineType({
  name: "certification",
  title: "Certifications",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Certification Title",
      type: "object",
      fields: [
        { name: "es", title: "Spanish", type: "string" },
        { name: "en", title: "English", type: "string" },
      ],
    }),
    defineField({
      name: "issuer",
      title: "Issuing Organization",
      type: "string",
      description: "Ej: AWS, Meta, Google, Platzi",
    }),
    defineField({
      name: "date",
      title: "Issue Date",
      type: "date",
      options: { dateFormat: "YYYY-MM" },
    }),
    defineField({
      name: "credentialId",
      title: "Credential ID (Optional)",
      type: "string",
    }),
    defineField({
      name: "url",
      title: "Credential URL",
      type: "url",
    }),
    defineField({
      name: "description",
      title: "Brief Description",
      type: "object",
      fields: [
        { name: "es", title: "Spanish", type: "text" },
        { name: "en", title: "English", type: "text" },
      ],
    }),
    defineField({
      name: "skills",
      title: "Acquired Skills",
      type: "array",
      of: [{ type: "string" }],
      description: "Ej: Serverless, CI/CD, React Performance",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "issuer",
    },
  },
});
