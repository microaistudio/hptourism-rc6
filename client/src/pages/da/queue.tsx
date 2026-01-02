/**
 * ============================================================================
 * ✅  NEW LAYOUT - UNIFIED DA APPLICATIONS QUEUE
 * ============================================================================
 * 
 * Route: /da/queue
 * Status: ACTIVE (New unified queue design with inline views)
 * 
 * This is the NEW unified DA dashboard with:
 *   - Left sidebar navigation
 *   - Service selector (for multi-service support)
 *   - Inline views for: Applications, Inspections, Search, Grievances, Analytics
 *   - All content renders within the same layout shell
 * 
 * LEGACY: See /da/dashboard → pages/da/dashboard.tsx (old layout)
 * ============================================================================
 */

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import {
    FileText,
    RefreshCw,
    Home,
    Mountain,
    ChevronDown,
    ClipboardList,
    LogOut,
    Bell,
    LayoutDashboard,
    FileSearch,
    HelpCircle,
    BarChart3,
    MessageSquare,
    Loader2,
    FilePenLine,
    User
} from "lucide-react";

// Import modular view components
import {
    ApplicationsView,
    InspectionsView,
    SearchView,
    GrievancesView,
    PlaceholderView,
    type ApplicationWithOwner,
    type InspectionOrder
} from "@/components/da-queue";

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICES = [
    { id: "homestay", label: "Homestay B&B", icon: Home, emoji: "🏠", color: "text-emerald-600" },
    { id: "adventure", label: "Adventure Sports", icon: Mountain, emoji: "⛰️", color: "text-blue-600", disabled: true },
];

const NAV_ITEMS = [
    { id: "applications", label: "Applications", icon: FileText, emoji: "📄" },
    { id: "drafts", label: "Drafts", icon: FilePenLine, emoji: "📝" },
    { id: "certificates", label: "Certificates", icon: FileText, emoji: "📜" },
    { id: "inspections", label: "Inspections", icon: ClipboardList, emoji: "📋" },
    { id: "grievances", label: "Grievances", icon: MessageSquare, emoji: "💬" },
    { id: "search", label: "Search", icon: FileSearch, emoji: "🔍" },
    { id: "analytics", label: "Analytics", icon: BarChart3, emoji: "📊" },
    { id: "profile", label: "My Profile", icon: User, emoji: "👤" },
    { id: "help", label: "Help & FAQ", icon: HelpCircle, emoji: "❓", disabled: true },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DAQueue() {
    const [activeService, setActiveService] = useState("homestay");
    const [activeNav, setActiveNav] = useState("applications");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    // ========== DATA FETCHING ==========
    const { data: applications, isLoading: appsLoading } = useQuery<ApplicationWithOwner[]>({
        queryKey: ["/api/da/applications"],
    });

    const { data: user } = useQuery<{ user: { id: string; fullName: string; role: string; district?: string } }>({
        queryKey: ["/api/auth/me"],
    });

    const { data: inspections, isLoading: inspectionsLoading } = useQuery<InspectionOrder[]>({
        queryKey: ["/api/da/inspections"],
    });

    // Fetch drafts (incomplete applications)
    const { data: drafts } = useQuery<ApplicationWithOwner[]>({
        queryKey: ["/api/da/applications/incomplete"],
    });

    const allApplications = applications ?? [];
    const allInspections = inspections ?? [];
    const allDrafts = drafts ?? [];
    const pendingInspections = allInspections.filter(i => !i.reportSubmitted).length;

    // Count only active pipeline applications (not drafts, not completed)
    const ACTIVE_STATUSES = [
        'submitted', 'under_scrutiny', 'reverted_to_applicant', 'sent_back_for_corrections',
        'forwarded_to_dtdo', 'dtdo_review', 'inspection_scheduled', 'inspection_completed',
        'legacy_rc_review', 'pending_payment', 'payment_failed', 'reverted_by_dtdo', 'objection_raised'
    ];
    const activeCount = allApplications.filter(app => ACTIVE_STATUSES.includes(app.status || "")).length;

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/da/applications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/da/inspections"] });
        queryClient.invalidateQueries({ queryKey: ["/api/da/applications/incomplete"] });
    };

    const currentService = SERVICES.find(s => s.id === activeService);
    const currentUser = user?.user;

    const goToApplication = (appId: string, _status?: string) => {
        // Always navigate to application detail page
        // For inspection-related statuses, the detail page shows read-only view
        setLocation(`/da/applications/${appId}`);
    };

    const goToInspection = (inspectionId: string) => {
        setLocation(`/da/inspections/${inspectionId}`);
    };

    // Stats for notification badge
    const needsAttentionCount = allApplications.filter(app =>
        (app.status === "sent_back_for_corrections" || app.status === "reverted_to_applicant") &&
        Boolean(app.latestCorrection?.createdAt || (app.correctionSubmissionCount ?? 0) > 0)
    ).length;

    // ========== LOADING STATE ==========
    if (appsLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // ========== RENDER CONTENT BASED ON activeNav ==========
    const renderContent = () => {
        switch (activeNav) {
            case "inspections":
                return (
                    <InspectionsView
                        inspections={allInspections}
                        isLoading={inspectionsLoading}
                        onInspectionClick={goToInspection}
                    />
                );
            case "drafts":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Draft Applications</h3>
                                <p className="text-sm text-gray-500">Applications being filled by property owners in your district</p>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                {allDrafts.length} drafts
                            </Badge>
                        </div>
                        {allDrafts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FilePenLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No draft applications in your district</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {allDrafts.map(app => (
                                    <div
                                        key={app.id}
                                        className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{app.propertyName || "Untitled Property"}</p>
                                            <p className="text-sm text-gray-500">
                                                {app.ownerName || "Unknown Owner"} • {app.ownerMobile || "No mobile"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-xs bg-gray-50">
                                                Draft
                                            </Badge>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Updated {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "grievances":
                return <GrievancesView role="da" />;
            case "search":
                return <SearchView onApplicationClick={goToApplication} />;
            case "analytics":
                return <PlaceholderView title="Analytics" description="Analytics dashboard coming soon" icon={BarChart3} />;
            case "certificates":
                // Show approved applications with certificates
                const approvedApps = allApplications.filter(app => app.status === "approved");
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">📜 Issued Certificates</h3>
                                <p className="text-sm text-gray-500">Approved homestays in your district</p>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                {approvedApps.length} certificates
                            </Badge>
                        </div>
                        {approvedApps.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <span className="text-4xl mb-3 block">📜</span>
                                <p>No approved certificates in your district yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {approvedApps.map(app => (
                                    <div
                                        key={app.id}
                                        onClick={() => goToApplication(app.id)}
                                        className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                                    <span className="text-lg">✅</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{app.propertyName || "Unnamed Property"}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        {app.ownerName} • {app.ownerMobile}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                                        <span>🛏️ {app.totalRooms || 0} rooms</span>
                                                        <span>📍 {app.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                {app.applicationNumber}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "profile":
                // Navigate to profile page
                setLocation("/da/profile");
                return null;
            case "applications":
            default:
                return (
                    <ApplicationsView
                        applications={allApplications}
                        onApplicationClick={goToApplication}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col shrink-0 h-screen sticky top-0">
                {/* Logo */}
                <div className="p-4 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">HP</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-gray-900">HP Tourism</h1>
                            <p className="text-xs text-gray-500">DA Portal</p>
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
                        const badge = item.id === "applications" ? activeCount :
                            item.id === "drafts" ? allDrafts.length :
                                item.id === "inspections" ? pendingInspections : undefined;
                        return (
                            <button
                                key={item.id}
                                onClick={() => !item.disabled && setActiveNav(item.id)}
                                disabled={item.disabled}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeNav === item.id
                                    ? "bg-emerald-50 text-emerald-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="flex-1 text-sm">{item.label}</span>
                                {badge !== undefined && badge > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activeNav === item.id
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
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                                {currentUser?.fullName?.charAt(0) || "D"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentUser?.fullName || "DA"}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser?.district || "Dealing Assistant"}</p>
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
                        <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeNav}</h2>
                        {currentUser?.district && (
                            <Badge variant="outline" className="text-xs">{currentUser.district}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            {needsAttentionCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                    {needsAttentionCount}
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
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
