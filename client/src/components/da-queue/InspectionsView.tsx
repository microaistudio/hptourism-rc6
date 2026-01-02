/**
 * Inspections View Component for DA Queue
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Clock,
    CheckCircle,
    Calendar,
    MapPin,
    User as UserIcon,
    ClipboardCheck,
    BellRing,
    Loader2
} from "lucide-react";
import type { InspectionOrder } from "./types";

interface InspectionsViewProps {
    inspections: InspectionOrder[];
    isLoading: boolean;
    onInspectionClick: (id: string) => void;
}

export function InspectionsView({ inspections, isLoading, onInspectionClick }: InspectionsViewProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'new'>('all');

    const pendingInspections = inspections.filter(i => !i.reportSubmitted);
    const completedInspections = inspections.filter(i => i.reportSubmitted);
    const newInspections = pendingInspections.filter(i => i.status?.toLowerCase() === 'scheduled');
    const hasNewInspections = newInspections.length > 0;

    const filteredInspections = useMemo(() => {
        switch (activeFilter) {
            case 'pending': return pendingInspections;
            case 'completed': return completedInspections;
            case 'new': return newInspections;
            default: return inspections;
        }
    }, [inspections, activeFilter, pendingInspections, completedInspections, newInspections]);

    const getCategoryBadge = (category: string) => {
        const colorMap: Record<string, string> = {
            diamond: "bg-purple-50 text-purple-700",
            gold: "bg-yellow-50 text-yellow-700",
            silver: "bg-gray-50 text-gray-700",
        };
        return (
            <Badge variant="outline" className={colorMap[category?.toLowerCase()] || ""}>
                {category?.toUpperCase()}
            </Badge>
        );
    };

    const getStatusBadge = (status: string, reportSubmitted: boolean) => {
        if (reportSubmitted) {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Report Submitted
                </Badge>
            );
        }
        switch (status) {
            case 'scheduled':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
            case 'acknowledged':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Acknowledged</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* New Inspections Banner */}
            <div className={`relative overflow-hidden rounded-2xl border shadow-sm transition-colors ${hasNewInspections ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full p-3 ${hasNewInspections ? "bg-amber-500/10 text-amber-600" : "bg-gray-200 text-gray-500"}`}>
                            <BellRing className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">New inspections scheduled</p>
                            <p className="text-sm text-gray-600">
                                {hasNewInspections
                                    ? `DTDO sent ${newInspections.length} ${newInspections.length === 1 ? 'application' : 'applications'} for field inspection.`
                                    : "You're all caught up. No new inspections."}
                            </p>
                        </div>
                    </div>
                    <Badge className={hasNewInspections ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-600"}>
                        {newInspections.length} New
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'new' ? "ring-2 ring-amber-500" : ""} ${hasNewInspections ? "border-amber-300 bg-amber-50" : ""}`}
                    onClick={() => setActiveFilter('new')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BellRing className={hasNewInspections ? "h-4 w-4 text-amber-600" : "h-4 w-4 text-gray-400"} />
                            New Assignments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newInspections.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting field inspection</p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'pending' ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setActiveFilter('pending')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Inspections</CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInspections.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting site visit</p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'completed' ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => setActiveFilter('completed')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedInspections.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Reports submitted</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inspection List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Assigned Inspections</CardTitle>
                        <CardDescription>Click on an inspection to view details and submit report</CardDescription>
                    </div>
                    {activeFilter !== 'all' && (
                        <Button variant="outline" size="sm" onClick={() => setActiveFilter('all')}>
                            Show All ({inspections.length})
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {filteredInspections.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No inspections found</h3>
                            <p className="text-sm text-gray-500 mt-2">No inspections match this filter</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredInspections.map(inspection => (
                                <Card
                                    key={inspection.id}
                                    className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200"
                                    onClick={() => onInspectionClick(inspection.id)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">
                                                            {inspection.application?.propertyName || 'Property Name Unavailable'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="text-sm text-gray-500">
                                                                {inspection.application?.applicationNumber || 'N/A'}
                                                            </span>
                                                            {inspection.application?.category && getCategoryBadge(inspection.application.category)}
                                                            {getStatusBadge(inspection.status, inspection.reportSubmitted)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-500">Scheduled:</span>
                                                        <span className="font-medium">
                                                            {format(new Date(inspection.inspectionDate), 'PPP')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-500">Owner:</span>
                                                        <span className="font-medium">{inspection.owner?.fullName || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 md:col-span-2">
                                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                        <span className="text-gray-500">Address:</span>
                                                        <span className="font-medium">{inspection.inspectionAddress}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button variant={inspection.reportSubmitted ? "outline" : "default"}>
                                                {inspection.reportSubmitted ? 'View Report' : 'Submit Report'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
