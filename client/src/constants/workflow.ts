/**
 * Status Consolidation for R1.0
 * 
 * Maps 16+ database statuses to 9 clean consolidated display statuses.
 * This provides backward compatibility - old DB values are kept,
 * but displayed with consistent, clear labels.
 */

// Consolidated display statuses (what users/officers see)
export type ConsolidatedStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'correction_required'
  | 'inspection_pending'
  | 'payment_pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

// Map DB statuses to consolidated display statuses
export const STATUS_CONSOLIDATION_MAP: Record<string, ConsolidatedStatus> = {
  // Draft
  'draft': 'draft',

  // Submitted (in queue, not yet picked up)
  'submitted': 'submitted',
  'forwarded_to_dtdo': 'submitted',

  // Under Review (officer is actively working)
  'under_scrutiny': 'under_review',
  'dtdo_review': 'under_review',
  'legacy_rc_review': 'under_review',
  'correction_resubmitted': 'under_review',

  // Correction Required (owner must fix)
  'sent_back_for_corrections': 'correction_required',
  'reverted_to_applicant': 'correction_required',
  'reverted_by_dtdo': 'correction_required',
  'objection_raised': 'correction_required',

  // Inspection Pending
  'inspection_scheduled': 'inspection_pending',
  'scheduled': 'inspection_pending',

  // Payment Pending
  'verified_for_payment': 'payment_pending',

  // Approved (certificate issued)
  'approved': 'approved',

  // Rejected
  'rejected': 'rejected',

  // Cancelled
  'certificate_cancelled': 'cancelled',
  'superseded': 'cancelled',
};

// Display labels for consolidated statuses
export const STATUS_DISPLAY_LABELS: Record<ConsolidatedStatus, string> = {
  'draft': 'Draft',
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'correction_required': 'Correction Required',
  'inspection_pending': 'Inspection Pending',
  'payment_pending': 'Payment Pending',
  'approved': 'Approved',
  'rejected': 'Rejected',
  'cancelled': 'Cancelled',
};

// Badge variants for each consolidated status
export const STATUS_BADGE_VARIANTS: Record<ConsolidatedStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  'draft': 'secondary',
  'submitted': 'default',
  'under_review': 'default',
  'correction_required': 'warning',
  'inspection_pending': 'outline',
  'payment_pending': 'warning',
  'approved': 'success',
  'rejected': 'destructive',
  'cancelled': 'secondary',
};

/**
 * Get consolidated status from DB status
 */
export function getConsolidatedStatus(dbStatus: string | null | undefined): ConsolidatedStatus {
  if (!dbStatus) return 'draft';
  return STATUS_CONSOLIDATION_MAP[dbStatus] || 'under_review'; // Default to under_review for unknown
}

/**
 * Get display label for any status (DB or consolidated)
 */
export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Draft';
  const consolidated = getConsolidatedStatus(status);
  return STATUS_DISPLAY_LABELS[consolidated];
}

/**
 * Get badge variant for any status
 */
export function getStatusBadgeVariant(status: string | null | undefined): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  if (!status) return 'secondary';
  const consolidated = getConsolidatedStatus(status);
  return STATUS_BADGE_VARIANTS[consolidated];
}

// ===== Correction Status Helpers (kept for backward compatibility) =====

export const CORRECTION_STATUSES = [
  "sent_back_for_corrections",
  "reverted_to_applicant",
  "reverted_by_dtdo",
  "objection_raised",
] as const;

const CORRECTION_STATUS_SET = new Set<string>(CORRECTION_STATUSES);

export const isCorrectionRequiredStatus = (status?: string | null) =>
  status ? CORRECTION_STATUS_SET.has(status) : false;

