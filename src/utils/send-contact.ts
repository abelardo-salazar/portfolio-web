"use server";

import { Resend } from "resend";
import { contactSchema, ContactFormData } from "@/schemas/contact";
import { siteConfig } from "@/config/site";

const resend = new Resend(process.env.RESEND_API_KEY);

// name/message llegan del formulario público y se interpolan directo en el
// HTML del correo enviado a siteConfig.email - sin esto, un remitente podía
// inyectar markup arbitrario (links falsos, imágenes de tracking) en el
// correo que recibe el dueño del sitio.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function sendContactAction(data: ContactFormData) {
  const validatedFields = contactSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Datos de formulario inválidos.",
    };
  }

  const { name, email, message } = validatedFields.data;

  try {
    const { data: resendData, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [siteConfig.email],
      subject: `Nuevo mensaje de contacto de ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">Has recibido un nuevo mensaje</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return { success: false, error: "No se pudo enviar el correo." };
    }

    return { success: true };
  } catch (e) {
    console.error("Server Action Error:", e);
    return { success: false, error: "Error interno del servidor." };
  }
}
