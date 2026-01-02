/**
 * Applications View Component for DA Queue
 */
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    FileText,
    UserPlus,
    Search,
    Clock,
    AlertTriangle,
    Plus,
    Minus,
    FileCheck,
    Filter,
    Phone,
    Eye,
    Sparkles,
    TrendingUp,
    Users,
    Building2,
    ChevronRight,
    XCircle
} from "lucide-react";
import { isCorrectionRequiredStatus } from "@/constants/workflow";
import type { ApplicationWithOwner } from "./types";
import type { ApplicationKind } from "@shared/schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

// Status constants for filtering
const ACTIVE_STATUSES = [
    'submitted',
    'under_scrutiny',
    'reverted_to_applicant',
    'sent_back_for_corrections',
    'forwarded_to_dtdo',
    'dtdo_review',
    'inspection_scheduled',
    'inspection_completed',
    'legacy_rc_review',
    'pending_payment',
    'payment_failed',
    'reverted_by_dtdo',
    'objection_raised',
];

const DRAFT_STATUSES = ['draft', 'legacy_rc_draft'];
const COMPLETED_STATUSES = ['approved', 'rejected', 'cancelled'];

// Configuration
const APPLICATION_TYPES = {
    new_registration: {
        label: "New Registration",
        shortLabel: "New",
        icon: UserPlus,
        borderColor: "border-l-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        dotColor: "bg-blue-500"
    },
    legacy_onboarding: {
        label: "Existing RC Reg",
        shortLabel: "Existing RC",
        icon: FileCheck,
        borderColor: "border-l-violet-500",
        bgColor: "bg-violet-50",
        textColor: "text-violet-700",
        dotColor: "bg-violet-500"
    },
    add_rooms: {
        label: "Add Rooms",
        shortLabel: "Add",
        icon: Plus,
        borderColor: "border-l-emerald-500",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        dotColor: "bg-emerald-500"
    },
    delete_rooms: {
        label: "Delete Rooms",
        shortLabel: "Delete",
        icon: Minus,
        borderColor: "border-l-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        dotColor: "bg-orange-500"
    },
    cancel_certificate: {
        label: "Cancel RC",
        shortLabel: "Cancel",
        icon: XCircle,
        borderColor: "border-l-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        dotColor: "bg-red-500"
    },
    change_category: {
        label: "Change Category",
        shortLabel: "Category",
        icon: FileCheck,
        borderColor: "border-l-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        dotColor: "bg-purple-500"
    },
};

type ApplicationTypeKey = keyof typeof APPLICATION_TYPES;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    submitted: { label: "Pending", color: "bg-gray-100 text-gray-700" },
    under_scrutiny: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
    sent_back_for_corrections: { label: "Correction", color: "bg-amber-100 text-amber-700" },
    reverted_to_applicant: { label: "Correction", color: "bg-amber-100 text-amber-700" },
    reverted_by_dtdo: { label: "DTDO Return", color: "bg-orange-100 text-orange-700" },
    objection_raised: { label: "Objection", color: "bg-red-100 text-red-700" },
    forwarded_to_dtdo: { label: "At DTDO", color: "bg-violet-100 text-violet-700" },
    dtdo_review: { label: "DTDO Review", color: "bg-violet-100 text-violet-700" },
    inspection_scheduled: { label: "Inspection Scheduled", color: "bg-purple-100 text-purple-700" },
    inspection_completed: { label: "Inspected", color: "bg-indigo-100 text-indigo-700" },
    pending_payment: { label: "Pending Payment", color: "bg-teal-100 text-teal-700" },
    payment_failed: { label: "Payment Failed", color: "bg-red-100 text-red-700" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

// Statuses where application has moved beyond DA scrutiny (at DTDO or in inspection)
const FORWARDED_INSPECTION_STATUSES = [
    'forwarded_to_dtdo',
    'dtdo_review',
    'inspection_scheduled',
    'inspection_completed',
    'inspection_under_review',
];

// Statuses for applications under DA scrutiny (not yet forwarded)
const DA_SCRUTINY_STATUSES = [
    'submitted',
    'under_scrutiny',
    'reverted_to_applicant',
    'sent_back_for_corrections',
    'reverted_by_dtdo',
    'objection_raised',
];

const TAB_GROUPS = [
    { key: "active", label: "All Active" },
    { key: "new_submissions", label: "New Submissions" },
    { key: "corrections", label: "Corrections" },
    { key: "dtdo", label: "At DTDO / Inspection" },
    { key: "completed", label: "Completed" },
];

// Sub-tabs configuration for each main stage
const STAGE_SUB_TABS = {
    new_submissions: [
        { key: 'all', label: 'All New' },
        { key: 'new_registration', label: 'New Applications' },
        { key: 'add_rooms', label: 'Add Rooms' },
        { key: 'delete_rooms', label: 'Delete Rooms' },
        { key: 'change_category', label: 'Change Category' },
        { key: 'cancel_certificate', label: 'Cancellations' },
        { key: 'existing_rc', label: 'Existing RC' },
    ],
    corrections: [
        { key: 'all', label: 'All Corrections' },
        { key: 'resubmitted', label: 'Resubmitted', highlight: true },
        { key: 'returned', label: 'Returned for Corrections' },
    ],
    dtdo: [
        { key: 'all', label: 'All At DTDO' },
        { key: 'forwarded', label: 'Forwarded' },
        { key: 'scheduled', label: 'Inspection Scheduled' },
        { key: 'report_pending', label: 'Report Pending' },
        { key: 'report_submitted', label: 'Report Submitted' },
    ],
    completed: [
        { key: 'all', label: 'All Completed' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ],
    active: [] // 'All Active' doesn't have specific sub-tabs
};

interface ApplicationsViewProps {
    applications: ApplicationWithOwner[];
    onApplicationClick: (id: string, status?: string) => void;
}

export function ApplicationsView({ applications, onApplicationClick }: ApplicationsViewProps) {
    const [activeTab, setActiveTab] = useState("active");
    const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [completedStatusFilter, setCompletedStatusFilter] = useState<"all" | "approved" | "rejected">("all");
    const [completedDateFilter, setCompletedDateFilter] = useState<"week" | "month" | "30days">("month");

    // Helper functions
    const isResubmitted = (app: ApplicationWithOwner) =>
        isCorrectionRequiredStatus(app.status) &&
        Boolean(app.latestCorrection?.createdAt || (app.correctionSubmissionCount ?? 0) > 0);

    const getAppKind = (app: ApplicationWithOwner): ApplicationTypeKey => {
        const kind = app.applicationKind?.toLowerCase() || "";
        if (kind === "add_rooms") return "add_rooms";
        if (kind === "delete_rooms") return "delete_rooms";
        if (kind === "cancel_certificate") return "cancel_certificate";
        if (kind === "change_category") return "change_category";
        if (kind === "legacy_onboarding") return "legacy_onboarding";
        return "new_registration";
    };

    // Helper: filter by date for completed tab
    const isWithinDateRange = (date: string | Date | null | undefined, range: "week" | "month" | "30days") => {
        if (!date) return false;
        const d = new Date(date);
        const now = new Date();
        switch (range) {
            case "week": {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                return d >= weekAgo;
            }
            case "month": {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            case "30days": {
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);
                return d >= thirtyDaysAgo;
            }
        }
    };

    // Filtered applications
    const filteredApps = useMemo(() => {
        let apps = applications;
        const currentTab = TAB_GROUPS.find(t => t.key === activeTab);

        // Handle different tabs
        if (activeTab === "active") {
            // Active = only active pipeline statuses (excludes drafts and completed)
            apps = apps.filter(app => ACTIVE_STATUSES.includes(app.status || ""));
        } else if (activeTab === "new_submissions") {
            // New Submissions = Submitted + Under Scrutiny (DA's Court)
            apps = apps.filter(app => ["submitted", "under_scrutiny"].includes(app.status || ""));
        } else if (activeTab === "corrections") {
            // Corrections = Sent back, Reverted, Objection, Resubmitted
            apps = apps.filter(app => [
                "sent_back_for_corrections",
                "reverted_to_applicant",
                "reverted_by_dtdo",
                "objection_raised"
            ].includes(app.status || ""));
        } else if (activeTab === "dtdo") {
            // At DTDO / Inspection = Forwarded, DTDO Review, Inspection stages
            apps = apps.filter(app => [
                "forwarded_to_dtdo",
                "dtdo_review",
                "inspection_scheduled",
                "inspection_completed",
                "inspection_under_review"
            ].includes(app.status || ""));
        } else if (activeTab === "completed") {
            // Completed = approved/rejected only, with date filter
            apps = apps.filter(app => COMPLETED_STATUSES.includes(app.status || ""));
            // Apply status sub-filter
            if (completedStatusFilter !== "all") {
                apps = apps.filter(app => app.status === completedStatusFilter);
            }
            // Apply date filter
            apps = apps.filter(app => isWithinDateRange(app.updatedAt, completedDateFilter));
        }

        // Apply Sub-Filters (Pills)
        if (activeSubFilter && activeSubFilter !== 'all') {
            if (activeTab === 'new_submissions') {
                // New Submissions: Filter by Kind
                if (activeSubFilter === 'new_registration') {
                    apps = apps.filter(app => !app.applicationKind || app.applicationKind === 'new_registration');
                } else if (activeSubFilter === 'add_rooms') {
                    apps = apps.filter(app => app.applicationKind === 'add_rooms');
                } else if (activeSubFilter === 'delete_rooms') {
                    apps = apps.filter(app => app.applicationKind === 'delete_rooms');
                } else if (activeSubFilter === 'cancel_certificate') {
                    apps = apps.filter(app => app.applicationKind === 'cancel_certificate');
                } else if (activeSubFilter === 'change_category') {
                    apps = apps.filter(app => app.applicationKind === 'change_category');
                } else if (activeSubFilter === 'existing_rc') {
                    apps = apps.filter(app => (app.applicationKind as string) === 'legacy_onboarding');
                }
            } else if (activeTab === 'corrections') {
                // Corrections: Filter by Status
                if (activeSubFilter === 'resubmitted') {
                    // Resubmitted by owner (action required for DA)
                    apps = apps.filter(app => isResubmitted(app));
                } else if (activeSubFilter === 'returned') {
                    // Returned for Corrections (waiting for applicant)
                    apps = apps.filter(app => !isResubmitted(app));
                }
            } else if (activeTab === 'dtdo') {
                if (activeSubFilter === 'forwarded') {
                    apps = apps.filter(app => ['forwarded_to_dtdo', 'dtdo_review'].includes(app.status || ''));
                } else if (activeSubFilter === 'scheduled') {
                    apps = apps.filter(app => app.status === 'inspection_scheduled');
                } else if (activeSubFilter === 'report_pending') {
                    apps = apps.filter(app => app.status === 'inspection_under_review');
                } else if (activeSubFilter === 'report_submitted') {
                    apps = apps.filter(app => app.status === 'inspection_completed');
                }
            } else if (activeTab === 'completed') {
                if (activeSubFilter === 'approved') {
                    apps = apps.filter(app => app.status === 'approved');
                } else if (activeSubFilter === 'rejected') {
                    apps = apps.filter(app => app.status === 'rejected');
                }
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            apps = apps.filter(app =>
                app.propertyName?.toLowerCase().includes(query) ||
                app.ownerName?.toLowerCase().includes(query) ||
                app.applicationNumber?.toLowerCase().includes(query) ||
                app.ownerMobile?.includes(query)
            );
        }
        return apps;
    }, [applications, activeTab, activeSubFilter, searchQuery, completedDateFilter]);

    const tabCounts = useMemo(() => {
        return TAB_GROUPS.map(tab => {
            let count = 0;
            if (tab.key === "active") {
                count = applications.filter(app => ACTIVE_STATUSES.includes(app.status || "")).length;
            } else if (tab.key === "new_submissions") {
                count = applications.filter(app => ["submitted", "under_scrutiny"].includes(app.status || "")).length;
            } else if (tab.key === "corrections") {
                count = applications.filter(app => [
                    "sent_back_for_corrections",
                    "reverted_to_applicant",
                    "reverted_by_dtdo",
                    "objection_raised"
                ].includes(app.status || "")).length;
            } else if (tab.key === "dtdo") {
                count = applications.filter(app => [
                    "forwarded_to_dtdo",
                    "dtdo_review",
                    "inspection_scheduled",
                    "inspection_completed",
                    "inspection_under_review"
                ].includes(app.status || "")).length;
            } else if (tab.key === "completed") {
                count = applications.filter(app => COMPLETED_STATUSES.includes(app.status || "")).length;
            }
            return { ...tab, count };
        });
    }, [applications]);

    const stats = useMemo(() => {
        const pending = applications.filter(app =>
            app.status === "submitted" || app.status === "under_scrutiny"
        ).length;
        const needsAttention = applications.filter(app => isResubmitted(app)).length;
        // New submissions TODAY that DA needs to act on (status must be 'submitted')
        const newTodayPending = applications.filter(app => {
            if (app.status !== 'submitted') return false; // Only unactioned submissions
            if (!app.submittedAt) return false;
            const submitted = new Date(app.submittedAt);
            const today = new Date();
            return submitted.toDateString() === today.toDateString();
        }).length;
        // Count applications at DTDO/Inspection stage
        const atDtdoOrInspection = applications.filter(app =>
            ['forwarded_to_dtdo', 'dtdo_review', 'inspection_scheduled', 'inspection_completed'].includes(app.status || '')
        ).length;

        // Count completed for different time ranges
        const now = new Date();
        const completedApps = applications.filter(app =>
            app.status === "approved" || app.status === "rejected"
        );

        // This week
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const completedWeek = completedApps.filter(app => {
            if (!app.updatedAt) return false;
            return new Date(app.updatedAt) >= weekAgo;
        }).length;

        // This month
        const completedMonth = completedApps.filter(app => {
            if (!app.updatedAt) return false;
            const d = new Date(app.updatedAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        // Last 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const completed30Days = completedApps.filter(app => {
            if (!app.updatedAt) return false;
            return new Date(app.updatedAt) >= thirtyDaysAgo;
        }).length;

        // Previous 30 days (for trend calculation - 60 to 30 days ago)
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(now.getDate() - 60);
        const completedPrev30Days = completedApps.filter(app => {
            if (!app.updatedAt) return false;
            const d = new Date(app.updatedAt);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).length;

        // Calculate trend percentage
        let trendPercent = 0;
        if (completedPrev30Days > 0) {
            trendPercent = Math.round(((completed30Days - completedPrev30Days) / completedPrev30Days) * 100);
        } else if (completed30Days > 0) {
            trendPercent = 100; // If previous was 0 but current has some, show 100% increase
        }

        return {
            pending, needsAttention, newTodayPending, atDtdoOrInspection,
            completedWeek, completedMonth, completed30Days, trendPercent
        };
    }, [applications]);

    const allApplicationTypes: ApplicationTypeKey[] = [
        "new_registration",
        "legacy_onboarding",
        "add_rooms",
        "delete_rooms",
        "change_category",
        "cancel_certificate"
    ];
    const showSubFilters = activeTab !== "completed";

    return (
        <div className="space-y-6">
            {/* Quick Stats - Clickable Cards */}
            {/* Quick Stats - Clickable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all ${activeTab === 'new_submissions' ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                    onClick={() => { setActiveTab("new_submissions"); setActiveSubFilter(null); }}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs uppercase tracking-wider font-medium ${activeTab === 'new_submissions' ? 'text-blue-700' : 'text-gray-500'}`}>New Submissions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                                <p className="text-xs text-gray-500 mt-1">New + Under scrutiny</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all ${activeTab === 'corrections' ? 'ring-2 ring-amber-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                    onClick={() => { setActiveTab("corrections"); setActiveSubFilter(null); }}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs uppercase tracking-wider font-medium ${activeTab === 'corrections' ? 'text-amber-700' : 'text-gray-500'}`}>Corrections</p>
                                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.needsAttention}</p>
                                <p className="text-xs text-gray-500 mt-1">Resubmitted + Pending</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all ${activeTab === 'dtdo' ? 'ring-2 ring-violet-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                    onClick={() => { setActiveTab("dtdo"); setActiveSubFilter(null); }}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-bl-full" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs uppercase tracking-wider font-medium ${activeTab === 'dtdo' ? 'text-violet-700' : 'text-gray-500'}`}>At DTDO / Inspection</p>
                                <p className="text-3xl font-bold text-violet-600 mt-1">{stats.atDtdoOrInspection}</p>
                                <p className="text-xs text-gray-500 mt-1">Forwarded + Inspection</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all ${activeTab === 'active' ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                    onClick={() => { setActiveTab("new_submissions"); setActiveSubFilter(null); }}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs uppercase tracking-wider font-medium ${activeTab === 'active' ? 'text-emerald-700' : 'text-gray-500'}`}>New Today</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.newTodayPending}</p>
                                <p className="text-xs text-gray-500 mt-1">Fresh submissions</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`relative overflow-hidden transition-all ${activeTab === 'completed' ? 'ring-2 ring-green-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div
                                className="cursor-pointer flex-1"
                                onClick={() => {
                                    setActiveTab("completed");
                                    setActiveSubFilter(null);
                                }}
                            >
                                <p className={`text-xs uppercase tracking-wider font-medium ${activeTab === 'completed' ? 'text-green-700' : 'text-gray-500'}`}>Completed</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <p className="text-3xl font-bold text-green-600">
                                        {completedDateFilter === "week" ? stats.completedWeek :
                                            completedDateFilter === "month" ? stats.completedMonth :
                                                stats.completed30Days}
                                    </p>
                                    {/* Trend indicator */}
                                    {stats.trendPercent !== 0 && (
                                        <span className={`text-xs font-medium flex items-center gap-0.5 ${stats.trendPercent > 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {stats.trendPercent > 0 ? "↑" : "↓"}
                                            {Math.abs(stats.trendPercent)}%
                                        </span>
                                    )}
                                </div>
                                {/* Date range selector */}
                                <select
                                    value={completedDateFilter}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setCompletedDateFilter(e.target.value as "week" | "month" | "30days");
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1 text-xs text-gray-600 bg-gray-100 border-0 rounded px-2 py-0.5 cursor-pointer hover:bg-gray-200 focus:ring-1 focus:ring-green-500"
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="30days">Last 30 Days</option>
                                </select>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Queue Card */}
            <Card className="overflow-hidden">
                {/* Tabs & Search */}
                <div className="border-b bg-gray-50/50 p-4">
                    <div className="flex flex-col gap-4">
                        {/* Header Row: Title + Search */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {TAB_GROUPS.find(t => t.key === activeTab)?.label || "Applications"}
                                <Badge variant="outline" className="ml-2 bg-white font-normal">
                                    {filteredApps.length} item{filteredApps.length !== 1 ? 's' : ''}
                                </Badge>
                            </h2>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search applications..."
                                    className="pl-10 w-64 bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Dynamic Sub-Pills based on Active Stage */}
                        {STAGE_SUB_TABS[activeTab as keyof typeof STAGE_SUB_TABS]?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {STAGE_SUB_TABS[activeTab as keyof typeof STAGE_SUB_TABS].map((subTab) => {
                                    const isActivePill = (activeSubFilter === null && subTab.key === 'all') || activeSubFilter === subTab.key;
                                    const isHighlight = 'highlight' in subTab && subTab.highlight;

                                    // Calculate count for this sub-tab
                                    let count = 0;
                                    const baseApps = applications.filter(app => {
                                        if (activeTab === "new_submissions") return ["submitted", "under_scrutiny"].includes(app.status || "");
                                        if (activeTab === "corrections") return ["sent_back_for_corrections", "reverted_to_applicant", "reverted_by_dtdo", "objection_raised"].includes(app.status || "");
                                        if (activeTab === "dtdo") return ["forwarded_to_dtdo", "dtdo_review", "inspection_scheduled", "inspection_completed", "inspection_under_review"].includes(app.status || "");
                                        if (activeTab === "completed") return COMPLETED_STATUSES.includes(app.status || "");
                                        return ACTIVE_STATUSES.includes(app.status || "");
                                    });

                                    if (subTab.key === 'all') {
                                        count = baseApps.length;
                                    } else {
                                        count = baseApps.filter(app => {
                                            if (activeTab === 'new_submissions') {
                                                if (subTab.key === 'new_registration') return !app.applicationKind || app.applicationKind === 'new_registration';
                                                if (subTab.key === 'add_rooms') return app.applicationKind === 'add_rooms';
                                                if (subTab.key === 'delete_rooms') return app.applicationKind === 'delete_rooms';
                                                if (subTab.key === 'cancel_certificate') return app.applicationKind === 'cancel_certificate';
                                                if (subTab.key === 'change_category') return app.applicationKind === 'change_category';
                                                if (subTab.key === 'existing_rc') return (app.applicationKind as string) === 'legacy_onboarding';
                                            } else if (activeTab === 'corrections') {
                                                if (subTab.key === 'resubmitted') return isResubmitted(app);
                                                if (subTab.key === 'returned') return !isResubmitted(app);
                                            } else if (activeTab === 'dtdo') {
                                                if (subTab.key === 'forwarded') return ['forwarded_to_dtdo', 'dtdo_review'].includes(app.status || '');
                                                if (subTab.key === 'scheduled') return app.status === 'inspection_scheduled';
                                                if (subTab.key === 'report_pending') return app.status === 'inspection_under_review';
                                                if (subTab.key === 'report_submitted') return app.status === 'inspection_completed';
                                            } else if (activeTab === 'completed') {
                                                if (subTab.key === 'approved') return app.status === 'approved';
                                                if (subTab.key === 'rejected') return app.status === 'rejected';
                                            }
                                            return false;
                                        }).length;
                                    }

                                    // Hide empty pills except for 'all' and currently selected
                                    // if (count === 0 && subTab.key !== 'all' && !isActivePill) return null;

                                    return (
                                        <button
                                            key={subTab.key}
                                            onClick={() => setActiveSubFilter(subTab.key === 'all' ? null : subTab.key)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-2
                                                ${isActivePill
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : isHighlight && count > 0
                                                        ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200 animate-pulse'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {isHighlight && count > 0 && !isActivePill && <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}
                                            {subTab.label}
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActivePill ? 'bg-emerald-500/30 text-white' : isHighlight && count > 0 ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Completed tab filters */}
                    {
                        activeTab === "completed" && (
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Show:</span>
                                    <Select value={completedStatusFilter} onValueChange={(v) => setCompletedStatusFilter(v as "all" | "approved" | "rejected")}>
                                        <SelectTrigger className="w-32 h-8 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="approved">
                                                <span className="flex items-center gap-1.5">
                                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                                    Approved
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                                <span className="flex items-center gap-1.5">
                                                    <XCircle className="w-3 h-3 text-red-600" />
                                                    Rejected
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Period:</span>
                                    <Select value={completedDateFilter} onValueChange={(v) => setCompletedDateFilter(v as "week" | "month" | "30days")}>
                                        <SelectTrigger className="w-36 h-8 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="30days">Last 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Applications List */}
                < div className="divide-y" >
                    {/* Action Required Banner */}
                    {(stats.newTodayPending > 0 || stats.needsAttention > 0) && activeTab !== 'completed' && (
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Action Required</p>
                                        <p className="text-xs text-amber-600">
                                            {stats.newTodayPending > 0 && <span>{stats.newTodayPending} new submission{stats.newTodayPending > 1 ? 's' : ''} awaiting scrutiny</span>}
                                            {stats.newTodayPending > 0 && stats.needsAttention > 0 && ' • '}
                                            {stats.needsAttention > 0 && <span>{stats.needsAttention} resubmitted awaiting review</span>}
                                        </p>
                                    </div>
                                </div>
                                {stats.needsAttention > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50 text-xs"
                                        onClick={() => {
                                            setActiveTab('corrections');
                                            setActiveSubFilter('resubmitted');
                                        }}
                                    >
                                        View Resubmitted
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    {
                        filteredApps.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No applications found</p>
                                <p className="text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        ) : (
                            filteredApps.map(app => {
                                const appKind = getAppKind(app);
                                const typeConfig = APPLICATION_TYPES[appKind];
                                const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: "bg-gray-100 text-gray-700" };
                                const TypeIcon = typeConfig.icon;
                                const isHighPriority = isResubmitted(app);
                                const daysAgo = app.submittedAt
                                    ? Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
                                    : null;

                                return (
                                    <div
                                        key={app.id}
                                        onClick={() => onApplicationClick(app.id, app.status || undefined)}
                                        className={`p-4 hover:bg-gray-50/50 transition-colors border-l-4 ${typeConfig.borderColor} group cursor-pointer`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center shrink-0`}>
                                                <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">{app.propertyName}</h3>
                                                    <div className={`w-2 h-2 rounded-full ${typeConfig.dotColor}`} />
                                                    <span className={`text-xs font-medium ${typeConfig.textColor}`}>{typeConfig.label}</span>
                                                    <Badge className={`text-[10px] ${statusConfig.color} border-0`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    {isHighPriority && (
                                                        <Badge className="text-[10px] bg-red-100 text-red-700 border-0 animate-pulse">
                                                            ⚡ Resubmitted
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {app.ownerName || "Unknown"}
                                                    </span>
                                                    {app.ownerMobile && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {app.ownerMobile}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        {app.category} • {app.totalRooms || 0} rooms
                                                    </span>
                                                    {daysAgo !== null && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-400">
                                                    {app.applicationNumber}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">
                                                    Start Review
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    }
                </div>
            </Card>
        </div>
    );
}
