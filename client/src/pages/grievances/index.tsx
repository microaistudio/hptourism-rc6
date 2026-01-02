import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Grievance } from "@shared/schema";
import { CreateGrievanceDialog } from "./create-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, MessageSquare, AlertCircle, CheckCircle2, Clock, ChevronRight, Send, User, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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

// Helper to check if grievance has unread replies for owner
function hasUnreadReplies(grievance: Grievance): boolean {
    if (!grievance.lastCommentAt) return false;
    if (!grievance.lastReadByOwner) return new Date(grievance.lastCommentAt) > new Date(grievance.createdAt!);
    return new Date(grievance.lastCommentAt) > new Date(grievance.lastReadByOwner);
}

export default function GrievanceList() {
    const [selectedGrievance, setSelectedGrievance] = useState<GrievanceWithComments | null>(null);
    const [newComment, setNewComment] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: grievances, isLoading } = useQuery<Grievance[]>({
        queryKey: ["/api/grievances"],
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

    // Mutation to add a comment
    const addCommentMutation = useMutation({
        mutationFn: async ({ grievanceId, comment }: { grievanceId: string; comment: string }) => {
            const response = await apiRequest("POST", `/api/grievances/${grievanceId}/comments`, { comment });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances", selectedGrievance?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances/unread-count"] });
            toast({ title: "Reply Sent", description: "Your reply has been added to the ticket." });
            setNewComment("");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to send reply. Please try again.", variant: "destructive" });
        },
    });

    const handleSendReply = () => {
        if (!selectedGrievance?.id || !newComment.trim()) return;
        addCommentMutation.mutate({ grievanceId: selectedGrievance.id, comment: newComment.trim() });
    };

    // Refetch unread count when dialog closes (grievance was marked as read)
    useEffect(() => {
        if (!selectedGrievance) {
            queryClient.invalidateQueries({ queryKey: ["/api/grievances/unread-count"] });
            queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
        }
    }, [selectedGrievance, queryClient]);

    const currentDetails = grievanceDetails || selectedGrievance;

    const renderList = (items: Grievance[] | undefined) => {
        if (!items || items.length === 0) {
            return (
                <Card className="bg-muted/50 border-dashed mt-4">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No tickets found</h3>
                        <p className="text-sm text-muted-foreground mb-4">You have no tickets in this category.</p>
                        <CreateGrievanceDialog />
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
                            className={`hover:shadow-md transition-all cursor-pointer ${isUnread ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200'}`}
                            onClick={() => setSelectedGrievance(ticket)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">{ticket.ticketNumber}</span>
                                            <CardTitle className="text-base font-semibold text-slate-900">{ticket.subject}</CardTitle>
                                            {isUnread && (
                                                <Badge className="bg-blue-500 text-white text-[10px] px-2 py-0.5 animate-pulse">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    New Reply
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Reported on {format(new Date(ticket.createdAt!), "PPP")}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={ticket.status} />
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

    const unreadCount = unreadData?.unreadCount || 0;

    return (
        <>
            <div className="container mx-auto py-8 px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grievance Redressal</h1>
                            {unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white">
                                    {unreadCount} unread
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Track your reported issues and view their resolution status.
                        </p>
                    </div>
                    <CreateGrievanceDialog />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                            <TabsTrigger value="all">All Tickets</TabsTrigger>
                            <TabsTrigger value="open">Open</TabsTrigger>
                            <TabsTrigger value="resolved">Resolved</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            {renderList(grievances)}
                        </TabsContent>
                        <TabsContent value="open">
                            {renderList(grievances?.filter(g => ['open', 'in_progress'].includes(g.status || '')))}
                        </TabsContent>
                        <TabsContent value="resolved">
                            {renderList(grievances?.filter(g => ['resolved', 'closed'].includes(g.status || '')))}
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Grievance Detail Dialog */}
            <Dialog open={!!selectedGrievance} onOpenChange={(open) => { if (!open) { setSelectedGrievance(null); setNewComment(""); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                                {currentDetails?.ticketNumber}
                            </span>
                            <span>{currentDetails?.subject}</span>
                        </DialogTitle>
                        <DialogDescription>
                            View and respond to your reported issue
                        </DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : currentDetails && (
                        <div className="space-y-6 py-4">
                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <StatusBadge status={currentDetails.status} />
                                {currentDetails.priority && (
                                    <Badge className={getPriorityStyle(currentDetails.priority)}>
                                        {currentDetails.priority.toUpperCase()}
                                    </Badge>
                                )}
                            </div>

                            {/* Original Description */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Your Issue</Label>
                                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {currentDetails.description}
                                </p>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                                    <p className="mt-1 text-sm capitalize">{currentDetails.category}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Submitted</Label>
                                    <p className="mt-1 text-sm">{format(new Date(currentDetails.createdAt!), "PPP p")}</p>
                                </div>
                            </div>

                            {/* Resolution Notes (if available) */}
                            {currentDetails.resolutionNotes && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Resolution Notes from Officer</Label>
                                    <div className="mt-1 text-sm text-gray-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-2" />
                                        {currentDetails.resolutionNotes}
                                    </div>
                                </div>
                            )}

                            {/* Conversation / Comments */}
                            <div className="border-t pt-4">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Conversation
                                </Label>

                                {/* Existing Comments */}
                                <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
                                    {currentDetails.comments && currentDetails.comments.length > 0 ? (
                                        currentDetails.comments
                                            .filter(c => !c.isInternal)
                                            .map((comment) => (
                                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.comment}</p>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No replies yet. Add a reply below.</p>
                                    )}
                                </div>

                                {/* Add Reply */}
                                {currentDetails.status !== 'closed' && (
                                    <div className="mt-4">
                                        <Label htmlFor="reply" className="text-sm font-medium text-gray-700">
                                            Add a Reply
                                        </Label>
                                        <div className="mt-1 flex gap-2">
                                            <Textarea
                                                id="reply"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Type your reply or provide additional information..."
                                                className="flex-1 min-h-[80px]"
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                                size="sm"
                                            >
                                                {addCommentMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4 mr-2" />
                                                )}
                                                Send Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentDetails.status === 'closed' && (
                                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600 text-center">
                                        This ticket has been closed. If you need further assistance, please create a new ticket.
                                    </div>
                                )}
                            </div>

                            {/* Last Updated */}
                            {currentDetails.updatedAt && (
                                <div className="text-xs text-muted-foreground pt-4 border-t">
                                    Last updated: {format(new Date(currentDetails.updatedAt), "PPP p")}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    const styles = {
        open: "bg-blue-100 text-blue-700 border-blue-200",
        in_progress: "bg-amber-100 text-amber-700 border-amber-200",
        resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        closed: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const defaultStyle = styles.open;

    const icons = {
        open: AlertCircle,
        in_progress: Clock,
        resolved: CheckCircle2,
        closed: CheckCircle2,
    };

    const variant = styles[status as keyof typeof styles] || defaultStyle;
    const Icon = icons[status as keyof typeof icons] || AlertCircle;

    return (
        <Badge variant="outline" className={`${variant} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize">{status?.replace('_', ' ') || 'open'}</span>
        </Badge>
    );
}

function getPriorityStyle(priority: string): string {
    const styles: Record<string, string> = {
        low: "bg-gray-100 text-gray-600",
        medium: "bg-blue-50 text-blue-600",
        high: "bg-orange-100 text-orange-700",
        urgent: "bg-red-100 text-red-700",
    };
    return styles[priority] || styles.medium;
}
