import * as z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "name_min"),
  email: z.string().email("email_invalid"),
  message: z.string().min(10, "message_min"),
  // Honeypot: a real field registered in the form but visually hidden and
  // out of the tab order (see ContactSection.tsx). A real user never touches
  // it, so it always arrives empty. A bot that autofills every input does
  // fill it, and that's enough for safeParse() to reject the submission in
  // sendContactAction - no separate detection logic needed.
  website: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
