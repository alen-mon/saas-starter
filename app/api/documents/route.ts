// app/api/documents/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { documents } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { ownerId, ownerType, docType, filePath, fileName, contentType, size } =
    body;

  if (!ownerId || !ownerType || !docType || !filePath) {
    return new Response("Missing required fields", { status: 400 });
  }

  const [record] = await db
    .insert(documents)
    .values({
      ownerId,
      ownerType,
      docType,
      filePath,
      fileName,
      contentType,
      size,
      uploadedAt: new Date(),
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
