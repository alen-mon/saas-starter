// lib/db/hotfix_make_admin.ts
import { db } from "./drizzle";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const email = process.env.ADMIN_EMAIL!;
if (!email) {
  console.error("Set ADMIN_EMAIL in env to the account you want to promote.");
  process.exit(1);
}

async function run() {
  const res = await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.email, email));
  console.log("✅ Promoted to admin:", email);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Failed to promote admin:", e);
  process.exit(1);
});
