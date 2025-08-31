// app/api/banned-names/check/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { bannedNames } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

function normalizeTeamName(s: string) {
  return s
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// escape % and _ for LIKE/ILIKE
function escapeForLike(s: string) {
  return s.replace(/[%_\\]/g, (m) => `\\${m}`);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name) return new Response("Missing name", { status: 400 });

  const normalized = normalizeTeamName(name);
  const escaped = escapeForLike(normalized);

  // exact match
  const exact = await db
    .select()
    .from(bannedNames)
    .where(eq(bannedNames.normalized, normalized))
    .limit(1);

  if (exact.length > 0) {
    return NextResponse.json({
      blocked: true,
      reason: `Matched banned word: ${exact[0].word}`,
    });
  }

  // partial (substring) match
  const partial = await db
    .select()
    .from(bannedNames)
    .where(ilike(bannedNames.normalized, `%${escaped}%`))
    .limit(1);

  if (partial.length > 0) {
    return NextResponse.json({
      blocked: true,
      reason: `Blocked (partial match): ${partial[0].word}`,
    });
  }

  return NextResponse.json({ blocked: false });
}
