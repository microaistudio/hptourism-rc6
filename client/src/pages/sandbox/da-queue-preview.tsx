/**
 * ============================================================================
 * 🎨 SANDBOX / UI PREVIEW ONLY - DA Queue Preview
 * ============================================================================
 * 
 * Route: /sandbox/da-queue
 * Status: SANDBOX (Mock data for UI testing only)
 * 
 * This file is for DESIGN EXPLORATION and UI mockups.
 * It uses MOCK DATA and is NOT connected to real APIs.
 * 
 * REAL IMPLEMENTATION: See /da/queue → pages/da/queue.tsx
 * The real file uses actual API data and is the production version.
 * 
 * Use this sandbox to:
 *   - Experiment with new UI designs
 *   - Test interaction patterns
 *   - Get stakeholder feedback before implementing
 * 
 * DO NOT use this in production. Always refer to /da/queue for real data.
 * ============================================================================
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    Filter,
    Home,
    Mountain,
    ChevronDown,
    ClipboardList,
    MapPin,
    Phone,
    Calendar,
    Eye,
    Sparkles,
    TrendingUp,
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
    Send,
    Paperclip,
    AlertCircle,
    CheckCircle,
    ArrowLeft
} from "lucide-react";

// Application types with their metadata
const APPLICATION_TYPES = {
    new_registration: {
        label: "New Registration",
        shortLabel: "New",
        icon: UserPlus,
        color: "bg-blue-500",
        borderColor: "border-l-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        dotColor: "bg-blue-500"
    },
    legacy_onboarding: {
        label: "Legacy Onboarding",
        shortLabel: "Legacy",
        icon: FileCheck,
        color: "bg-purple-500",
        borderColor: "border-l-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        dotColor: "bg-purple-500"
    },
    add_rooms: {
        label: "Add Rooms",
        shortLabel: "Add",
        icon: Plus,
        color: "bg-emerald-500",
        borderColor: "border-l-emerald-500",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        dotColor: "bg-emerald-500"
    },
    delete_rooms: {
        label: "Delete Rooms",
        shortLabel: "Delete",
        icon: Minus,
        color: "bg-orange-500",
        borderColor: "border-l-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        dotColor: "bg-orange-500"
    },
    cancel_rc: {
        label: "Cancel RC",
        shortLabel: "Cancel",
        icon: XCircle,
        color: "bg-red-500",
        borderColor: "border-l-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        dotColor: "bg-red-500"
    },
    renewal: {
        label: "Renewal",
        shortLabel: "Renewal",
        icon: CalendarClock,
        color: "bg-teal-500",
        borderColor: "border-l-teal-500",
        bgColor: "bg-teal-50",
        textColor: "text-teal-700",
        dotColor: "bg-teal-500"
    },
};

type ApplicationType = keyof typeof APPLICATION_TYPES;

// Mock data
const MOCK_APPLICATIONS = [
    { id: 1, propertyName: "Himalayan View Homestay", owner: "Rajesh Kumar", mobile: "9876543210", type: "new_registration" as ApplicationType, status: "under_review", submittedAt: "2025-12-24", daysAgo: 1, district: "Shimla", category: "Gold", rooms: 4, priority: "normal" },
    { id: 2, propertyName: "Green Valley Home", owner: "Priya Sharma", mobile: "9876543211", type: "add_rooms" as ApplicationType, status: "pending", submittedAt: "2025-12-24", daysAgo: 1, district: "Shimla", category: "Silver", rooms: 4, priority: "normal", currentRooms: 4, requestedRooms: 2 },
    { id: 3, propertyName: "Mountain Bliss", owner: "Vikram Singh", mobile: "9876543212", type: "legacy_onboarding" as ApplicationType, status: "correction", submittedAt: "2025-12-23", daysAgo: 2, district: "Shimla", category: "Silver", rooms: 3, priority: "high" },
    { id: 4, propertyName: "Snow Peak Lodge", owner: "Anita Devi", mobile: "9876543213", type: "delete_rooms" as ApplicationType, status: "pending", submittedAt: "2025-12-23", daysAgo: 2, district: "Shimla", category: "Gold", rooms: 6, priority: "normal", currentRooms: 6, requestedRooms: -2 },
    { id: 5, propertyName: "Valley Dream", owner: "Meera Kapoor", mobile: "9876543214", type: "new_registration" as ApplicationType, status: "pending", submittedAt: "2025-12-22", daysAgo: 3, district: "Shimla", category: "Silver", rooms: 5, priority: "normal" },
    { id: 6, propertyName: "Sunrise Cottage", owner: "Deepak Verma", mobile: "9876543215", type: "legacy_onboarding" as ApplicationType, status: "pending", submittedAt: "2025-12-21", daysAgo: 4, district: "Shimla", category: "Bronze", rooms: 2, priority: "normal" },
    { id: 7, propertyName: "Heritage Home", owner: "Kusum Rani", mobile: "9876543216", type: "cancel_rc" as ApplicationType, status: "pending", submittedAt: "2025-12-20", daysAgo: 5, district: "Shimla", category: "Silver", rooms: 3, priority: "low" },
];

// Mock inspections
const MOCK_INSPECTIONS = [
    { id: 1, propertyName: "Pine Forest Retreat", owner: "Sanjay Thakur", scheduledDate: "2025-12-26", status: "scheduled", address: "Village Mashobra, Near IGMC", category: "Gold" },
    { id: 2, propertyName: "Cloud Nine Stay", owner: "Ritu Sharma", scheduledDate: "2025-12-27", status: "scheduled", address: "Kufri Road, Shimla", category: "Silver" },
    { id: 3, propertyName: "Apple Valley Home", owner: "Mohan Lal", scheduledDate: "2025-12-25", status: "overdue", address: "Narkanda, Shimla", category: "Bronze" },
];

// Mock grievances/tickets
const MOCK_TICKETS = [
    {
        id: "GRV-2025-000123",
        subject: "Payment not reflecting in portal",
        applicant: "Rajesh Kumar",
        mobile: "9876543210",
        category: "payment",
        priority: "high",
        status: "open",
        createdAt: "2025-12-23",
        daysOpen: 2,
        lastMessage: "I made payment on Dec 23 but status still shows pending.",
        unreadCount: 1
    },
    {
        id: "GRV-2025-000120",
        subject: "Inspection date change request",
        applicant: "Priya Sharma",
        mobile: "9876543211",
        category: "inspection",
        priority: "medium",
        status: "in_progress",
        createdAt: "2025-12-22",
        daysOpen: 3,
        lastMessage: "Thank you, the new date works for me.",
        unreadCount: 0
    },
    {
        id: "GRV-2025-000118",
        subject: "Document upload failing",
        applicant: "Vikram Singh",
        mobile: "9876543212",
        category: "technical",
        priority: "low",
        status: "resolved",
        createdAt: "2025-12-20",
        daysOpen: 5,
        lastMessage: "Issue resolved. Thank you for your help!",
        unreadCount: 0
    },
    {
        id: "GRV-2025-000115",
        subject: "Query about room addition process",
        applicant: "Anita Devi",
        mobile: "9876543213",
        category: "general",
        priority: "low",
        status: "open",
        createdAt: "2025-12-21",
        daysOpen: 4,
        lastMessage: "Can you please explain the process for adding rooms?",
        unreadCount: 1
    },
];

// Mock conversation
const MOCK_CONVERSATION = [
    { id: 1, sender: "applicant", senderName: "Rajesh Kumar", message: "I made payment on Dec 23 via HimKosh. Transaction ID: HIMK2025122300456. But my application still shows 'Payment Pending'. Please help.", timestamp: "Dec 23, 2025 10:30 AM", attachments: [] },
    { id: 2, sender: "officer", senderName: "DA Shimla", message: "Thank you for reporting this. I'm checking with the payment gateway. Can you please share a screenshot of your payment confirmation?", timestamp: "Dec 23, 2025 2:15 PM", attachments: [], isInternal: false },
    { id: 3, sender: "applicant", senderName: "Rajesh Kumar", message: "Here is the payment screenshot.", timestamp: "Dec 23, 2025 3:00 PM", attachments: ["payment_receipt.pdf"] },
];

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-gray-100 text-gray-700", icon: Clock },
    under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700", icon: FileText },
    correction: { label: "Correction", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Calendar },
    overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

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
    urgent: { label: "Urgent", color: "text-red-700 animate-pulse" },
};

// Services/Pipelines
const SERVICES = [
    { id: "homestay", label: "Homestay B&B", icon: Home, color: "text-emerald-600", count: 7 },
    { id: "adventure", label: "Adventure Sports", icon: Mountain, color: "text-blue-600", count: 3 },
];

// Main navigation
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: FileText, badge: 7 },
    { id: "inspections", label: "Inspections", icon: ClipboardList, badge: 3 },
    { id: "grievances", label: "Grievances", icon: MessageSquare, badge: 4 },
    { id: "search", label: "Search", icon: FileSearch },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "help", label: "Help & FAQ", icon: HelpCircle },
];

// Tab filter groups
const TAB_GROUPS = [
    { key: "all", label: "All" },
    { key: "registrations", label: "Registrations", types: ["new_registration", "legacy_onboarding"] },
    { key: "amendments", label: "Amendments", types: ["add_rooms", "delete_rooms", "cancel_rc"] },
    { key: "renewals", label: "Renewals", types: ["renewal"] },
];

export default function DAQueuePreview() {
    const [activeService, setActiveService] = useState("homestay");
    const [activeNav, setActiveNav] = useState("applications");
    const [activeTab, setActiveTab] = useState("all");
    const [activeSubFilter, setActiveSubFilter] = useState<ApplicationType | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
    const [ticketFilter, setTicketFilter] = useState("all");
    const [replyMessage, setReplyMessage] = useState("");

    // Count applications by type
    const typeCounts = MOCK_APPLICATIONS.reduce((acc, app) => {
        acc[app.type] = (acc[app.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Count by tab group
    const tabCounts = TAB_GROUPS.map(tab => ({
        ...tab,
        count: tab.types
            ? MOCK_APPLICATIONS.filter(app => tab.types!.includes(app.type)).length
            : MOCK_APPLICATIONS.length
    }));

    // Get current tab config
    const currentTab = TAB_GROUPS.find(t => t.key === activeTab);

    // Get sub-filters for amendments tab
    const showSubFilters = activeTab === "amendments";
    const amendmentTypes: ApplicationType[] = ["add_rooms", "delete_rooms", "cancel_rc"];

    // Filter applications
    const filteredApps = MOCK_APPLICATIONS.filter(app => {
        if (currentTab?.types && !currentTab.types.includes(app.type)) return false;
        if (activeSubFilter && app.type !== activeSubFilter) return false;
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

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">HP</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-gray-900">HP Tourism</h1>
                            <p className="text-xs text-gray-500">eServices Portal</p>
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
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {item.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activeNav === item.id
                                    ? "bg-emerald-600 text-white"
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
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">DS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">DA Shimla</p>
                            <p className="text-xs text-gray-500 truncate">Dealing Assistant</p>
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
                                activeNav === "inspections" ? "Inspections" :
                                    activeNav === "grievances" ? "Grievances & Support" :
                                        activeNav === "dashboard" ? "Dashboard" : NAV_ITEMS.find(n => n.id === activeNav)?.label}
                        </h2>
                        <Badge variant="outline" className="text-xs">Shimla Division</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
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
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">In Progress</p>
                                                <p className="text-2xl font-bold text-amber-600">{MOCK_TICKETS.filter(t => t.status === "in_progress").length}</p>
                                            </div>
                                            <Clock className="w-8 h-8 text-amber-500 opacity-50" />
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
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Response</p>
                                                <p className="text-2xl font-bold text-blue-600">2.3h</p>
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
                            {/* Back Button */}
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Tickets
                            </Button>

                            {/* Ticket Header */}
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
                                                <Clock className="w-4 h-4 mr-1" />
                                                Mark In Progress
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Resolve
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conversation */}
                            <Card className="flex-1">
                                <div className="p-4 border-b">
                                    <h3 className="font-medium">Conversation</h3>
                                </div>
                                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                    {MOCK_CONVERSATION.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === "officer" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] ${msg.sender === "officer" ? "order-1" : ""}`}>
                                                <div className={`rounded-lg p-3 ${msg.sender === "officer"
                                                    ? "bg-emerald-100 text-emerald-900"
                                                    : "bg-gray-100 text-gray-900"
                                                    }`}>
                                                    <p className="text-sm">{msg.message}</p>
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                                                            <Paperclip className="w-3 h-3" />
                                                            {msg.attachments.join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`text-xs text-gray-500 mt-1 ${msg.sender === "officer" ? "text-right" : ""}`}>
                                                    {msg.senderName} • {msg.timestamp}
                                                </p>
                                            </div>
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
                                        <Button className="bg-emerald-600 hover:bg-emerald-700">
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
                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending Review</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-1">{MOCK_APPLICATIONS.length}</p>
                                                <p className="text-xs text-gray-500 mt-1">Across all types</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Need Attention</p>
                                                <p className="text-3xl font-bold text-amber-600 mt-1">{MOCK_APPLICATIONS.filter(a => a.status === "correction").length}</p>
                                                <p className="text-xs text-gray-500 mt-1">Corrections pending</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">New Today</p>
                                                <p className="text-3xl font-bold text-emerald-600 mt-1">{MOCK_APPLICATIONS.filter(a => a.daysAgo === 1).length}</p>
                                                <p className="text-xs text-gray-500 mt-1">Fresh submissions</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">This Week</p>
                                                <p className="text-3xl font-bold text-purple-600 mt-1">12</p>
                                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> +23% vs last week
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <BarChart3 className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Queue Card */}
                            <Card className="overflow-hidden">
                                {/* Tabs & Search */}
                                <div className="border-b bg-gray-50/50 p-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        {/* Tabs */}
                                        <div className="flex gap-1 p-1 bg-white border rounded-lg shadow-sm">
                                            {tabCounts.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => {
                                                        setActiveTab(tab.key);
                                                        setActiveSubFilter(null);
                                                    }}
                                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.key
                                                        ? "bg-emerald-600 text-white shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {tab.label}
                                                    <span className={`ml-2 text-xs ${activeTab === tab.key ? "text-emerald-100" : "text-gray-400"}`}>
                                                        {tab.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="Search by name, owner, mobile..."
                                                className="pl-10 w-72 bg-white"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Sub-filters for Amendments */}
                                    {showSubFilters && (
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">Type:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActiveSubFilter(null)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${!activeSubFilter
                                                        ? "bg-gray-900 text-white"
                                                        : "bg-white border text-gray-600 hover:border-gray-300"
                                                        }`}
                                                >
                                                    All
                                                </button>
                                                {amendmentTypes.map(type => {
                                                    const config = APPLICATION_TYPES[type];
                                                    const count = typeCounts[type] || 0;
                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => setActiveSubFilter(activeSubFilter === type ? null : type)}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeSubFilter === type
                                                                ? `${config.color} text-white`
                                                                : `bg-white border ${config.textColor} hover:border-gray-300`
                                                                }`}
                                                        >
                                                            <config.icon className="w-3 h-3" />
                                                            {config.shortLabel}
                                                            <span className="opacity-75">({count})</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                                            const typeConfig = APPLICATION_TYPES[app.type];
                                            const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
                                            const TypeIcon = typeConfig.icon;

                                            return (
                                                <div
                                                    key={app.id}
                                                    className={`p-4 hover:bg-gray-50/50 transition-colors border-l-4 ${typeConfig.borderColor} group`}
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
                                                                {app.priority === "high" && (
                                                                    <Badge className="text-[10px] bg-red-100 text-red-700 border-0 animate-pulse">
                                                                        ⚡ Urgent
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Details Row */}
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
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {app.daysAgo === 1 ? "Today" : `${app.daysAgo}d ago`}
                                                                </span>
                                                            </div>

                                                            {/* Contextual Info */}
                                                            {app.type === "add_rooms" && (
                                                                <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                                                                    <Plus className="w-3 h-3" />
                                                                    Adding {app.requestedRooms} rooms ({app.currentRooms} → {app.currentRooms! + app.requestedRooms!})
                                                                </div>
                                                            )}
                                                            {app.type === "delete_rooms" && (
                                                                <div className="mt-2 inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                                                                    <Minus className="w-3 h-3" />
                                                                    Removing {Math.abs(app.requestedRooms!)} rooms ({app.currentRooms} → {app.currentRooms! + app.requestedRooms!})
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
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
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Inspections View */}
                    {activeNav === "inspections" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</p>
                                                <p className="text-2xl font-bold text-gray-900">{MOCK_INSPECTIONS.filter(i => i.status === "scheduled").length}</p>
                                            </div>
                                            <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Overdue</p>
                                                <p className="text-2xl font-bold text-red-600">{MOCK_INSPECTIONS.filter(i => i.status === "overdue").length}</p>
                                            </div>
                                            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Completed</p>
                                                <p className="text-2xl font-bold text-emerald-600">8</p>
                                            </div>
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <div className="border-b p-4">
                                    <h3 className="font-semibold">Upcoming Inspections</h3>
                                </div>
                                <div className="divide-y">
                                    {MOCK_INSPECTIONS.map(inspection => {
                                        const statusConfig = STATUS_CONFIG[inspection.status as keyof typeof STATUS_CONFIG];
                                        return (
                                            <div key={inspection.id} className="p-4 hover:bg-gray-50">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 rounded-xl ${inspection.status === "overdue" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center`}>
                                                        <ClipboardList className={`w-5 h-5 ${inspection.status === "overdue" ? "text-red-600" : "text-blue-600"}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold">{inspection.propertyName}</h4>
                                                            <Badge className={`text-xs ${statusConfig.color} border-0`}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                            <span>{inspection.owner}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {inspection.scheduledDate}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {inspection.address}
                                                        </p>
                                                    </div>
                                                    <Button size="sm">
                                                        Submit Report
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Dashboard placeholder */}
                    {activeNav === "dashboard" && (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Dashboard Overview</p>
                                <p className="text-sm">(Combined stats view)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
