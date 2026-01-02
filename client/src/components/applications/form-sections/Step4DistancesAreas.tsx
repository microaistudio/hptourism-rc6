import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { normalizeOptionalFloat, type ApplicationForm } from "@/lib/application-schema";
import {
    Plane,
    Train,
    Building2,
    ShoppingBag,
    Bus,
    Car,
    Check,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Trash2,
    MapPin,
    Shield,
    Sparkles,
    Info,
    Lock,
    Sofa,
    UtensilsCrossed,
    Hospital,
    Leaf
} from "lucide-react";

const DISTANCE_FIELDS = [
    { key: "distanceAirport" as const, label: "Airport", icon: Plane },
    { key: "distanceRailway" as const, label: "Railway Station", icon: Train },
    { key: "distanceCityCenter" as const, label: "City Centre", icon: Building2 },
    { key: "distanceShopping" as const, label: "Shopping Centre", icon: ShoppingBag },
    { key: "distanceBusStand" as const, label: "Bus Stand", icon: Bus },
];

// Annexure-III Mandatory Checklist - Exact 18 items
// Items 1, 2, 7 are auto-verified from the application process
export const ANNEXURE_III_MANDATORY = [
    { id: "1", label: "Application Form (ANNEXURE-I) complete", autoCheck: true, autoReason: "Auto-verified from application" },
    { id: "2", label: "Documents list (ANNEXURE-II) uploaded", autoCheck: true, autoReason: "Auto-verified from documents" },
    { id: "3", label: "Online payment facility (UPI, Net, Debit/Credit Card) + cash option in low-connectivity areas", autoCheck: false },
    { id: "4", label: "Well maintained and well equipped house and guest rooms with quality carpets/rugs/tiles/marble flooring, furniture, fittings", autoCheck: false },
    { id: "5", label: "All rooms clean, airy, pest free, without dampness, with outside window/ventilation", autoCheck: false },
    { id: "6", label: "Comfortable bed with good quality linen & bedding", autoCheck: false },
    { id: "7", label: "Adherence to minimum room and bathroom size in sq. ft.", autoCheck: true, autoReason: "Auto-verified from room configuration" },
    { id: "8", label: "Well maintained smoke free, clean, hygienic, odour free, pest free kitchen", autoCheck: false },
    { id: "9", label: "Good quality cutlery and crockery", autoCheck: false },
    { id: "10", label: "RO/Aqua Guard water facility", autoCheck: false },
    { id: "11", label: "Garbage disposal as per Municipal/applicable laws", autoCheck: false },
    { id: "12", label: "Energy Saving Lighting (CFL/LED) in guest rooms and public areas", autoCheck: false },
    { id: "13", label: "Visitor book and feedback facilities", autoCheck: false },
    { id: "14", label: "Name, address and telephone number of doctors", autoCheck: false },
    { id: "15", label: "Facilities for assisting tourists with forgotten/left back luggage", autoCheck: false },
    { id: "16", label: "Basic fire equipments", autoCheck: false },
    { id: "17", label: "Register (physical or electronic) for guest check-in/out with passport details for foreign tourists", autoCheck: false },
    { id: "18", label: "CCTVs in common areas", autoCheck: false },
];

// Annexure-III Desirable (Optional) Facilities - 18 items
export const OPTIONAL_FACILITIES = [
    { id: "1", label: "Sufficient parking with adequate road width" },
    { id: "2", label: "Attached private bathroom with toiletries" },
    { id: "3", label: "WC toilet with seat, lid, toilet paper" },
    { id: "4", label: "Running hot & cold water with proper sewerage" },
    { id: "5", label: "Water saving taps/shower" },
    { id: "6", label: "Dining area serving Authentic Himachali Food" },
    { id: "7", label: "Wardrobe with at least 4 clothes hangers" },
    { id: "8", label: "Shelves or drawer space" },
    { id: "9", label: "Good quality chairs, working table, furniture" },
    { id: "10", label: "Washing Machines/dryers or laundry/dry cleaning arrangements" },
    { id: "11", label: "Refrigerator" },
    { id: "12", label: "Lounge or seating in lobby" },
    { id: "13", label: "Heating and cooling in enclosed public rooms" },
    { id: "14", label: "Luggage assistance on request" },
    { id: "15", label: "Safekeeping facilities in room" },
    { id: "16", label: "Security guard" },
    { id: "17", label: "Vernacular Architecture & Himachali Handicrafts" },
    { id: "18", label: "Rainwater harvesting system" },
    { id: "19", label: "Accessible / Differently abled friendly" },
    { id: "20", label: "Senior Citizen Friendly" },
];

interface Step4DistancesAreasProps {
    form: UseFormReturn<ApplicationForm>;
    selectedAttractions: Record<string, boolean>;
    setSelectedAttractions: Dispatch<SetStateAction<Record<string, boolean>>>;
    mandatoryChecks: Record<string, boolean>;
    setMandatoryChecks: Dispatch<SetStateAction<Record<string, boolean>>>;
}

interface NearbyAttraction {
    id: string;
    description: string;
}

// Export for parent component validation
export const MANDATORY_CHECKLIST_COUNT = ANNEXURE_III_MANDATORY.length;
export const getMandatoryAutoChecked = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    ANNEXURE_III_MANDATORY.forEach(item => {
        if (item.autoCheck) {
            initial[item.id] = true;
        }
    });
    return initial;
};

export function Step4DistancesAreas({
    form,
    selectedAttractions,
    setSelectedAttractions,
    mandatoryChecks,
    setMandatoryChecks
}: Step4DistancesAreasProps) {
    const [optionalChecks, setOptionalChecks] = useState<Record<string, boolean>>({});
    const [nearbyAttractions, setNearbyAttractions] = useState<NearbyAttraction[]>([
        { id: "1", description: "" }
    ]);

    // Hydrate optional checks: prefer JSONB checklist, fallback to text parsing
    useEffect(() => {
        const storedChecklist = form.getValues("desirableChecklist");
        if (storedChecklist && Object.keys(storedChecklist).length > 0) {
            setOptionalChecks(storedChecklist);
            return;
        }

        // Fallback: Parse text strings for backward compatibility
        const ecoVal = form.getValues("ecoFriendlyFacilities") || "";
        const diffVal = form.getValues("differentlyAbledFacilities") || "";
        const allText = (ecoVal + "," + diffVal).toLowerCase();

        const initialChecks: Record<string, boolean> = {};
        OPTIONAL_FACILITIES.forEach(fac => {
            if (allText.includes(fac.label.toLowerCase())) {
                initialChecks[fac.id] = true;
            }
        });
        setOptionalChecks(initialChecks);
    }, [form]); // Only run on mount/form reset

    const handleCheckboxChange = (facilityId: string, checked: boolean) => {
        const newChecks = { ...optionalChecks, [facilityId]: checked };
        setOptionalChecks(newChecks);

        // 1. Save structured data for ALL optional facilities
        form.setValue("desirableChecklist", newChecks, { shouldDirty: true });

        // Auto-population of text fields is removed to prevent duplication.
        // Users can manually add details if they wish.
    };

    // Public area values (Annexure-I #6e)
    const [publicAreas, setPublicAreas] = useState({
        lobbyArea: "",
        diningArea: "",
        parkingCapacity: "",
    });

    const mandatoryCount = Object.values(mandatoryChecks).filter(Boolean).length;
    const optionalCount = Object.values(optionalChecks).filter(Boolean).length;
    const allMandatoryChecked = ANNEXURE_III_MANDATORY.every(f => mandatoryChecks[f.id]);
    // Fix: Ensure we don't crash if mandatoryChecks is missing keys
    const manualItemsCount = ANNEXURE_III_MANDATORY.filter(f => !f.autoCheck).length;
    const manualCheckedCount = ANNEXURE_III_MANDATORY.filter(f => !f.autoCheck && mandatoryChecks[f.id]).length;

    const addAttraction = () => {
        if (nearbyAttractions.length < 5) {
            setNearbyAttractions([...nearbyAttractions, { id: Date.now().toString(), description: "" }]);
        }
    };

    // Hydrate public areas from form values
    useEffect(() => {
        const lobby = form.getValues("lobbyArea");
        const dining = form.getValues("diningArea");
        const parking = form.getValues("parkingArea");
        setPublicAreas({
            lobbyArea: lobby ? String(lobby) : "",
            diningArea: dining ? String(dining) : "",
            parkingCapacity: parking || "",
        });
    }, [form]);

    // Persist public areas to form fields
    useEffect(() => {
        const lobbyNum = publicAreas.lobbyArea ? parseFloat(publicAreas.lobbyArea) : undefined;
        const diningNum = publicAreas.diningArea ? parseFloat(publicAreas.diningArea) : undefined;

        form.setValue("lobbyArea", lobbyNum, { shouldDirty: true });
        form.setValue("diningArea", diningNum, { shouldDirty: true });
        form.setValue("parkingArea", publicAreas.parkingCapacity, { shouldDirty: true });
    }, [publicAreas, form]);

    const removeAttraction = (id: string) => {
        if (nearbyAttractions.length > 1) {
            setNearbyAttractions(nearbyAttractions.filter(a => a.id !== id));
        }
    };

    const updateAttraction = (id: string, description: string) => {
        setNearbyAttractions(nearbyAttractions.map(a => a.id === id ? { ...a, description } : a));
    };

    return (
        <Tabs defaultValue="mandatory" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/80 rounded-xl">
                <TabsTrigger
                    value="mandatory"
                    className="group data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-3 rounded-lg transition-all duration-300 font-bold flex gap-2 border border-transparent data-[state=active]:border-gray-200"
                >
                    <div className={`p-1 rounded-full ${allMandatoryChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600 group-data-[state=active]:bg-indigo-600 group-data-[state=active]:text-white'}`}>
                        {allMandatoryChecked ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    Mandatory Checklist
                    {allMandatoryChecked && <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">Complete</Badge>}
                </TabsTrigger>
                <TabsTrigger
                    value="optional"
                    className="group data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-3 rounded-lg transition-all duration-300 font-bold flex gap-2 border border-transparent data-[state=active]:border-gray-200"
                >
                    <div className="p-1 rounded-full bg-amber-100 text-amber-600 group-data-[state=active]:bg-amber-500 group-data-[state=active]:text-white">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    Property Details (Optional)
                </TabsTrigger>
            </TabsList>

            {/* TAB 1: MANDATORY CHECKLIST */}
            <TabsContent value="mandatory" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Card className={`shadow-lg overflow-hidden rounded-xl border transition-colors duration-500 ${allMandatoryChecked ? 'border-emerald-300' : 'border-indigo-200'}`}>
                    <CardContent className="p-0">
                        {/* Section 3: Mandatory Checklist */}
                        <div className="border-b transition-colors duration-500">
                            <div className={`bg-gradient-to-r px-6 py-5 text-white transition-all duration-500 ${allMandatoryChecked ? 'from-emerald-600 to-emerald-500' : 'from-indigo-600 to-violet-600'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner backdrop-blur-sm">
                                        {allMandatoryChecked ? <CheckCircle2 className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="font-bold text-lg flex items-center gap-2">
                                                    Mandatory Checklist
                                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                                                        Annexure-III
                                                    </Badge>
                                                </h2>
                                                <p className="text-sm text-white/80 font-medium mt-0.5">
                                                    {allMandatoryChecked
                                                        ? "Great! All mandatory requirements are confirmed."
                                                        : "All 18 items must be confirmed to proceed."}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{mandatoryCount}<span className="text-lg text-white/60 font-medium">/18</span></div>
                                                <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Confirmed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Inspection Notice */}
                                <Alert className="bg-blue-50/50 border-blue-100">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-sm text-blue-800 flex items-center gap-2">
                                        <span className="font-semibold">Note:</span> These items will be physically verified during the departmental inspection.
                                    </AlertDescription>
                                </Alert>

                                {/* Auto-verified items - Premium Card Layout */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                    <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        Auto-Verified Items
                                        <span className="text-xs font-normal text-emerald-600 ml-auto">Verified automatically from your application</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {ANNEXURE_III_MANDATORY.filter(item => item.autoCheck).map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white border border-emerald-200 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm text-gray-800 font-medium leading-tight block">{item.label.split('(')[0].trim()}</span>
                                                </div>
                                                <Badge className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold">AUTO</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Manual items - Premium Section */}
                                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${manualCheckedCount === manualItemsCount ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                                                {manualCheckedCount === manualItemsCount
                                                    ? <Check className="w-4 h-4 text-white" />
                                                    : <span className="text-xs text-white font-bold">{manualCheckedCount}</span>
                                                }
                                            </div>
                                            <span>Facilities to Confirm</span>
                                            <Badge variant="outline" className={`ml-2 ${manualCheckedCount === manualItemsCount ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                                {manualCheckedCount}/{manualItemsCount}
                                            </Badge>
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-8 px-4 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 font-medium"
                                            onClick={() => {
                                                const allManualChecked = ANNEXURE_III_MANDATORY.filter(f => !f.autoCheck).every(f => mandatoryChecks[f.id]);
                                                const newChecks: Record<string, boolean> = { ...mandatoryChecks };
                                                ANNEXURE_III_MANDATORY.filter(f => !f.autoCheck).forEach(item => {
                                                    newChecks[item.id] = !allManualChecked;
                                                });
                                                setMandatoryChecks(newChecks);
                                            }}
                                        >
                                            {manualCheckedCount === manualItemsCount ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ANNEXURE_III_MANDATORY.filter(item => !item.autoCheck).map(item => {
                                            const isChecked = mandatoryChecks[item.id];
                                            return (
                                                <label
                                                    key={item.id}
                                                    htmlFor={`mandatory-${item.id}`}
                                                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isChecked
                                                        ? "border-indigo-300 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-100"
                                                        : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        id={`mandatory-${item.id}`}
                                                        checked={isChecked || false}
                                                        onCheckedChange={(checked) =>
                                                            setMandatoryChecks(prev => ({ ...prev, [item.id]: !!checked }))
                                                        }
                                                        className={`mt-0.5 h-5 w-5 rounded transition-all duration-300 ${isChecked ? 'data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600' : 'border-gray-300'}`}
                                                    />
                                                    <div className="flex-1">
                                                        <span className={`text-sm font-medium leading-relaxed transition-colors ${isChecked ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    {isChecked && (
                                                        <div className="absolute top-2 right-2">
                                                            <Check className="w-4 h-4 text-indigo-500" />
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Completion status */}
                                {!allMandatoryChecked && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm animate-in slide-in-from-top-1">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">
                                                {18 - mandatoryCount} items remaining
                                            </p>
                                            <p className="text-xs text-amber-700">
                                                Please confirm all facilities to complete the checklist
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB 2: OPTIONAL DETAILS */}
            <TabsContent value="optional" className="space-y-6">
                <Card className="shadow-lg border-0 overflow-hidden">
                    <CardContent className="p-0">
                        {/* Section 1: Distances */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                                    <div>
                                        <h2 className="font-semibold">Distances from Key Locations <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-bold ml-2">(OPTIONAL)</span></h2>
                                        <p className="text-sm text-white/70">Approximate distances in kilometers (Annexure-I #4)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {DISTANCE_FIELDS.map(field => {
                                        const IconComponent = field.icon;
                                        return (
                                            <FormField
                                                key={field.key}
                                                control={form.control}
                                                name={field.key}
                                                render={({ field: formField }) => (
                                                    <FormItem>
                                                        <label className="text-xs text-gray-500 flex items-center gap-2">
                                                            <IconComponent className="w-4 h-4" />
                                                            {field.label}
                                                        </label>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Distance in KM"
                                                                    className="h-11 pr-12"
                                                                    min={0}
                                                                    step="any"
                                                                    value={formField.value ?? ""}
                                                                    onChange={(e) => formField.onChange(normalizeOptionalFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                                                                KM
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        );
                                    })}

                                    {/* Nearest Hospital - Moved from Page 6 */}
                                    <FormField
                                        control={form.control}
                                        name="nearestHospital"
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="text-xs text-gray-500 flex items-center gap-2">
                                                    <Hospital className="w-4 h-4" />
                                                    Nearest Hospital
                                                </label>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Name & Distance (e.g. Civil Hospital, 5km)"
                                                        className="h-11"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Public Areas */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                                    <div>
                                        <h2 className="font-semibold">Public Areas (Annexure-I #6e) <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-bold ml-2">(OPTIONAL)</span></h2>
                                        <p className="text-sm text-white/70">Details of lobby, dining, and parking facilities</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 flex items-center gap-2">
                                            <Sofa className="w-4 h-4" />
                                            Lobby/Lounge Area
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="Enter area"
                                                className="h-11 pr-16"
                                                min={0}
                                                value={publicAreas.lobbyArea}
                                                onChange={(e) => setPublicAreas(prev => ({ ...prev, lobbyArea: e.target.value }))}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                                                Sq.Ft
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 flex items-center gap-2">
                                            <UtensilsCrossed className="w-4 h-4" />
                                            Dining Space
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="Enter area"
                                                className="h-11 pr-16"
                                                min={0}
                                                value={publicAreas.diningArea}
                                                onChange={(e) => setPublicAreas(prev => ({ ...prev, diningArea: e.target.value }))}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                                                Sq.Ft
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Parking Capacity
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. 5 cars"
                                            className="h-11"
                                            value={publicAreas.parkingCapacity}
                                            onChange={(e) => setPublicAreas(prev => ({ ...prev, parkingCapacity: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Nearby Attractions */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Nearby Attractions <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-bold ml-2">(OPTIONAL)</span>
                                        </h2>
                                        <p className="text-sm text-white/70">Describe tourist attractions near your property (Optional - 100-200 words each)</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white">
                                        {nearbyAttractions.filter(a => a.description.trim().length > 0).length}/{nearbyAttractions.length}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {nearbyAttractions.map((attraction, index) => (
                                <div key={attraction.id} className="relative">
                                    <div className="absolute left-3 top-3 text-sm font-bold text-gray-400">#{index + 1}</div>
                                    <Textarea
                                        placeholder={`Describe attraction #${index + 1}...`}
                                        className="min-h-[100px] pl-10"
                                        value={attraction.description}
                                        onChange={(e) => updateAttraction(attraction.id, e.target.value)}
                                    />
                                    {nearbyAttractions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAttraction(attraction.id)}
                                            className="absolute right-3 top-3 text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            {nearbyAttractions.length < 5 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAttraction}
                                    className="w-full border-dashed"
                                >
                                    + Add Another Attraction
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Good to Have */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">4</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Good to Have (Annexure-III Desirable) <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-bold ml-2">(OPTIONAL)</span>
                                        </h2>
                                        <p className="text-sm text-white/70">Optional amenities - not mandatory for registration</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white">
                                        {optionalCount} Selected
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {OPTIONAL_FACILITIES.map((facility) => {
                                const isChecked = !!optionalChecks[facility.id];
                                return (
                                    <label
                                        key={facility.id}
                                        htmlFor={`opt-${facility.id}`}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative select-none ${isChecked
                                            ? 'bg-emerald-50/60 border-emerald-500/30 shadow-sm'
                                            : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm'}`}
                                    >
                                        <Checkbox
                                            id={`opt-${facility.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => handleCheckboxChange(facility.id, !!checked)}
                                            className={`mt-0.5 transition-all duration-300 ${isChecked ? 'data-[state=checked]:bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <span className={`text-sm font-medium transition-colors duration-200 ${isChecked ? 'text-emerald-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                {facility.label}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Eco-Friendly Facilities Textarea - Moved from Page 6 */}
                        <div className="mt-6 pt-6 border-t">
                            <FormField
                                control={form.control}
                                name="ecoFriendlyFacilities"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                            <Leaf className="w-4 h-4 text-emerald-600" />
                                            Eco-Friendly Facilities Description
                                        </label>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional details about solar panels, rainwater harvesting, waste management, etc."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500 mt-1">
                                            You can edit the list above or add more details here.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
