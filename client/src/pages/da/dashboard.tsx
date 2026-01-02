/**
 * ============================================================================
 * ⚠️  LEGACY LAYOUT - OLD DA DASHBOARD
 * ============================================================================
 * 
 * Route: /da/dashboard
 * Status: LEGACY (kept for backward compatibility)
 * 
 * This is the ORIGINAL DA dashboard with stage-based pipeline view.
 * 
 * NEW LAYOUT: See /da/queue → pages/da/queue.tsx
 * The new unified queue layout is the future direction.
 * 
 * DO NOT add new features here. All new development should go to:
 *   - /da/queue (Unified Applications Queue)
 *   - /da/inspections (Inspections - shared)
 *   - /da/grievances (Grievances - new module)
 * 
 * This file will be deprecated once the new layout is stable.
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { isThisMonth, differenceInCalendarDays } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  RefreshCw,
  BellRing,
  Calendar,
  MapPin,
  User,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import type { ApplicationKind } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isCorrectionRequiredStatus } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import { ApplicationPipelineRow, type PipelineApplication } from "@/components/application/application-pipeline-row";
import { Badge } from "@/components/ui/badge";

const isInCurrentMonth = (value?: string | Date | null) => {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return isThisMonth(date);
};
type ApplicationWithOwner = PipelineApplication;

type InspectionOrder = {
  id: string;
  applicationId: string;
  inspectionDate?: string | null;
  inspectionAddress?: string | null;
  specialInstructions?: string | null;
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
  updatedAt?: string | null;
};

type SortOrder = "newest" | "oldest";

export default function DADashboard() {
  const [activeStage, setActiveStage] = useState("new-queue");
  const [activePill, setActivePill] = useState("new-queue-new");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [completedRange, setCompletedRange] = useState<"month" | "30d">("month");
  const [amendmentSubType, setAmendmentSubType] = useState<"all" | "add_room" | "delete_room" | "upgrade_category">("all");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/da/applications"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    queryClient.invalidateQueries({ queryKey: ["/api/da/inspections"] });
  };
  const navigateToInspections = useCallback(() => {
    setLocation("/da/inspections");
  }, [setLocation]);

  const { data: applications, isLoading } = useQuery<ApplicationWithOwner[]>({
    queryKey: ["/api/da/applications"],
  });

  const allApplications = applications ?? [];
  const correctionStatuses = new Set([
    "sent_back_for_corrections",
    "reverted_to_applicant",
    "reverted_by_dtdo",
    "objection_raised",
  ]);
  const isResubmitted = (app: ApplicationWithOwner) =>
    isCorrectionRequiredStatus(app.status) &&
    Boolean(app.latestCorrection?.createdAt || (app.correctionSubmissionCount ?? 0) > 0);
  const needsCorrectionHandling = (app: ApplicationWithOwner) =>
    correctionStatuses.has(app.status || "") || isResubmitted(app);

  const getSortTimestamp = useCallback((app: ApplicationWithOwner) => {
    const candidate = app.updatedAt ?? app.submittedAt ?? app.createdAt;
    return candidate ? new Date(candidate).getTime() : 0;
  }, []);

  const sortApplications = useCallback(
    (apps: ApplicationWithOwner[]) =>
      [...apps].sort((a, b) => {
        const diff = getSortTimestamp(a) - getSortTimestamp(b);
        return sortOrder === "newest" ? -diff : diff;
      }),
    [getSortTimestamp, sortOrder],
  );

  const { data: user } = useQuery<{ user: { id: string; fullName: string; role: string; district?: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const { data: inspections } = useQuery<InspectionOrder[]>({
    queryKey: ["/api/da/inspections"],
  });

  // Group applications by status
  const submittedApplications = useMemo(
    () => allApplications.filter((app) => app.status === "submitted"),
    [allApplications],
  );
  const underScrutiny = useMemo(
    () => allApplications.filter((app) => app.status === "under_scrutiny" && !needsCorrectionHandling(app)),
    [allApplications],
  );
  const forwarded = useMemo(
    () => allApplications.filter((app) => app.status === "forwarded_to_dtdo"),
    [allApplications],
  );
  const reverted = useMemo(
    () => allApplications.filter((app) => needsCorrectionHandling(app)),
    [allApplications],
  );
  const awaitingOwner = useMemo(
    () => reverted.filter((app) => !isResubmitted(app)),
    [reverted],
  );
  const ownerResubmitted = useMemo(
    () => reverted.filter((app) => isResubmitted(app)),
    [reverted],
  );
  const sortedUnderScrutiny = useMemo(
    () => sortApplications(underScrutiny),
    [underScrutiny, sortApplications],
  );
  const sortedForwarded = useMemo(() => sortApplications(forwarded), [forwarded, sortApplications]);
  const sortedAwaitingOwners = useMemo(() => sortApplications(awaitingOwner), [awaitingOwner, sortApplications]);
  const sortedResubmitted = useMemo(
    () => sortApplications(ownerResubmitted),
    [ownerResubmitted, sortApplications],
  );
  const scheduledInspections = useMemo(
    () => {
      const seen = new Set<string>();
      return (inspections ?? []).filter((order) => {
        const key = order.applicationId || order.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return !order.reportSubmitted;
      });
    },
    [inspections],
  );
  const completedInspections = useMemo(
    () => {
      const seen = new Set<string>();
      return (inspections ?? []).filter((order) => {
        const key = order.applicationId || order.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return order.reportSubmitted;
      });
    },
    [inspections],
  );
  const completedInspectionsThisMonth = useMemo(
    () =>
      completedInspections.filter((order) =>
        isInCurrentMonth(order.updatedAt || order.inspectionDate || null),
      ),
    [completedInspections],
  );
  const isModificationKind = useCallback((app: ApplicationWithOwner) => {
    const kind = (app.applicationKind || (app as any).application_kind) as string | undefined;
    const value = kind?.toLowerCase() || "";
    return value === "cancel_certificate" || value.includes("modification");
  }, []);

  const isAmendmentKind = useCallback((app: ApplicationWithOwner) => {
    const kind = (app.applicationKind || (app as any).application_kind) as string | undefined;
    const value = kind?.toLowerCase() || "";
    // Explicit checks for known kinds
    if (value === "add_rooms" || value === "delete_rooms" || value === "change_category") return true;
    // Fallback for variations
    return value.includes("amend") || value.includes("add_room") || value.includes("delete_room");
  }, []);

  // Individual amendment type filters
  const isAddRoomKind = useCallback((app: ApplicationWithOwner) => {
    const kind = (app.applicationKind || (app as any).application_kind) as string | undefined;
    const value = kind?.toLowerCase() || "";
    return value === "add_rooms" || value.includes("add_room");
  }, []);

  const isDeleteRoomKind = useCallback((app: ApplicationWithOwner) => {
    const kind = (app.applicationKind || (app as any).application_kind) as string | undefined;
    const value = kind?.toLowerCase() || "";
    return value === "delete_rooms" || value.includes("delete_room");
  }, []);

  const isUpgradeCategoryKind = useCallback((app: ApplicationWithOwner) => {
    const kind = (app.applicationKind || (app as any).application_kind) as string | undefined;
    const value = kind?.toLowerCase() || "";
    return value === "change_category" || value.includes("upgrade");
  }, []);

  const submittedNew = useMemo(
    () =>
      sortApplications(
        submittedApplications.filter(
          (app) =>
            !isModificationKind(app) &&
            !isAmendmentKind(app),
        ),
      ),
    [submittedApplications, sortApplications, isModificationKind, isAmendmentKind],
  );
  const submittedAmendments = useMemo(
    () =>
      sortApplications(
        submittedApplications.filter((app) => isAmendmentKind(app)),
      ),
    [submittedApplications, sortApplications, isAmendmentKind],
  );
  // Individual amendment type arrays
  const submittedAddRoom = useMemo(
    () => sortApplications(submittedApplications.filter((app) => isAddRoomKind(app))),
    [submittedApplications, sortApplications, isAddRoomKind],
  );
  const submittedDeleteRoom = useMemo(
    () => sortApplications(submittedApplications.filter((app) => isDeleteRoomKind(app))),
    [submittedApplications, sortApplications, isDeleteRoomKind],
  );
  const submittedUpgradeCategory = useMemo(
    () => sortApplications(submittedApplications.filter((app) => isUpgradeCategoryKind(app))),
    [submittedApplications, sortApplications, isUpgradeCategoryKind],
  );
  const submittedModifications = useMemo(
    () =>
      sortApplications(
        submittedApplications.filter((app) => isModificationKind(app)),
      ),
    [submittedApplications, sortApplications, isModificationKind],
  );

  const renderInspectionList = useCallback(
    (list: InspectionOrder[], variant: "scheduled" | "completed") => {
      if (!list.length) {
        return (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">
              {variant === "scheduled" ? "All inspections cleared" : "No reports in this window"}
            </p>
            <p className="text-sm mt-1">
              {variant === "scheduled"
                ? "You don't have any pending field visits."
                : "Completed inspections will appear here."}
            </p>
          </div>
        );
      }

      return (
        <div className="border rounded-lg overflow-hidden">
          {list.map((inspection) => (
            <div
              key={inspection.id}
              className="px-4 py-3 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors last:border-b-0"
              onClick={() => setLocation(`/da/inspections/${inspection.id}`)}
              data-testid={`card-inspection-${inspection.id}`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left side: Icon + Property info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Clipboard icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${inspection.reportSubmitted
                    ? "bg-green-100"
                    : "bg-amber-100"
                    }`}>
                    <ClipboardCheck className={`w-5 h-5 ${inspection.reportSubmitted
                      ? "text-green-600"
                      : "text-amber-600"
                      }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Line 1: Property name + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{inspection.application?.propertyName || 'Property Name Unavailable'}</span>
                      {inspection.application?.category && (
                        <Badge
                          variant="outline"
                          className={
                            {
                              diamond: "bg-purple-50 text-purple-700",
                              gold: "bg-yellow-50 text-yellow-700",
                              silver: "bg-gray-50 text-gray-700",
                            }[inspection.application.category.toLowerCase()] || ""
                          }
                        >
                          {inspection.application.category.toUpperCase()}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          inspection.reportSubmitted
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }
                      >
                        {inspection.reportSubmitted ? "Report Submitted" : "Scheduled"}
                      </Badge>
                    </div>

                    {/* Line 2: App number, date, owner */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{inspection.application?.applicationNumber || '—'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {inspection.inspectionDate
                          ? new Date(inspection.inspectionDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {inspection.owner?.fullName || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Action button */}
                <Button
                  size="sm"
                  variant={inspection.reportSubmitted ? "outline" : "default"}
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/da/inspections/${inspection.id}`);
                  }}
                >
                  {inspection.reportSubmitted ? 'View Report' : 'Submit Report'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [setLocation],
  );

  const completedRangeFilter = useCallback(
    (date?: string | Date | null) => {
      if (!date) return false;
      const dt = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(dt.getTime())) return false;
      if (completedRange === "month") return isThisMonth(dt);
      return differenceInCalendarDays(new Date(), dt) <= 30;
    },
    [completedRange],
  );
  const approvedCompleted = useMemo(
    () =>
      sortApplications(
        allApplications.filter(
          (app) => app.status === "approved" &&
            !app.applicationNumber?.startsWith('LG-HS-') &&  // Exclude Legacy RC
            completedRangeFilter(app.approvedAt ?? app.updatedAt),
        ),
      ),
    [allApplications, sortApplications, completedRangeFilter],
  );
  const legacyRCVerified = useMemo(
    () =>
      sortApplications(
        allApplications.filter(
          (app) => app.status === "approved" &&
            app.applicationNumber?.startsWith('LG-HS-') &&
            completedRangeFilter(app.approvedAt ?? app.updatedAt),
        ),
      ),
    [allApplications, sortApplications, completedRangeFilter],
  );
  const rejectedCompleted = useMemo(
    () =>
      sortApplications(
        allApplications.filter((app) => app.status === "rejected" && completedRangeFilter(app.updatedAt)),
      ),
    [allApplications, sortApplications, completedRangeFilter],
  );
  const stageSummaries = useMemo(
    () => ({
      new: `New Reg ${submittedNew.length} · Renewals 0 · Amend ${submittedAmendments.length} · Cancel ${submittedModifications.length}`,
      process: `Screening ${sortedUnderScrutiny.length} · Forwarded ${sortedForwarded.length}`,
      corrections: `Sent back ${sortedAwaitingOwners.length} · Resubmitted ${sortedResubmitted.length}`,
      inspections: `Scheduled ${scheduledInspections.length} · Reports ${completedInspections.length}`,
      completed: `Approved ${approvedCompleted.length} · Rejected ${rejectedCompleted.length}`,
    }),
    [
      submittedNew.length,
      submittedAmendments.length,
      submittedModifications.length,
      sortedUnderScrutiny.length,
      sortedForwarded.length,
      sortedAwaitingOwners.length,
      sortedResubmitted.length,
      scheduledInspections.length,
      completedInspectionsThisMonth.length,
      approvedCompleted.length,
      rejectedCompleted.length,
      completedRange,
      renderInspectionList,
    ],
  );
  const stageConfigs = useMemo<StageConfig[]>(
    () => [
      {
        key: "new-queue",
        title: "Incoming Queue",
        description: "New submissions ready for scrutiny.",
        icon: FileText,
        summary: stageSummaries.new,
        pills: [
          {
            value: "new-queue-new",
            label: "New Registration",
            count: submittedNew.length,
            description: "Brand-new properties seeking recognition.",
            applications: submittedNew,
            actionLabel: "Start scrutiny",
            emptyTitle: "No new registrations",
            emptyDescription: "Every new application has been triaged.",
          },
          {
            value: "new-queue-renewal",
            label: "Renewals",
            count: 0,
            description: "RC renewals from existing registrations.",
            applications: [],
            actionLabel: "Start scrutiny",
            emptyTitle: "No renewals pending",
            emptyDescription: "Renewals will appear here 90 days before expiry.",
          },
          {
            value: "new-queue-amend",
            label: "Amendments",
            count: submittedAmendments.length,
            description: "Add/remove room and category upgrade requests.",
            applications: submittedAmendments,
            actionLabel: "Start scrutiny",
            emptyTitle: "No amendments",
            emptyDescription: "No amendment requests pending.",
          },
          {
            value: "new-queue-mod",
            label: "Cancellation",
            count: submittedModifications.length,
            description: "Cancellation requests to validate.",
            applications: submittedModifications,
            actionLabel: "Start scrutiny",
            emptyTitle: "No cancellations",
            emptyDescription: "No cancellation requests pending.",
          },
        ],
      },
      {
        key: "process",
        title: "Under Process",
        description: "Files currently in your scrutiny flow.",
        icon: Search,
        summary: stageSummaries.process,
        pills: [
          {
            value: "process-screening",
            label: "Screening",
            count: sortedUnderScrutiny.length,
            description: "Applications you're actively reviewing.",
            applications: sortedUnderScrutiny,
            actionLabel: "Resume review",
            emptyTitle: "No files in scrutiny",
            emptyDescription: "Pick any pending application to keep the queue moving.",
          },
          {
            value: "process-forwarded",
            label: "Forwarded to DTDO",
            count: sortedForwarded.length,
            description: "Cases awaiting DTDO action.",
            applications: sortedForwarded,
            actionLabel: "View summary",
            emptyTitle: "Nothing forwarded yet",
            emptyDescription: "Forward files once all DA checks are complete.",
          },
        ],
      },
      {
        key: "corrections",
        title: "Awaiting Response",
        description: "Sent back for corrections or awaiting resubmission.",
        icon: AlertCircle,
        summary: stageSummaries.corrections,
        pills: [
          {
            value: "corrections-waiting",
            label: "Sent back to applicant",
            count: sortedAwaitingOwners.length,
            description: "Corrections requested and awaiting owner response.",
            applications: sortedAwaitingOwners,
            actionLabel: "Review notes",
            emptyTitle: "No pending owners",
            emptyDescription: "All requested corrections have been acknowledged.",
          },
          {
            value: "corrections-resubmitted",
            label: "Resubmitted",
            count: sortedResubmitted.length,
            description: "Owners have shared updates and await your confirmation.",
            applications: sortedResubmitted,
            actionLabel: "Review update",
            emptyTitle: "No new resubmissions",
            emptyDescription: "You'll be notified when an owner sends corrections.",
          },
        ],
      },
      {
        key: "inspections",
        title: "Inspections",
        description: "Status of field inspections assigned to you.",
        icon: BellRing,
        summary: stageSummaries.inspections,
        pills: [
          {
            value: "inspections-scheduled",
            label: "Scheduled",
            count: scheduledInspections.length,
            description: "Visits assigned but awaiting field report uploads.",
            applications: [],
            emptyTitle: "All inspections cleared",
            emptyDescription: "You don't have any pending field visits.",
            render: () => renderInspectionList(scheduledInspections, "scheduled"),
          },
          {
            value: "inspections-completed",
            label: "Report submitted",
            count: completedInspections.length,
            description: "Field reports submitted.",
            applications: [],
            emptyTitle: "No recent inspections",
            emptyDescription: "Completed inspections will appear here.",
            render: () => renderInspectionList(completedInspections, "completed"),
          },
        ],
      },
      {
        key: "completed",
        title: "Completed",
        description:
          completedRange === "month" ? "Decisions recorded this month." : "Decisions in the last 30 days.",
        icon: CheckCircle,
        summary: stageSummaries.completed,
        pills: [
          {
            value: "completed-approved",
            label: "Approved",
            count: approvedCompleted.length,
            description: "Applications that cleared all checks.",
            applications: approvedCompleted,
            emptyTitle: "No approvals yet",
            emptyDescription: "Complete scrutiny + inspection to unlock approvals.",
          },

          {
            value: "completed-rejected",
            label: "Rejected",
            count: rejectedCompleted.length,
            description: "Applications declined in this window.",
            applications: rejectedCompleted,
            actionLabel: "Review decision",
            emptyTitle: "No rejections",
            emptyDescription: "Declined files in this window will appear here.",
          },
        ],
      },
    ],
    [
      submittedNew,
      submittedAmendments,
      submittedModifications,
      sortedUnderScrutiny,
      sortedForwarded,
      sortedAwaitingOwners,
      sortedResubmitted,
      scheduledInspections,
      completedInspectionsThisMonth,
      navigateToInspections,
      approvedCompleted,
      legacyRCVerified,
      rejectedCompleted,
      completedRange,
      stageSummaries,
    ],
  );

  const actionablePills = useMemo(
    () =>
      new Set([
        "new-queue-new",
        "new-queue-amend",
        "new-queue-mod",
        "process-screening",
        "inspections-scheduled",
      ]),
    [],
  );

  useEffect(() => {
    if (!stageConfigs.length) return;
    const resolvedStage = stageConfigs.find((stage) => stage.key === activeStage) ?? stageConfigs[0];
    if (resolvedStage.key !== activeStage) {
      setActiveStage(resolvedStage.key);
      setActivePill(resolvedStage.pills[0]?.value ?? "");
      return;
    }
    if (!resolvedStage.pills.length) return;
    const resolvedPill =
      resolvedStage.pills.find((pill) => pill.value === activePill) ?? resolvedStage.pills[0];
    if (resolvedPill.value !== activePill) {
      setActivePill(resolvedPill.value);
    }
  }, [stageConfigs, activeStage, activePill]);

  // If the current stage has no items but another stage does, auto-switch to the first non-empty stage
  useEffect(() => {
    type StageKey = "new-queue" | "process" | "corrections" | "inspections" | "completed";
    const stageTotals: Record<StageKey, number> = {
      "new-queue": submittedNew.length + submittedAmendments.length + submittedModifications.length,
      process: sortedUnderScrutiny.length + sortedForwarded.length,
      corrections: sortedAwaitingOwners.length + sortedResubmitted.length,
      inspections: scheduledInspections.length + completedInspectionsThisMonth.length,
      completed: approvedCompleted.length + legacyRCVerified.length + rejectedCompleted.length,
    };
    const currentTotal = stageTotals[activeStage as StageKey] ?? 0;
    if (currentTotal > 0) return;

    const preference: StageKey[] = ["corrections", "inspections", "process", "new-queue", "completed"];
    const nextStage = preference.find((key) => (stageTotals[key] ?? 0) > 0);
    if (!nextStage) return;

    setActiveStage(nextStage);
    const pill =
      stageConfigs.find((s) => s.key === nextStage)?.pills.find((p) => p.count > 0) ??
      stageConfigs.find((s) => s.key === nextStage)?.pills[0];
    if (pill) setActivePill(pill.value);
  }, [
    activeStage,
    stageConfigs,
    submittedNew.length,
    submittedAmendments.length,
    submittedModifications.length,
    sortedUnderScrutiny.length,
    sortedForwarded.length,
    sortedAwaitingOwners.length,
    sortedResubmitted.length,
    scheduledInspections.length,
    completedInspectionsThisMonth.length,
    approvedCompleted.length,
    legacyRCVerified.length,
    rejectedCompleted.length,
  ]);
  const activeStageConfig =
    stageConfigs.find((stage) => stage.key === activeStage) ?? stageConfigs[0];
  const activePillConfig =
    activeStageConfig?.pills.find((pill) => pill.value === activePill) ??
    activeStageConfig?.pills[0];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dealing Assistant Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.user?.district || "District"} – Scrutiny + inspection workflow
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
            data-testid="button-da-refresh"
            className="w-full sm:w-fit"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/da/incomplete-applications")}
            className="w-full sm:w-fit"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Incomplete Applications
          </Button>
        </div>
      </div>

      {/* Stage Overview */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 mb-6">
        {stageConfigs.map((stage) => {
          const Icon = stage.icon;
          const totalCount = stage.totalCount ?? stage.pills.reduce((sum, pill) => sum + pill.count, 0);
          const isActiveStage = stage.key === activeStageConfig?.key;
          const hasActionable = stage.pills.some((pill) => actionablePills.has(pill.value) && pill.count > 0);
          const needsAttention = stage.key === "inspections" && totalCount > 0;
          return (
            <Card
              key={stage.key}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (stage.key !== activeStage) {
                  setActiveStage(stage.key);
                  setActivePill(stage.pills[0]?.value ?? "");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (stage.key !== activeStage) {
                    setActiveStage(stage.key);
                    setActivePill(stage.pills[0]?.value ?? "");
                  }
                }
              }}
              className={cn(
                "p-3 sm:p-4 flex flex-col gap-1 cursor-pointer transition-all border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl relative overflow-hidden dashboard-card-hover",
                isActiveStage ? "ring-2 ring-primary" : "",
                hasActionable ? "dashboard-card-shimmer" : "",
                needsAttention ? "dashboard-card-shimmer-amber" : "",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground dashboard-card-title">{stage.title}</p>
                  <p className={cn(
                    "text-2xl font-semibold mt-0.5 dashboard-card-count",
                    totalCount > 0 ? "dashboard-count-pulse" : ""
                  )}>{totalCount}</p>
                </div>
                <div className="p-1.5 rounded-full bg-muted/40">
                  <Icon className="w-4 h-4 text-primary dashboard-card-icon" />
                </div>
              </div>
              {stage.key === "completed" ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={completedRange}
                    onValueChange={(v: "month" | "30d") => setCompletedRange(v)}
                  >
                    <SelectTrigger className="h-5 text-[10px] w-fit gap-1 bg-transparent border-0 p-0 text-muted-foreground hover:text-foreground focus:ring-0">
                      <span className="truncate">
                        {completedRange === "month" ? "Decisions this month" : "Decisions last 30 days"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground line-clamp-1">{stage.description}</p>
              )}
              <div className="mt-2 flex flex-col gap-0.5 text-[11px]">
                {stage.pills.map((pill) => {
                  const isActionable = actionablePills.has(pill.value) && pill.count > 0;
                  const isActive = pill.value === activePill && stage.key === activeStage;
                  return (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveStage(stage.key);
                        setActivePill(pill.value);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-2 py-1 rounded transition-all text-left",
                        // Background for all bars
                        isActionable
                          ? stage.key === "inspections"
                            ? "bg-amber-50 hover:bg-amber-100"
                            : "bg-primary/10 hover:bg-primary/15"
                          : "bg-muted/30 hover:bg-muted/50",
                        isActive ? "ring-1 ring-primary" : "",
                        // Subtle pulse animation for items with count > 0
                        isActionable ? "animate-pulse-subtle" : "",
                      )}
                    >
                      <span className={cn(
                        isActionable
                          ? stage.key === "inspections"
                            ? "text-amber-800 font-medium"
                            : "text-primary font-medium"
                          : "text-muted-foreground"
                      )}>{pill.label}</span>
                      <span className={cn(
                        "min-w-[1.5rem] text-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isActionable
                          ? stage.key === "inspections"
                            ? "bg-amber-500 text-white"
                            : "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      )}>{pill.count}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {activeStageConfig && (
        <div className="flex flex-wrap gap-2 bg-muted/30 p-3 rounded-3xl mb-6 items-center">
          {activeStageConfig.pills.map((pill) => {
            const isActivePill = pill.value === activePillConfig?.value;
            const isAttentionPill = pill.count > 0;
            return (
              <button
                key={pill.value}
                type="button"
                className={cn(
                  "px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 transition-colors",
                  isActivePill
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-white text-foreground border-border hover:bg-muted",
                )}
                onClick={() => {
                  setActiveStage(activeStageConfig.key);
                  setActivePill(pill.value);
                }}
              >
                <span>{pill.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{pill.count}</span>
                {isAttentionPill && !isActivePill && <span className="h-2 w-2 rounded-full bg-amber-500" />}
              </button>
            );
          })}

        </div>
      )}

      {/* Amendment Sub-Pills Row - appears when Amendments tab is selected */}
      {activePill === "new-queue-amend" && (
        <div className="flex flex-wrap gap-2 bg-muted/20 p-2 rounded-xl mb-4 items-center ml-4 mr-4 border border-dashed border-border">
          <span className="text-xs text-muted-foreground mr-2">Filter by:</span>
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              amendmentSubType === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-muted"
            )}
            onClick={() => setAmendmentSubType("all")}
          >
            All ({submittedAmendments.length})
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              amendmentSubType === "add_room"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-muted"
            )}
            onClick={() => setAmendmentSubType("add_room")}
          >
            Add Room ({submittedAddRoom.length})
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              amendmentSubType === "delete_room"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-muted"
            )}
            onClick={() => setAmendmentSubType("delete_room")}
          >
            Delete Room ({submittedDeleteRoom.length})
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              amendmentSubType === "upgrade_category"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-muted"
            )}
            onClick={() => setAmendmentSubType("upgrade_category")}
          >
            Upgrade Category ({submittedUpgradeCategory.length})
          </button>
        </div>
      )}

      {scheduledInspections.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Inspections need attention</p>
            <p className="text-sm text-amber-900/80">
              {scheduledInspections.length} inspection{scheduledInspections.length === 1 ? "" : "s"} are awaiting field
              reports.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-100"
            onClick={navigateToInspections}
          >
            <BellRing className="w-4 h-4 mr-2" />
            View inspection queue
          </Button>
        </div>
      )}

      {activeStageConfig && activePillConfig && (
        <Card data-testid={`stage-${activeStageConfig.key}-${activePillConfig.value}`}>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>{activePillConfig.label}</CardTitle>
              <CardDescription>{activePillConfig.description}</CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {!activePillConfig.render && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Sort</span>
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            </div>
          </CardHeader>
          <CardContent>
            {activePillConfig.render ? (
              activePillConfig.render(activePillConfig.applications)
            ) : activePillConfig.applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{activePillConfig.emptyTitle}</p>
                <p className="text-sm mt-1">{activePillConfig.emptyDescription}</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {activePillConfig.applications.map((application) => (
                  <ApplicationPipelineRow
                    key={application.id}
                    application={application}
                    actionLabel={activePillConfig.actionLabel ?? "Open application"}
                    applicationIds={activePillConfig.applications.map((a) => a.id)}
                    hideAction={activeStageConfig.key === "completed"}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StageConfig {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  totalCount?: number;
  summary: string;
  pills: StagePillConfig[];
}

interface StagePillConfig {
  value: string;
  label: string;
  count: number;
  description: string;
  applications: ApplicationWithOwner[];
  actionLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  render?: (applications: ApplicationWithOwner[]) => JSX.Element;
}

interface InspectionSummaryCardProps {
  count: number;
  variant: "pending" | "completed";
  onNavigate: () => void;
  subtitle?: string;
}

function InspectionSummaryCard({ count, variant, onNavigate, subtitle }: InspectionSummaryCardProps) {
  const isPending = variant === "pending";
  const title = isPending ? "Scheduled inspections" : "Completed inspections";
  const description = subtitle
    ? subtitle
    : isPending
      ? "Field visits are scheduled and waiting for updates."
      : "These inspections already include submitted reports.";
  const buttonLabel = isPending ? "Capture inspection updates" : "View inspection history";

  return (
    <div className="text-center py-8 space-y-4">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-4xl font-semibold">{count}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onNavigate} variant={isPending ? "default" : "outline"} className="gap-2">
        {buttonLabel}
      </Button>
    </div>
  );
}
