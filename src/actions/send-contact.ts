"use server";

import { contactSchema, ContactFormData } from "@/schemas/contact";

export async function sendContactAction(data: ContactFormData) {
  const validatedFields = contactSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Email enviado a administración:", validatedFields.data);
    return { success: true };
  } catch (e) {
    return { error: "Fallo al enviar el mensaje" };
  }
}
