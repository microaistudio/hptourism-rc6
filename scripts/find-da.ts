
import { db } from "../server/db";
import { users } from "@shared/schema";
import { ilike, or, and, eq } from "drizzle-orm";

async function main() {
    const searchTerm = "%Shimla%";

    const results = await db.select().from(users).where(
        and(
            eq(users.role, 'dealing_assistant'),
            or(
                ilike(users.fullName, searchTerm),
                ilike(users.username, searchTerm)
            )
        )
    );

    console.log("Found DAs:", results.map(u => ({ id: u.id, name: u.fullName, username: u.username })));
    process.exit(0);
}

main().catch(console.error);
