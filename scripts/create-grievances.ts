
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating Grievance Tables...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS grievances (
              id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
              ticket_number varchar(50) NOT NULL UNIQUE,
              user_id varchar REFERENCES users(id),
              application_id varchar REFERENCES homestay_applications(id),
              category varchar(50) NOT NULL,
              priority varchar(20) DEFAULT 'medium',
              status varchar(20) DEFAULT 'open',
              subject varchar(255) NOT NULL,
              description text NOT NULL,
              assigned_to varchar REFERENCES users(id),
              resolution_notes text,
              attachments jsonb,
              created_at timestamp DEFAULT now(),
              updated_at timestamp DEFAULT now(),
              resolved_at timestamp
            );
        `);
        console.log("✅ Table 'grievances' created.");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS grievance_comments (
              id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
              grievance_id varchar NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
              user_id varchar NOT NULL REFERENCES users(id),
              comment text NOT NULL,
              is_internal boolean DEFAULT false,
              created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ Table 'grievance_comments' created.");

    } catch (e) {
        console.error("❌ Migration failed:", e);
    }
    process.exit(0);
}

main();
