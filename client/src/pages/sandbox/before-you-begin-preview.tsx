import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Camera, FileCheck, ScrollText, Building2, MapPin,
    ClipboardCheck, CheckCircle2, Zap, FileText, X
} from "lucide-react";

// Enhanced "Before You Begin" Dialog Component
function EnhancedReadinessDialog({
    open,
    onOpenChange,
    onProceed
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProceed: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                {
                                    title: "Revenue Papers / Property Documents",
                                    desc: "Ownership proof (Jamabandi, Registry, etc.)",
                                    icon: FileCheck
                                },
                                {
                                    title: "Affidavit (Section 29)",
                                    desc: "Self-declaration as per tourism rules",
                                    icon: FileText
                                },
                                {
                                    title: "Undertaking (Form-C)",
                                    desc: "Compliance declaration form",
                                    icon: FileText
                                }
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                        <doc.icon className="w-5 h-5 text-emerald-600" />
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
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 text-base"
                    >
                        I'll Come Back Later
                    </Button>
                    <Button
                        onClick={onProceed}
                        className="flex-1 h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        I Have All Documents Ready
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Preview Page
export default function BeforeYouBeginPreview() {
    const [, setLocation] = useLocation();
    const [showDialog, setShowDialog] = useState(true);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Enhanced "Before You Begin" Dialog</h1>
                    <p className="text-muted-foreground">
                        A refined version of the document readiness checklist with improved visual hierarchy and modern styling.
                    </p>
                </div>

                <Button onClick={() => setShowDialog(true)} className="mb-8">
                    Open Dialog
                </Button>

                <EnhancedReadinessDialog
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    onProceed={() => {
                        setShowDialog(false);
                        setLocation("/applications/new");
                    }}
                />

                {/* Comparison Notes */}
                <div className="mt-8 p-6 bg-muted/50 rounded-xl">
                    <h3 className="font-bold mb-4">Design Improvements:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>✓ Gradient header with cleaner visual hierarchy</li>
                        <li>✓ Pro tip section to set expectations</li>
                        <li>✓ Photo requirements with visual tags</li>
                        <li>✓ Cleaner document list with icons</li>
                        <li>✓ Collapsible Gold/Diamond section with "Optional" badge</li>
                        <li>✓ Grid layout for property details</li>
                        <li>✓ Larger, more prominent action buttons</li>
                        <li>✓ Consistent spacing and rounded corners</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
