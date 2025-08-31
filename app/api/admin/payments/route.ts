import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payments, teams } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { and, desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  // pending first, then recent others
  const rows = await db
    .select({
      id: payments.id,
      teamId: payments.teamId,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnRef: payments.txnRef,
      proofUrl: payments.proofUrl,
      createdAt: payments.createdAt,
      teamName: teams.name,
    })
    .from(payments)
    .leftJoin(teams, eq(payments.teamId, teams.id))
    .orderBy(desc(payments.createdAt))
    .limit(200);

  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  const { id, action, note } = await request.json().catch(() => ({}));
  if (!id || !action) return new Response("Missing id/action", { status: 400 });

  const target = await db
    .select()
    .from(payments)
    .where(eq(payments.id, Number(id)))
    .limit(1);
  if (!target.length) return new Response("Payment not found", { status: 404 });

  const status =
    action === "verify" ? "verified" : action === "reject" ? "rejected" : null;
  if (!status) return new Response("Invalid action", { status: 400 });

  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, Number(id)));

  // If verified, you may also bump team status to 'approved' (optional rule for MVP)
  if (status === "verified") {
    await db
      .update(teams)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(teams.id, target[0].teamId));
  }

  return NextResponse.json({ ok: true });
}
