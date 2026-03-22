import { defineField, defineType } from "sanity";

export const profileType = defineType({
  name: "profile",
  title: "About Me",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Document Title (Internal)",
      type: "string",
      initialValue: "Mi Perfil",
    }),
    defineField({
      name: "bio",
      title: "Biography Paragraphs",
      type: "object",
      fields: [
        {
          name: "es",
          title: "Spanish",
          type: "array",
          of: [{ type: "text" }],
          description: "Cada elemento de la lista será un párrafo diferente.",
        },
        {
          name: "en",
          title: "English",
          type: "array",
          of: [{ type: "text" }],
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Profile Image (Optional)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
