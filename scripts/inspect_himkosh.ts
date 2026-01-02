
import { db } from "../server/db";
import { homestayApplications, himkoshTransactions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
    const appNumber = "HP-HS-2025-SML-000005";
    console.log(`Inspecting HimKosh txns for ${appNumber}...`);

    const app = await db.query.homestayApplications.findFirst({
        where: eq(homestayApplications.applicationNumber, appNumber)
    });

    if (!app) {
        console.log("Application not found");
        return;
    }

    console.log("App ID:", app.id);
    console.log("App Status:", app.status);
    console.log("App Payment Status:", app.paymentStatus);
    console.log("totalFee:", (app as any).totalFee); // Cast to any in case types are loose

    const txns = await db.select().from(himkoshTransactions)
        .where(eq(himkoshTransactions.applicationId, app.id))
        .orderBy(desc(himkoshTransactions.createdAt));

    console.log(`Found ${txns.length} transactions for this App.`);
    txns.forEach(t => {
        console.log(`  ID: ${t.id}, Status: ${t.transactionStatus}, Amount: ${t.totalAmount}, Ref: ${t.appRefNo}, ECH: ${t.echTxnId}, Msg: ${t.statusCd}`);
    });

    const recentTxns = await db.select().from(himkoshTransactions)
        .orderBy(desc(himkoshTransactions.createdAt))
        .limit(5);

    console.log("Recent Global Transactions:");
    recentTxns.forEach(t => {
        console.log(`  ID: ${t.id}, App: ${t.appRefNo}, Status: ${t.transactionStatus}, Amount: ${t.totalAmount}, Created: ${t.createdAt}`);
    });

    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
