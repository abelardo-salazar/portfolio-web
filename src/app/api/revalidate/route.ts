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
      return new Response("Invalid signature", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Bad Request: missing _type", { status: 400 });
    }

    revalidateTag(body._type as string, "max");

    console.log(`✅ Cache revalidated for tag: ${body._type}`);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      type: body._type,
    });
  } catch (err: unknown) {
    console.error("Webhook error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown internal error";

    return new Response(errorMessage, { status: 500 });
  }
}
