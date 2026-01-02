/**
 * ============================================================================
 * 🎨 SANDBOX / UI PREVIEW ONLY - DTDO Queue Preview
 * ============================================================================
 * 
 * Route: /sandbox/dtdo-queue
 * Status: SANDBOX (Mock data for UI testing only)
 * 
 * This file is for DESIGN EXPLORATION and UI mockups.
 * It uses MOCK DATA and is NOT connected to real APIs.
 * 
 * REAL IMPLEMENTATION: See /dtdo/queue → pages/dtdo/queue.tsx
 * The real file uses actual API data and is the production version.
 * 
 * Use this sandbox to:
 *   - Experiment with new UI designs
 *   - Test interaction patterns
 *   - Get stakeholder feedback before implementing
 * 
 * DO NOT use this in production. Always refer to /dtdo/queue for real data.
 * ============================================================================
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText,
    UserPlus,
    RefreshCw,
    Search,
    ArrowRight,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Plus,
    Minus,
    CalendarClock,
    FileCheck,
    Home,
    Mountain,
    ChevronDown,
    ClipboardList,
    MapPin,
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
    UserCheck,
    RotateCcw,
    Stamp,
    ClipboardCheck,
    CalendarPlus,
    Award,
    MessageSquare,
    Send,
    Paperclip,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    TrendingUp
} from "lucide-react";

// Application types
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
        label: "Legacy Onboarding",
        shortLabel: "Legacy",
        icon: FileCheck,
        borderColor: "border-l-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        dotColor: "bg-purple-500"
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
    cancel_rc: {
        label: "Cancel RC",
        shortLabel: "Cancel",
        icon: XCircle,
        borderColor: "border-l-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        dotColor: "bg-red-500"
    },
    renewal: {
        label: "Renewal",
        shortLabel: "Renewal",
        icon: CalendarClock,
        borderColor: "border-l-teal-500",
        bgColor: "bg-teal-50",
        textColor: "text-teal-700",
        dotColor: "bg-teal-500"
    },
};

type ApplicationType = keyof typeof APPLICATION_TYPES;

// DTDO-specific statuses
const STATUS_CONFIG = {
    da_verified: { label: "DA Verified", color: "bg-blue-100 text-blue-700", icon: UserCheck },
    pending_inspection: { label: "Pending Inspection", color: "bg-amber-100 text-amber-700", icon: ClipboardList },
    inspection_scheduled: { label: "Inspection Scheduled", color: "bg-purple-100 text-purple-700", icon: Calendar },
    report_submitted: { label: "Report Submitted", color: "bg-indigo-100 text-indigo-700", icon: ClipboardCheck },
    pending_approval: { label: "Pending Approval", color: "bg-orange-100 text-orange-700", icon: Stamp },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    returned: { label: "Returned to DA", color: "bg-red-100 text-red-700", icon: RotateCcw },
};

// Mock applications for DTDO
const MOCK_APPLICATIONS = [
    { id: 1, propertyName: "Himalayan View Homestay", owner: "Rajesh Kumar", mobile: "9876543210", type: "new_registration" as ApplicationType, status: "da_verified", submittedAt: "2025-12-24", daysAgo: 1, district: "Shimla", category: "Gold", rooms: 4, daName: "DA Shimla", daVerifiedAt: "2025-12-24" },
    { id: 2, propertyName: "Green Valley Home", owner: "Priya Sharma", mobile: "9876543211", type: "add_rooms" as ApplicationType, status: "pending_inspection", submittedAt: "2025-12-23", daysAgo: 2, district: "Shimla", category: "Silver", rooms: 4, daName: "DA Shimla", currentRooms: 4, requestedRooms: 2 },
    { id: 3, propertyName: "Mountain Bliss", owner: "Vikram Singh", mobile: "9876543212", type: "new_registration" as ApplicationType, status: "inspection_scheduled", submittedAt: "2025-12-22", daysAgo: 3, district: "Shimla", category: "Silver", rooms: 3, daName: "DA Shimla", inspectionDate: "2025-12-27", inspectorName: "DA Shimla" },
    { id: 4, propertyName: "Snow Peak Lodge", owner: "Anita Devi", mobile: "9876543213", type: "new_registration" as ApplicationType, status: "report_submitted", submittedAt: "2025-12-20", daysAgo: 5, district: "Shimla", category: "Gold", rooms: 6, daName: "DA Shimla", reportSubmittedAt: "2025-12-24" },
    { id: 5, propertyName: "Valley Dream", owner: "Meera Kapoor", mobile: "9876543214", type: "legacy_onboarding" as ApplicationType, status: "pending_approval", submittedAt: "2025-12-19", daysAgo: 6, district: "Shimla", category: "Silver", rooms: 5, daName: "DA Shimla" },
    { id: 6, propertyName: "Sunrise Cottage", owner: "Deepak Verma", mobile: "9876543215", type: "renewal" as ApplicationType, status: "da_verified", submittedAt: "2025-12-21", daysAgo: 4, district: "Shimla", category: "Bronze", rooms: 2, daName: "DA Shimla" },
];

// Mock grievances/tickets for DTDO (escalated ones)
const MOCK_TICKETS = [
    {
        id: "GRV-2025-000125",
        subject: "Application stuck for 15 days - no response",
        applicant: "Ramesh Gupta",
        mobile: "9876543220",
        category: "escalation",
        priority: "urgent",
        status: "open",
        createdAt: "2025-12-23",
        daysOpen: 2,
        lastMessage: "My application has been pending for 15 days. DA is not responding.",
        unreadCount: 1,
        escalatedFrom: "DA Shimla"
    },
    {
        id: "GRV-2025-000122",
        subject: "Inspection report seems incorrect",
        applicant: "Sunita Devi",
        mobile: "9876543221",
        category: "inspection",
        priority: "high",
        status: "in_progress",
        createdAt: "2025-12-22",
        daysOpen: 3,
        lastMessage: "The inspection report mentions rooms that don't exist in my property.",
        unreadCount: 0,
        escalatedFrom: null
    },
    {
        id: "GRV-2025-000119",
        subject: "Fee calculation dispute",
        applicant: "Mohan Kumar",
        mobile: "9876543222",
        category: "payment",
        priority: "medium",
        status: "resolved",
        createdAt: "2025-12-20",
        daysOpen: 5,
        lastMessage: "Thank you for the clarification. I understand now.",
        unreadCount: 0,
        escalatedFrom: "DA Shimla"
    },
];

// Mock conversation
const MOCK_CONVERSATION = [
    { id: 1, sender: "applicant", senderName: "Ramesh Gupta", message: "My application (APP-2025-000456) has been pending for 15 days now. I've tried contacting DA Shimla multiple times but no response. Please help escalate this.", timestamp: "Dec 23, 2025 9:00 AM", attachments: [] },
    { id: 2, sender: "system", senderName: "System", message: "Ticket escalated to DTDO Shimla", timestamp: "Dec 23, 2025 9:01 AM", attachments: [], isInternal: true },
    { id: 3, sender: "officer", senderName: "DTDO Shimla", message: "I've reviewed your application. The delay was due to pending document verification. I've instructed DA Shimla to expedite the process. You should hear back within 2 days.", timestamp: "Dec 24, 2025 11:30 AM", attachments: [], isInternal: false },
];

// Mock DAs for assignment
const DEALING_ASSISTANTS = [
    { id: "da1", name: "DA Shimla", district: "Shimla" },
    { id: "da2", name: "DA Solan", district: "Solan" },
    { id: "da3", name: "DA Kangra", district: "Kangra" },
];

// Services
const SERVICES = [
    { id: "homestay", label: "Homestay B&B", icon: Home, color: "text-emerald-600", count: 6 },
    { id: "adventure", label: "Adventure Sports", icon: Mountain, color: "text-blue-600", count: 2 },
];

// DTDO Navigation
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: FileText, badge: 6 },
    { id: "inspections", label: "Inspections", icon: ClipboardList, badge: 2 },
    { id: "reports", label: "Reports to Review", icon: ClipboardCheck, badge: 2 },
    { id: "approvals", label: "Final Approvals", icon: Award, badge: 1 },
    { id: "grievances", label: "Grievances", icon: MessageSquare, badge: 3 },
    { id: "search", label: "Search", icon: FileSearch },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
];

// Ticket status config
const TICKET_STATUS_CONFIG = {
    open: { label: "Open", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
    in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", dotColor: "bg-amber-500" },
    resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-500" },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-400" },
};

const PRIORITY_CONFIG = {
    low: { label: "Low", color: "text-gray-500" },
    medium: { label: "Medium", color: "text-amber-600" },
    high: { label: "High", color: "text-red-600" },
    urgent: { label: "Urgent", color: "text-red-700 font-bold" },
};

// Tab groups for DTDO
const TAB_GROUPS = [
    { key: "all", label: "All" },
    { key: "new_from_da", label: "New from DA", statuses: ["da_verified"] },
    { key: "pending_inspection", label: "Pending Inspection", statuses: ["pending_inspection", "inspection_scheduled"] },
    { key: "reports", label: "Reports", statuses: ["report_submitted"] },
    { key: "final_approval", label: "Final Approval", statuses: ["pending_approval"] },
];

export default function DTDOQueuePreview() {
    const [activeService, setActiveService] = useState("homestay");
    const [activeNav, setActiveNav] = useState("applications");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<typeof MOCK_APPLICATIONS[0] | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
    const [ticketFilter, setTicketFilter] = useState("all");
    const [replyMessage, setReplyMessage] = useState("");

    // Count by status
    const statusCounts = MOCK_APPLICATIONS.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Count by tab
    const tabCounts = TAB_GROUPS.map(tab => ({
        ...tab,
        count: tab.statuses
            ? MOCK_APPLICATIONS.filter(app => tab.statuses!.includes(app.status)).length
            : MOCK_APPLICATIONS.length
    }));

    const currentTab = TAB_GROUPS.find(t => t.key === activeTab);

    // Filter applications
    const filteredApps = MOCK_APPLICATIONS.filter(app => {
        if (currentTab?.statuses && !currentTab.statuses.includes(app.status)) return false;
        if (searchQuery && !app.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !app.owner.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Filter tickets
    const filteredTickets = MOCK_TICKETS.filter(ticket => {
        if (ticketFilter !== "all" && ticket.status !== ticketFilter) return false;
        return true;
    });

    const currentService = SERVICES.find(s => s.id === activeService);

    const getActionButton = (app: typeof MOCK_APPLICATIONS[0]) => {
        switch (app.status) {
            case "da_verified":
                return (
                    <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700" onClick={() => {
                        setSelectedApp(app);
                        setShowScheduleModal(true);
                    }}>
                        <CalendarPlus className="w-4 h-4 mr-1" />
                        Schedule Inspection
                    </Button>
                );
            case "pending_inspection":
                return (
                    <Button size="sm" variant="outline" className="h-8">
                        <Clock className="w-4 h-4 mr-1" />
                        Awaiting Schedule
                    </Button>
                );
            case "inspection_scheduled":
                return (
                    <Button size="sm" variant="outline" className="h-8 text-purple-700 border-purple-300">
                        <Calendar className="w-4 h-4 mr-1" />
                        {app.inspectionDate}
                    </Button>
                );
            case "report_submitted":
                return (
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700">
                        <Eye className="w-4 h-4 mr-1" />
                        Review Report
                    </Button>
                );
            case "pending_approval":
                return (
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                        setSelectedApp(app);
                        setShowApproveModal(true);
                    }}>
                        <Stamp className="w-4 h-4 mr-1" />
                        Approve
                    </Button>
                );
            default:
                return (
                    <Button size="sm" variant="outline" className="h-8">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                    </Button>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b">
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
                <div className="p-3 border-b">
                    <div className="relative">
                        <button
                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {currentService && <currentService.icon className={`w-4 h-4 ${currentService.color}`} />}
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
                                            setActiveService(service.id);
                                            setShowServiceDropdown(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${activeService === service.id ? "bg-gray-50" : ""
                                            }`}
                                    >
                                        <service.icon className={`w-4 h-4 ${service.color}`} />
                                        <span className="text-sm flex-1">{service.label}</span>
                                        <Badge variant="secondary" className="text-xs">{service.count}</Badge>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveNav(item.id);
                                setSelectedTicket(null);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeNav === item.id
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {item.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activeNav === item.id
                                    ? "bg-blue-600 text-white"
                                    : item.id === "grievances" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User */}
                <div className="p-3 border-t">
                    <div className="flex items-center gap-3 px-2">
                        <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">DT</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">DTDO Shimla</p>
                            <p className="text-xs text-gray-500 truncate">District Officer</p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="h-14 bg-white border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {activeNav === "applications" ? "Applications Queue" :
                                activeNav === "inspections" ? "Inspection Management" :
                                    activeNav === "reports" ? "Reports to Review" :
                                        activeNav === "approvals" ? "Final Approvals" :
                                            activeNav === "grievances" ? "Grievances & Escalations" :
                                                NAV_ITEMS.find(n => n.id === activeNav)?.label}
                        </h2>
                        <Badge variant="outline" className="text-xs">Shimla Division</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">5</span>
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    {/* GRIEVANCES VIEW */}
                    {activeNav === "grievances" && !selectedTicket && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Open Tickets</p>
                                                <p className="text-2xl font-bold text-red-600">{MOCK_TICKETS.filter(t => t.status === "open").length}</p>
                                            </div>
                                            <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Escalated</p>
                                                <p className="text-2xl font-bold text-amber-600">{MOCK_TICKETS.filter(t => t.escalatedFrom).length}</p>
                                            </div>
                                            <ArrowRight className="w-8 h-8 text-amber-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Resolved</p>
                                                <p className="text-2xl font-bold text-emerald-600">{MOCK_TICKETS.filter(t => t.status === "resolved").length}</p>
                                            </div>
                                            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Resolution</p>
                                                <p className="text-2xl font-bold text-blue-600">1.5d</p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tickets List */}
                            <Card>
                                <div className="border-b p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                                            {["all", "open", "in_progress", "resolved"].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setTicketFilter(status)}
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${ticketFilter === status
                                                        ? "bg-white text-gray-900 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {status === "all" ? "All" : status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input placeholder="Search tickets..." className="pl-10 w-64" />
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y">
                                    {filteredTickets.map(ticket => {
                                        const statusConfig = TICKET_STATUS_CONFIG[ticket.status as keyof typeof TICKET_STATUS_CONFIG];
                                        const priorityConfig = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
                                        return (
                                            <div
                                                key={ticket.id}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${statusConfig.dotColor}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                                                            <Badge className={`text-[10px] ${statusConfig.color} border-0`}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                            <span className={`text-xs font-medium ${priorityConfig.color}`}>
                                                                {priorityConfig.label} Priority
                                                            </span>
                                                            {ticket.escalatedFrom && (
                                                                <Badge className="text-[10px] bg-orange-100 text-orange-700 border-0">
                                                                    Escalated from {ticket.escalatedFrom}
                                                                </Badge>
                                                            )}
                                                            {ticket.unreadCount > 0 && (
                                                                <Badge className="text-[10px] bg-red-500 text-white border-0">
                                                                    {ticket.unreadCount} new
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="font-medium text-gray-900 mt-1">{ticket.subject}</h3>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3.5 h-3.5" />
                                                                {ticket.applicant}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {ticket.mobile}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {ticket.daysOpen}d open
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                                            "{ticket.lastMessage}"
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TICKET CONVERSATION VIEW */}
                    {activeNav === "grievances" && selectedTicket && (
                        <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Tickets
                            </Button>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-gray-500">{selectedTicket.id}</span>
                                                <Badge className={`text-xs ${TICKET_STATUS_CONFIG[selectedTicket.status as keyof typeof TICKET_STATUS_CONFIG].color} border-0`}>
                                                    {TICKET_STATUS_CONFIG[selectedTicket.status as keyof typeof TICKET_STATUS_CONFIG].label}
                                                </Badge>
                                                <span className={`text-xs font-medium ${PRIORITY_CONFIG[selectedTicket.priority as keyof typeof PRIORITY_CONFIG].color}`}>
                                                    {PRIORITY_CONFIG[selectedTicket.priority as keyof typeof PRIORITY_CONFIG].label} Priority
                                                </span>
                                                {selectedTicket.escalatedFrom && (
                                                    <Badge className="text-xs bg-orange-100 text-orange-700 border-0">
                                                        Escalated from {selectedTicket.escalatedFrom}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h2 className="text-lg font-semibold mt-1">{selectedTicket.subject}</h2>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span>{selectedTicket.applicant}</span>
                                                <span>•</span>
                                                <span>{selectedTicket.mobile}</span>
                                                <span>•</span>
                                                <span>Opened {selectedTicket.createdAt}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                Send Back to DA
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Resolve
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex-1">
                                <div className="p-4 border-b">
                                    <h3 className="font-medium">Conversation</h3>
                                </div>
                                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                    {MOCK_CONVERSATION.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === "officer" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}>
                                            {msg.sender === "system" ? (
                                                <p className="text-xs text-gray-400 italic">{msg.message} • {msg.timestamp}</p>
                                            ) : (
                                                <div className={`max-w-[70%]`}>
                                                    <div className={`rounded-lg p-3 ${msg.sender === "officer"
                                                        ? "bg-blue-100 text-blue-900"
                                                        : "bg-gray-100 text-gray-900"
                                                        }`}>
                                                        <p className="text-sm">{msg.message}</p>
                                                    </div>
                                                    <p className={`text-xs text-gray-500 mt-1 ${msg.sender === "officer" ? "text-right" : ""}`}>
                                                        {msg.senderName} • {msg.timestamp}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t bg-gray-50">
                                    <div className="flex gap-2">
                                        <Textarea
                                            placeholder="Type your reply..."
                                            className="flex-1 min-h-[80px] bg-white"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <Button variant="ghost" size="sm">
                                            <Paperclip className="w-4 h-4 mr-1" />
                                            Attach
                                        </Button>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Reply
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* APPLICATIONS VIEW */}
                    {activeNav === "applications" && (
                        <div className="space-y-6">
                            {/* Quick Stats for DTDO */}
                            <div className="grid grid-cols-5 gap-4">
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">From DA</p>
                                                <p className="text-2xl font-bold text-blue-600">{statusCounts["da_verified"] || 0}</p>
                                            </div>
                                            <UserCheck className="w-8 h-8 text-blue-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Need Inspection</p>
                                                <p className="text-2xl font-bold text-amber-600">{statusCounts["pending_inspection"] || 0}</p>
                                            </div>
                                            <ClipboardList className="w-8 h-8 text-amber-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</p>
                                                <p className="text-2xl font-bold text-purple-600">{statusCounts["inspection_scheduled"] || 0}</p>
                                            </div>
                                            <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Reports</p>
                                                <p className="text-2xl font-bold text-indigo-600">{statusCounts["report_submitted"] || 0}</p>
                                            </div>
                                            <ClipboardCheck className="w-8 h-8 text-indigo-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Ready to Approve</p>
                                                <p className="text-2xl font-bold text-emerald-600">{statusCounts["pending_approval"] || 0}</p>
                                            </div>
                                            <Award className="w-8 h-8 text-emerald-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Queue */}
                            <Card className="overflow-hidden">
                                {/* Tabs */}
                                <div className="border-b bg-gray-50/50 p-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex gap-1 p-1 bg-white border rounded-lg shadow-sm">
                                            {tabCounts.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.key
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {tab.label}
                                                    <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-blue-100" : "text-gray-400"}`}>
                                                        {tab.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

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
                                </div>

                                {/* Applications List */}
                                <div className="divide-y">
                                    {filteredApps.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No applications found</p>
                                        </div>
                                    ) : (
                                        filteredApps.map(app => {
                                            const typeConfig = APPLICATION_TYPES[app.type];
                                            const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
                                            const TypeIcon = typeConfig.icon;
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <div
                                                    key={app.id}
                                                    className={`p-4 hover:bg-gray-50/50 transition-colors border-l-4 ${typeConfig.borderColor} group`}
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
                                                                <Badge className={`text-[10px] ${statusConfig.color} border-0 flex items-center gap-1`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {statusConfig.label}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3.5 h-3.5" />
                                                                    {app.owner}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                    {app.mobile}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Building2 className="w-3.5 h-3.5" />
                                                                    {app.category} • {app.rooms} rooms
                                                                </span>
                                                                <span className="flex items-center gap-1 text-blue-600">
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    Verified by {app.daName}
                                                                </span>
                                                            </div>

                                                            {app.status === "inspection_scheduled" && (
                                                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Inspection on {app.inspectionDate} • Assigned to {app.inspectorName}
                                                                </div>
                                                            )}
                                                            {app.status === "report_submitted" && (
                                                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                                                                    <ClipboardCheck className="w-3 h-3" />
                                                                    Report submitted on {app.reportSubmittedAt}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            {getActionButton(app)}
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

                    {/* Other nav views */}
                    {!["applications", "grievances"].includes(activeNav) && (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">{NAV_ITEMS.find(n => n.id === activeNav)?.label}</p>
                                <p className="text-sm mt-1">(View in development)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Inspection Modal */}
            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarPlus className="w-5 h-5 text-purple-600" />
                            Schedule Inspection
                        </DialogTitle>
                        <DialogDescription>
                            {selectedApp?.propertyName} • {selectedApp?.owner}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Assign Dealing Assistant</Label>
                            <Select defaultValue="da1">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select DA" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEALING_ASSISTANTS.map(da => (
                                        <SelectItem key={da.id} value={da.id}>{da.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Inspection Date</Label>
                            <Input type="date" defaultValue="2025-12-28" />
                        </div>
                        <div className="space-y-2">
                            <Label>Instructions (Optional)</Label>
                            <Textarea placeholder="Special instructions for the inspection..." rows={3} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowScheduleModal(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowScheduleModal(false)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-emerald-600" />
                            Final Approval
                        </DialogTitle>
                        <DialogDescription>
                            {selectedApp?.propertyName} • {selectedApp?.category} Category
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="font-medium text-emerald-900">Ready for Approval</p>
                                    <p className="text-sm text-emerald-700">All verifications complete. Approve to generate certificate.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Approval Remarks (Optional)</Label>
                            <Textarea placeholder="Any remarks for the record..." rows={3} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowApproveModal(false)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Return to DA
                            </Button>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowApproveModal(false)}>
                                <Stamp className="w-4 h-4 mr-2" />
                                Approve & Generate RC
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
