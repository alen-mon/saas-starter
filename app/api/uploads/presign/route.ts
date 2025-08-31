import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { getPresignedPutUrl } from "@/lib/s3";

export async function POST(req: Request) {
  const me = await getUser();
  if (!me) return new Response("Unauthorized", { status: 401 });

  const { fileName, ownerType, ownerId } = await req.json().catch(() => ({}));
  if (!fileName || !ownerType || !ownerId)
    return new Response("Bad Request", { status: 400 });

  const safeName = fileName.replace(/[^\w.\- ]+/g, "_");
  const key = `uploads/${ownerType}/${ownerId}/${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}-${safeName}`;
  const url = await getPresignedPutUrl({ key });

  return NextResponse.json({ url, key });
}
