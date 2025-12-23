import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Home, ChevronRight } from "lucide-react";

// Comparison of original cluttered form vs cleaned up version
export default function FormCleanupPreview() {
    const [showClean, setShowClean] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Property Details Form Cleanup</h1>
                        <p className="text-muted-foreground">
                            Comparison: Original (cluttered) vs Cleaned (readable)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={!showClean ? "default" : "outline"}
                            onClick={() => setShowClean(false)}
                        >
                            Original
                        </Button>
                        <Button
                            variant={showClean ? "default" : "outline"}
                            onClick={() => setShowClean(true)}
                        >
                            Cleaned Up
                        </Button>
                    </div>
                </div>

                {!showClean ? (
                    /* ORIGINAL - Cluttered Version */
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Home className="w-5 h-5 text-emerald-600" />
                                Property Details
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Basic information about your homestay property
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Homestay Name <span className="text-red-500">*</span></Label>
                                    <Input placeholder="e.g., Himalayan View Homestay" className="h-10" />
                                    <p className="text-xs text-muted-foreground">Choose a memorable name for your homestay</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">New Registration <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="New Homestay Registration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New Homestay Registration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Submit a fresh homestay registration.</p>
                                </div>
                            </div>

                            {/* Row 2 - State/District/Tehsil */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">State</Label>
                                    <Input value="Himachal Pradesh" disabled className="h-10 bg-gray-50" />
                                    <p className="text-xs text-muted-foreground">Portal currently supports Himachal Pradesh only.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">District <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select district" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shimla">Shimla</SelectItem>
                                            <SelectItem value="kullu">Kullu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Select your district first</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Tehsil <span className="text-red-500">*</span></Label>
                                    <Select disabled>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select tehsil" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shimla">Shimla</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Select tehsil after district</p>
                                </div>
                            </div>

                            {/* Row 3 - Location Type */}
                            <div className="space-y-1.5">
                                <Label className="text-sm">Location Type (affects registration fee) <span className="text-red-500">*</span></Label>
                                <Select>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Municipal Corporation / Municipal Council" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mc">Municipal Corporation / Municipal Council</SelectItem>
                                        <SelectItem value="rural">Rural (Gram Panchayat)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Rural (GP) or Urban (MC/TCP) - Required for fee calculation</p>
                            </div>

                            {/* Row 4 - City/Zone */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Enter City/Town (MC/Council) <span className="text-red-500">*</span></Label>
                                    <Input placeholder="e.g., Shimla, Theog" className="h-10" />
                                    <p className="text-xs text-muted-foreground">Required for Municipal Corporation or Council applicants.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Ward / Zone (optional)</Label>
                                    <Input placeholder="Ward number or zone" className="h-10" />
                                    <p className="text-xs text-muted-foreground">Provide the ward or zone if assigned by the urban body.</p>
                                </div>
                            </div>

                            {/* Row 5 - Address */}
                            <div className="space-y-1.5">
                                <Label className="text-sm">House/Building Number, Street & Locality <span className="text-red-500">*</span></Label>
                                <Input placeholder="e.g., House No. 123, Main Road, Near Post Office" className="h-10" />
                            </div>

                            <p className="text-center text-red-500 font-medium pt-4">
                                ⚠️ Notice how cluttered this looks with all the tiny helper text
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    /* CLEANED UP Version */
                    <Card className="shadow-sm">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Home className="w-5 h-5 text-emerald-600" />
                                </div>
                                Property Details
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Basic information about your homestay property
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Row 1 - Larger inputs, no helper text */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Homestay Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g., Himalayan View Homestay"
                                        className="h-12 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Registration Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="New Homestay Registration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New Homestay Registration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 2 - State/District/Tehsil - Clean */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">State</Label>
                                    <Input
                                        value="Himachal Pradesh"
                                        disabled
                                        className="h-12 text-base bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        District <span className="text-red-500">*</span>
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Select district" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shimla">Shimla</SelectItem>
                                            <SelectItem value="kullu">Kullu</SelectItem>
                                            <SelectItem value="kangra">Kangra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Tehsil <span className="text-red-500">*</span>
                                    </Label>
                                    <Select disabled>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Select tehsil" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shimla">Shimla</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 3 - Location Type - Clean with inline hint */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">
                                    Location Type <span className="text-red-500">*</span>
                                    <span className="font-normal text-muted-foreground ml-2">(affects fee)</span>
                                </Label>
                                <Select>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Select location type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mc">Municipal Corporation / Municipal Council</SelectItem>
                                        <SelectItem value="rural">Rural (Gram Panchayat)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Row 4 - City/Zone - Clean */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        City / Town <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g., Shimla, Theog"
                                        className="h-12 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Ward / Zone <span className="text-muted-foreground font-normal">(optional)</span>
                                    </Label>
                                    <Input
                                        placeholder="Ward number or zone"
                                        className="h-12 text-base"
                                    />
                                </div>
                            </div>

                            {/* Row 5 - Address - Clean */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">
                                    Full Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="House No., Street, Locality, Near..."
                                    className="h-12 text-base"
                                />
                            </div>

                            <p className="text-center text-emerald-600 font-medium pt-4">
                                ✓ Cleaner! Larger text, no redundant helper descriptions
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Summary of changes */}
                <div className="mt-8 p-6 bg-white rounded-xl border">
                    <h3 className="font-bold mb-4">Cleanup Summary:</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-red-600 mb-2">❌ Before (Issues)</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Small `text-sm` labels</li>
                                <li>• Tiny `text-xs` helper text under every field</li>
                                <li>• Redundant explanations (e.g., "Select tehsil after district")</li>
                                <li>• `h-10` input height (40px)</li>
                                <li>• Cluttered appearance</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-emerald-600 mb-2">✓ After (Cleaned)</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Larger `text-base` labels with `font-medium`</li>
                                <li>• No helper text (self-explanatory fields)</li>
                                <li>• Optional notes inline with label</li>
                                <li>• `h-12` input height (48px)</li>
                                <li>• Clean, breathable layout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
