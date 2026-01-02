
import { db } from "../server/db";
import { homestayApplications, systemSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const appNumber = "HP-HS-2025-SML-000005";
    console.log(`Force approving ${appNumber}...`);

    const app = await db.query.homestayApplications.findFirst({
        where: eq(homestayApplications.applicationNumber, appNumber)
    });

    if (!app) {
        console.log("Application not found");
        return;
    }

    // Generate certificate number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const certNum = `HP-HST-${year}-${randomSuffix}`;

    // Set expiry to 1 year from now
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await db.update(homestayApplications)
        .set({
            status: 'approved',
            currentStage: 'approved',
            paymentStatus: 'paid',
            paymentAmount: '3000.00', // Assuming standard fee
            paymentDate: new Date(),
            certificateNumber: certNum,
            certificateIssuedDate: issueDate,
            certificateExpiryDate: expiryDate,
            approvedAt: new Date(),
            rejectionReason: null,
            clarificationRequested: null
        })
        .where(eq(homestayApplications.id, app.id));

    console.log(`Application ${appNumber} marked as APPROVED with Cert #${certNum}`);
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
