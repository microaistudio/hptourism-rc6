
import { db } from "../server/db";
import { inspectionOrders, homestayApplications } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../server/storage";

async function main() {
    const appId = "62f6c21c-bf3f-40bf-9816-7fa4cc9dbf3b";
    const daId = "486a4663-dcc8-49fb-8c4c-9aeafef4bb97"; // DA Shimla
    const inspectionDate = new Date("2025-12-30T10:00:00.000Z"); // Dec 30, 2025

    console.log(`Repairing application ${appId}...`);

    const app = await storage.getApplication(appId);

    if (!app) {
        console.error("Application not found!");
        process.exit(1);
    }

    // 1. Repair Application Record
    console.log("Updating application record with restored data...");
    await storage.updateApplication(appId, {
        assignedDealingAssistantId: daId,
        inspectionDate: inspectionDate,
        // Ensure status is correct
        status: 'inspection_scheduled',
        inspectionStatus: 'pending'
    });

    // 2. Create Inspection Order
    // Check if order exists first
    const existingOrder = await db.query.inspectionOrders.findFirst({
        where: eq(inspectionOrders.applicationId, appId),
    });

    if (existingOrder) {
        console.log("Inspection order already exists:", existingOrder.id);
    } else {
        console.log("Creating missing inspection order...");
        const [order] = await db.insert(inspectionOrders).values({
            applicationId: appId,
            scheduledBy: app.dtdoId ?? app.userId, // Fallback if DTDO ID missing
            scheduledDate: new Date(),
            assignedTo: daId,
            assignedDate: new Date(),
            inspectionDate: inspectionDate,
            inspectionAddress: app.address,
            specialInstructions: app.dtdoRemarks || "Restored inspection order",
            status: 'scheduled',
        }).returning();
        console.log("Successfully created inspection order:", order.id);
    }

    console.log("Repair complete!");
    process.exit(0);
}

main().catch(console.error);
