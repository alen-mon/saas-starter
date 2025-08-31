import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { invitations, teamMembers, users } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const me = await getUser();
  if (!me) return new Response("Unauthorized", { status: 401 });
  const teamId = Number(params.teamId);
  if (!teamId) return new Response("Invalid team id", { status: 400 });

  // captain check
  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, me.id)),
  });
  if (!member || member.role !== "captain")
    return new Response("Forbidden", { status: 403 });

  const { email, role = "rider" } = await request.json().catch(() => ({}));
  if (!email) return new Response("Missing email", { status: 400 });

  const token = crypto.randomBytes(24).toString("base64url");

  const [inv] = await db
    .insert(invitations)
    .values({
      teamId,
      email,
      role,
      invitedBy: me.id,
      invitedAt: new Date(),
      status: "pending",
      token,
    })
    .returning();

  // TODO: Send an email with the link:
  // `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  return NextResponse.json({ ok: true, token, inviteId: inv.id });
}
