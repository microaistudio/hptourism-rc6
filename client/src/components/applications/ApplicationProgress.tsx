import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ApplicationProgressProps {
    formData: Record<string, any>;
    currentStep: number;
    totalSteps: number;
    mandatoryChecks?: Record<string, boolean>;
}

// Key fields per step that determine overall progress
const PROGRESS_FIELDS = {
    step1: ['propertyName', 'district', 'tehsil', 'pincode', 'address', 'locationType'],
    step2: ['ownerFirstName', 'ownerLastName', 'ownerMobile', 'ownerAadhaar', 'ownerGender', 'guardianName', 'propertyOwnership'],
    step3: ['category', 'propertyArea'],
    step4: ['nearestHospital'], // Mandatory fields tracked via mandatoryChecks
    step5: ['revenuePapers', 'affidavitSection29', 'undertakingFormC'],
    step6: [], // Review only
};

/**
 * ApplicationProgress - Shows overall application completion percentage.
 * Displayed as a subtle progress indicator near the timer.
 */
export function ApplicationProgress({
    formData,
    currentStep,
    totalSteps,
    mandatoryChecks = {}
}: ApplicationProgressProps) {
    const progress = useMemo(() => {
        let filledCount = 0;
        let totalCount = 0;

        // Count filled fields across all steps
        Object.values(PROGRESS_FIELDS).forEach(fields => {
            fields.forEach(field => {
                totalCount++;
                const value = formData[field];
                if (Array.isArray(value) && value.length > 0) filledCount++;
                else if (typeof value === 'string' && value.trim() !== '') filledCount++;
                else if (typeof value === 'number' && value > 0) filledCount++;
                else if (value !== null && value !== undefined && value !== '') filledCount++;
            });
        });

        // Add mandatory checklist items (Step 4)
        const mandatoryTotal = 15; // Non-auto-verified mandatory items
        const mandatoryFilled = Object.values(mandatoryChecks).filter(Boolean).length;
        totalCount += mandatoryTotal;
        filledCount += Math.min(mandatoryFilled, mandatoryTotal);

        // Calculate percentage
        const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
        return Math.min(percentage, 100);
    }, [formData, mandatoryChecks]);

    const getProgressColor = (pct: number): string => {
        if (pct < 30) return 'bg-slate-300';
        if (pct < 60) return 'bg-amber-400';
        if (pct < 90) return 'bg-emerald-400';
        return 'bg-emerald-500';
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-sm">
            <CheckCircle2 className={`w-4 h-4 ${progress >= 90 ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs text-slate-500 font-medium">{progress}%</span>
            </div>
        </div>
    );
}
