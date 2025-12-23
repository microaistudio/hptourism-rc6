import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileEdit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  CreditCard, Download, Copy, Mountain, Home, Camera, FileCheck, ScrollText,
  Building2, MapPin, ClipboardCheck, Zap
} from "lucide-react";
import type { User, HomestayApplication } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ServiceCenterPanel } from "@/components/dashboard/service-center";

// Service Type definition
type ServiceType = 'homestay' | 'adventure_sports';

type FilterType =
  | 'all'
  | 'homestay'
  | 'adventure_sports'
  | 'new_applications'
  | 'under_process'
  | 'completed'
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'sent_back'
  | 'payment_pending'
  | 'pending_review'
  | 'inspection';

const ownerProgressMilestones = [
  { id: "da_review", label: "With Dealing Assistant" },
  { id: "forwarded_dtdo", label: "Forwarded to DTDO" },
  { id: "inspection_scheduled", label: "Inspection Scheduled" },
  { id: "inspection_completed", label: "Inspection Completed" },
  { id: "payment_pending", label: "Payment Pending" },
  { id: "certificate", label: "Registration Approved" },
] as const;

const statusToMilestoneIndex: Record<string, number> = {
  draft: 0,
  paid_pending_submit: 0,
  submitted: 0,
  district_review: 0,
  under_scrutiny: 0,
  forwarded_to_dtdo: 1,
  sent_back_for_corrections: 0,
  reverted_to_applicant: 0,
  objection_raised: 1,
  state_review: 1,
  reverted_by_dtdo: 1,
  inspection_scheduled: 2,
  inspection_completed: 3,
  payment_pending: 4,
  verified_for_payment: 4,
  approved: 5,
  rejected: 5,
};

const progressSummaryMap: Record<string, string> = {
  draft: "Complete the draft to submit your application.",
  paid_pending_submit: "Payment received. Please confirm submission to proceed.",
  submitted: "Your application is with the Dealing Assistant for review.",
  district_review: "Your application is with the Dealing Assistant for review.",
  under_scrutiny: "Your application is being reviewed by the Dealing Assistant.",
  forwarded_to_dtdo: "Your application is with the DTDO for decision.",
  state_review: "Your application is with the DTDO for decision.",
  sent_back_for_corrections: "Action required: update the application with the requested corrections.",
  reverted_to_applicant: "Action required: update the application with the requested corrections.",
  objection_raised: "DTDO raised an objection. Please review and respond.",
  reverted_by_dtdo: "DTDO requested revisions — please review the remarks.",
  inspection_scheduled: "The inspection has been scheduled. Keep an eye on notifications.",
  inspection_completed: "Inspection finished. Awaiting final payment instructions.",
  payment_pending: "Complete the payment to receive your registration certificate.",
  verified_for_payment: "Payment verified — certificate will unlock shortly.",
  approved: "Certificate is ready for download.",
  rejected: "Application closed. Contact support for clarifications.",
};

const defaultProgressSummary = "We'll keep this tracker updated and notify you when action is needed.";

const getOwnerProgressState = (app: HomestayApplication) => {
  const status = app.status;
  let stageIndex = status ? statusToMilestoneIndex[status] ?? 0 : 0;
  if (app.siteInspectionCompletedDate) {
    stageIndex = Math.max(stageIndex, 3);
  } else if (app.siteInspectionScheduledDate) {
    stageIndex = Math.max(stageIndex, 2);
  }
  if (app.status === "payment_pending" || app.status === "verified_for_payment") {
    stageIndex = Math.max(stageIndex, 4);
  }
  if (app.approvedAt || app.status === "approved") {
    stageIndex = Math.max(stageIndex, 5);
  }
  const maxStageIndex = ownerProgressMilestones.length - 1;
  const boundedIndex = Math.min(Math.max(stageIndex, 0), maxStageIndex);
  const summary = (status && progressSummaryMap[status]) || defaultProgressSummary;

  return {
    stageIndex: boundedIndex,
    summary,
  };
};

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showReadinessDialog, setShowReadinessDialog] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const { data: userData, isLoading: userLoading, error } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: applicationsData, isLoading: appsLoading } = useQuery<{ applications: HomestayApplication[] }>({
    queryKey: ["/api/applications"],
    enabled: !!userData?.user,
  });

  const searchParams = useMemo(() => {
    const query = location.includes("?") ? location.split("?")[1] : "";
    return new URLSearchParams(query);
  }, [location]);

  const paymentQuery = searchParams.get("payment");
  const paymentApplicationId = searchParams.get("application");
  const paymentApplicationNumber = searchParams.get("appNo");
  const paymentSuccess = paymentQuery === "success" && !!paymentApplicationId;
  const paymentFailed = paymentQuery === "failed" && !!paymentApplicationId;

  const handleCopy = async (value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? null : current));
      }, 1500);
    } catch {
      setCopiedValue(null);
    }
  };

  useEffect(() => {
    if (paymentQuery) {
      const timer = window.setTimeout(() => {
        const pathOnly = location.split("?")[0];
        setLocation(pathOnly, { replace: true });
      }, 6000);
      return () => window.clearTimeout(timer);
    }
  }, [paymentQuery, location, setLocation]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (error || !userData?.user) {
    setTimeout(() => setLocation("/login"), 0);
    return (
      <div className="flex items-center justify-center p-8">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const user = userData.user;
  const applications = applicationsData?.applications || [];

  // Helper to get application type safety
  const getAppType = (app: HomestayApplication): ServiceType => {
    if (app.applicationType === 'adventure_sports') return 'adventure_sports';
    return 'homestay';
  };

  const filteredApplications = (() => {
    switch (activeFilter) {
      case 'homestay':
        return applications.filter(a => getAppType(a) === 'homestay');
      case 'adventure_sports':
        return applications.filter(a => getAppType(a) === 'adventure_sports');
      case 'new_applications':
        return applications.filter(a => ['draft', 'paid_pending_submit', 'submitted'].includes(a.status || ''));
      case 'under_process':
        return applications.filter(a => ['under_scrutiny', 'forwarded_to_dtdo', 'inspection_scheduled', 'inspection_completed'].includes(a.status || ''));
      case 'completed':
        return applications.filter(a => ['approved', 'rejected'].includes(a.status || ''));
      case 'draft':
        return applications.filter(a => a.status === 'draft');
      case 'pending':
        return applications.filter(a => ['submitted', 'district_review'].includes(a.status || ''));
      case 'approved':
        return applications.filter(a => a.status === 'approved');
      case 'sent_back':
        return applications.filter(a => ['sent_back_for_corrections', 'reverted_to_applicant', 'reverted_by_dtdo'].includes(a.status || ''));
      case 'all':
      default:
        return applications;
    }
  })();

  const stats = {
    total: applications.length,
    homestay: applications.filter(a => getAppType(a) === 'homestay').length,
    adventure: applications.filter(a => getAppType(a) === 'adventure_sports').length,
    draft: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    paymentPending: applications.filter(a => a.status === 'payment_pending' || a.status === 'verified_for_payment').length,
    inspectionScheduled: applications.filter(a => a.status === 'inspection_scheduled').length,
    sentBack: applications.filter(a => a.status === 'sent_back_for_corrections' || a.status === 'reverted_to_applicant' || a.status === 'reverted_by_dtdo').length,
    underProcess: applications.filter(a => ['under_scrutiny', 'forwarded_to_dtdo', 'inspection_scheduled', 'inspection_completed'].includes(a.status || '')).length,
    newApps: applications.filter(a => ['draft', 'paid_pending_submit', 'submitted'].includes(a.status || '')).length,
    resubmitted: applications.filter(a => a.status === 'submitted' && a.resubmittedCount && a.resubmittedCount > 0).length
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "warning", label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      submitted: { variant: "secondary", label: "Submitted" },
      district_review: { variant: "secondary", label: "District Review" },
      state_review: { variant: "secondary", label: "State Review" },
      sent_back_for_corrections: { variant: "warning", label: "Sent Back" },
      reverted_to_applicant: { variant: "warning", label: "Reverted by DA" },
      reverted_by_dtdo: { variant: "warning", label: "Reverted by DTDO" },
      objection_raised: { variant: "warning", label: "DTDO Objection" },
      inspection_scheduled: { variant: "secondary", label: "Inspection Scheduled" },
      inspection_completed: { variant: "secondary", label: "Inspection Completed" },
      payment_pending: { variant: "secondary", label: "Payment Pending" },
      verified_for_payment: { variant: "secondary", label: "Payment Verified" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Alerts for Payment/Success/Failure */}
        {paymentSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle>Payment Successful</AlertTitle>
            <AlertDescription>Application {paymentApplicationNumber || paymentApplicationId} approved. Certificate ready.</AlertDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setLocation(`/applications/${paymentApplicationId}`)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </Alert>
        )}

        {paymentFailed && (
          <Alert className="mb-6 border-destructive/40 bg-red-50">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>
                We could not confirm the payment for application {paymentApplicationNumber || paymentApplicationId}.
                Please try again or contact support with your HimKosh reference ID.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {user.role === 'property_owner' && <ServiceCenterPanel />}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Manage your applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            {user.role === 'property_owner' && (
              <Button
                variant="secondary"
                onClick={() => setLocation("/existing-owner")}
                data-testid="button-existing-rc-registration"
              >
                Existing RC Registration
              </Button>
            )}
            {user.role === 'property_owner' && (
              <Button onClick={() => setShowReadinessDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> New Application
              </Button>
            )}
          </div>
        </div>

        {/* Action Alerts */}
        {stats.paymentPending > 0 && user.role === 'property_owner' && (
          <div className="mb-6 p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Payment Pending</h3>
                <p className="text-sm text-green-700">You have {stats.paymentPending} application(s) ready for payment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - New Design with Color-Coded Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className={cn(
              "cursor-pointer hover:shadow-md transition shadow-sm border-l-4 border-l-emerald-500",
              activeFilter === 'new_applications' && "ring-2 ring-emerald-500"
            )}
            onClick={() => setActiveFilter('new_applications')}
          >
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">New Applications</div>
              <div className="text-3xl font-bold text-foreground">{stats.newApps}</div>
              <div className="text-xs text-muted-foreground mt-1">Drafts: {stats.draft} • Submitted: {stats.submitted}</div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer hover:shadow-md transition shadow-sm border-l-4 border-l-blue-500",
              activeFilter === 'under_process' && "ring-2 ring-blue-500"
            )}
            onClick={() => setActiveFilter('under_process')}
          >
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Under Process</div>
              <div className="text-3xl font-bold text-foreground">{stats.underProcess}</div>
              <div className="text-xs text-muted-foreground mt-1">Inspections: {stats.inspectionScheduled} • Payment pending: {stats.paymentPending}</div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer hover:shadow-md transition shadow-sm border-l-4 border-l-orange-500 bg-orange-50/30",
              activeFilter === 'sent_back' && "ring-2 ring-orange-500"
            )}
            onClick={() => setActiveFilter('sent_back')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Pending / Corrections</div>
                {stats.sentBack > 0 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
              </div>
              <div className="text-3xl font-bold text-orange-900">{stats.sentBack}</div>
              <div className="text-xs text-orange-700/70 mt-1">Sent back: {stats.sentBack} • Resubmitted: {stats.resubmitted}</div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer hover:shadow-md transition shadow-sm border-l-4 border-l-gray-300",
              activeFilter === 'completed' && "ring-2 ring-gray-400"
            )}
            onClick={() => setActiveFilter('completed')}
          >
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</div>
              <div className="text-3xl font-bold text-foreground">{stats.approved + stats.rejected}</div>
              <div className="text-xs text-muted-foreground mt-1">Approved: {stats.approved} • Rejected: {stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Application Progress Timeline - Shows current stage */}
        {applications.length > 0 && (() => {
          const primaryApp = applications.find(a => a.status !== 'approved' && a.status !== 'rejected') || applications[0];
          if (!primaryApp) return null;
          const progress = getOwnerProgressState(primaryApp);
          return (
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Application Status</CardTitle>
                    <CardDescription>{primaryApp.propertyName || 'Your Application'} • {primaryApp.applicationNumber || 'DRAFT'}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (primaryApp.status === 'draft') {
                        setLocation(`/applications/new?draft=${primaryApp.id}`);
                      } else {
                        setLocation(`/applications/${primaryApp.id}`);
                      }
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Timeline */}
                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    {ownerProgressMilestones.map((milestone, idx) => {
                      const isCompleted = idx <= progress.stageIndex;
                      const isConnectorComplete = idx < progress.stageIndex;
                      const isLast = idx === ownerProgressMilestones.length - 1;
                      const isCurrent = idx === progress.stageIndex;

                      return (
                        <div key={milestone.id} className="flex items-center flex-1">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all shrink-0",
                              isCompleted
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(34,197,94,0.15)]"
                                : "border-muted-foreground/30 bg-background text-muted-foreground"
                            )}
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "h-[3px] flex-1 rounded-full transition-all mx-1",
                                isConnectorComplete
                                  ? "bg-gradient-to-r from-emerald-300 to-emerald-500"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="mt-3 grid gap-2 text-center text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      gridTemplateColumns: `repeat(${ownerProgressMilestones.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {ownerProgressMilestones.map((milestone, idx) => (
                      <span
                        key={`${milestone.id}-label`}
                        className={cn(
                          "leading-tight",
                          idx <= progress.stageIndex ? "text-emerald-600" : "text-muted-foreground"
                        )}
                      >
                        {milestone.label}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{progress.summary}</p>
              </CardContent>
            </Card>
          );
        })()}

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applications</CardTitle>
                <CardDescription>
                  {activeFilter === 'all' ? 'All your applications' : `Viewing ${activeFilter.replace('_', ' ')} applications`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications found matching this filter.</p>
                {user.role === 'property_owner' && activeFilter === 'all' && (
                  <Button variant="link" onClick={() => setShowServiceSelection(true)} className="mt-2">
                    Start a new application
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const progress = getOwnerProgressState(app);
                  return (
                    <div key={app.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition cursor-pointer gap-4"
                      onClick={() => {
                        // Navigate based on type
                        if (getAppType(app) === 'adventure_sports') {
                          if (app.status === 'draft') {
                            setLocation(`/adventure-sports/register?id=${app.id}`);
                          } else {
                            setLocation(`/adventure-sports/applications/${app.id}`);
                          }
                        } else {
                          if (app.status === 'draft') {
                            setLocation(`/applications/new?draft=${app.id}`);
                          } else {
                            setLocation(`/applications/${app.id}`);
                          }
                        }
                      }}>
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg mt-1", getAppType(app) === 'homestay' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
                          {getAppType(app) === 'homestay' ? <Home className="h-5 w-5" /> : <Mountain className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-lg">{app.propertyName || 'Untitled Application'}</h4>
                            {getStatusBadge(app.status || 'draft')}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <span>#{app.applicationNumber || 'DRAFT'}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="capitalize">{getAppType(app).replace('_', ' ')}</span>
                            {app.district && (
                              <>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.district}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 md:hidden">
                            {progress.summary}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2 md:w-1/3">
                        <span className="text-sm text-muted-foreground hidden md:block text-right">
                          {progress.summary}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(app.updatedAt || app.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Selection Dialog */}
        <Dialog open={showServiceSelection} onOpenChange={setShowServiceSelection}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Application</DialogTitle>
              <DialogDescription>
                Select the type of service you want to register for.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div
                className="cursor-pointer border rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition text-center space-y-2 group"
                onClick={() => {
                  setShowServiceSelection(false);
                  setShowReadinessDialog(true);
                }}
              >
                <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto group-hover:bg-emerald-200 transition">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="font-medium">Homestay</h3>
                <p className="text-xs text-muted-foreground">Register B&B / Homestay</p>
              </div>

              <div
                className="cursor-pointer border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition text-center space-y-2 group"
                onClick={() => {
                  setShowServiceSelection(false);
                  setLocation("/adventure-sports/register");
                }}
              >
                <div className="h-12 w-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition">
                  <Mountain className="h-6 w-6" />
                </div>
                <h3 className="font-medium">Adventure Sports</h3>
                <p className="text-xs text-muted-foreground">Water, Air & Land Sports</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Readiness Check Dialog - Enhanced Version */}
        <Dialog open={showReadinessDialog} onOpenChange={setShowReadinessDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  Before You Begin
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-base mt-2">
                  Please ensure you have all required documents ready before starting your homestay registration.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Tip */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Pro Tip</p>
                  <p className="text-sm text-blue-700">
                    Having all documents ready will help you complete the application in one session (approx. 15-20 minutes).
                  </p>
                </div>
              </div>

              {/* Photo Requirements - Prominent */}
              <div className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-900">Property Photographs</h3>
                    <p className="text-amber-800 mt-1">
                      Upload <span className="font-bold text-amber-950">minimum 2</span> and up to <span className="font-bold text-amber-950">10 best photographs</span> of your property.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['External views', 'Rooms', 'Bathrooms', 'Common areas', 'Surroundings'].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents - Clean List */}
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2 mb-4">
                  <ScrollText className="w-5 h-5 text-muted-foreground" />
                  Required Documents
                  <span className="text-xs font-normal text-muted-foreground">(All Categories)</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { title: "Revenue Papers / Property Documents", desc: "Ownership proof (Jamabandi, Registry, etc.)" },
                    { title: "Affidavit (Section 29)", desc: "Self-declaration as per tourism rules" },
                    { title: "Undertaking (Form-C)", desc: "Compliance declaration form" }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">{doc.desc}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold/Diamond Category - Required for those categories */}
              <div className="border rounded-xl overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100">
                  <h3 className="font-bold text-base text-yellow-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Additional for Gold & Diamond Category
                    <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">Required</span>
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">These documents are mandatory if applying for Gold or Diamond category.</p>
                </div>
                <div className="p-4 space-y-3 bg-yellow-50/30">
                  {[
                    { title: "Commercial Electricity Bill", desc: "Recent utility bill under commercial connection" },
                    { title: "Commercial Water Bill", desc: "Recent water connection bill" }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-yellow-100">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4 text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Details Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" />
                  You'll also need to provide:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Property address with PIN",
                    "Owner Aadhaar number",
                    "Number of rooms & rates",
                    "GPS coordinates (optional)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReadinessDialog(false)}
                className="flex-1 h-12 text-base"
              >
                I'll Come Back Later
              </Button>
              <Button
                onClick={() => {
                  setShowReadinessDialog(false);
                  setLocation("/applications/new");
                }}
                className="flex-1 h-12 text-base bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                I Have All Documents Ready
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
