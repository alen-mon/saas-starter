// lib/db/hotfix_add_team_status.ts
import { db } from "./drizzle";

async function run() {
  // Use the same connection the app uses (POSTGRES_URL)
  await db.execute(
    `ALTER TABLE teams ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';`
  );
  await db.execute(
    `ALTER TABLE teams ADD COLUMN IF NOT EXISTS slots_paid INTEGER DEFAULT 0;`
  );
  console.log("✅ Hotfix applied: teams.status & teams.slots_paid ensured.");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Hotfix failed:", e);
  process.exit(1);
});
