import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  FileText,
  User,
  MapPin,
  Home as HomeIcon,
  ClipboardCheck,
  AlertTriangle,
  Shield,
  Ruler,
  Banknote,
  Copy,
  ZoomIn,
  Download,
  Award,
  Pencil,
  Save,
  X,
  ExternalLink,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { HomestayApplication, Document as HomestayDocument } from "@shared/schema";
import { buildObjectViewUrl } from "@/lib/utils";
import { ApplicationTimelineCard } from "@/components/application/application-timeline-card";
import { InspectionReportCard } from "@/components/application/inspection-report-card";
import { generateCertificatePDF, type CertificateFormat } from "@/lib/certificateGenerator";
import { fetchInspectionReportSummary } from "@/lib/inspection-report";

interface ApplicationData {
  application: HomestayApplication;
  owner: {
    fullName: string;
    mobile: string;
    email?: string;
  };
  documents: HomestayDocument[];
  daInfo?: {
    fullName: string;
    mobile: string;
  };
  correctionHistory?: Array<{
    id: string;
    createdAt: string;
    feedback?: string | null;
  }>;
}

interface DealingAssistant {
  id: string;
  fullName: string;
  mobile: string;
}

// Generate time slots for inspection scheduling
const generateTimeSlots = (startHour = 8, endHour = 19) => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      if (hour === endHour && minute > 45) continue;
      const labelHour = String(hour).padStart(2, "0");
      const labelMinute = String(minute).padStart(2, "0");
      slots.push(`${labelHour}:${labelMinute}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots(8, 19);

const formatTimeLabel = (slot: string) => {
  const [hour, minute] = slot.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return format(date, "h:mm a");
};

const combineDateAndTime = (date: Date, time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hour, minute, 0, 0);
  return combined;
};

const formatCorrectionTimestamp = (value?: string | null) => {
  if (!value) return "No resubmission yet";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "No resubmission yet" : format(parsed, "PPP p");
};

export default function DTDOApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [actionType, setActionType] = useState<'accept' | 'reject' | 'revert' | 'approve-cancellation' | 'approve-bypass' | null>(null);
  const [remarks, setRemarks] = useState("");
  const [previewDoc, setPreviewDoc] = useState<HomestayDocument | null>(null);
  const [copied, setCopied] = useState(false);

  // Certificate generation state
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateFormat, setCertificateFormat] = useState<CertificateFormat>("policy_heritage");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<HomestayApplication>>({});
  const [correctionReason, setCorrectionReason] = useState("");

  // Legacy RC: optional inspection (default: no inspection)
  const [requireInspection, setRequireInspection] = useState(false);

  // Inline inspection scheduling state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[8] ?? "10:00");
  const [assignedDA, setAssignedDA] = useState("");

  const { data, isLoading } = useQuery<ApplicationData>({
    queryKey: ["/api/dtdo/applications", id],
  });

  // Fetch available DAs for scheduling
  const { data: dasData } = useQuery<{ das: DealingAssistant[] }>({
    queryKey: ["/api/dtdo/available-das"],
    enabled: actionType === 'accept', // Only fetch when Accept dialog is open
  });

  const { data: settings } = useQuery<{ inspectionConfig: { optionalKinds: string[] } }>({
    queryKey: ["/api/settings/public"],
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, remarks, inspectionDate, assignedTo }: {
      action: string;
      remarks: string;
      inspectionDate?: string;
      assignedTo?: string;
    }) => {
      const response = await apiRequest("POST", `/api/dtdo/applications/${id}/${action}`, {
        remarks,
        inspectionDate,
        assignedTo,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dtdo/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dtdo/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", id, "timeline"] });

      if (variables.action === 'accept') {
        toast({
          title: "Inspection Scheduled",
          description: "Application accepted and inspection has been scheduled successfully.",
        });
      } else {
        toast({
          title: "Success",
          description: "Application processed successfully",
        });
      }

      // Always redirect to queue (scheduling is now inline)
      setLocation("/dtdo/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process application",
        variant: "destructive",
      });
    },
  });

  // DTDO can correct approved application fields (with audit trail)
  const correctionMutation = useMutation({
    mutationFn: async ({ corrections, reason }: { corrections: Partial<HomestayApplication>; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/dtdo/applications/${id}/correct`, {
        corrections,
        reason
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to apply corrections");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dtdo/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", id, "timeline"] });
      toast({
        title: "Corrections Applied",
        description: data.message || "Application details corrected successfully",
      });
      setIsEditMode(false);
      setEditedFields({});
      setCorrectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Correction Failed",
        description: error.message || "Failed to apply corrections",
        variant: "destructive",
      });
    },
  });

  const application = data?.application;
  const owner = data?.owner;
  const documents = data?.documents ?? [];
  const daInfo = data?.daInfo;
  const correctionHistory = data?.correctionHistory ?? [];
  const correctionCount = application?.correctionSubmissionCount ?? 0;
  const lastCorrection = correctionHistory[0];

  // Detect Legacy RC applications (Existing RC onboarding)
  const isLegacyRC = application?.applicationNumber?.startsWith('LG-HS-') ?? false;

  const documentStats = useMemo(() => {
    const counts = { pending: 0, verified: 0, needsCorrection: 0, rejected: 0 };
    for (const doc of documents) {
      const status = (doc.verificationStatus || "pending").toLowerCase();
      if (status === "verified") counts.verified += 1;
      else if (status === "needs_correction") counts.needsCorrection += 1;
      else if (status === "rejected") counts.rejected += 1;
      else counts.pending += 1;
    }
    return counts;
  }, [documents]);

  const roomSummary = useMemo(() => {
    const app = application;
    if (!app) {
      return [
        { label: "Single Rooms", value: 0, rate: undefined },
        { label: "Double Rooms", value: 0, rate: undefined },
        { label: "Family Suites", value: 0, rate: undefined },
      ];
    }
    return [
      {
        label: "Single Rooms",
        value: app.singleBedRooms ?? 0,
        rate: app.singleBedRoomRate,
      },
      {
        label: "Double Rooms",
        value: app.doubleBedRooms ?? 0,
        rate: app.doubleBedRoomRate,
      },
      {
        label: "Family Suites",
        value: app.familySuites ?? 0,
        rate: app.familySuiteRate,
      },
    ];
  }, [application]);

  const amenities = (application?.amenities as Record<string, boolean>) || {};
  const safetyChecks = {
    cctv: amenities.cctv ?? false,
    fireSafety: amenities.fireSafety ?? false,
    powerBackup: amenities.generator ?? false,
    parking: amenities.parking ?? false,
  };

  if (isLoading || !application || !owner) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <div className="text-muted-foreground">Application not found</div>
          )}
        </div>
      </div>
    );
  }
  const applicationStatus = application.status ?? "forwarded_to_dtdo";
  const daRemarks = (application as unknown as { daRemarks?: string | null }).daRemarks ?? null;
  const actionableStatuses = new Set(["forwarded_to_dtdo", "dtdo_review"]);
  const isActionableStatus = actionableStatuses.has(applicationStatus);
  const formattedStatus = applicationStatus.replace(/_/g, " ").replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  );
  const copyApplicationNumber = async () => {
    try {
      await navigator.clipboard.writeText(application.applicationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Application number copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy application number",
        variant: "destructive",
      });
    }
  };

  const documentUrl = (doc: HomestayDocument) =>
    (doc as unknown as { fileUrl?: string }).fileUrl ||
    buildObjectViewUrl(doc.filePath, {
      fileName: doc.fileName,
      mimeType: doc.mimeType,
    });

  const handleAction = (action: 'accept' | 'reject' | 'revert' | 'approve-cancellation' | 'approve-bypass') => {
    setActionType(action);
    setRemarks("");
    // Reset scheduling fields when opening accept dialog
    if (action === 'accept') {
      setSelectedDate(undefined);
      setSelectedTime(TIME_SLOTS[8] ?? "10:00");
      setAssignedDA("");
    }
  };

  const actionRequiresRemarks = (action: typeof actionType) =>
    action === 'accept' || action === 'reject' || action === 'revert' || action === 'approve-cancellation' || action === 'approve-bypass';

  // Calculate minimum selectable date for scheduling (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const minSelectableDate = tomorrow;

  const availableDAs = dasData?.das || [];

  const confirmAction = () => {
    if (!actionType) return;

    if (actionRequiresRemarks(actionType) && !remarks.trim()) {
      const context =
        actionType === 'accept'
          ? 'scheduling the inspection'
          : actionType === 'approve-cancellation'
            ? 'cancellation approval'
            : actionType === 'reject'
              ? 'rejection'
              : 'reverting';
      toast({
        title: "Remarks Required",
        description: `Please provide remarks for ${context}.`,
        variant: "destructive",
      });
      return;
    }

    // For accept action, validate scheduling fields
    if (actionType === 'accept') {
      if (!selectedDate) {
        toast({
          title: "Date Required",
          description: "Please select an inspection date.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedTime) {
        toast({
          title: "Time Required",
          description: "Please select an inspection time.",
          variant: "destructive",
        });
        return;
      }
      if (!assignedDA) {
        toast({
          title: "DA Required",
          description: "Please assign a Dealing Assistant.",
          variant: "destructive",
        });
        return;
      }

      // Combine date and time and validate it's in the future
      const combinedDate = combineDateAndTime(selectedDate, selectedTime);
      if (combinedDate < new Date()) {
        toast({
          title: "Invalid Date",
          description: "Inspection date must be in the future.",
          variant: "destructive",
        });
        return;
      }

      // Include scheduling data in the mutation
      actionMutation.mutate({
        action: actionType,
        remarks: remarks.trim(),
        inspectionDate: combinedDate.toISOString(),
        assignedTo: assignedDA,
      });
    } else {
      actionMutation.mutate({ action: actionType, remarks: remarks.trim() });
    }
  };

  // Certificate download function
  const handleDownloadCertificate = async () => {
    if (!application) return;
    setIsGeneratingCertificate(true);
    try {
      generateCertificatePDF(application, certificateFormat);
      toast({
        title: "Certificate Downloaded",
        description: "RC certificate has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unable to prepare certificate right now.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Edit mode handlers
  const handleEditField = (field: keyof HomestayApplication, value: string | number) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdits = () => {
    if (Object.keys(editedFields).length === 0) {
      toast({
        title: "No Changes",
        description: "No fields have been modified.",
        variant: "destructive",
      });
      return;
    }

    if (correctionReason.trim().length < 10) {
      toast({
        title: "Reason Required",
        description: "Please provide a correction reason (minimum 10 characters)",
        variant: "destructive",
      });
      return;
    }

    correctionMutation.mutate({
      corrections: editedFields,
      reason: correctionReason.trim()
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedFields({});
    setCorrectionReason("");
  };

  // Get display value (edited or original)
  const getFieldValue = <K extends keyof HomestayApplication>(field: K): HomestayApplication[K] | undefined => {
    if (field in editedFields) {
      return editedFields[field] as HomestayApplication[K];
    }
    return application?.[field];
  };

  // Check if certificate can be downloaded (application is approved/completed)
  const canDownloadCertificate = application?.certificateNumber &&
    ["approved", "certificate_issued", "completed", "active"].some(s =>
      application?.status?.includes(s) || application?.certificateNumber
    );

  const getCategoryBadge = (category: string) => {
    const colorMap: Record<string, string> = {
      diamond: "bg-purple-50 text-purple-700 dark:bg-purple-950/20",
      gold: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20",
      silver: "bg-gray-50 text-gray-700 dark:bg-gray-950/20",
    };
    return (
      <Badge variant="outline" className={colorMap[category.toLowerCase()] || ""}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      forwarded_to_dtdo: {
        label: "Forwarded by DA",
        className: "bg-blue-50 text-blue-700 dark:bg-blue-950/20",
      },
      dtdo_review: {
        label: "Under Review",
        className: "bg-orange-50 text-orange-700 dark:bg-orange-950/20",
      },
    };

    const config = statusConfig[status] || { label: status, className: "" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dtdo/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application Review</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span>{application.applicationNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={copyApplicationNumber}
                title="Copy application number"
              >
                <Copy className={`h-4 w-4 ${copied ? "text-green-600" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {getCategoryBadge(application.category)}
          {getStatusBadge(applicationStatus)}
        </div>
      </div>

      {/* DA Remarks Card */}
      {(daRemarks || daInfo) && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <ClipboardCheck className="h-5 w-5" />
              DA Scrutiny Report
            </CardTitle>
            {daInfo && (
              <CardDescription>
                Forwarded by {daInfo.fullName} ({daInfo.mobile})
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
              <p className="text-sm whitespace-pre-wrap">
                {daRemarks || "No remarks provided"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Application Details */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="property">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="property" data-testid="tab-property">Property</TabsTrigger>
              <TabsTrigger value="owner" data-testid="tab-owner">Owner</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="property" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    Property Snapshot
                  </CardTitle>
                  <CardDescription>Key facts captured during owner onboarding</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <DetailRow label="Property Name" value={application.propertyName} />
                  <DetailRow label="Category" value={application.category.toUpperCase()} />
                  <DetailRow label="Total Rooms" value={String(application.totalRooms ?? "N/A")} />
                  <DetailRow label="Application Kind" value={application.applicationKind?.replace(/_/g, " ") ?? "New"} />
                  <DetailRow label="Address" value={application.address} />
                  <DetailRow label="District / Tehsil" value={`${application.district} • ${application.tehsil ?? "N/A"}`} />
                  <DetailRow label="Pincode" value={application.pincode} />
                  <DetailRow label="Legacy RC / Guardian" value={(application as any).parentCertificateNumber || (application as any).guardianName || "N/A"} />
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      Room Mix & Tariffs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2">Type</th>
                          <th className="py-2">Rooms</th>
                          <th className="py-2 text-right">Tariff / Night</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomSummary.map((row) => (
                          <tr key={row.label} className="border-t">
                            <td className="py-2">{row.label}</td>
                            <td className="py-2">{row.value}</td>
                            <td className="py-2 text-right">{formatCurrency(row.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Fee & Discount Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <SummaryRow label="Base Fee" value={formatCurrency(application.baseFee)} />
                    <SummaryRow label="Female Owner Discount" value={formatCurrency(application.femaleOwnerDiscount)} />
                    <SummaryRow label="Pangi Concession" value={formatCurrency(application.pangiDiscount)} />
                    <SummaryRow label="Multi-year Discount" value={formatCurrency(application.validityDiscount)} />
                    <SummaryRow label="Total Discount" value={formatCurrency(application.totalDiscount)} />
                    <div className="border-t pt-2 text-right text-base font-semibold">
                      Payable: {formatCurrency(application.totalFee)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Correction Tracking
                    </CardTitle>
                    <CardDescription>Owner acknowledgement before resubmission</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailRow label="Corrections Used" value={`${correctionCount}`} />
                    <DetailRow
                      label="Owner Confirmation"
                      value={formatCorrectionTimestamp(lastCorrection?.createdAt)}
                    />
                    {lastCorrection?.feedback && (
                      <p className="text-xs text-muted-foreground rounded-lg border bg-muted/30 p-3">
                        {lastCorrection.feedback}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Safety & Amenities
                    </CardTitle>
                    <CardDescription>Availability as declared by the owner</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm">
                    <TagRow label="CCTV Coverage" enabled={safetyChecks.cctv} />
                    <TagRow label="Fire Safety Equipment" enabled={safetyChecks.fireSafety} />
                    <TagRow label="Power Backup" enabled={safetyChecks.powerBackup} />
                    <TagRow label="On-site Parking" enabled={safetyChecks.parking} />
                    <DetailRow label="Nearest Hospital" value={application.nearestHospital ?? "N/A"} />
                    <DetailRow label="Additional Notes" value={application.fireEquipmentDetails || application.serviceNotes || "N/A"} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailRow label="Latitude" value={application.latitude || "N/A"} />
                    <DetailRow label="Longitude" value={application.longitude || "N/A"} />
                    <DetailRow label="Distance to Airport" value={formatDistance(application.distanceAirport)} />
                    <DetailRow label="Distance to Railway" value={formatDistance(application.distanceRailway)} />
                    <DetailRow label="Distance to City Center" value={formatDistance(application.distanceCityCenter)} />
                    <DetailRow label="Distance to Bus Stand" value={formatDistance(application.distanceBusStand)} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="owner" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Owner & Guardian Details
                  </CardTitle>
                  <CardDescription>Verify identity before inspection scheduling</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <DetailRow label="Full Name" value={owner.fullName} />
                  <DetailRow label="Gender" value={application.ownerGender?.toUpperCase()} />
                  <DetailRow label="Mobile" value={owner.mobile} />
                  <DetailRow label="Email" value={owner.email || "N/A"} />
                  <DetailRow label="Guardian / Father" value={(application as any).guardianName || "N/A"} />
                  <DetailRow label="Aadhaar" value={application.ownerAadhaar} />
                  <DetailRow label="Ownership" value={(application.propertyOwnership || "").replace(/_/g, " ") || "N/A"} />
                  <DetailRow label="Alternate Phone" value={(application as any).alternatePhone || "N/A"} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Uploaded Documents
                  </CardTitle>
                  <CardDescription>
                    {documents.length} uploaded • {documentStats.verified} verified by DA · {documentStats.pending} pending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No documents uploaded
                      </p>
                    ) : (
                      documents.map((doc) => {
                        const statusMeta = getDocumentStatusMeta(doc.verificationStatus);
                        const trimmedNotes =
                          typeof doc.verificationNotes === "string" && doc.verificationNotes.trim().length > 0
                            ? doc.verificationNotes.trim()
                            : "";
                        return (
                          <div
                            key={doc.id}
                            className="p-3 border rounded-xl bg-card/50 shadow-xs flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">{formatDocumentType(doc.documentType)}</div>
                                  <div className="text-xs text-muted-foreground">{doc.fileName}</div>
                                </div>
                              </div>
                              <StatusBadge status={doc.verificationStatus ?? "pending"} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewDoc(doc)}
                                data-testid={`button-preview-doc-${doc.id}`}
                              >
                                <ZoomIn className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(documentUrl(doc), "_blank")}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                            {trimmedNotes && (
                              <div
                                className={`rounded-lg border px-3 py-2 text-sm space-y-1 ${statusMeta?.noteBgClass ?? "bg-muted/30 border-border/60"
                                  }`}
                              >
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  DA Remarks
                                </div>
                                <p className={statusMeta?.noteTextClass ?? "text-muted-foreground"}>
                                  {trimmedNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Decision Panel */}
        <div className="space-y-4">
          {isActionableStatus ? (
            <Card>
              <CardHeader>
                <CardTitle>DTDO Decision</CardTitle>
                <CardDescription>Review and take action on this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">


                {application?.applicationKind === 'cancel_certificate' ? (
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleAction('approve-cancellation')}
                    disabled={actionMutation.isPending}
                    data-testid="button-approve-cancellation"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Cancellation (Revoke Certificate)
                  </Button>
                ) : isLegacyRC ? (
                  /* Legacy RC: Direct approval with optional inspection */
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                      <Checkbox
                        id="require-inspection"
                        checked={requireInspection}
                        onCheckedChange={(checked) => setRequireInspection(checked === true)}
                      />
                      <label
                        htmlFor="require-inspection"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Conduct inspection first
                      </label>
                    </div>

                    {requireInspection ? (
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => handleAction('accept')}
                        disabled={actionMutation.isPending}
                        data-testid="button-accept-legacy-inspection"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Schedule Inspection
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction('approve-bypass')}
                        disabled={actionMutation.isPending}
                        data-testid="button-approve-legacy-rc"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve RC Verification
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleAction('accept')}
                    disabled={actionMutation.isPending}
                    data-testid="button-accept"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept & Schedule Inspection
                  </Button>
                )}

                {/* Optional Inspection Bypass - only for non-Legacy RC apps */}
                {!isLegacyRC && settings?.inspectionConfig?.optionalKinds?.includes(application?.applicationKind || '') && (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => handleAction('approve-bypass')}
                    disabled={actionMutation.isPending}
                    data-testid="button-approve-bypass"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve (Skip Inspection)
                  </Button>
                )}

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleAction('revert')}
                  disabled={actionMutation.isPending}
                  data-testid="button-revert"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Revert to Applicant
                </Button>

                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  disabled={actionMutation.isPending}
                  data-testid="button-reject"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
                {application?.applicationKind === 'cancel_certificate' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Rejecting this request will restore the original certificate.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>DTDO Decision</CardTitle>
                <CardDescription>
                  Actions are disabled because this application is already {formattedStatus}.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Certificate Actions Card */}
          {canDownloadCertificate && (
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Award className="h-5 w-5" />
                  Registration Certificate
                </CardTitle>
                <CardDescription>
                  RC #: {application.certificateNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadCertificate}
                  disabled={isGeneratingCertificate}
                  data-testid="button-download-certificate"
                >
                  {isGeneratingCertificate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download RC Certificate
                    </>
                  )}
                </Button>

                {!isEditMode ? (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => setIsEditMode(true)}
                    data-testid="button-edit-details"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit RC Details
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Correction Form */}
                    <div className="space-y-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Editing Active RC
                      </div>

                      {/* Editable Fields */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">Property Name</Label>
                          <Input
                            value={getFieldValue('propertyName') ?? ''}
                            onChange={(e) => handleEditField('propertyName', e.target.value)}
                            placeholder="Property name"
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600">Guardian / Father's Name</Label>
                          <Input
                            value={(editedFields as any).guardianName ?? (application as any).guardianName ?? ''}
                            onChange={(e) => handleEditField('guardianName' as any, e.target.value)}
                            placeholder="Father's / Husband's name"
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600">Address</Label>
                          <Input
                            value={getFieldValue('address') ?? ''}
                            onChange={(e) => handleEditField('address', e.target.value)}
                            placeholder="Full address"
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600">Gender</Label>
                            <Select
                              value={getFieldValue('ownerGender') ?? ''}
                              onValueChange={(value) => handleEditField('ownerGender', value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Tehsil</Label>
                            <Input
                              value={getFieldValue('tehsil') ?? ''}
                              onChange={(e) => handleEditField('tehsil', e.target.value)}
                              placeholder="Tehsil"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600">Village / Gram Panchayat</Label>
                            <Input
                              value={(editedFields as any).gramPanchayat ?? (application as any).gramPanchayat ?? ''}
                              onChange={(e) => handleEditField('gramPanchayat' as any, e.target.value)}
                              placeholder="Village name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Urban Body</Label>
                            <Input
                              value={(editedFields as any).urbanBody ?? (application as any).urbanBody ?? ''}
                              onChange={(e) => handleEditField('urbanBody' as any, e.target.value)}
                              placeholder="MC/NAC name"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600">Pincode</Label>
                            <Input
                              value={getFieldValue('pincode') ?? ''}
                              onChange={(e) => handleEditField('pincode', e.target.value)}
                              placeholder="Pincode"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Alternate Phone</Label>
                            <Input
                              value={(editedFields as any).alternatePhone ?? (application as any).alternatePhone ?? ''}
                              onChange={(e) => handleEditField('alternatePhone' as any, e.target.value)}
                              placeholder="Alt. phone"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Correction Reason - REQUIRED */}
                      <div className="pt-2 border-t border-amber-200 dark:border-amber-700">
                        <Label className="text-xs text-gray-600 flex items-center gap-1">
                          Correction Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          value={correctionReason}
                          onChange={(e) => setCorrectionReason(e.target.value)}
                          placeholder="Explain why these corrections are needed (min. 10 characters)..."
                          className="text-sm resize-none"
                          rows={2}
                        />
                        {correctionReason.length > 0 && correctionReason.length < 10 && (
                          <p className="text-xs text-red-500 mt-1">
                            {10 - correctionReason.length} more characters needed
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={handleSaveEdits}
                        disabled={correctionMutation.isPending || Object.keys(editedFields).length === 0}
                        data-testid="button-save-edits"
                      >
                        {correctionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Corrections
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={correctionMutation.isPending}
                        data-testid="button-cancel-edit"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <InspectionReportCard applicationId={id} preferDtdoEndpoint />

          <ApplicationTimelineCard
            applicationId={id}
            description="Workflow trace covering DA scrutiny, DTDO actions, and owner resubmissions."
            preferDtdoEndpoint
          />
        </div>
      </div>


      {/* Action Dialog */}
      <Dialog open={actionType !== null} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className={actionType === 'accept' ? 'max-w-lg' : ''}>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' && 'Accept & Schedule Inspection'}
              {actionType === 'reject' && 'Reject Application'}
              {actionType === 'revert' && 'Revert to Applicant'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' && 'Schedule the site inspection and assign a Dealing Assistant.'}
              {actionType === 'reject' && 'This will permanently reject the application. Please provide rejection reason.'}
              {actionType === 'revert' && 'This will send the application back to the applicant for corrections. Please provide details.'}
              {actionType === 'approve-bypass' && 'This will approve the application immediately without an inspection field visit.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Remarks field (for all actions) */}
            <div className="space-y-2">
              <Label htmlFor="remarks">
                {actionType === 'accept'
                  ? 'Instructions for Inspection Team'
                  : 'Remarks (Required)'}
              </Label>
              <Textarea
                id="remarks"
                placeholder={
                  actionType === 'accept'
                    ? 'Share instructions or observations for the inspection team...'
                    : actionType === 'reject'
                      ? 'Please specify the reason for rejection...'
                      : actionType === 'approve-bypass'
                        ? 'Confirm approval without inspection...'
                        : 'Please specify what corrections are needed...'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                data-testid="textarea-remarks"
              />
            </div>

            {/* Scheduling fields for Accept action */}
            {actionType === 'accept' && (
              <>
                {/* Date & Time selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Inspection Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-[1fr,0.6fr]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                          data-testid="button-inspection-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < minSelectableDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                    >
                      <SelectTrigger data-testid="select-inspection-time">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {formatTimeLabel(slot)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Schedule starts from tomorrow. Time slots in 15-minute intervals.
                  </p>
                </div>

                {/* DA Assignment */}
                <div className="space-y-2">
                  <Label htmlFor="assignedDA" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assign Dealing Assistant <span className="text-destructive">*</span>
                  </Label>
                  <Select value={assignedDA} onValueChange={setAssignedDA}>
                    <SelectTrigger id="assignedDA" data-testid="select-da">
                      <SelectValue placeholder="Select a DA" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDAs.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No DAs available in this district
                        </div>
                      ) : (
                        availableDAs.map((da) => (
                          <SelectItem key={da.id} value={da.id}>
                            {da.fullName} - {da.mobile}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setActionType(null)}
              disabled={actionMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={
                actionMutation.isPending ||
                (actionRequiresRemarks(actionType) && !remarks.trim()) ||
                (actionType === 'accept' && (!selectedDate || !selectedTime || !assignedDA))
              }
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              data-testid="button-confirm-action"
            >
              {actionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === 'accept' ? 'Accept & Schedule' : actionType === 'approve-bypass' ? 'Confirm Approval' : actionType === 'reject' ? 'Confirm Rejection' : 'Confirm Revert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {formatDocumentType(previewDoc.documentType)}
                </DialogTitle>
                <DialogDescription className="flex items-center justify-between flex-wrap gap-2">
                  <span>{previewDoc.fileName}</span>
                  <StatusBadge status={previewDoc.verificationStatus ?? "pending"} />
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(documentUrl(previewDoc), "_blank", "noopener,noreferrer")}
                    title="Open in new tab for full view"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(documentUrl(previewDoc), "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-muted/30" style={{ height: 'calc(80vh - 180px)', minHeight: '500px' }}>
                  {previewDoc.mimeType?.startsWith("image/") ? (
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                      <img
                        src={documentUrl(previewDoc)}
                        alt={previewDoc.fileName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : previewDoc.mimeType?.includes("pdf") ? (
                    <iframe
                      src={documentUrl(previewDoc)}
                      className="w-full h-full"
                      title={previewDoc.fileName}
                    />
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 mb-4 opacity-50" />
                      <p>This file type is not previewable in the browser.</p>
                      <p className="text-xs mt-2">Click "Full View" or "Download" to view the file.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-right">{value || "N/A"}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function TagRow({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-green-100 text-green-700" : ""}>
        {enabled ? "Available" : "Missing"}
      </Badge>
    </div>
  );
}

type DocumentStatusMeta = {
  label: string;
  badgeClass: string;
  noteBgClass: string;
  noteTextClass: string;
};

const DOCUMENT_STATUS_META: Record<string, DocumentStatusMeta> = {
  pending: {
    label: "Pending review",
    badgeClass: "bg-slate-100 text-slate-700",
    noteBgClass: "bg-slate-50 border-slate-200",
    noteTextClass: "text-slate-800",
  },
  verified: {
    label: "Verified",
    badgeClass: "bg-emerald-50 text-emerald-700",
    noteBgClass: "bg-emerald-50 border-emerald-200",
    noteTextClass: "text-emerald-900",
  },
  needs_correction: {
    label: "Needs correction",
    badgeClass: "bg-amber-50 text-amber-800",
    noteBgClass: "bg-amber-50 border-amber-200",
    noteTextClass: "text-amber-900",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-rose-50 text-rose-700",
    noteBgClass: "bg-rose-50 border-rose-200",
    noteTextClass: "text-rose-900",
  },
};

const getDocumentStatusMeta = (status?: string | null): DocumentStatusMeta | null => {
  if (!status) return null;
  const normalized = status.toLowerCase();
  if (DOCUMENT_STATUS_META[normalized]) {
    return DOCUMENT_STATUS_META[normalized];
  }
  return {
    label: status.replace(/_/g, " "),
    badgeClass: "bg-muted text-muted-foreground",
    noteBgClass: "bg-muted/40 border-border/60",
    noteTextClass: "text-muted-foreground",
  };
};

function StatusBadge({ status }: { status: string }) {
  const meta = getDocumentStatusMeta(status) ?? DOCUMENT_STATUS_META.pending;
  return <Badge className={meta.badgeClass}>{meta.label}</Badge>;
}

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined) return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `₹${numeric.toLocaleString("en-IN")}`;
}

function formatDistance(value?: number | string | null) {
  if (value === null || value === undefined) return "Not provided";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Not provided";
  return `${numeric} km`;
}

function formatDocumentType(value?: string | null) {
  if (!value) return "Document";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
