import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Building2, Check, Info } from "lucide-react";

// Sample Districts
const HP_DISTRICTS = [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu",
    "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
];

// Sample Tehsils (would be dynamic based on district)
const SAMPLE_TEHSILS: Record<string, string[]> = {
    "Shimla": ["Shimla Urban", "Shimla Rural", "Theog", "Rampur", "Rohru"],
    "Kullu": ["Kullu", "Manali", "Anni", "Banjar", "Nirmand"],
    "Kangra": ["Dharamshala", "Palampur", "Kangra", "Nurpur", "Dehra"],
    "Mandi": ["Mandi", "Sundernagar", "Joginder Nagar", "Chachyot", "Karsog"],
};

const LOCATION_TYPES = [
    { value: "gp", label: "Gram Panchayat (Rural)", description: "Lower registration fees" },
    { value: "mc", label: "Municipal Corporation (Urban)", description: "Higher registration fees" },
    { value: "tcp", label: "Town & Country Planning Area", description: "Standard fees apply" },
];

const PROJECT_TYPES = [
    { value: "new", label: "New Homestay Registration" },
    { value: "renewal", label: "Renewal of Existing Registration" },
];

interface PropertyFormData {
    propertyName: string;
    projectType: string;
    district: string;
    tehsil: string;
    locationType: string;
    gramPanchayat: string;
    urbanBody: string;
    ward: string;
    address: string;
    pincode: string;
    telephone: string;
}

export default function Step1PropertyPreview() {
    const [formData, setFormData] = useState<PropertyFormData>({
        propertyName: "",
        projectType: "",
        district: "",
        tehsil: "",
        locationType: "",
        gramPanchayat: "",
        urbanBody: "",
        ward: "",
        address: "",
        pincode: "17",
        telephone: "",
    });

    const updateField = (field: keyof PropertyFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const availableTehsils = formData.district ? (SAMPLE_TEHSILS[formData.district] || ["Other"]) : [];

    const isFormValid =
        formData.propertyName.length >= 3 &&
        formData.projectType &&
        formData.district &&
        formData.tehsil &&
        formData.locationType &&
        formData.address.length >= 10 &&
        formData.pincode.length === 6;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">Step 1: Property Details</h1>
                    <p className="text-slate-500">Sandbox Preview - Basic information about your homestay property</p>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        {/* Section 1: Basic Information */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                                    <div>
                                        <h2 className="font-semibold">Basic Information</h2>
                                        <p className="text-sm text-white/70">Property name and registration type</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Homestay Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="e.g., Himalayan View Homestay"
                                            value={formData.propertyName}
                                            onChange={(e) => updateField("propertyName", e.target.value)}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-gray-400">Choose a memorable name for your homestay</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Registration Type <span className="text-red-500">*</span></Label>
                                        <Select value={formData.projectType} onValueChange={(v) => updateField("projectType", v)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select registration type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PROJECT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location Hierarchy */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                                    <div>
                                        <h2 className="font-semibold">Location Hierarchy</h2>
                                        <p className="text-sm text-white/70">State, District, and Tehsil selection</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">State</Label>
                                        <Input value="Himachal Pradesh" readOnly className="h-11 bg-gray-50" />
                                        <p className="text-xs text-gray-400">Portal supports HP only</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">District <span className="text-red-500">*</span></Label>
                                        <Select value={formData.district} onValueChange={(v) => {
                                            updateField("district", v);
                                            updateField("tehsil", "");
                                        }}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select district" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HP_DISTRICTS.map(d => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Tehsil <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.tehsil}
                                            onValueChange={(v) => updateField("tehsil", v)}
                                            disabled={!formData.district}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select tehsil" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTehsils.map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                                <SelectItem value="__other">Other (Manual Entry)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Location Type Cards */}
                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs text-gray-500">Location Type <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {LOCATION_TYPES.map(type => (
                                            <div
                                                key={type.value}
                                                onClick={() => updateField("locationType", type.value)}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.locationType === type.value
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm">{type.label}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                                    </div>
                                                    {formData.locationType === type.value && (
                                                        <Check className="w-5 h-5 text-primary" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Conditional: Rural or Urban fields */}
                                {formData.locationType === "gp" && (
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-xs text-gray-500">Gram Panchayat / Village <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="Enter village or Gram Panchayat name"
                                            value={formData.gramPanchayat}
                                            onChange={(e) => updateField("gramPanchayat", e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                )}

                                {(formData.locationType === "mc" || formData.locationType === "tcp") && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-500">
                                                {formData.locationType === "mc" ? "Municipal Corporation" : "TCP Area"} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                placeholder={formData.locationType === "mc" ? "e.g., Shimla MC" : "e.g., Manali Planning Area"}
                                                value={formData.urbanBody}
                                                onChange={(e) => updateField("urbanBody", e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-500">Ward / Zone (Optional)</Label>
                                            <Input
                                                placeholder="Ward number or zone"
                                                value={formData.ward}
                                                onChange={(e) => updateField("ward", e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Address Details */}
                        <div>
                            <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                                    <div>
                                        <h2 className="font-semibold">Address Details</h2>
                                        <p className="text-sm text-white/70">Complete postal address and PIN code</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-500">House/Building Number, Street & Locality <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="e.g., House No. 123, Main Road, Near Post Office"
                                        value={formData.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        className="min-h-20"
                                    />
                                    <p className="text-xs text-gray-400">Specific address details with landmarks</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">PIN Code <span className="text-red-500">*</span></Label>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-md border bg-gray-50 px-3 py-2.5 font-mono text-sm text-gray-500">
                                                17-
                                            </span>
                                            <Input
                                                placeholder="Last 4 digits"
                                                value={formData.pincode.slice(2)}
                                                onChange={(e) => {
                                                    const suffix = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    updateField("pincode", "17" + suffix);
                                                }}
                                                className="h-11 font-mono"
                                                maxLength={4}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">Prefix 17 is fixed—enter the last 4 digits</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Telephone (Optional)</Label>
                                        <Input
                                            placeholder="Landline number"
                                            value={formData.telephone}
                                            onChange={(e) => updateField("telephone", e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
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
                                    <Home className="w-5 h-5 text-slate-600" />
                                    <span className="text-sm font-medium">{formData.propertyName || "Unnamed Property"}</span>
                                </div>
                                {formData.district && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {formData.district}
                                    </Badge>
                                )}
                                {formData.locationType && (
                                    <Badge variant="secondary">
                                        {formData.locationType === "gp" ? "Rural" : "Urban"}
                                    </Badge>
                                )}
                            </div>
                            <Button disabled={!isFormValid}>
                                Continue to Step 2
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
                                <p className="text-xs text-amber-600 mt-1">
                                    Fill in property name, registration type, location details, address, and PIN code to proceed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
