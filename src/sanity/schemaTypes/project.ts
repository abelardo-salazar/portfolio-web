import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startDate",
      title: "Start Date (For sorting only)",
      type: "date",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "object",
      fields: [
        { name: "es", title: "Spanish", type: "string" },
        { name: "en", title: "English", type: "string" },
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "object",
      fields: [
        { name: "es", title: "Spanish", type: "text" },
        { name: "en", title: "English", type: "text" },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "link",
      title: "Live Link",
      type: "url",
    }),
    defineField({
      name: "github",
      title: "GitHub Link",
      type: "url",
    }),
    defineField({
      name: "images",
      title: "Gallery Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "features",
      title: "Features",
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
      name: "challenges",
      title: "Challenges",
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
      name: "lighthouse",
      title: "Lighthouse (manual snapshot)",
      description:
        "Scores measured by hand against the Live Link. The sync script applies the same rules.",
      type: "object",
      // The scores describe the Live Link; without it they'd describe nothing.
      validation: (Rule) =>
        Rule.custom((value, context) =>
          value && !(context.document as { link?: string } | undefined)?.link
            ? "Requires a Live Link: the scores describe that URL"
            : true,
        ),
      fields: [
        defineField({
          name: "measuredAt",
          title: "Measured at",
          type: "date",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "formFactor",
          title: "Device",
          type: "string",
          options: { list: ["mobile", "desktop"], layout: "radio" },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "scores",
          title: "Scores",
          type: "object",
          validation: (Rule) => Rule.required(),
          fields: [
            { name: "performance", title: "Performance" },
            { name: "accessibility", title: "Accessibility" },
            { name: "bestPractices", title: "Best practices" },
            { name: "seo", title: "SEO" },
          ].map(({ name, title }) =>
            defineField({
              name,
              title,
              type: "number",
              validation: (Rule) => Rule.required().integer().min(0).max(100),
            }),
          ),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "year",
    },
  },
});
