import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, AlertTriangle, Sparkles } from "lucide-react";
import {
    GENDER_OPTIONS,
    OWNERSHIP_LABELS,
    type ApplicationForm,
} from "@/lib/application-schema";

interface Step2OwnerInfoProps {
    form: UseFormReturn<ApplicationForm>;
    ownerGender: "male" | "female" | "other" | undefined;
    propertyOwnership: "owned" | "leased" | undefined;
    goToProfile: () => void;
    renderProfileManagedDescription: (fieldLabel?: string) => JSX.Element;
}

export function Step2OwnerInfo({
    form,
    ownerGender,
    propertyOwnership,
    goToProfile,
}: Step2OwnerInfoProps) {
    return (
        <Card className="shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
                {/* Profile Managed Alert */}
                <div className="m-6 mb-0 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">Profile-managed details</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Name, contact and Aadhaar information come from your verified profile. Update them via{" "}
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-blue-700 font-semibold underline"
                                    onClick={goToProfile}
                                >
                                    My Profile
                                </Button>{" "}
                                before starting the application.
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
                            <FormField
                                control={form.control}
                                name="ownerFirstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">First Name <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                className="h-11 bg-gray-50 cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerLastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Last Name <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                className="h-11 bg-gray-50 cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Owner Full Name (auto-filled)</label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                className="h-11 bg-gray-50 cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Generated from first and last name</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="guardianName"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Father's / Husband's Name <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="As per Aadhaar card"
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Required for registration certificate</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ownerGender"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Gender (affects registration fee)</label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {GENDER_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-400">Female owners receive 5% fee discount</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerAadhaar"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Aadhaar Number <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                className="h-11 bg-gray-50 cursor-not-allowed font-mono"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name="ownerMobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Mobile Number <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                className="h-11 bg-gray-50 cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Email <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                readOnly
                                                type="email"
                                                className="h-11 bg-gray-50 cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Managed via profile</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        <FormField
                            control={form.control}
                            name="propertyOwnership"
                            render={({ field }) => (
                                <FormItem>
                                    <label className="text-xs text-gray-500">Property Ownership <span className="text-red-500">*</span></label>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex gap-4 mt-2"
                                        >
                                            <div
                                                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 ${field.value === "owned"
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                onClick={() => field.onChange("owned")}
                                            >
                                                <RadioGroupItem value="owned" id="owned" />
                                                <label htmlFor="owned" className="cursor-pointer">
                                                    <p className="font-medium">Owned</p>
                                                    <p className="text-xs text-gray-500">Property is under your name</p>
                                                </label>
                                            </div>
                                            <div
                                                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 ${field.value === "leased"
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                onClick={() => field.onChange("leased")}
                                            >
                                                <RadioGroupItem value="leased" id="leased" />
                                                <label htmlFor="leased" className="cursor-pointer">
                                                    <p className="font-medium">{OWNERSHIP_LABELS.leased}</p>
                                                    <p className="text-xs text-gray-500">Property on lease deed</p>
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Lease Warning */}
                        {propertyOwnership === "leased" && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
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
                        {ownerGender === "female" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
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
    );
}
