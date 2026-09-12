import * as z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "name_min"),
  email: z.string().email("email_invalid"),
  message: z.string().min(10, "message_min"),
  // Honeypot: campo real registrado en el form pero escondido visualmente y
  // fuera del tab order (ver ContactSection.tsx). Un usuario real nunca lo
  // toca, así que siempre llega vacío. Un bot que autocompleta todos los
  // inputs sí lo llena, y eso alcanza para que safeParse() rechace el envío
  // en sendContactAction - no necesita lógica de detección aparte.
  website: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
