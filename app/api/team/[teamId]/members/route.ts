import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { teamMembers, users } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { and, eq, inArray } from "drizzle-orm";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const me = await getUser();
  if (!me) return new Response("Unauthorized", { status: 401 });

  const teamId = Number(params.teamId);
  if (!teamId) return new Response("Invalid team id", { status: 400 });

  // ✅ Check ANY membership with owner/captain role
  const allowed = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, me.id),
        inArray(teamMembers.role, ["owner", "captain"])
      )
    )
    .limit(1);

  if (!allowed.length) return new Response("Forbidden", { status: 403 });

  const {
    name,
    email,
    role = "rider",
  } = await request.json().catch(() => ({}));
  if (!name) return new Response("Missing name", { status: 400 });

  // Resolve or create a user for this rider
  let userIdToLink: number;

  if (email && typeof email === "string") {
    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (found.length) {
      userIdToLink = found[0].id;
    } else {
      const [createdUser] = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash: "", // placeholder until invitation/onboarding
          role: "member",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: users.id });
      userIdToLink = createdUser.id;
    }
  } else {
    // ✅ No email → create a placeholder user so we can attach docs later
    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email: `${crypto.randomUUID()}@placeholder.local`,
        passwordHash: "",
        role: "member",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: users.id });
    userIdToLink = createdUser.id;
  }

  const [member] = await db
    .insert(teamMembers)
    .values({
      userId: userIdToLink,
      teamId,
      role,
      joinedAt: new Date(),
    })
    .returning();

  return NextResponse.json(member, { status: 201 });
}
