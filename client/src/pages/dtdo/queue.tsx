/**
 * ============================================================================
 * ✅  NEW LAYOUT - UNIFIED DTDO APPLICATIONS QUEUE
 * ============================================================================
 * 
 * Route: /dtdo/queue
 * Status: ACTIVE (New unified queue design)
 * 
 * This is the NEW unified DTDO dashboard with:
 *   - Left sidebar navigation
 *   - Service selector (for multi-service support)
 *   - Tabbed application filtering by status
 *   - Real-time stats cards
 *   - Grievances module (future)
 * 
 * Related routes:
 *   - /dtdo/applications/:id (Application review)
 *   - /dtdo/inspection-review/:id (Inspection review)
 *   - /dtdo/grievances (Grievances - future)
 * 
 * LEGACY: See /dtdo/dashboard → pages/dtdo/dashboard.tsx (old layout)
 * ============================================================================
 */

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import type { ApplicationKind } from "@shared/schema";
import {
    FileText,
    UserPlus,
    RefreshCw,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Minus,
    FileCheck,
    Home,
    Mountain,
    ChevronDown,
    ClipboardList,
    Phone,
    Calendar,
    Eye,
    Users,
    Building2,
    LogOut,
    Bell,
    ChevronRight,
    LayoutDashboard,
    FileSearch,
    HelpCircle,
    BarChart3,
    MessageSquare,
    XCircle,
    Loader2,
    UserCheck,
    ClipboardCheck,
    Award,
    Stamp,
    RotateCcw,
    FilePenLine
} from "lucide-react";

// Types - Using intersection to add optional properties
interface ApplicationWithOwner {
    id: string;
    applicationNumber?: string | null;
    propertyName?: string | null;
    category?: string | null;
    status?: string | null;
    applicationKind?: ApplicationKind | null;
    totalRooms?: number | null;
    submittedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    createdAt?: Date | string | null;
    district?: string | null;
    ownerName?: string;
    ownerMobile?: string;
    daName?: string;
    latestCorrection?: {
        createdAt: string;
        feedback?: string | null;
    } | null;
}

// Application type configuration
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

// DTDO-specific status configuration - consistent labels with DA
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    forwarded_to_dtdo: { label: "Pending Review", color: "bg-blue-100 text-blue-700" },
    dtdo_review: { label: "Under Review", color: "bg-orange-100 text-orange-700" },
    inspection_scheduled: { label: "Inspection Scheduled", color: "bg-purple-100 text-purple-700" },
    inspection_under_review: { label: "Report Pending", color: "bg-indigo-100 text-indigo-700" },
    inspection_completed: { label: "Report Reviewed", color: "bg-teal-100 text-teal-700" },
    reverted_by_dtdo: { label: "Awaiting Correction", color: "bg-amber-100 text-amber-700" },
    objection_raised: { label: "Objection", color: "bg-red-100 text-red-700" },
    legacy_rc_review: { label: "Legacy RC", color: "bg-violet-100 text-violet-700" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
    revoked: { label: "Revoked", color: "bg-gray-100 text-gray-700" },
    superseded: { label: "Superseded", color: "bg-gray-100 text-gray-700" },
};

// Services/Pipelines (for future multi-service support)
const SERVICES = [
    { id: "homestay", label: "Homestay B&B", icon: Home, emoji: "🏠", color: "text-emerald-600" },
    { id: "adventure", label: "Adventure Sports", icon: Mountain, emoji: "⛰️", color: "text-blue-600", disabled: true },
];

// Navigation items
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, emoji: "🏠", route: "/dtdo/dashboard" },
    { id: "applications", label: "Applications", icon: FileText, emoji: "📄" },
    { id: "drafts", label: "Drafts", icon: FilePenLine, emoji: "📝" },
    { id: "certificates", label: "Certificates", icon: FileText, emoji: "📜" },
    { id: "inspections", label: "Inspections", icon: ClipboardList, emoji: "📋", disabled: true },
    { id: "approvals", label: "Final Approvals", icon: Award, emoji: "🏆", disabled: true },
    { id: "grievances", label: "Grievances", icon: MessageSquare, emoji: "💬", route: "/dtdo/grievances" },
    { id: "search", label: "Search", icon: FileSearch, emoji: "🔍", route: "/dtdo/search" },
    { id: "analytics", label: "Analytics", icon: BarChart3, emoji: "📊", route: "/analytics" },
    { id: "profile", label: "My Profile", icon: UserCheck, emoji: "👤", route: "/dtdo/profile" },
    { id: "help", label: "Help & FAQ", icon: HelpCircle, emoji: "❓", disabled: true },
];

// Tab filter groups for DTDO - simplified to match actual workflow stages
// DTDO only sees applications AFTER they are forwarded from DA
const TAB_GROUPS = [
    {
        key: "active",
        label: "Active",
        statuses: [
            'forwarded_to_dtdo', 'dtdo_review', 'inspection_scheduled',
            'inspection_under_review', 'inspection_completed', 'legacy_rc_review'
        ]
    },
    {
        key: "new_submissions",
        label: "New Submissions",
        statuses: ["forwarded_to_dtdo", "dtdo_review"],
        excludeResubmissions: true
    },
    {
        key: "inspections",
        label: "Inspections",
        statuses: ["inspection_scheduled", "inspection_under_review", "inspection_completed"]
    },
    {
        key: "corrections",
        label: "Corrections",
        statuses: ["reverted_by_dtdo", "objection_raised", "forwarded_to_dtdo", "dtdo_review"],
        onlyResubmissions: true
    },
    {
        key: "completed",
        label: "Completed",
        statuses: ["approved", "rejected", "revoked", "superseded"]
    },
];

// Sub-tabs configuration for each main stage (aligned with DA dashboard)
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
    inspections: [
        { key: 'all', label: 'All Inspections' },
        { key: 'scheduled', label: 'Scheduled' },
        { key: 'report_submitted', label: 'Report Submitted' },
    ],
    corrections: [
        { key: 'all', label: 'All Corrections' },
        { key: 'resubmitted', label: 'Resubmitted', highlight: true },
        { key: 'returned', label: 'Returned for Corrections' },
    ],
    completed: [
        { key: 'all', label: 'All Completed' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ],
    active: [] // 'Active' is an overview
};

export default function DTDOQueue() {
    const [activeService, setActiveService] = useState("homestay");
    const [activeNav, setActiveNav] = useState("applications");
    const [activeTab, setActiveTab] = useState("new_submissions"); // Start on New Submissions instead of Active
    const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [location, setLocation] = useLocation();
    const queryClient = useQueryClient();

    // Fetch applications
    const { data: applications, isLoading } = useQuery<ApplicationWithOwner[]>({
        queryKey: ["/api/dtdo/applications"],
    });

    // Fetch drafts (incomplete applications)
    const { data: drafts } = useQuery<ApplicationWithOwner[]>({
        queryKey: ["/api/dtdo/applications/incomplete"],
    });

    // Fetch user info
    const { data: user } = useQuery<{ user: { id: string; fullName: string; role: string; district?: string } }>({
        queryKey: ["/api/auth/me"],
    });

    const allApplications = applications ?? [];
    const allDrafts = drafts ?? [];

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/dtdo/applications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dtdo/applications/incomplete"] });
    };

    // Helper to get application kind
    const getAppKind = useCallback((app: ApplicationWithOwner): ApplicationTypeKey => {
        const kind = (app.applicationKind as string)?.toLowerCase() || "";
        if (kind === "add_rooms") return "add_rooms";
        if (kind === "delete_rooms") return "delete_rooms";
        if (kind === "cancel_certificate") return "cancel_certificate";
        if (kind === "change_category") return "change_category";
        if (kind === "legacy_onboarding") return "legacy_onboarding";
        return "new_registration";
    }, []);

    // Helper to check if app is a resubmission (has latestCorrection)
    const isResubmission = useCallback((app: ApplicationWithOwner) => {
        return Boolean(app.latestCorrection?.createdAt);
    }, []);

    // Filter applications based on active tab and search
    const filteredApps = useMemo(() => {
        let apps = allApplications;

        // Filter by tab
        const currentTab = TAB_GROUPS.find(t => t.key === activeTab);
        if (currentTab?.statuses) {
            apps = apps.filter(app => {
                const matchesStatus = currentTab.statuses!.includes(app.status || "");

                // Special handling for "New Submissions" - exclude resubmissions
                if (currentTab.key === "new_submissions") {
                    return matchesStatus && !isResubmission(app);
                }

                // Special handling for "Corrections" - include awaiting + resubmitted
                if (currentTab.key === "corrections") {
                    const isAwaitingCorrection = app.status === "reverted_by_dtdo" || app.status === "objection_raised";
                    const isResubmitted = isResubmission(app) &&
                        (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review");
                    return isAwaitingCorrection || isResubmitted;
                }

                return matchesStatus;
            });
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
            } else if (activeTab === 'inspections') {
                // Inspections: Filter by status
                if (activeSubFilter === 'scheduled') {
                    apps = apps.filter(app => app.status === 'inspection_scheduled');
                } else if (activeSubFilter === 'report_submitted') {
                    apps = apps.filter(app => ['inspection_under_review', 'inspection_completed'].includes(app.status || ''));
                }
            } else if (activeTab === 'corrections') {
                // Corrections: Filter by status
                if (activeSubFilter === 'resubmitted') {
                    apps = apps.filter(app => isResubmission(app) &&
                        (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review"));
                } else if (activeSubFilter === 'returned') {
                    apps = apps.filter(app => app.status === "reverted_by_dtdo" || app.status === "objection_raised");
                }
            } else if (activeTab === 'completed') {
                if (activeSubFilter === 'approved') {
                    apps = apps.filter(app => app.status === 'approved');
                } else if (activeSubFilter === 'rejected') {
                    apps = apps.filter(app => app.status === 'rejected');
                }
            }
        }

        // Filter by search
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
    }, [allApplications, activeTab, activeSubFilter, searchQuery, isResubmission]);

    // Count by tab - use same logic as filtering
    const tabCounts = useMemo(() => {
        return TAB_GROUPS.map(tab => {
            let count = 0;
            if (tab.statuses) {
                count = allApplications.filter(app => {
                    const matchesStatus = tab.statuses!.includes(app.status || "");

                    // Special handling for "From DA" - exclude resubmissions
                    if (tab.key === "from_da") {
                        return matchesStatus && !isResubmission(app);
                    }

                    // Special handling for "Resubmissions" - include awaiting + resubmitted
                    if (tab.key === "resubmissions") {
                        const isAwaitingCorrection = app.status === "reverted_by_dtdo" || app.status === "objection_raised";
                        const isResubmitted = isResubmission(app) &&
                            (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review");
                        return isAwaitingCorrection || isResubmitted;
                    }

                    return matchesStatus;
                }).length;
            } else {
                count = allApplications.length;
            }
            return { ...tab, count };
        });
    }, [allApplications, isResubmission]);

    // Stats - aligned with actual workflow stages
    const stats = useMemo(() => {
        // New Submissions: waiting for DTDO to review/accept (excluding resubmissions)
        const newSubmissions = allApplications.filter(app =>
            (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review") &&
            !isResubmission(app)
        ).length;

        // Inspections: scheduled or report submitted
        const inspections = allApplications.filter(app =>
            app.status === "inspection_scheduled" ||
            app.status === "inspection_under_review" ||
            app.status === "inspection_completed"
        ).length;

        // Reports pending DTDO review
        const reportsToReview = allApplications.filter(app =>
            app.status === "inspection_under_review" || app.status === "inspection_completed"
        ).length;

        // Corrections: sent back OR resubmitted after correction
        const corrections = allApplications.filter(app => {
            const isAwaitingCorrection = app.status === "reverted_by_dtdo" || app.status === "objection_raised";
            const isResubmitted = isResubmission(app) &&
                (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review");
            return isAwaitingCorrection || isResubmitted;
        }).length;

        // Completed (approved/rejected in this period)
        const completed = allApplications.filter(app =>
            app.status === "approved" || app.status === "rejected" ||
            app.status === "revoked" || app.status === "superseded"
        ).length;

        return { newSubmissions, inspections, reportsToReview, corrections, completed };
    }, [allApplications, isResubmission]);

    const currentService = SERVICES.find(s => s.id === activeService);
    const currentUser = user?.user;

    // Navigate to application detail
    const goToApplication = (appId: string, status?: string) => {
        if (status === "inspection_under_review") {
            setLocation(`/dtdo/inspection-review/${appId}`);
        } else {
            setLocation(`/dtdo/applications/${appId}`);
        }
    };

    // Handle nav click
    const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
        if (item.disabled) return;
        if (item.route) {
            setLocation(item.route);
        } else {
            setActiveNav(item.id);
        }
    };

    // Get action button based on status
    const getActionButton = (status: string) => {
        switch (status) {
            case "forwarded_to_dtdo":
            case "dtdo_review":
                return { label: "Review", icon: Eye, color: "bg-blue-600 hover:bg-blue-700" };
            case "inspection_scheduled":
                return { label: "View", icon: Calendar, color: "bg-purple-600 hover:bg-purple-700" };
            case "inspection_under_review":
                return { label: "Review Report", icon: ClipboardCheck, color: "bg-indigo-600 hover:bg-indigo-700" };
            case "payment_pending":
                return { label: "Monitor", icon: Clock, color: "bg-amber-600 hover:bg-amber-700" };
            case "verified_for_payment":
                return { label: "Approve", icon: Stamp, color: "bg-emerald-600 hover:bg-emerald-700" };
            default:
                return { label: "View", icon: Eye, color: "bg-gray-600 hover:bg-gray-700" };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col shrink-0 h-screen sticky top-0">
                {/* Logo */}
                <div className="p-4 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">HP</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-gray-900">HP Tourism</h1>
                            <p className="text-xs text-gray-500">DTDO Portal</p>
                        </div>
                    </div>
                </div>

                {/* Service Selector */}
                <div className="p-3 border-b shrink-0">
                    <div className="relative">
                        <button
                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {currentService && <currentService.icon className={`w-5 h-5 ${currentService.color}`} />}
                                <span className="text-sm font-medium">{currentService?.label}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showServiceDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                                {SERVICES.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            if (!service.disabled) {
                                                setActiveService(service.id);
                                            }
                                            setShowServiceDropdown(false);
                                        }}
                                        disabled={service.disabled}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${activeService === service.id ? "bg-gray-50" : ""
                                            } ${service.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <service.icon className={`w-5 h-5 ${service.color}`} />
                                        <span className="text-sm flex-1">{service.label}</span>
                                        {service.disabled && (
                                            <Badge variant="outline" className="text-[10px]">Soon</Badge>
                                        )}
                                        {activeService === service.id && (
                                            <span className="text-emerald-600">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation - scrollable */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => {
                        // Badge logic
                        let badge: number | undefined;
                        if (item.id === "dashboard") badge = allApplications.filter(a => ['forwarded_to_dtdo', 'dtdo_review'].includes(a.status || '')).length;
                        if (item.id === "drafts") badge = allDrafts.length;
                        if (item.id === "inspections") badge = allApplications.filter(a => a.status === 'inspection_completed').length;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                disabled={item.disabled}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${(item.route && location === item.route) || (!item.route && activeNav === item.id)
                                    ? "bg-emerald-50 text-emerald-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="flex-1 text-sm">{item.label}</span>
                                {badge !== undefined && badge > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(item.route && location === item.route) || (!item.route && activeNav === item.id)
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-200 text-gray-600"
                                        }`}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User - fixed at bottom */}
                <div className="p-3 border-t shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                                {currentUser?.fullName?.charAt(0) || "D"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentUser?.fullName || "DTDO"}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser?.district || "District Officer"}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setLocation("/")}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <div className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">Applications Queue</h2>
                        {currentUser?.district && (
                            <Badge variant="outline" className="text-xs">{currentUser.district}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            {stats.reportsToReview > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                    {stats.reportsToReview}
                                </span>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    {activeNav === "drafts" ? (
                        /* Drafts View */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Draft Applications</h3>
                                    <p className="text-sm text-gray-500">
                                        Incomplete applications in your district • {allDrafts.length} drafts
                                    </p>
                                </div>
                            </div>
                            {allDrafts.length === 0 ? (
                                <Card className="p-8 text-center text-gray-500">
                                    <FilePenLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No draft applications in your district</p>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-0 divide-y">
                                        {allDrafts.map(app => (
                                            <div
                                                key={app.id}
                                                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => goToApplication(app.id, app.status ?? "")}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                                    <FilePenLine className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {app.propertyName || "Untitled Property"}
                                                        </span>
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                            Draft
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {app.ownerName || "Unknown Owner"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {app.ownerMobile || "N/A"}
                                                        </span>
                                                        {app.updatedAt && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Last updated: {new Date(app.updatedAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {app.applicationNumber || "No App #"}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Quick Stats - 4 pipeline stages */}
                            <div className="grid grid-cols-4 gap-4">
                                {/* From DA - awaiting DTDO review */}
                                <Card
                                    className={`relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${activeTab === 'new_submissions' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                    onClick={() => { setActiveTab("new_submissions"); setActiveSubFilter(null); }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">New Submissions</p>
                                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.newSubmissions}</p>
                                                <p className="text-xs text-gray-500 mt-1">Pending review</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <UserCheck className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Inspections - scheduled or reports pending */}
                                <Card
                                    className={`relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${activeTab === 'inspections' ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                                    onClick={() => { setActiveTab("inspections"); setActiveSubFilter(null); }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Inspections</p>
                                                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.inspections}</p>
                                                <p className="text-xs text-gray-500 mt-1">{stats.reportsToReview > 0 ? `${stats.reportsToReview} reports pending` : 'Scheduled'}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <ClipboardCheck className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Resubmissions - corrections awaiting or submitted */}
                                <Card
                                    className={`relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${activeTab === 'corrections' ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                                    onClick={() => { setActiveTab("corrections"); setActiveSubFilter(null); }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Corrections</p>
                                                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.corrections}</p>
                                                <p className="text-xs text-gray-500 mt-1">Resubmitted + Returned</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <RotateCcw className="w-6 h-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Completed - approved/rejected */}
                                <Card
                                    className={`relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${activeTab === 'completed' ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                                    onClick={() => { setActiveTab("completed"); setActiveSubFilter(null); }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Completed</p>
                                                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
                                                <p className="text-xs text-gray-500 mt-1">Approved/Rejected</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <Award className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Queue Card */}
                            <Card className="overflow-hidden">
                                {/* Tabs & Search - Replaced with Header + Sub-Pills */}
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
                                                    const baseApps = allApplications.filter(app => {
                                                        const currentTabDef = TAB_GROUPS.find(t => t.key === activeTab);
                                                        if (!currentTabDef?.statuses) return false;
                                                        const matchesStatus = currentTabDef.statuses.includes(app.status || "");
                                                        if (activeTab === "new_submissions") return matchesStatus && !isResubmission(app);
                                                        if (activeTab === "corrections") {
                                                            const isAwaitingCorrection = app.status === "reverted_by_dtdo" || app.status === "objection_raised";
                                                            const isResub = isResubmission(app) && (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review");
                                                            return isAwaitingCorrection || isResub;
                                                        }
                                                        return matchesStatus;
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
                                                            } else if (activeTab === 'inspections') {
                                                                if (subTab.key === 'scheduled') return app.status === 'inspection_scheduled';
                                                                if (subTab.key === 'report_submitted') return app.status === 'inspection_under_review';
                                                                if (subTab.key === 'report_reviewed') return app.status === 'inspection_completed';
                                                            } else if (activeTab === 'resubmissions') {
                                                                if (subTab.key === 'resubmitted') return isResubmission(app) && (app.status === "forwarded_to_dtdo" || app.status === "dtdo_review");
                                                                if (subTab.key === 'waiting') return app.status === "reverted_by_dtdo" || app.status === "objection_raised";
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
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                    : isHighlight && count > 0
                                                                        ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200 animate-pulse'
                                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {isHighlight && count > 0 && !isActivePill && <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}
                                                            {subTab.label}
                                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActivePill ? 'bg-blue-500/30 text-white' : isHighlight && count > 0 ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                                                {count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Applications List */}
                                <div className="divide-y">
                                    {filteredApps.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No applications found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters</p>
                                        </div>
                                    ) : (
                                        filteredApps.map(app => {
                                            const appKind = getAppKind(app);
                                            const typeConfig = APPLICATION_TYPES[appKind];
                                            const statusConfig = STATUS_CONFIG[app.status || ""] || { label: app.status, color: "bg-gray-100 text-gray-700" };
                                            const TypeIcon = typeConfig.icon;
                                            const actionBtn = getActionButton(app.status || "");
                                            const ActionIcon = actionBtn.icon;
                                            const daysAgo = app.submittedAt
                                                ? Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
                                                : null;

                                            return (
                                                <div
                                                    key={app.id}
                                                    onClick={() => goToApplication(app.id, app.status || undefined)}
                                                    className={`p-4 hover:bg-gray-50/50 transition-colors border-l-4 ${typeConfig.borderColor} group cursor-pointer`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Type Indicator */}
                                                        <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center shrink-0`}>
                                                            <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                                                        </div>

                                                        {/* Main Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-semibold text-gray-900">{app.propertyName}</h3>
                                                                <div className={`w-2 h-2 rounded-full ${typeConfig.dotColor}`} />
                                                                <span className={`text-xs font-medium ${typeConfig.textColor}`}>{typeConfig.label}</span>
                                                                <Badge className={`text-[10px] ${statusConfig.color} border-0`}>
                                                                    {statusConfig.label}
                                                                </Badge>
                                                                {app.daName && (
                                                                    <span className="text-xs text-gray-400">
                                                                        via {app.daName}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Details Row */}
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

                                                            {/* Application Number */}
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                {app.applicationNumber}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button size="sm" className={`h-8 ${actionBtn.color}`}>
                                                                <ActionIcon className="w-4 h-4 mr-1" />
                                                                {actionBtn.label}
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
