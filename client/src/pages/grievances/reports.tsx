/**
 * GrievanceReports - Analytics dashboard for grievance management
 * 
 * Shows statistics, charts, and allows CSV export of grievance data.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, BarChart2, PieChart, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface SummaryData {
    totals: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    };
    averageResolutionDays: number;
    last30Days: {
        newTickets: number;
        resolvedTickets: number;
    };
}

interface CategoryData {
    category: string;
    count: number;
}

interface StatusData {
    status: string;
    count: number;
}

interface PriorityData {
    priority: string;
    count: number;
}

interface MonthlyData {
    month: string;
    count: number;
}

const categoryColors: Record<string, string> = {
    payment: "bg-blue-500",
    application: "bg-green-500",
    portal: "bg-purple-500",
    other: "bg-gray-500",
};

const statusColors: Record<string, string> = {
    open: "bg-blue-500",
    in_progress: "bg-amber-500",
    resolved: "bg-emerald-500",
    closed: "bg-slate-500",
};

const priorityColors: Record<string, string> = {
    low: "bg-gray-400",
    medium: "bg-blue-400",
    high: "bg-orange-500",
    urgent: "bg-red-500",
};

export default function GrievanceReports() {
    const { data: dashboardStats, isLoading } = useQuery<{
        summary: SummaryData;
        byCategory: CategoryData[];
        byStatus: StatusData[];
        byPriority: PriorityData[];
        monthlyTrend: MonthlyData[];
    }>({
        queryKey: ["/api/grievances/reports/dashboard-stats"],
    });

    const handleExportCSV = () => {
        window.open("/api/grievances/reports/export", "_blank");
    };

    if (isLoading || !dashboardStats) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { summary, byCategory, byStatus, byPriority, monthlyTrend } = dashboardStats;

    const totals = summary?.totals || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
    const maxCount = Math.max(...(byCategory?.map(c => c.count) || [1]));

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grievance Reports</h1>
                    <p className="text-muted-foreground mt-2">
                        Analytics and insights for grievance management
                    </p>
                </div>
                <Button onClick={handleExportCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Tickets</p>
                                <p className="text-3xl font-bold text-blue-700">{totals.total}</p>
                            </div>
                            <BarChart2 className="h-10 w-10 text-blue-300" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600">Open</p>
                                <p className="text-3xl font-bold text-amber-700">{totals.open + totals.inProgress}</p>
                            </div>
                            <AlertCircle className="h-10 w-10 text-amber-300" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">Resolved</p>
                                <p className="text-3xl font-bold text-emerald-700">{totals.resolved + totals.closed}</p>
                            </div>
                            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Avg. Resolution</p>
                                <p className="text-3xl font-bold text-purple-700">
                                    {summary?.averageResolutionDays || 0}
                                    <span className="text-sm font-normal ml-1">days</span>
                                </p>
                            </div>
                            <Clock className="h-10 w-10 text-purple-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Last 30 Days */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Last 30 Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-sm text-muted-foreground">New Tickets</p>
                            <p className="text-2xl font-bold text-blue-600">{summary?.last30Days.newTickets || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Resolved</p>
                            <p className="text-2xl font-bold text-emerald-600">{summary?.last30Days.resolvedTickets || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* By Category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            By Category
                        </CardTitle>
                        <CardDescription>Distribution of tickets by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {byCategory && byCategory.length > 0 ? (
                            <div className="space-y-3">
                                {byCategory.map((item) => (
                                    <div key={item.category} className="flex items-center gap-3">
                                        <span className="w-24 text-sm capitalize">{item.category}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                                            <div
                                                className={`h-4 rounded-full ${categoryColors[item.category] || 'bg-gray-500'}`}
                                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-sm font-medium text-right">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* By Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" />
                            By Status
                        </CardTitle>
                        <CardDescription>Current status distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {byStatus && byStatus.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {byStatus.map((item) => (
                                    <div key={item.status} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || 'bg-gray-500'}`} />
                                        <span className="text-sm capitalize">{item.status.replace('_', ' ')}</span>
                                        <Badge variant="secondary">{item.count}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* By Priority */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            By Priority
                        </CardTitle>
                        <CardDescription>Tickets grouped by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {byPriority && byPriority.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {byPriority.map((item) => (
                                    <div key={item.priority} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${priorityColors[item.priority] || 'bg-gray-500'}`} />
                                        <span className="text-sm capitalize">{item.priority}</span>
                                        <Badge variant="secondary">{item.count}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Monthly Trend
                        </CardTitle>
                        <CardDescription>Tickets created per month (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthlyTrend && monthlyTrend.length > 0 ? (
                            <div className="space-y-2">
                                {monthlyTrend.map((item) => {
                                    const maxMonthCount = Math.max(...monthlyTrend.map(m => m.count));
                                    return (
                                        <div key={item.month} className="flex items-center gap-3">
                                            <span className="w-20 text-sm">{item.month}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full bg-blue-500"
                                                    style={{ width: `${(item.count / maxMonthCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-sm font-medium text-right">{item.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
