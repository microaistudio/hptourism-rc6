/**
 * Grievance Reports API
 * 
 * Provides statistics, analytics, and export functionality for grievances.
 */

import { Router } from "express";
import { db } from "../../db";
import { storage } from "../../storage";
import { grievances, users } from "@shared/schema";
import { eq, sql, desc, and, gte, lte, count } from "drizzle-orm";

const router = Router();

// Officer role check
function isOfficer(role: string): boolean {
    return ['dealing_assistant', 'district_tourism_officer', 'district_officer', 'state_officer', 'admin', 'super_admin'].includes(role);
}

// GET grievance summary statistics
router.get("/summary", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const [totals] = await db.select({
            total: count(),
            open: sql<number>`count(*) filter (where status = 'open')`,
            inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
            resolved: sql<number>`count(*) filter (where status = 'resolved')`,
            closed: sql<number>`count(*) filter (where status = 'closed')`,
        }).from(grievances);

        // Average resolution time (in days)
        const [avgResolution] = await db.select({
            avgDays: sql<number>`
                avg(extract(epoch from (resolved_at - created_at)) / 86400)
                filter (where resolved_at is not null)
            `,
        }).from(grievances);

        // Last 30 days trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recent] = await db.select({
            newTickets: count(),
            resolvedTickets: sql<number>`count(*) filter (where resolved_at is not null)`,
        }).from(grievances)
            .where(gte(grievances.createdAt, thirtyDaysAgo));

        res.json({
            totals: {
                total: Number(totals.total) || 0,
                open: Number(totals.open) || 0,
                inProgress: Number(totals.inProgress) || 0,
                resolved: Number(totals.resolved) || 0,
                closed: Number(totals.closed) || 0,
            },
            averageResolutionDays: Math.round((Number(avgResolution.avgDays) || 0) * 10) / 10,
            last30Days: {
                newTickets: Number(recent.newTickets) || 0,
                resolvedTickets: Number(recent.resolvedTickets) || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching grievance summary:", error);
        res.status(500).json({ message: "Failed to fetch summary" });
    }
});

// GET grievances by category
router.get("/by-category", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const result = await db.select({
            category: grievances.category,
            count: count(),
        })
            .from(grievances)
            .groupBy(grievances.category);

        res.json(result.map(r => ({
            category: r.category,
            count: Number(r.count),
        })));
    } catch (error) {
        console.error("Error fetching by category:", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
});

// GET grievances by status
router.get("/by-status", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const result = await db.select({
            status: grievances.status,
            count: count(),
        })
            .from(grievances)
            .groupBy(grievances.status);

        res.json(result.map(r => ({
            status: r.status || 'open',
            count: Number(r.count),
        })));
    } catch (error) {
        console.error("Error fetching by status:", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
});

// GET grievances by priority
router.get("/by-priority", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const result = await db.select({
            priority: grievances.priority,
            count: count(),
        })
            .from(grievances)
            .groupBy(grievances.priority);

        res.json(result.map(r => ({
            priority: r.priority || 'medium',
            count: Number(r.count),
        })));
    } catch (error) {
        console.error("Error fetching by priority:", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
});

// GET monthly trend (last 6 months)
router.get("/monthly-trend", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const result = await db.select({
            month: sql<string>`to_char(created_at, 'YYYY-MM')`,
            count: count(),
        })
            .from(grievances)
            .where(gte(grievances.createdAt, sql`now() - interval '6 months'`))
            .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
            .orderBy(sql`to_char(created_at, 'YYYY-MM')`);

        res.json(result.map(r => ({
            month: r.month,
            count: Number(r.count),
        })));
    } catch (error) {
        console.error("Error fetching monthly trend:", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
});

// GET export as CSV
router.get("/export", async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);

    const user = await storage.getUser(req.session.userId);
    if (!user || !isOfficer(user.role)) return res.sendStatus(403);

    try {
        const allGrievances = await db.select({
            ticketNumber: grievances.ticketNumber,
            subject: grievances.subject,
            category: grievances.category,
            priority: grievances.priority,
            status: grievances.status,
            description: grievances.description,
            resolutionNotes: grievances.resolutionNotes,
            createdAt: grievances.createdAt,
            resolvedAt: grievances.resolvedAt,
        })
            .from(grievances)
            .orderBy(desc(grievances.createdAt));

        // Generate CSV
        const headers = ["Ticket Number", "Subject", "Category", "Priority", "Status", "Description", "Resolution Notes", "Created At", "Resolved At"];
        const csvRows = [headers.join(",")];

        for (const g of allGrievances) {
            const row = [
                g.ticketNumber,
                `"${(g.subject || '').replace(/"/g, '""')}"`,
                g.category,
                g.priority || 'medium',
                g.status || 'open',
                `"${(g.description || '').replace(/"/g, '""').substring(0, 200)}"`,
                `"${(g.resolutionNotes || '').replace(/"/g, '""')}"`,
                g.createdAt ? new Date(g.createdAt).toISOString() : '',
                g.resolvedAt ? new Date(g.resolvedAt).toISOString() : '',
            ];
            csvRows.push(row.join(","));
        }

        const csv = csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="grievances-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Error exporting grievances:", error);
        res.status(500).json({ message: "Failed to export" });
    }
});

export default router;
