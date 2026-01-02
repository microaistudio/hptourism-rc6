
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding guardian_relation column...");
    try {
        await db.execute(sql`ALTER TABLE homestay_applications ADD COLUMN IF NOT EXISTS guardian_relation varchar(20) DEFAULT 'father'`);
        console.log("✅ Column added successfully");
    } catch (e) {
        console.error("❌ Migration failed:", e);
    }
    process.exit(0);
}

main();
