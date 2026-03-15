import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return new Response("Firma inválida", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Bad Request: Falta el _type", { status: 400 });
    }

    revalidateTag(body._type as string, "max");

    console.log(`✅ Caché revalidada para el tag: ${body._type}`);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      type: body._type,
    });
  } catch (err: unknown) {
    console.error("Error en el Webhook:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Error interno desconocido";

    return new Response(errorMessage, { status: 500 });
  }
}
