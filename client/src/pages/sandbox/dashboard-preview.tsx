import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus, FileText, Clock, CheckCircle2, RefreshCw,
    CreditCard, Mountain, Home, MapPin, Search,
    AlertTriangle, FileEdit, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// MOCKED DATA
const MOCK_USER = { name: "Test BBB", role: "property_owner" };
const MOCK_STATS = {
    new: 1,
    process: 2,
    attention: 1,
    completed: 1
};

const MOCK_APPLICATIONS = [
    {
        id: 1,
        propertyName: "Draft Homestay",
        applicationNumber: "HP-HS-2025-SML-000001",
        status: "draft",
        category: "Silver",
        district: "Shimla",
        rooms: 1,
        updatedAt: new Date().toISOString(),
        summary: "Complete the draft to submit your application."
    },
    {
        id: 2,
        propertyName: "Mountain View Lodge",
        applicationNumber: "HP-HS-2025-KUL-000042",
        status: "inspection_scheduled",
        category: "Gold",
        district: "Kullu",
        rooms: 5,
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        summary: "Inspection scheduled for Dec 28, 2025."
    },
    {
        id: 3,
        propertyName: "Sunny Side Cottage",
        applicationNumber: "HP-HS-2025-MNL-000003",
        status: "sent_back_for_corrections",
        category: "Silver",
        district: "Manali",
        rooms: 2,
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        summary: "Action Required: Please enable geotagging in photos."
    }
];

// 6-Step Timeline matching the user's screenshot
const ProgressTimeline = ({ status }: { status: string }) => {
    const statusToStep: Record<string, number> = {
        draft: 0,
        submitted: 0,
        district_review: 0,
        under_scrutiny: 0,
        forwarded_to_dtdo: 1,
        sent_back_for_corrections: 0,
        reverted_to_applicant: 0,
        inspection_scheduled: 2,
        inspection_completed: 3,
        payment_pending: 4,
        verified_for_payment: 4,
        approved: 5
    };

    const currentStep = statusToStep[status] ?? 0;

    const steps = [
        { label: "With Dealing Assistant" },
        { label: "Forwarded to DTDO" },
        { label: "Inspection Scheduled" },
        { label: "Inspection Completed" },
        { label: "Payment Pending" },
        { label: "Registration Approved" }
    ];

    return (
        <div className="flex items-start w-full mt-3">
            {steps.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isLast = i === steps.length - 1;
                return (
                    <div key={i} className="flex items-center flex-1">
                        {/* Circle */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0",
                                isCompleted
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-gray-300 bg-white"
                            )}>
                                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <span className={cn(
                                "text-[10px] mt-2 font-semibold text-center uppercase tracking-wide max-w-[80px] leading-tight",
                                isCompleted ? "text-emerald-700" : "text-gray-400"
                            )}>{step.label}</span>
                        </div>
                        {/* Connector line */}
                        {!isLast && (
                            <div className={cn(
                                "h-[3px] flex-1 mx-1 mt-[-24px]",
                                i < currentStep ? "bg-emerald-400" : "bg-gray-200"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default function DashboardPreview() {
    const [, setLocation] = useLocation();

    return (
        <div className="bg-background p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- SERVICE CENTER --- */}
                <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <FileEdit className="w-28 h-28 text-emerald-600" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Service Center
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Renew or amend approved applications without starting from scratch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3 pt-2">
                        <Button variant="outline" size="sm" className="h-9 text-sm">
                            <RefreshCw className="w-4 h-4 mr-2" /> Apply for Renewal
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 text-sm text-blue-700 border-blue-200 hover:bg-blue-50">
                            <FileEdit className="w-4 h-4 mr-2" /> Amend Certificate
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 text-sm text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-2" /> Surrender / Cancel
                        </Button>
                    </CardContent>
                </Card>

                {/* --- STATUS OVERVIEW CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">New Applications</div>
                            <div className="text-3xl font-bold text-foreground">{MOCK_STATS.new}</div>
                            <div className="text-xs text-muted-foreground mt-1">Drafts: 1 • Submitted: 0</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Under Process</div>
                            <div className="text-3xl font-bold text-foreground">{MOCK_STATS.process}</div>
                            <div className="text-xs text-muted-foreground mt-1">Inspections: 1 • Payment pending: 0</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm bg-orange-50/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Pending / Corrections</div>
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold text-orange-900">{MOCK_STATS.attention}</div>
                            <div className="text-xs text-orange-700/70 mt-1">Sent back: 1 • Resubmitted: 0</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-300 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</div>
                            <div className="text-3xl font-bold text-foreground">{MOCK_STATS.completed}</div>
                            <div className="text-xs text-muted-foreground mt-1">Approved: 1 • Rejected: 0</div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- DASHBOARD HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
                        <p className="text-sm text-muted-foreground">Manage your applications</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="h-9">
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                            Existing RC Registration
                        </Button>
                        <Button size="sm" className="h-9 bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" /> New Application
                        </Button>
                    </div>
                </div>

                {/* --- APPLICATION STATUS CARD (Primary App) --- */}
                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Application Status</h3>
                                <p className="text-sm text-muted-foreground">
                                    {MOCK_APPLICATIONS[0].propertyName} • {MOCK_APPLICATIONS[0].applicationNumber}
                                </p>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                        </div>

                        {/* Timeline */}
                        <ProgressTimeline status={MOCK_APPLICATIONS[0].status} />

                        <p className="text-sm text-muted-foreground mt-4">{MOCK_APPLICATIONS[0].summary}</p>
                    </CardContent>
                </Card>

                {/* --- ALL APPLICATIONS LIST --- */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="text-base font-semibold">All Applications</CardTitle>
                        <CardDescription className="text-sm">Your homestay applications</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {MOCK_APPLICATIONS.map((app) => (
                            <div key={app.id} className="p-4 hover:bg-muted/30 transition-all cursor-pointer">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Home className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-sm text-foreground">{app.propertyName}</h4>
                                                <Badge variant="outline" className="text-xs capitalize">{app.status.replace(/_/g, ' ')}</Badge>
                                                <Badge variant="secondary" className="text-xs">{app.category}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span className="font-mono">{app.applicationNumber}</span>
                                                <span>•</span>
                                                <span>{app.district}</span>
                                                <span>•</span>
                                                <span>{app.rooms} rooms</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0 text-xs h-8">
                                        {app.status === 'draft' || app.status === 'sent_back_for_corrections' ? 'Resume Editing' : 'View Details'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
