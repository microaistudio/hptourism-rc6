
import { db } from "../server/db";
import { homestayApplications, payments } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
    const appNumber = "HP-HS-2025-SML-000005";
    console.log(`Inspecting ${appNumber}...`);

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
    console.log("Total Amount:", app.totalAmount);

    const paymentList = await db.select().from(payments)
        .where(eq(payments.applicationId, app.id));

    console.log("Payments:");
    paymentList.forEach(p => {
        console.log(`  ID: ${p.id}, Status: ${p.paymentStatus}, Amount: ${p.amount}, GatewayRef: ${p.gatewayTransactionId}, Created: ${p.createdAt}`);
    });

    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
