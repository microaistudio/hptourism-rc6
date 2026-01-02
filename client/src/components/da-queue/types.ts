/**
 * Shared types for DA Queue components
 */
import type { ApplicationKind } from "@shared/schema";

export interface ApplicationWithOwner {
    id: string;
    applicationNumber: string;
    propertyName: string;
    category: string;
    status: string;
    applicationKind?: ApplicationKind | null;
    totalRooms?: number;
    submittedAt?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    district?: string | null;
    ownerName?: string;
    ownerMobile?: string;
    latestCorrection?: {
        createdAt: string;
        feedback?: string | null;
    } | null;
    correctionSubmissionCount?: number;
}

export type InspectionOrder = {
    id: string;
    applicationId: string;
    inspectionDate: string;
    inspectionAddress: string;
    specialInstructions?: string;
    status: string;
    application: {
        id: string;
        applicationNumber: string;
        propertyName: string;
        category: string;
        status: string;
        dtdoRemarks?: string | null;
    } | null;
    owner: {
        fullName: string;
        mobile: string;
    } | null;
    reportSubmitted: boolean;
};

export interface SearchParams {
    applicationNumber: string;
    ownerMobile: string;
    status: string;
    recentLimit: string;
}
