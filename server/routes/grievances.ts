
import { Router } from "express";
import { db } from "../db";
import { storage } from "../storage";
import { grievances, grievanceComments, grievanceAuditLog, insertGrievanceSchema, insertGrievanceCommentSchema } from "@shared/schema";
import { eq, desc, and, gt, or, isNull, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { notifyGrievanceCreated, notifyGrievanceOfficerReply, notifyGrievanceStatusChanged } from "../services/grievanceNotifications";

const router = Router();

// Helper to log audit entries
async function logAuditEntry(
    grievanceId: string,
    action: string,
    performedBy: string,
    oldValue?: string | null,
    newValue?: string | null,
    req?: any
) {
    try {
        await db.insert(grievanceAuditLog).values({
            grievanceId,
            action,
            oldValue: oldValue || null,
            newValue: newValue || null,
            performedBy,
            ipAddress: req?.headers?.['x-real-ip'] || req?.ip || null,
            userAgent: req?.headers?.['user-agent'] || null,
        });
    } catch (error) {
        console.error("Failed to log audit entry:", error);
    }
}

// GET unread count for the logged-in user
router.get("/unread-count", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    try {
        const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);

        let count = 0;
        if (isOfficer) {
            // For officers: count grievances with new owner comments since lastReadByOfficer
            const result = await db.select({ count: sql<number>`count(*)` })
                .from(grievances)
                .where(
                    or(
                        // Never read by officer but has comments
                        and(isNull(grievances.lastReadByOfficer), gt(grievances.lastCommentAt, grievances.createdAt)),
                        // Has new comments since last read
                        and(gt(grievances.lastCommentAt, grievances.lastReadByOfficer))
                    )
                );
            count = Number(result[0]?.count || 0);
        } else {
            // For owners: count their grievances with new comments since lastReadByOwner
            const result = await db.select({ count: sql<number>`count(*)` })
                .from(grievances)
                .where(
                    and(
                        eq(grievances.userId, user.id),
                        or(
                            // Never read but has comments
                            and(isNull(grievances.lastReadByOwner), gt(grievances.lastCommentAt, grievances.createdAt)),
                            // Has new comments since last read
                            gt(grievances.lastCommentAt, grievances.lastReadByOwner)
                        )
                    )
                );
            count = Number(result[0]?.count || 0);
        }

        res.json({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
});

// PATCH mark a grievance as read
router.patch("/:id/mark-read", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    try {
        const grievance = await db.query.grievances.findFirst({
            where: eq(grievances.id, req.params.id),
        });

        if (!grievance) return res.sendStatus(404);

        const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);
        const isOwner = grievance.userId === user.id;

        if (!isOwner && !isOfficer) return res.sendStatus(403);

        const now = new Date();
        if (isOfficer) {
            await db.update(grievances)
                .set({ lastReadByOfficer: now })
                .where(eq(grievances.id, req.params.id));
        } else {
            await db.update(grievances)
                .set({ lastReadByOwner: now })
                .where(eq(grievances.id, req.params.id));
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error marking grievance as read:", error);
        res.status(500).json({ message: "Failed to mark grievance as read" });
    }
});

// GET audit log for a grievance
router.get("/:id/audit-log", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    // Only officers can view audit logs
    const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);
    if (!isOfficer) return res.sendStatus(403);

    try {
        const logs = await db.query.grievanceAuditLog.findMany({
            where: eq(grievanceAuditLog.grievanceId, req.params.id),
            orderBy: [desc(grievanceAuditLog.performedAt)],
        });

        res.json(logs);
    } catch (error) {
        console.error("Error fetching audit log:", error);
        res.status(500).json({ message: "Failed to fetch audit log" });
    }
});

// GET all grievances for the logged-in user (or all if admin/officer)
// Query params: ?type=owner_grievance|internal_ticket (for officers)
router.get("/", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);
    const requestedType = req.query.type as string | undefined;

    try {
        if (isOfficer) {
            // Officers can filter by type; default shows all
            let whereClause = undefined;
            if (requestedType === 'owner_grievance' || requestedType === 'internal_ticket') {
                whereClause = eq(grievances.ticketType, requestedType);
            }
            const allGrievances = await db.query.grievances.findMany({
                where: whereClause,
                orderBy: [desc(grievances.createdAt)],
            });
            return res.json(allGrievances);
        } else {
            // Owners only see their own owner_grievance tickets (never internal tickets)
            const userGrievances = await db.query.grievances.findMany({
                where: and(
                    eq(grievances.userId, user.id),
                    eq(grievances.ticketType, 'owner_grievance')
                ),
                orderBy: [desc(grievances.createdAt)],
            });
            return res.json(userGrievances);
        }
    } catch (error) {
        console.error("Error fetching grievances:", error);
        res.status(500).json({ message: "Failed to fetch grievances" });
    }
});

// GET single grievance details
router.get("/:id", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    try {
        const grievance = await db.query.grievances.findFirst({
            where: eq(grievances.id, req.params.id),
        });

        if (!grievance) return res.sendStatus(404);

        const isOwner = grievance.userId === user.id;
        const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);

        if (!isOwner && !isOfficer) return res.sendStatus(403);

        const comments = await db.query.grievanceComments.findMany({
            where: eq(grievanceComments.grievanceId, grievance.id),
            orderBy: [desc(grievanceComments.createdAt)]
        });

        // Auto-mark as read when viewing
        const now = new Date();
        if (isOfficer) {
            await db.update(grievances)
                .set({ lastReadByOfficer: now })
                .where(eq(grievances.id, req.params.id));
        } else {
            await db.update(grievances)
                .set({ lastReadByOwner: now })
                .where(eq(grievances.id, req.params.id));
        }

        res.json({ ...grievance, comments });
    } catch (error) {
        console.error("Error fetching grievance:", error);
        res.status(500).json({ message: "Failed to fetch grievance details" });
    }
});

// POST create new grievance
// Officers can create internal_ticket, owners can only create owner_grievance
router.post("/", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    const validation = insertGrievanceSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(validation.error);
    }

    const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);

    // Determine ticket type - owners can only create owner_grievance
    let ticketType = validation.data.ticketType || 'owner_grievance';
    if (!isOfficer && ticketType === 'internal_ticket') {
        ticketType = 'owner_grievance'; // Force owner_grievance for non-officers
    }

    try {
        // Different prefix for internal tickets vs owner grievances
        const prefix = ticketType === 'internal_ticket' ? 'INT' : 'GRV';
        const ticketNumber = `${prefix}-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;

        const [newGrievance] = await db.insert(grievances).values({
            ...validation.data,
            ticketType,
            ticketNumber,
            userId: user.id,
            status: 'open',
            lastReadByOwner: ticketType === 'owner_grievance' ? new Date() : null,
            lastReadByOfficer: ticketType === 'internal_ticket' ? new Date() : null,
        }).returning();

        // Log audit entry
        await logAuditEntry(newGrievance.id, 'created', user.id, null, `Ticket ${ticketNumber} created (${ticketType})`, req);

        // Send email/SMS notification only for owner grievances
        if (ticketType === 'owner_grievance') {
            notifyGrievanceCreated({
                ticketNumber,
                subject: validation.data.subject,
                category: validation.data.category,
                ownerName: user.fullName || user.username,
                ownerEmail: user.email || undefined,
                ownerMobile: user.mobile || undefined,
            }).catch(err => console.error("Failed to send grievance created notification:", err));
        }

        res.status(201).json(newGrievance);
    } catch (error) {
        console.error("Error creating grievance:", error);
        res.status(500).json({ message: "Failed to create grievance" });
    }
});

// POST add comment
router.post("/:id/comments", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    const validation = insertGrievanceCommentSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(validation.error);
    }

    try {
        const grievance = await db.query.grievances.findFirst({
            where: eq(grievances.id, req.params.id)
        });
        if (!grievance) return res.sendStatus(404);

        const isOwner = grievance.userId === user.id;
        const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);

        if (!isOwner && !isOfficer) return res.sendStatus(403);

        const [comment] = await db.insert(grievanceComments).values({
            grievanceId: grievance.id,
            userId: user.id,
            comment: validation.data.comment,
            isInternal: validation.data.isInternal && isOfficer ? true : false,
        }).returning();

        // Update lastCommentAt and clear read status for the other party
        const now = new Date();
        if (isOfficer) {
            await db.update(grievances)
                .set({
                    lastCommentAt: now,
                    lastReadByOfficer: now, // Officer just commented, so it's read for them
                    updatedAt: now,
                })
                .where(eq(grievances.id, grievance.id));
        } else {
            await db.update(grievances)
                .set({
                    lastCommentAt: now,
                    lastReadByOwner: now, // Owner just commented, so it's read for them
                    updatedAt: now,
                })
                .where(eq(grievances.id, grievance.id));
        }

        // Log audit entry
        await logAuditEntry(grievance.id, 'comment_added', user.id, null, `Comment added by ${user.fullName || user.username}`, req);

        // Send notification to the other party
        if (isOfficer && !validation.data.isInternal) {
            // Officer replied to owner's grievance - notify owner
            const owner = await storage.getUser(grievance.userId);
            if (owner) {
                notifyGrievanceOfficerReply({
                    ticketNumber: grievance.ticketNumber,
                    subject: grievance.subject,
                    category: grievance.category,
                    ownerName: owner.fullName || owner.username,
                    ownerEmail: owner.email || undefined,
                    ownerMobile: owner.mobile || undefined,
                }).catch(err => console.error("Failed to send officer reply notification:", err));
            }
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to add comment" });
    }
});

// PATCH update status (Officer only)
router.patch("/:id/status", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);

    const isOfficer = ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(user.role);
    if (!isOfficer) return res.sendStatus(403);

    const { status, priority, assignedTo, resolutionNotes } = req.body;

    try {
        const grievance = await db.query.grievances.findFirst({
            where: eq(grievances.id, req.params.id)
        });
        if (!grievance) return res.sendStatus(404);

        const [updated] = await db.update(grievances)
            .set({
                status,
                priority,
                assignedTo,
                resolutionNotes,
                updatedAt: new Date(),
                lastReadByOfficer: new Date(), // Officer just updated, so it's read
                resolvedAt: status === 'resolved' ? new Date() : undefined
            })
            .where(eq(grievances.id, req.params.id))
            .returning();

        // Log audit entries for changes
        if (status && status !== grievance.status) {
            await logAuditEntry(grievance.id, 'status_changed', user.id, grievance.status, status, req);
        }
        if (priority && priority !== grievance.priority) {
            await logAuditEntry(grievance.id, 'priority_changed', user.id, grievance.priority, priority, req);
        }
        if (assignedTo && assignedTo !== grievance.assignedTo) {
            await logAuditEntry(grievance.id, 'assigned', user.id, grievance.assignedTo, assignedTo, req);
        }
        if (resolutionNotes && resolutionNotes !== grievance.resolutionNotes) {
            await logAuditEntry(grievance.id, 'resolution_notes_updated', user.id, null, 'Resolution notes updated', req);
        }

        // Send notification to owner when status changes
        if (status && status !== grievance.status) {
            const owner = await storage.getUser(grievance.userId);
            if (owner) {
                notifyGrievanceStatusChanged({
                    ticketNumber: grievance.ticketNumber,
                    subject: grievance.subject,
                    category: grievance.category,
                    status: status,
                    resolutionNotes: resolutionNotes || undefined,
                    ownerName: owner.fullName || owner.username,
                    ownerEmail: owner.email || undefined,
                    ownerMobile: owner.mobile || undefined,
                }).catch(err => console.error("Failed to send status change notification:", err));
            }
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating grievance:", error);
        res.status(500).json({ message: "Failed to update grievance" });
    }
});

export default router;
