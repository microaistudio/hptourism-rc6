import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Trash2, Loader2, Download, Calendar, BedDouble, Building2, CheckCircle2 } from "lucide-react";
import { RoomDeltaModal } from "./RoomDeltaModal";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import { HomestayApplication } from "@shared/schema";

// Emoji icons for actions
const ACTION_EMOJIS = {
  renew: "🔄",
  addRooms: "➕",
  deleteRooms: "➖",
  changeCategory: "🔀",
  changeOwnership: "🤝",
  cancelCertificate: "❌",
  downloadRC: "📄",
};

type ServiceRequestSummary = {
  id: string;
  applicationNumber: string;
  propertyName: string;
  totalRooms: number;
  maxRoomsAllowed: number;
  certificateExpiryDate: string | null;
  renewalWindowStart: string | null;
  renewalWindowEnd: string | null;
  canRenew: boolean;
  canAddRooms: boolean;
  canDeleteRooms: boolean;
  rooms: {
    single: number;
    double: number;
    family: number;
  };
  activeServiceRequest: {
    id: string;
    applicationNumber: string;
    applicationKind: string;
    status: string;
    totalRooms: number;
    createdAt: string;
  } | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  try {
    return format(new Date(value), "d MMM yyyy");
  } catch {
    return null;
  }
};

const EmptyState = () => (
  <Card className="border-dashed bg-muted/40">
    <CardContent className="py-8 text-center text-sm text-muted-foreground">
      Once approved, manage your certificate here.
    </CardContent>
  </Card>
);

export function ServiceCenterPanel() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError } = useQuery<{ applications: ServiceRequestSummary[] }>({
    queryKey: ["/api/service-center"],
  });

  // Amendment panel unlock state - per application
  const [unlockedAmendments, setUnlockedAmendments] = useState<Set<string>>(new Set());

  const toggleAmendmentLock = (appId: string) => {
    setUnlockedAmendments(prev => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  // Room delta modal state
  const [roomModalState, setRoomModalState] = useState<{
    open: boolean;
    mode: "add_rooms" | "delete_rooms";
    parentId: string;
    currentRooms: { single: number; double: number; family: number };
  } | null>(null);

  // Action confirmation dialog state
  const [actionConfirm, setActionConfirm] = useState<{
    type: "change_category" | "cancel_certificate" | "add_rooms" | "delete_rooms" | "change_ownership";
    appId: string;
    rooms?: { single: number; double: number; family: number };
  } | null>(null);

  const openRoomModal = (
    mode: "add_rooms" | "delete_rooms",
    appId: string,
    rooms: { single: number; double: number; family: number }
  ) => {
    setRoomModalState({ open: true, mode, parentId: appId, currentRooms: rooms });
  };

  const closeRoomModal = () => setRoomModalState(null);

  const handleRoomModalSuccess = (nextUrl: string) => {
    closeRoomModal();
    setLocation(nextUrl);
  };

  // Discard draft state and mutation
  const { toast } = useToast();
  const [discardTarget, setDiscardTarget] = useState<{ id: string; kind: string } | null>(null);

  const discardDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Draft Discarded",
        description: "The incomplete service request has been removed. You can now start a new one.",
      });
      setDiscardTarget(null);
      queryClient.invalidateQueries({ queryKey: ["/api/service-center"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Discard",
        description: error.message || "Could not remove the draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // RC Download Handler
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadRC = async (appId: string) => {
    try {
      setDownloadingId(appId);
      toast({
        title: "Preparing Certificate",
        description: "Please wait while we generate your Registration Certificate...",
      });

      // Fetch full application details including latest status
      const response = await apiRequest("GET", `/api/applications/${appId}`);
      const data = await response.json();

      if (!data || !data.application) {
        throw new Error("Could not retrieve application details");
      }

      // Generate PDF client-side
      generateCertificatePDF(data.application, "policy_heritage");

      toast({
        title: "Download Started",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error("RC Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="mb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isError) {
    return null;
  }

  const applications = data?.applications ?? [];
  if (applications.length === 0) {
    return (
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">Service Center</h2>
          <p className="text-sm text-muted-foreground">
            Renew or amend approved applications without starting from scratch.
          </p>
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="max-w-2xl space-y-4">
        <div className="mb-2">
          <h2 className="text-xl font-semibold">Service Center</h2>
          <p className="text-sm text-muted-foreground">
            Manage your approved homestay certificates
          </p>
        </div>

        {applications.map((application) => {
          const expiry = formatDate(application.certificateExpiryDate);
          const windowStart = formatDate(application.renewalWindowStart);
          const windowEnd = formatDate(application.renewalWindowEnd);
          const hasWindow = Boolean(windowStart && windowEnd);

          const activeRequestMessage = application.activeServiceRequest
            ? `Active request: ${application.activeServiceRequest.applicationKind
              .replace(/_/g, " ")
              .toUpperCase()} (${application.activeServiceRequest.status.replace(/_/g, " ")})`
            : "No pending service requests. Choose an action below to get started.";

          const actionDisabled = Boolean(application.activeServiceRequest);
          const renewDisabled = !application.canRenew || actionDisabled;
          const amendmentUnlocked = unlockedAmendments.has(application.id);

          return (
            <Card
              key={application.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="p-4">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{application.propertyName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {expiry ? `Expires ${expiry}` : "Certificate pending"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                    {application.applicationNumber}
                  </Badge>
                </div>

                {/* Compact room info */}
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="font-medium">🛏️ {application.totalRooms} rooms</span>
                  <span className="text-slate-400">|</span>
                  <span>{application.rooms.single}S · {application.rooms.double}D · {application.rooms.family}F</span>
                  {hasWindow && (
                    <>
                      <span className="text-slate-400">|</span>
                      <span className="text-xs">📅 Renewal: {windowStart} - {windowEnd}</span>
                    </>
                  )}
                </div>

                {/* Active request alert */}
                {application.activeServiceRequest && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-sm text-amber-700 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Active: {application.activeServiceRequest.applicationKind.replace(/_/g, " ")} ({application.activeServiceRequest.status.replace(/_/g, " ")})</span>
                  </div>
                )}

                {/* Show discard option for draft service requests */}
                {application.activeServiceRequest && application.activeServiceRequest.status === "draft" && (
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => setLocation(`/applications/new?draft=${application.activeServiceRequest!.id}`)}
                    >
                      ✏️ Resume Draft
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setDiscardTarget({
                        id: application.activeServiceRequest!.id,
                        kind: application.activeServiceRequest!.applicationKind,
                      })}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Discard
                    </Button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  {/* Renew button - always visible */}
                  <Button
                    disabled={renewDisabled}
                    size="sm"
                    className={cn(
                      "rounded-full bg-emerald-600 text-white hover:bg-emerald-700",
                      renewDisabled && "bg-muted text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {ACTION_EMOJIS.renew} Renew
                  </Button>

                  {/* Download RC - always visible */}
                  {/* Download RC - always visible */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleDownloadRC(application.id)}
                    disabled={downloadingId === application.id}
                  >
                    {downloadingId === application.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <span className="mr-1">{ACTION_EMOJIS.downloadRC}</span>
                    )}
                    {downloadingId === application.id ? "Generating..." : "Download RC"}
                  </Button>

                  {/* Amendment panel toggle */}
                  {!actionDisabled && (
                    <Button
                      variant={amendmentUnlocked ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-full ml-auto",
                        amendmentUnlocked && "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      )}
                      onClick={() => toggleAmendmentLock(application.id)}
                    >
                      {amendmentUnlocked ? "🔓 Lock Amendments" : "🔒 Unlock Amendments"}
                    </Button>
                  )}
                </div>

                {/* Amendment actions - only shown when unlocked */}
                {amendmentUnlocked && !actionDisabled && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 mt-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <span className="text-xs text-amber-700 font-medium mr-2">⚠️ Amendment Actions:</span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!application.canAddRooms}
                      className="rounded-full text-xs border-blue-200 hover:bg-blue-50"
                      onClick={() => setActionConfirm({ type: "add_rooms", appId: application.id, rooms: application.rooms })}
                    >
                      {ACTION_EMOJIS.addRooms} Add Rooms
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!application.canDeleteRooms}
                      className="rounded-full text-xs border-orange-200 hover:bg-orange-50"
                      onClick={() => setActionConfirm({ type: "delete_rooms", appId: application.id, rooms: application.rooms })}
                    >
                      {ACTION_EMOJIS.deleteRooms} Delete Rooms
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs border-purple-200 hover:bg-purple-50"
                      onClick={() => setActionConfirm({ type: "change_category", appId: application.id })}
                    >
                      {ACTION_EMOJIS.changeCategory} Change Category
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs border-indigo-200 hover:bg-indigo-50"
                      onClick={() => setActionConfirm({ type: "change_ownership", appId: application.id })}
                    >
                      {ACTION_EMOJIS.changeOwnership} Change Ownership
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => setActionConfirm({ type: "cancel_certificate", appId: application.id })}
                    >
                      {ACTION_EMOJIS.cancelCertificate} Cancel Certificate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Room Delta Modal */}
      {roomModalState && (
        <RoomDeltaModal
          open={roomModalState.open}
          onOpenChange={(open) => !open && closeRoomModal()}
          mode={roomModalState.mode}
          parentApplicationId={roomModalState.parentId}
          currentRooms={roomModalState.currentRooms}
          onSuccess={handleRoomModalSuccess}
        />
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionConfirm} onOpenChange={(open) => !open && setActionConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionConfirm?.type === "add_rooms" && "Add Rooms to Certificate?"}
              {actionConfirm?.type === "delete_rooms" && "Delete Rooms from Certificate?"}
              {actionConfirm?.type === "change_category" && "Change Property Category?"}
              {actionConfirm?.type === "change_ownership" && "Transfer Property Ownership?"}
              {actionConfirm?.type === "cancel_certificate" && "Cancel Your Certificate?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionConfirm?.type === "add_rooms" && "This will start a new request to add rooms to your certificate. You can cancel anytime before final submission."}
              {actionConfirm?.type === "delete_rooms" && "This will start a request to remove rooms from your certificate. This action requires approval."}
              {actionConfirm?.type === "change_category" && "This will start a request to change your property category. Your certificate details will be updated upon approval."}
              {actionConfirm?.type === "change_ownership" && "This will start a request to transfer ownership. You will need to upload proof of transfer (Sale Deed/Gift Deed)."}
              {actionConfirm?.type === "cancel_certificate" && "⚠️ WARNING: This will permanently cancel your certificate. This action cannot be undone easily."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!actionConfirm) return;
                if (actionConfirm.type === "add_rooms" && actionConfirm.rooms) {
                  openRoomModal("add_rooms", actionConfirm.appId, actionConfirm.rooms);
                } else if (actionConfirm.type === "delete_rooms" && actionConfirm.rooms) {
                  openRoomModal("delete_rooms", actionConfirm.appId, actionConfirm.rooms);
                } else if (actionConfirm.type === "change_category") {
                  setLocation(`/applications/service-request?type=change_category&parentId=${actionConfirm.appId}`);
                } else if (actionConfirm.type === "change_ownership") {
                  setLocation(`/applications/service-request?type=change_ownership&parentId=${actionConfirm.appId}`);
                } else if (actionConfirm.type === "cancel_certificate") {
                  setLocation(`/applications/service-request?type=cancel_certificate&parentId=${actionConfirm.appId}`);
                }
                setActionConfirm(null);
              }}
              className={actionConfirm?.type === "cancel_certificate" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionConfirm?.type === "cancel_certificate" ? "Yes, Cancel Certificate" : "Proceed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={!!discardTarget} onOpenChange={(open) => !open && setDiscardTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Service Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your{" "}
              <strong>{discardTarget?.kind.replace(/_/g, " ")}</strong> draft.
              You can start a new service request after discarding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => discardTarget && discardDraftMutation.mutate(discardTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={discardDraftMutation.isPending}
            >
              {discardDraftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Discard Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
