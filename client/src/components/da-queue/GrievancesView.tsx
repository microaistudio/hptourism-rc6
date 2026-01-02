/**
 * GrievancesView - DA/DTDO Grievance Management View
 * 
 * Shows all grievances submitted by property owners for DA/DTDO to manage.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Loader2, MessageSquare, AlertCircle, CheckCircle2, Clock, User, ChevronRight, Bell, History, BarChart2, Send } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Grievance {
    id: string;
    ticketNumber: string;
    ticketType?: string; // 'owner_grievance' | 'internal_ticket'
    userId: string;
    applicationId?: string | null;
    category: string;
    priority?: string | null;
    status?: string | null;
    subject: string;
    description: string;
    assignedTo?: string | null;
    resolutionNotes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    resolvedAt?: string | null;
    lastCommentAt?: string | null;
    lastReadByOwner?: string | null;
    lastReadByOfficer?: string | null;
}

interface GrievanceComment {
    id: string;
    grievanceId: string;
    userId: string;
    comment: string;
    isInternal: boolean;
    createdAt: string;
}

interface GrievanceWithComments extends Grievance {
    comments?: GrievanceComment[];
}

interface GrievanceAuditLog {
    id: string;
    grievanceId: string;
    action: string;
    oldValue?: string | null;
    newValue?: string | null;
    performedBy: string;
    performedAt: string;
}

// Helper to check if grievance has unread replies for officer
function hasUnreadReplies(grievance: Grievance): boolean {
    if (!grievance.lastCommentAt) return false;
    if (!grievance.lastReadByOfficer) return new Date(grievance.lastCommentAt) > new Date(grievance.createdAt);
    return new Date(grievance.lastCommentAt) > new Date(grievance.lastReadByOfficer);
}

interface GrievancesViewProps {
    role?: 'da' | 'dtdo';
}

export function GrievancesView({ role = 'da' }: GrievancesViewProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedGrievance, setSelectedGrievance] = useState<GrievanceWithComments | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [newPriority, setNewPriority] = useState<string>("");
    const [resolutionNotes, setResolutionNotes] = useState<string>("");
    const [newComment, setNewComment] = useState("");
    const [showAuditLog, setShowAuditLog] = useState(false);

    // Two-tier system: track which ticket type view is active
    const [activeTicketType, setActiveTicketType] = useState<'owner_grievance' | 'internal_ticket'>('owner_grievance');
    const [showCreateInternalDialog, setShowCreateInternalDialog] = useState(false);
    const [newInternalSubject, setNewInternalSubject] = useState("");
    const [newInternalDescription, setNewInternalDescription] = useState("");
    const [newInternalCategory, setNewInternalCategory] = useState("policy_query");

    // Fetch grievances based on active ticket type
    const { data: grievances, isLoading } = useQuery<Grievance[]>({
        queryKey: ["/api/grievances", { type: activeTicketType }],
        queryFn: async () => {
            const response = await apiRequest("GET", `/api/grievances?type=${activeTicketType}`);
            return response.json();
        },
    });

    // Fetch unread count
    const { data: unreadData } = useQuery<{ unreadCount: number }>({
        queryKey: ["/api/grievances/unread-count"],
    });

    // Fetch grievance details with comments when one is selected
    const { data: grievanceDetails, isLoading: detailsLoading } = useQuery<GrievanceWithComments>({
        queryKey: ["/api/grievances", selectedGrievance?.id],
        enabled: !!selectedGrievance?.id,
    });

    // Fetch audit log when dialog is open and audit tab is shown
    const { data: auditLogs, isLoading: auditLoading } = useQuery<GrievanceAuditLog[]>({
        queryKey: ["/api/grievances", selectedGrievance?.id, "audit-log"],
        enabled: !!selectedGrievance?.id && showAuditLog,
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: { id: string; status?: string; priority?: string; resolutionNotes?: string }) => {
            const response = await apiRequest("PATCH", `/api/grievances/${id}/status`, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances/unread-count"] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances", selectedGrievance?.id] });
            toast({ title: "Grievance Updated", description: "Status has been updated successfully." });
            // Don't close dialog, just update state
            if (newStatus === "closed") {
                setSelectedGrievance(null);
                setShowAuditLog(false);
            }
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update grievance.", variant: "destructive" });
        },
    });

    // Mutation to add a comment
    const addCommentMutation = useMutation({
        mutationFn: async ({ grievanceId, comment }: { grievanceId: string; comment: string }) => {
            const response = await apiRequest("POST", `/api/grievances/${grievanceId}/comments`, { comment });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances", selectedGrievance?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances", { type: activeTicketType }] });
            toast({ title: "Reply Sent", description: "Your reply has been added to the ticket." });
            setNewComment("");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to send reply.", variant: "destructive" });
        },
    });

    // Mutation to create internal ticket
    const createInternalMutation = useMutation({
        mutationFn: async (data: { subject: string; description: string; category: string }) => {
            const response = await apiRequest("POST", "/api/grievances", {
                ...data,
                ticketType: "internal_ticket",
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances", { type: "internal_ticket" }] });
            toast({ title: "Internal Ticket Created", description: "Your ticket has been submitted to DTDO." });
            setShowCreateInternalDialog(false);
            setNewInternalSubject("");
            setNewInternalDescription("");
            setNewInternalCategory("policy_query");
            setActiveTicketType("internal_ticket"); // Switch to internal tab
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create internal ticket.", variant: "destructive" });
        },
    });

    const handleUpdateGrievance = () => {
        if (!selectedGrievance) return;
        updateMutation.mutate({
            id: selectedGrievance.id,
            status: newStatus || undefined,
            priority: newPriority || undefined,
            resolutionNotes: resolutionNotes || undefined,
        });
    };


    const handleSendReply = () => {
        if (!selectedGrievance?.id || !newComment.trim()) return;
        addCommentMutation.mutate({ grievanceId: selectedGrievance.id, comment: newComment.trim() });
    };

    const openGrievanceDialog = (grievance: GrievanceWithComments) => {
        setSelectedGrievance(grievance);
        setNewStatus(grievance.status || "open");
        setNewPriority(grievance.priority || "medium");
        setResolutionNotes(grievance.resolutionNotes || "");
        setShowAuditLog(false);
    };

    // Refetch when dialog closes
    useEffect(() => {
        if (!selectedGrievance) {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances/unread-count"] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
        }
    }, [selectedGrievance, queryClient]);

    const renderList = (items: Grievance[] | undefined) => {
        if (!items || items.length === 0) {
            return (
                <Card className="bg-muted/50 border-dashed mt-4">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No grievances found</h3>
                        <p className="text-sm text-muted-foreground">There are no grievances in this category.</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid gap-4 mt-4">
                {items.map((ticket) => {
                    const isUnread = hasUnreadReplies(ticket);
                    return (
                        <Card
                            key={ticket.id}
                            className={`hover:shadow-md transition-all cursor-pointer ${isUnread ? 'border-orange-400 bg-orange-50/50' : 'border-slate-200'}`}
                            onClick={() => openGrievanceDialog(ticket)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                                                {ticket.ticketNumber}
                                            </span>
                                            <CardTitle className="text-base font-semibold text-slate-900">
                                                {ticket.subject}
                                            </CardTitle>
                                            {isUnread && (
                                                <Badge className="bg-orange-500 text-white text-[10px] px-2 py-0.5 animate-pulse">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    New Response
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Reported on {format(new Date(ticket.createdAt), "PPP")}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={ticket.status} />
                                        <PriorityBadge priority={ticket.priority} />
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                                    <span className="flex items-center gap-1">
                                        Category: <Badge variant="secondary" className="font-normal capitalize">{ticket.category}</Badge>
                                    </span>
                                    {ticket.updatedAt && (
                                        <span>Last updated: {format(new Date(ticket.updatedAt), "MMM d, h:mm a")}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const allGrievances = grievances || [];
    const openGrievances = allGrievances.filter(g => ['open', 'in_progress'].includes(g.status || ''));
    const resolvedGrievances = allGrievances.filter(g => ['resolved', 'closed'].includes(g.status || ''));
    const unreadCount = unreadData?.unreadCount || 0;

    const currentDetails = grievanceDetails || selectedGrievance;

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">Grievance Management</h3>
                            {unreadCount > 0 && (
                                <Badge className="bg-orange-500 text-white">
                                    {unreadCount} new responses
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {activeTicketType === 'owner_grievance'
                                ? 'Review and resolve grievances submitted by property owners.'
                                : 'Internal staff tickets for DA-DTDO communication.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTicketType === 'internal_ticket' && (
                            <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => setShowCreateInternalDialog(true)}
                            >
                                + Create Internal Ticket
                            </Button>
                        )}
                        <a href={role === 'dtdo' ? "/dtdo/grievance-reports" : "/da/grievance-reports"}>
                            <Button variant="outline" size="sm">
                                <BarChart2 className="w-4 h-4 mr-1" />
                                Reports
                            </Button>
                        </a>
                        <Badge variant="outline" className="text-sm">
                            {allGrievances.length} total
                        </Badge>
                    </div>
                </div>

                {/* Primary Tabs: Owner Grievances vs Internal Tickets */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTicketType('owner_grievance')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTicketType === 'owner_grievance'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Owner Grievances
                    </button>
                    <button
                        onClick={() => setActiveTicketType('internal_ticket')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTicketType === 'internal_ticket'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Internal Tickets
                    </button>
                </div>

                {/* Secondary Tabs: Status Filter */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                        <TabsTrigger value="all">All ({allGrievances.length})</TabsTrigger>
                        <TabsTrigger value="open">Open ({openGrievances.length})</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved ({resolvedGrievances.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">{renderList(allGrievances)}</TabsContent>
                    <TabsContent value="open">{renderList(openGrievances)}</TabsContent>
                    <TabsContent value="resolved">{renderList(resolvedGrievances)}</TabsContent>
                </Tabs>
            </div>

            {/* Grievance Detail Dialog */}
            <Dialog open={!!selectedGrievance} onOpenChange={(open) => { if (!open) { setSelectedGrievance(null); setShowAuditLog(false); setNewComment(""); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                                {selectedGrievance?.ticketNumber}
                            </span>
                            <span>{selectedGrievance?.subject}</span>
                        </DialogTitle>
                        <DialogDescription>
                            {role === 'dtdo' ? 'Manage and resolve this grievance' : 'View grievance details and conversation'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedGrievance && (
                        <div className="space-y-6 py-4">
                            {/* Tab toggle for Details vs Audit Log */}
                            <div className="flex gap-2">
                                <Button
                                    variant={!showAuditLog ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowAuditLog(false)}
                                >
                                    Details
                                </Button>
                                <Button
                                    variant={showAuditLog ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowAuditLog(true)}
                                >
                                    <History className="w-4 h-4 mr-1" />
                                    Activity Log
                                </Button>
                            </div>

                            {!showAuditLog ? (
                                <>
                                    {/* Description */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                                        <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {selectedGrievance.description}
                                        </p>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Category</Label>
                                            <p className="mt-1 text-sm capitalize">{selectedGrievance.category}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Submitted</Label>
                                            <p className="mt-1 text-sm">{format(new Date(selectedGrievance.createdAt), "PPP p")}</p>
                                        </div>
                                    </div>

                                    {/* Status/Priority - Editable for DTDO, Read-only for DA */}
                                    {role === 'dtdo' ? (
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                            <div className="col-span-2 mb-2 font-medium text-sm text-slate-800">Officer Actions (DTDO)</div>
                                            <div>
                                                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                                <Select value={newStatus} onValueChange={setNewStatus}>
                                                    <SelectTrigger id="status" className="mt-1">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="open">Open</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="resolved">Resolved</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                                                <Select value={newPriority} onValueChange={setNewPriority}>
                                                    <SelectTrigger id="priority" className="mt-1">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2">
                                                <Label htmlFor="resolution" className="text-sm font-medium">Resolution Notes</Label>
                                                <Textarea
                                                    id="resolution"
                                                    value={resolutionNotes}
                                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                                    placeholder="Add notes about how this grievance was resolved..."
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* Read-only view for DA */
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Status</Label>
                                                <div className="mt-1"><StatusBadge status={selectedGrievance.status} /></div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Priority</Label>
                                                <div className="mt-1"><PriorityBadge priority={selectedGrievance.priority} /></div>
                                            </div>
                                            {selectedGrievance.resolutionNotes && (
                                                <div className="col-span-2">
                                                    <Label className="text-sm font-medium text-gray-700">Resolution Notes</Label>
                                                    <p className="mt-1 text-sm text-gray-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                                        {selectedGrievance.resolutionNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Conversation Section */}
                                    <div className="border-t pt-4">
                                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                                            <MessageSquare className="w-4 h-4" />
                                            Conversation
                                        </Label>

                                        <div className="space-y-3 max-h-48 overflow-y-auto mb-4 bg-gray-50/50 p-2 rounded-lg">
                                            {detailsLoading ? (
                                                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
                                            ) : currentDetails?.comments && currentDetails.comments.length > 0 ? (
                                                currentDetails.comments.map((comment) => (
                                                    <div key={comment.id} className={`p-3 rounded-lg text-sm ${comment.isInternal ? 'bg-yellow-50 border border-yellow-100' : 'bg-white border border-gray-100'}`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-xs text-gray-500">
                                                                {comment.isInternal ? 'Internal Note' : 'Reply'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700">{comment.comment}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic text-center py-2">No comments yet.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <Button
                                                size="sm"
                                                onClick={handleSendReply}
                                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                            >
                                                {addCommentMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                                                Send Reply
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Audit Log View */
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">Activity History</Label>
                                    {auditLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    ) : auditLogs && auditLogs.length > 0 ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {auditLogs.map((log) => (
                                                <div key={log.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium capitalize">{log.action.replace('_', ' ')}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {format(new Date(log.performedAt), "MMM d, h:mm a")}
                                                        </span>
                                                    </div>
                                                    {log.oldValue && log.newValue && (
                                                        <div className="mt-1 text-xs text-gray-600">
                                                            <span className="text-red-600 line-through">{log.oldValue}</span>
                                                            {" → "}
                                                            <span className="text-green-600">{log.newValue}</span>
                                                        </div>
                                                    )}
                                                    {!log.oldValue && log.newValue && (
                                                        <div className="mt-1 text-xs text-gray-600">{log.newValue}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic py-4">No activity recorded yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedGrievance(null); setShowAuditLog(false); setNewComment(""); }}>
                            Close
                        </Button>
                        {!showAuditLog && role === 'dtdo' && (
                            <Button onClick={handleUpdateGrievance} disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Details
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Internal Ticket Dialog */}
            <Dialog open={showCreateInternalDialog} onOpenChange={setShowCreateInternalDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-amber-600" />
                            Create Internal Ticket
                        </DialogTitle>
                        <DialogDescription>
                            Create a ticket for DTDO review. This will NOT be visible to property owners.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="int-category" className="text-sm font-medium">Category</Label>
                            <Select value={newInternalCategory} onValueChange={setNewInternalCategory}>
                                <SelectTrigger id="int-category" className="mt-1">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="policy_query">Policy Query</SelectItem>
                                    <SelectItem value="system_issue">System Issue</SelectItem>
                                    <SelectItem value="application">Application Clarification</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="int-subject" className="text-sm font-medium">Subject</Label>
                            <input
                                id="int-subject"
                                type="text"
                                value={newInternalSubject}
                                onChange={(e) => setNewInternalSubject(e.target.value)}
                                placeholder="Brief description of the issue"
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="int-description" className="text-sm font-medium">Description</Label>
                            <Textarea
                                id="int-description"
                                value={newInternalDescription}
                                onChange={(e) => setNewInternalDescription(e.target.value)}
                                placeholder="Provide details about the issue or query..."
                                className="mt-1"
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateInternalDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => {
                                if (newInternalSubject.trim() && newInternalDescription.trim()) {
                                    createInternalMutation.mutate({
                                        subject: newInternalSubject.trim(),
                                        description: newInternalDescription.trim(),
                                        category: newInternalCategory,
                                    });
                                }
                            }}
                            disabled={!newInternalSubject.trim() || !newInternalDescription.trim() || createInternalMutation.isPending}
                        >
                            {createInternalMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
    const styles: Record<string, string> = {
        open: "bg-blue-100 text-blue-700 border-blue-200",
        in_progress: "bg-amber-100 text-amber-700 border-amber-200",
        resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        closed: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const icons: Record<string, typeof AlertCircle> = {
        open: AlertCircle,
        in_progress: Clock,
        resolved: CheckCircle2,
        closed: CheckCircle2,
    };

    const variant = styles[status || "open"] || styles.open;
    const Icon = icons[status || "open"] || AlertCircle;

    return (
        <Badge variant="outline" className={`${variant} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize">{(status || "open").replace('_', ' ')}</span>
        </Badge>
    );
}

function PriorityBadge({ priority }: { priority: string | null | undefined }) {
    const styles: Record<string, string> = {
        low: "bg-gray-100 text-gray-600",
        medium: "bg-blue-50 text-blue-600",
        high: "bg-orange-100 text-orange-700",
        urgent: "bg-red-100 text-red-700",
    };

    const priorityValue = priority || "medium";
    const variant = styles[priorityValue] || styles.medium;

    return (
        <Badge className={`${variant} text-[10px] font-medium`}>
            {priorityValue.toUpperCase()}
        </Badge>
    );
}
