
import { pool } from "./server/db";
import { logger } from "./server/logger";

async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log("Starting manual migration...");

        // 1. Create Indexes for Grievances
        await client.query(`CREATE INDEX IF NOT EXISTS grv_ticket_idx ON grievances (ticket_number);`);
        await client.query(`CREATE INDEX IF NOT EXISTS grv_user_id_idx ON grievances (user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS grv_status_idx ON grievances (status);`);
        await client.query(`CREATE INDEX IF NOT EXISTS grv_category_idx ON grievances (category);`);
        await client.query(`CREATE INDEX IF NOT EXISTS grv_created_idx ON grievances (created_at);`);
        console.log("✅ Grievance indexes created.");

        // 2. Create Session Table (if not exists)
        await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

        // 3. Create Session Constraints & Index
        try {
            await client.query(`ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;`);
        } catch (e: any) {
            // Ignore if PK already exists (code 42P16) or constraint exists
            if (e.code !== '42P16' && !e.message.includes('already exists')) {
                console.warn("Run into PK error, ignoring:", e.message);
            }
        }

        await client.query(`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`);
        console.log("✅ Session table and indexes created.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

runMigrations();
