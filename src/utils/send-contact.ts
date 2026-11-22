"use server";

import { Resend } from "resend";
import { contactSchema, ContactFormData } from "@/schemas/contact";
import { getContactRecipient } from "@/config/contact.server";

// name/message come from the public form and are interpolated straight into
// the HTML of the email sent to CONTACT_EMAIL - without this, a sender could
// inject arbitrary markup (fake links, tracking images) into the email the
// site owner receives.
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
      error: "Invalid form data.",
    };
  }

  const { name, email, message } = validatedFields.data;

  const recipient = getContactRecipient();
  if (!recipient) {
    console.error("Contact form: CONTACT_EMAIL is not set, cannot send.");
    return { success: false, error: "Internal server error." };
  }

  try {
    // Created per call: the constructor throws without an API key, and at
    // module scope that breaks page loads and builds, not just sending.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [recipient],
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
      console.error("Resend error:", error);
      return { success: false, error: "Could not send the email." };
    }

    return { success: true };
  } catch (e) {
    console.error("Server Action Error:", e);
    return { success: false, error: "Internal server error." };
  }
}
