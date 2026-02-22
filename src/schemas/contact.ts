import * as z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "name_min"),
  email: z.string().email("email_invalid"),
  message: z.string().min(10, "message_min"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
