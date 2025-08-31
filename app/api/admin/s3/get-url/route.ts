import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { getPresignedGetUrl } from "@/lib/s3";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  const { key } = await request.json().catch(() => ({}));
  if (!key) return new Response("Missing key", { status: 400 });

  const url = await getPresignedGetUrl({ key });
  return NextResponse.json({ url });
}
