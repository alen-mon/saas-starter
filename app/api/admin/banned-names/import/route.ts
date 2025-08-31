import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { bannedNames } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

function normalize(s: string) {
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

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { words, sourceFile } = body as {
    words: string[];
    sourceFile?: string;
  };

  if (!Array.isArray(words) || words.length === 0) {
    return new Response("No words provided", { status: 400 });
  }

  const rows = words
    .map((w) => (typeof w === "string" ? w.trim() : ""))
    .filter(Boolean)
    .map((w) => ({
      word: w,
      normalized: normalize(w),
      sourceFile: sourceFile || "upload",
      createdAt: new Date(),
    }));

  // upsert: simplest approach – delete duplicates by normalized then insert
  const normals = rows.map((r) => r.normalized);
  // delete existing with same normalized values
  if (normals.length) {
    await db.execute(
      sql.raw(
        `DELETE FROM banned_names WHERE normalized = ANY(${sql.param(normals)})`
      )
    );
  }

  // bulk insert
  // drizzle inserts in chunks implicitly; to be safe chunk manually
  const chunk = 500;
  for (let i = 0; i < rows.length; i += chunk) {
    await db.insert(bannedNames).values(rows.slice(i, i + chunk));
  }

  return NextResponse.json({ inserted: rows.length });
}
