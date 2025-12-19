import { Router } from 'express';
import { db } from '../db';
import { homestayApplications } from '@shared/schema';
import {
    ADVENTURE_SPORTS_ACTIVITIES,
    getAdventureActivityById,
    calculateAdventureSportsFee,
    getMaxInsuranceRequired
} from '@shared/activityTypes';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// GET /api/adventure-sports/activities - List all adventure activities
router.get('/activities', async (req, res) => {
    try {
        res.json({
            success: true,
            activities: ADVENTURE_SPORTS_ACTIVITIES,
            total: ADVENTURE_SPORTS_ACTIVITIES.length,
        });
    } catch (error) {
        console.error('Error fetching adventure activities:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch activities' });
    }
});

// POST /api/adventure-sports/calculate-fee - Calculate total fee
const calculateFeeSchema = z.object({
    activityIds: z.array(z.string()).min(1, 'At least one activity must be selected'),
});

router.post('/calculate-fee', async (req, res) => {
    try {
        const { activityIds } = calculateFeeSchema.parse(req.body);

        // Validate all activity IDs exist
        const invalidIds = activityIds.filter(id => !getAdventureActivityById(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Invalid activity IDs: ${invalidIds.join(', ')}`,
            });
        }

        const totalFee = calculateAdventureSportsFee(activityIds);
        const minimumInsurance = getMaxInsuranceRequired(activityIds);

        const selectedActivities = activityIds.map(id => {
            const activity = getAdventureActivityById(id)!;
            return {
                id: activity.id,
                name: activity.name,
                baseFee: activity.baseFee,
                insuranceRequired: activity.insuranceRequired,
            };
        });

        res.json({
            success: true,
            data: {
                selectedActivities,
                totalAnnualFee: totalFee,
                minimumInsuranceRequired: minimumInsurance,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors });
        }
        console.error('Error calculating fee:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate fee' });
    }
});

// POST /api/adventure-sports/applications - Create new application (draft)
// POST /api/adventure-sports/applications - Create new application (draft)
const createApplicationSchema = z.object({
    operatorName: z.string().optional(),
    adventureSportsData: z.any().optional(), // Allow raw data from frontend for drafts
    activities: z.array(z.object({
        activityId: z.string(),
        activityName: z.string(),
        category: z.string(),
        baseFee: z.number(),
        insuranceRequired: z.number(),
    })).optional(),
    totalAnnualFee: z.number().optional(),
    minimumInsuranceRequired: z.number().optional(),
});

router.post('/applications', async (req, res) => {
    try {

        if (!req.session.userId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        const validData = createApplicationSchema.parse(req.body);

        // Handle both flat structure and nested adventureSportsData
        const operatorName = validData.operatorName || validData.adventureSportsData?.operatorName || 'New Application';
        const activities = validData.activities || validData.adventureSportsData?.activities || [];
        const totalAnnualFee = validData.totalAnnualFee || validData.adventureSportsData?.totalAnnualFee || 0;
        const minimumInsuranceRequired = validData.minimumInsuranceRequired || validData.adventureSportsData?.minimumInsuranceRequired || 0;
        // Merge raw data if exists
        const rawData = validData.adventureSportsData || {};

        // Generate application number
        const appNumber = `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const [application] = await db.insert(homestayApplications).values({
            userId: user.id,
            applicationNumber: appNumber,
            applicationType: 'adventure_sports',
            propertyName: operatorName,
            category: 'gold', // Default category for adventure sports
            locationType: 'gp', // Will be updated with actual location
            totalRooms: 0, // Not applicable for adventure sports
            district: rawData.district || '',
            tehsil: '',
            address: rawData.localOfficeAddress || '',
            pincode: '',
            ownerName: user.fullName,
            ownerGender: 'male',
            ownerMobile: user.mobile,
            ownerEmail: user.email || '',
            ownerAadhaar: user.aadhaarNumber || '',
            projectType: 'new_property',
            propertyArea: 0, // Not applicable
            attachedWashrooms: 0, // Not applicable
            adventureSportsData: {
                ...rawData, // Store all frontend data
                activities: activities,
                insurancePolicy: {
                    policyNumber: '',
                    provider: '',
                    coverageAmount: minimumInsuranceRequired,
                    validFrom: '',
                    validUpto: '',
                },
                safetyEquipment: [],
                trainedStaff: [],
                emergencyProtocols: {
                    evacuationPlanUploaded: false,
                    medicalFacilityTieup: '',
                    medicalFacilityDistance: 0,
                    rescueTeamAvailable: false,
                    emergencyContactNumber: '',
                    weatherMonitoringSystem: false,
                },
                operatingLocations: [],
                totalAnnualFee: totalAnnualFee,
                minimumInsuranceRequired: minimumInsuranceRequired,
            },
            status: 'draft',
            currentPage: 1,
        }).returning();

        res.json({
            success: true,
            application: {
                id: application.id,
                applicationNumber: application.applicationNumber,
                status: application.status,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors });
        }
        console.error('Error creating application:', error);
        res.status(500).json({ success: false, error: 'Failed to create application' });
    }
});

// GET /api/adventure-sports/applications/:id - Get application details
router.get('/applications/:id', async (req, res) => {
    try {

        if (!req.session.userId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        const [application] = await db
            .select()
            .from(homestayApplications)
            .where(eq(homestayApplications.id, req.params.id))
            .limit(1);

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Check ownership
        if (application.userId !== user.id && user.role === 'property_owner') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        res.json({ success: true, application });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch application' });
    }
});

// PUT /api/adventure-sports/applications/:id - Update application
router.put('/applications/:id', async (req, res) => {
    try {

        if (!req.session.userId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        const [existing] = await db
            .select()
            .from(homestayApplications)
            .where(eq(homestayApplications.id, req.params.id))
            .limit(1);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        if (existing.userId !== user.id) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (existing.status !== 'draft') {
            return res.status(400).json({ success: false, error: 'Can only update draft applications' });
        }

        const [updated] = await db
            .update(homestayApplications)
            .set({
                ...req.body,
                updatedAt: new Date(),
            })
            .where(eq(homestayApplications.id, req.params.id))
            .returning();

        res.json({ success: true, application: updated });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, error: 'Failed to update application' });
    }
});

// POST /api/adventure-sports/applications/:id/submit - Submit application
router.post('/applications/:id/submit', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        const [existing] = await db
            .select()
            .from(homestayApplications)
            .where(eq(homestayApplications.id, req.params.id))
            .limit(1);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        if (existing.userId !== user.id) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Update status to submitted
        const [updated] = await db
            .update(homestayApplications)
            .set({
                status: 'submitted',
                updatedAt: new Date(),
                submissionDate: new Date(),
            })
            .where(eq(homestayApplications.id, req.params.id))
            .returning();

        res.json({ success: true, application: updated });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ success: false, error: 'Failed to submit application' });
    }
});

export default router;
