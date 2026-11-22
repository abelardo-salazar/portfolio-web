import * as z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "name_min").max(100, "name_max"),
  // 254 is the longest address SMTP can deliver to.
  email: z.string().email("email_invalid").max(254, "email_invalid"),
  message: z.string().min(10, "message_min").max(5000, "message_max"),
  // Honeypot: a real field registered in the form but visually hidden and
  // out of the tab order (see ContactSection.tsx). A real user never touches
  // it; a bot that autofills every input does. It's accepted here on purpose,
  // so the client always submits and sendContactAction can fake a success
  // for bots. The neutral name keeps browser autofill from filling it for
  // real users, which would silently drop their message.
  contact_ref: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
