
import express from "express";
import { db } from "../db";
import {
    homestayApplications,
    users,
    documents,
    payments,
    applicationActions,
    inspectionOrders,
    inspectionReports,
    certificates,
    ApplicationKind
} from "@shared/schema";
import { eq, desc, inArray, and, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import { format } from "date-fns";

// ------------------------------------------------------------------
// IN-MEMORY REPORT STORE (Global to persist across router instantiations)
// ------------------------------------------------------------------
const globalTestReports: any[] = [];

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

// Helper to ensure a system/officer user exists for running actions
const getSystemUserId = async () => {
    const email = "simulator.system@hp.gov.in";
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return existing[0].id;

    const id = randomUUID();
    await db.insert(users).values({
        id,
        email,
        password: "hashed_system_password",
        fullName: "System Simulator",
        mobile: "9999999999",
        role: "district_tourism_officer", // Use DTO role to be safe
        district: "Shimla",
        isEmailVerified: true,
        isMobileVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return id;
};

// Helper to create a random owner
const createRandomOwner = async (district: string) => {
    const id = randomUUID();
    const timestamp = Date.now().toString().slice(-4);
    const user = {
        id,
        email: `test.owner.${Date.now()}@example.com`,
        password: "hashed_password_placeholder",
        fullName: `Test Owner ${timestamp}`,
        mobile: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        role: "property_owner",
        district: district,
        isEmailVerified: true,
        isMobileVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.insert(users).values(user);
    return id;
};

// Helper to create dummy docs
const createDummyDocs = async (appId: string) => {
    const docTypes = ['identity_proof', 'property_proof', 'revenue_papers'];
    for (const type of docTypes) {
        await db.insert(documents).values({
            id: randomUUID(),
            applicationId: appId,
            documentType: type,
            filePath: "/uploads/dummy.pdf",
            fileName: `${type}_dummy.pdf`,
            fileSize: 1024,
            mimeType: "application/pdf",
            uploadDate: new Date(),
            isVerified: true
        });
    }
};

// ------------------------------------------------------------------
// ROUTER FACTORY
// ------------------------------------------------------------------
export function createDevToolsRouter() {
    const router = express.Router();

    // 1. SEED APPLICATIONS
    router.post("/seed", async (req, res) => {
        try {
            const { count = 5, type = "new_registration", district = "Shimla", projectType = "new_property" } = req.body;
            const createdIds = [];
            const validAppKind = type as ApplicationKind;

            for (let i = 0; i < count; i++) {
                const ownerId = await createRandomOwner(district);
                const appId = randomUUID();
                const timestamp = Date.now();
                const ownerName = `Test Owner ${timestamp}`;
                const ownerMobile = "9812345678";

                await db.insert(homestayApplications).values({
                    id: appId,
                    userId: ownerId,
                    district: district,
                    tehsil: "Shimla Urban",
                    applicationNumber: `HP-TEST-${timestamp}-${i}`,
                    propertyName: `Test Homestay ${timestamp}-${i}`,
                    address: "123 Test Street, Shimla (Simulator Data)",
                    pincode: "171001",
                    locationType: "mc",
                    applicationKind: validAppKind,
                    category: "silver",
                    status: "submitted",
                    totalRooms: 3,

                    // Owner Details required
                    ownerName: ownerName,
                    ownerGender: "male",
                    ownerMobile: ownerMobile,
                    ownerAadhaar: "123456789012",
                    ownerEmail: `test.owner.${timestamp}@example.com`,

                    propertyOwnership: "owned",
                    projectType: projectType,
                    propertyArea: "150",
                    propertyAreaUnit: "sqm",
                    attachedWashrooms: 3,

                    createdAt: new Date(),
                    updatedAt: new Date(),
                    submittedAt: new Date(),
                });

                // Add dummy docs
                await createDummyDocs(appId);

                // Add 'Payment'
                await db.insert(payments).values({
                    id: randomUUID(),
                    applicationId: appId,
                    amount: "1000",
                    paymentStatus: "success",
                    paymentGateway: "himkosh",
                    gatewayTransactionId: `TXN-${timestamp}`,
                    initiatedAt: new Date(),
                    completedAt: new Date(),
                    receiptNumber: `REC-${timestamp}`,
                    paymentType: "registration"
                });

                // Log submission action
                await db.insert(applicationActions).values({
                    id: randomUUID(),
                    applicationId: appId,
                    officerId: ownerId, // Using owner ID as actor for submission
                    action: "submitted",
                    createdAt: new Date(),
                    feedback: "Auto-generated test application via Console"
                });

                createdIds.push(appId);
            }

            res.json({ message: `Successfully seeded ${count} applications`, ids: createdIds });
        } catch (error) {
            console.error("Seeding failed:", error);
            res.status(500).json({ message: "Seeding failed", error });
        }
    });

    // GET RECENT TEST APPLICATIONS
    router.get("/applications", async (req, res) => {
        try {
            const apps = await db.select()
                .from(homestayApplications)
                .where(like(homestayApplications.applicationNumber, 'HP-TEST-%'))
                .orderBy(desc(homestayApplications.createdAt))
                .limit(50);

            res.json(apps);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch test applications" });
        }
    });

    // REPORTING APIs
    router.get("/reports", (req, res) => {
        res.json(globalTestReports);
    });

    router.post("/reports", (req, res) => {
        const report = {
            id: randomUUID(),
            createdAt: new Date(),
            ...req.body
        };
        globalTestReports.unshift(report); // Newest first
        if (globalTestReports.length > 50) globalTestReports.pop(); // Keep last 50
        res.json(report);
    });


    // GENERIC ACTION HANDLER
    router.post("/action", async (req, res) => {
        try {
            const { applicationId, action } = req.body;
            const systemUserId = await getSystemUserId();

            let newStatus = "";
            let logAction = "";
            let logFeedback = "";

            // Fetch app first to get current details if needed
            const [app] = await db.select().from(homestayApplications).where(eq(homestayApplications.id, applicationId));
            if (!app) throw new Error("App not found");

            switch (action) {
                case "forward_to_dtdo":
                    newStatus = "forwarded_to_dtdo";
                    logAction = "document_verified";
                    logFeedback = "Documents OK. Forwarding to DTDO (Console Action)";
                    break;

                case "revert_by_da":
                    newStatus = "reverted_by_da";
                    logAction = "sent_back_for_corrections";
                    logFeedback = "Please fix documents (Console Action)";
                    break;

                case "revert_by_dtdo":
                    newStatus = "reverted_by_dtdo";
                    logAction = "sent_back_for_corrections";
                    logFeedback = "Please fix issues found by DTDO (Console Action)";
                    break;

                case "reject_application":
                    newStatus = "rejected";
                    logAction = "rejected";
                    logFeedback = "Application Rejected (Console Action)";
                    break;

                case "schedule_inspection":
                    newStatus = "inspection_scheduled";
                    logAction = "site_inspection_scheduled";
                    logFeedback = "Inspection scheduled (Console Action)";

                    // Create inspection order
                    await db.insert(inspectionOrders).values({
                        id: randomUUID(),
                        applicationId: applicationId,
                        scheduledBy: systemUserId,
                        assignedTo: systemUserId, // Self-assign for simplicity
                        scheduledDate: new Date(Date.now() + 86400000), // Date object!
                        assignedDate: new Date(),
                        inspectionDate: new Date(Date.now() + 86400000), // Date object!
                        inspectionAddress: app.address,

                        status: "scheduled",
                        createdAt: new Date()
                    });
                    break;

                case "submit_inspection_report":
                    newStatus = "inspection_completed";
                    // Find order
                    const [order] = await db.select().from(inspectionOrders)
                        .where(eq(inspectionOrders.applicationId, applicationId))
                        .orderBy(desc(inspectionOrders.createdAt))
                        .limit(1);

                    if (order) {
                        await db.update(inspectionOrders)
                            .set({ status: "completed", updatedAt: new Date() })
                            .where(eq(inspectionOrders.id, order.id));

                        await db.insert(inspectionReports).values({
                            id: randomUUID(),
                            inspectionOrderId: order.id,
                            applicationId: applicationId,
                            submittedBy: systemUserId,
                            submittedDate: new Date(),
                            actualInspectionDate: new Date(),
                            roomCountVerified: true,
                            categoryMeetsStandards: true,
                            overallSatisfactory: true,
                            recommendation: "approve", // 'approve' or 'raise_objections'
                            detailedFindings: "Console generated report: All clear.",

                            createdAt: new Date()
                        });
                    }
                    logAction = "inspection_acknowledged"; // closest state?
                    logFeedback = "Inspection Completed";
                    break;

                case "approve_application":
                    newStatus = "approved";
                    logAction = "approved";
                    logFeedback = "Approved via Console";

                    await db.insert(certificates).values({
                        id: randomUUID(),
                        applicationId: applicationId,
                        certificateNumber: `HP-RC-${Date.now()}`,
                        issuedDate: new Date(),
                        validFrom: new Date(),
                        validUpto: new Date(Date.now() + 31536000000), // 1 year
                        propertyName: app.propertyName,
                        category: app.category,
                        address: app.address,
                        district: app.district,
                        ownerName: app.ownerName,
                        ownerMobile: app.ownerMobile
                    });

                    // Update app with cert details
                    await db.update(homestayApplications)
                        .set({
                            certificateIssuedDate: new Date(),
                            certificateNumber: `HP-RC-${Date.now()}`
                        })
                        .where(eq(homestayApplications.id, applicationId));
                    break;

                case "resubmit_owner":
                    newStatus = "submitted";
                    logAction = "correction_resubmitted";
                    logFeedback = "Fixed issues (Console Action)";
                    break;

                case "resubmit_to_dtdo":
                    newStatus = "forwarded_to_dtdo";
                    logAction = "correction_resubmitted";
                    logFeedback = "Fixed issues & Forwarded to DTDO (Console Action)";
                    break;

                default:
                    throw new Error("Invalid action: " + action);
            }

            if (newStatus) {
                await db.update(homestayApplications)
                    .set({ status: newStatus, updatedAt: new Date() })
                    .where(eq(homestayApplications.id, applicationId));

                await db.insert(applicationActions).values({
                    id: randomUUID(),
                    applicationId: applicationId,
                    officerId: systemUserId,
                    action: logAction,
                    feedback: logFeedback,
                    createdAt: new Date()
                });
            }

            res.json({ success: true, newStatus });
        } catch (error) {
            console.error("Action failed:", error);
            res.status(500).json({ message: "Action failed", error: error.message });
        }
    });

    return router;
}
