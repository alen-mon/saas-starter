// app/api/payments/upi/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payments } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { teamId, amount, txnRef, proofUrl } = body;

  if (!teamId || !amount)
    return new Response("Missing teamId or amount", { status: 400 });

  const [record] = await db
    .insert(payments)
    .values({
      teamId,
      amount,
      method: "UPI_QR",
      status: "pending",
      txnRef,
      proofUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
