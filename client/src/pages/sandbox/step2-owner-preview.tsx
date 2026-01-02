import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, CreditCard, Check, Info, AlertTriangle, Sparkles } from "lucide-react";

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

interface OwnerFormData {
    firstName: string;
    lastName: string;
    guardianName: string;
    gender: string;
    mobile: string;
    email: string;
    aadhaar: string;
    propertyOwnership: "owned" | "leased" | "";
}

export default function Step2OwnerPreview() {
    const [formData, setFormData] = useState<OwnerFormData>({
        firstName: "Ramesh",
        lastName: "Sharma",
        guardianName: "",
        gender: "",
        mobile: "9876543210",
        email: "ramesh.sharma@example.com",
        aadhaar: "123412341234",
        propertyOwnership: "",
    });

    const updateField = (field: keyof OwnerFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const isFormValid =
        formData.firstName.length >= 2 &&
        formData.lastName.length >= 2 &&
        formData.guardianName.length >= 3 &&
        formData.gender &&
        formData.mobile.length === 10 &&
        formData.email.includes("@") &&
        formData.aadhaar.length === 12 &&
        formData.propertyOwnership === "owned";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">Step 2: Owner Information</h1>
                    <p className="text-slate-500">Sandbox Preview - Details of the property owner</p>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        {/* Profile Managed Alert */}
                        <div className="m-6 mb-0 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Profile-managed details</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Name, contact and Aadhaar information come from your verified profile.
                                        Update them via <span className="font-semibold">My Profile</span> before starting the application.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 1: Personal Information */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                                    <div>
                                        <h2 className="font-semibold">Personal Information</h2>
                                        <p className="text-sm text-white/70">Owner's name and identity details</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">First Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.firstName}
                                            readOnly
                                            className="h-11 bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Last Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.lastName}
                                            readOnly
                                            className="h-11 bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Owner Full Name (auto-filled)</Label>
                                        <Input
                                            value={fullName}
                                            readOnly
                                            className="h-11 bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400">Generated from first and last name</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Father's / Husband's Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="As per Aadhaar card"
                                            value={formData.guardianName}
                                            onChange={(e) => updateField("guardianName", e.target.value)}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-gray-400">Required for registration certificate</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Gender (affects registration fee)</Label>
                                        <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GENDER_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-400">Female owners receive 5% additional fee discount</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Aadhaar Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.aadhaar}
                                            readOnly
                                            className="h-11 bg-gray-50 cursor-not-allowed font-mono"
                                        />
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Details */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                                    <div>
                                        <h2 className="font-semibold">Contact Details</h2>
                                        <p className="text-sm text-white/70">Mobile and email for communication</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Mobile Number <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                value={formData.mobile}
                                                readOnly
                                                className="h-11 pl-10 bg-gray-50 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Email <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                value={formData.email}
                                                readOnly
                                                className="h-11 pl-10 bg-gray-50 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Property Ownership */}
                        <div>
                            <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                                    <div>
                                        <h2 className="font-semibold">Property Ownership</h2>
                                        <p className="text-sm text-white/70">Ownership status verification</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-500">Property Ownership <span className="text-red-500">*</span></Label>
                                    <RadioGroup
                                        value={formData.propertyOwnership}
                                        onValueChange={(v) => updateField("propertyOwnership", v)}
                                        className="flex gap-6"
                                    >
                                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.propertyOwnership === "owned"
                                            ? "border-primary bg-primary/5"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}>
                                            <RadioGroupItem value="owned" id="owned" />
                                            <label htmlFor="owned" className="cursor-pointer">
                                                <p className="font-medium">Owned</p>
                                                <p className="text-xs text-gray-500">Property is under your name</p>
                                            </label>
                                        </div>
                                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.propertyOwnership === "leased"
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}>
                                            <RadioGroupItem value="leased" id="leased" />
                                            <label htmlFor="leased" className="cursor-pointer">
                                                <p className="font-medium">Leased / Rented</p>
                                                <p className="text-xs text-gray-500">Property on lease deed</p>
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Lease Warning */}
                                {formData.propertyOwnership === "leased" && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-orange-800">Lease Deed Applications Not Accepted</p>
                                                <p className="text-xs text-orange-700 mt-1">
                                                    The tourism department currently processes homestay registrations only for properties under clear ownership.
                                                    Applications submitted on lease or sale deeds are not entertained.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Female Discount Banner */}
                                {formData.gender === "female" && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-700">Special Discount Eligible!</p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    As a female property owner, you qualify for an additional <strong>5% discount</strong> on registration fees.
                                                    This discount will be automatically applied to your final fee calculation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Bar */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-600" />
                                    <span className="text-sm font-medium">{fullName || "Owner Name"}</span>
                                </div>
                                {formData.gender && (
                                    <Badge variant="outline" className="capitalize">{formData.gender}</Badge>
                                )}
                                {formData.propertyOwnership === "owned" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Owned Property
                                    </Badge>
                                )}
                            </div>
                            <Button disabled={!isFormValid}>
                                Continue to Step 3
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Validation Info */}
                {!isFormValid && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-800">Complete all required fields</p>
                                <ul className="text-xs text-amber-600 mt-1 list-disc list-inside space-y-0.5">
                                    {!formData.guardianName && <li>Enter Father's/Husband's name</li>}
                                    {!formData.gender && <li>Select gender</li>}
                                    {formData.propertyOwnership !== "owned" && <li>Property must be owned (not leased)</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
