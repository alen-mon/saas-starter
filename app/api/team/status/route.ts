import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  documents,
  payments,
  teamMembers,
  teams,
  users,
} from "@/lib/db/schema";
import { getTeamForUser, getUser } from "@/lib/db/queries";
import { and, desc, eq, inArray } from "drizzle-orm";

type DocType = "license" | "medical" | "rc" | "pucc" | "waiver";
const REQUIRED_DOCS: DocType[] = ["license", "medical", "rc", "pucc", "waiver"];

export async function GET() {
  const me = await getUser();
  if (!me) return new Response("Unauthorized", { status: 401 });

  const team = await getTeamForUser();
  if (!team) return NextResponse.json({ hasTeam: false });

  // members
  const members = await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, team.id),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
  });

  const memberIds = members.map((m) => m.id);
  // docs for these members
  const docs = memberIds.length
    ? await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.ownerType, "team_member"),
            inArray(documents.ownerId, memberIds)
          )
        )
    : [];

  // latest payment (by createdAt)
  const latestPayment = await db
    .select()
    .from(payments)
    .where(eq(payments.teamId, team.id))
    .orderBy(desc(payments.createdAt))
    .limit(1);

  const payment = latestPayment[0] || null;

  // assemble per-rider completeness
  const riders = members.map((m) => {
    const d = docs.filter((d) => d.ownerId === m.id);
    const docMap: Record<string, boolean> = {};
    for (const t of REQUIRED_DOCS) docMap[t] = false;
    d.forEach((row) => {
      if ((REQUIRED_DOCS as string[]).includes(row.docType)) {
        docMap[row.docType] = !!row.verifiedAt; // count as complete only when verified
      }
    });
    const completeCount = REQUIRED_DOCS.filter((t) => docMap[t]).length;
    return {
      memberId: m.id,
      name: m.user.name || m.user.email,
      role: m.role,
      docs: docMap,
      completeCount,
      requiredCount: REQUIRED_DOCS.length,
    };
  });

  const ridersOnly = riders.filter(
    (r) => r.role !== "captain" && r.role !== "owner"
  );

  const ridersCount = ridersOnly.length;

  return NextResponse.json({
    hasTeam: true,
    team: { id: team.id, name: team.name, status: team.status },
    ridersCount,
    minRequired: 3,
    maxAllowed: 5,
    payment: payment
      ? {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          createdAt: payment.createdAt,
        }
      : null,
    riders,
    requiredDocs: REQUIRED_DOCS,
  });
}
