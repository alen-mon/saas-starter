import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { documents, teamMembers, teams, users } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { and, desc, eq, isNull } from "drizzle-orm";

export async function GET() {
  const me = await getUser();
  if (!me || me.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  // Show unverified first
  const rows = await db
    .select({
      id: documents.id,
      ownerId: documents.ownerId,
      ownerType: documents.ownerType,
      docType: documents.docType,
      filePath: documents.filePath,
      fileName: documents.fileName,
      contentType: documents.contentType,
      size: documents.size,
      uploadedAt: documents.uploadedAt,
      verifiedAt: documents.verifiedAt,
      // join details for team_member owners
      teamId: teams.id,
      teamName: teams.name,
      riderName: users.name,
      riderEmail: users.email,
    })
    .from(documents)
    .leftJoin(
      teamMembers,
      and(
        eq(documents.ownerType, "team_member"),
        eq(teamMembers.id, documents.ownerId)
      )
    )
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .orderBy(desc(documents.uploadedAt))
    .limit(300);

  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const me = await getUser();
  if (!me || me.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  const { id, action, note } = await request.json().catch(() => ({}));
  if (!id || !action) return new Response("Missing id/action", { status: 400 });

  const now = new Date();
  if (action === "verify") {
    await db
      .update(documents)
      .set({
        verifiedBy: me.id,
        verifiedAt: now,
        notes: note ?? null,
      })
      .where(eq(documents.id, Number(id)));
  } else if (action === "reject") {
    // For MVP: we record a rejection as notes, but keep verified_at null.
    await db
      .update(documents)
      .set({
        notes: note ? `REJECTED: ${note}` : "REJECTED",
      })
      .where(eq(documents.id, Number(id)));
  } else {
    return new Response("Invalid action", { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
