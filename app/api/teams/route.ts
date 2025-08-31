// app/api/teams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { teams, teamMembers } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { and, eq } from "drizzle-orm";
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  // return team for the user (if exists)
  const membership = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: { team: true },
  });

  return NextResponse.json(membership?.team || null);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { name } = body;
  if (!name || typeof name !== "string") {
    return new Response("Invalid team name", { status: 400 });
  }

  // TODO: optionally run banned-name check here via banned_names table

  const [created] = await db
    .insert(teams)
    .values({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      slotsPaid: 0,
    })
    .returning();

  await db.insert(teamMembers).values({
    userId: user.id,
    teamId: created.id,
    // role: "captain",
    role: "owner", // <- was 'captain'
    joinedAt: new Date(),
  });

  return new Response(JSON.stringify(created), { status: 201 });
}
