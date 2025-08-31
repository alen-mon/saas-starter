import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { invitations, teamMembers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { token, name, password } = await request.json().catch(() => ({}));
  if (!token || !password)
    return new Response("Missing token/password", { status: 400 });

  const invs = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);
  const inv = invs[0];
  if (!inv || inv.status !== "pending")
    return new Response("Invalid invite", { status: 400 });

  // ensure a user exists or create
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, inv.email))
    .limit(1);
  let userId: number;
  if (existing.length) {
    userId = existing[0].id;
    // optionally update password if empty
    if (!existing[0].passwordHash && password) {
      await db
        .update(users)
        .set({
          passwordHash: await hashPassword(password),
          name: name ?? existing[0].name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  } else {
    const [u] = await db
      .insert(users)
      .values({
        name: name || null,
        email: inv.email,
        passwordHash: await hashPassword(password),
        role: "member",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    userId = u.id;
  }

  await db.insert(teamMembers).values({
    userId,
    teamId: inv.teamId,
    role: inv.role,
    joinedAt: new Date(),
  });

  await db
    .update(invitations)
    .set({ status: "accepted" })
    .where(eq(invitations.id, inv.id));

  // sign them in
  await setSession({ id: userId } as any);
  return NextResponse.json({ ok: true });
}
