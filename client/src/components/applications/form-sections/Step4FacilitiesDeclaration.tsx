import { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    CheckCircle2,
    AlertTriangle,
    Shield,
    Star,
    FileCheck,
    FileText,
    CreditCard,
    Home,
    Wind,
    Bed,
    Ruler,
    ChefHat,
    UtensilsCrossed,
    Droplets,
    Trash2,
    Lightbulb,
    BookOpen,
    Stethoscope,
    Briefcase,
    Flame,
    ClipboardList,
    Video,
    Car,
    Bath,
    Thermometer,
    Droplet,
    UtensilsCrossed as Dining,
    ShirtIcon,
    FolderOpen,
    Sofa,
    WashingMachine,
    Refrigerator,
    Armchair,
    ThermometerSun,
    ShoppingBag,
    Lock,
    ShieldCheck,
    Palette,
    CloudRain
} from "lucide-react";

// 18 Mandatory checklist items from Annexure-III A
const MANDATORY_CHECKLIST = [
    { id: "checklist_form_complete", label: "Application form completed as per Annexure-I", icon: FileCheck },
    { id: "checklist_docs_uploaded", label: "All required documents uploaded per Annexure-II", icon: FileText },
    { id: "checklist_payment_facility", label: "Online + cash payment facility available for guests", icon: CreditCard },
    { id: "checklist_maintained_house", label: "Well maintained house/rooms with quality flooring and furniture", icon: Home },
    { id: "checklist_clean_rooms", label: "Clean, airy, pest-free rooms with proper ventilation", icon: Wind },
    { id: "checklist_quality_beds", label: "Comfortable beds with quality linen provided", icon: Bed },
    { id: "checklist_room_size", label: "Rooms meet minimum size requirements", icon: Ruler },
    { id: "checklist_clean_kitchen", label: "Smoke-free, hygienic kitchen maintained", icon: ChefHat },
    { id: "checklist_cutlery", label: "Quality cutlery and crockery available", icon: UtensilsCrossed },
    { id: "checklist_water_purifier", label: "RO/Aqua Guard water purification facility", icon: Droplets },
    { id: "checklist_garbage_disposal", label: "Garbage disposal as per municipal laws", icon: Trash2 },
    { id: "checklist_led_lights", label: "Energy-saving lighting (CFL/LED) installed", icon: Lightbulb },
    { id: "checklist_visitor_book", label: "Visitor book and guest feedback facility maintained", icon: BookOpen },
    { id: "checklist_doctor_contacts", label: "Doctor/hospital contact details available for emergencies", icon: Stethoscope },
    { id: "checklist_luggage_assist", label: "Lost luggage assistance policy in place", icon: Briefcase },
    { id: "checklist_fire_equipment", label: "Basic fire safety equipment installed", icon: Flame },
    { id: "checklist_guest_register", label: "Guest register (physical or electronic) maintained", icon: ClipboardList },
    { id: "checklist_cctv", label: "CCTV surveillance in common areas", icon: Video },
];

// 18 Desirable checklist items from Annexure-III B
const DESIRABLE_CHECKLIST = [
    { id: "desirable_parking", label: "Sufficient parking with adequate road width", icon: Car },
    { id: "desirable_attached_bath", label: "Attached bathroom with toiletries", icon: Bath },
    { id: "desirable_wc_complete", label: "WC with seat, lid, and toilet paper", icon: Bath },
    { id: "desirable_hot_cold_water", label: "Hot & cold running water available", icon: Thermometer },
    { id: "desirable_water_saving", label: "Water-saving taps installed", icon: Droplet },
    { id: "desirable_dining", label: "Dining area serving fresh local food", icon: UtensilsCrossed },
    { id: "desirable_wardrobe", label: "Wardrobe with sufficient hangers", icon: ShirtIcon },
    { id: "desirable_storage", label: "Shelves or drawer space for guests", icon: FolderOpen },
    { id: "desirable_furniture", label: "Quality furniture in rooms", icon: Sofa },
    { id: "desirable_laundry", label: "Laundry/dry cleaning service available", icon: WashingMachine },
    { id: "desirable_fridge", label: "Refrigerator available for guests", icon: Refrigerator },
    { id: "desirable_lobby", label: "Lobby with seating area", icon: Armchair },
    { id: "desirable_hvac", label: "Heating/cooling in public areas", icon: ThermometerSun },
    { id: "desirable_luggage_help", label: "Luggage assistance service", icon: ShoppingBag },
    { id: "desirable_safe", label: "Safekeeping facilities for valuables", icon: Lock },
    { id: "desirable_security", label: "Security guard or surveillance", icon: ShieldCheck },
    { id: "desirable_himachali", label: "Himachali handicrafts/local architecture", icon: Palette },
    { id: "desirable_rainwater", label: "Rainwater harvesting system", icon: CloudRain },
];

interface Step4FacilitiesDeclarationProps {
    mandatoryChecklist: Record<string, boolean>;
    setMandatoryChecklist: Dispatch<SetStateAction<Record<string, boolean>>>;
    desirableChecklist: Record<string, boolean>;
    setDesirableChecklist: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export function Step4FacilitiesDeclaration({
    mandatoryChecklist,
    setMandatoryChecklist,
    desirableChecklist,
    setDesirableChecklist,
}: Step4FacilitiesDeclarationProps) {
    const mandatoryCount = Object.values(mandatoryChecklist).filter(Boolean).length;
    const desirableCount = Object.values(desirableChecklist).filter(Boolean).length;
    const allMandatoryComplete = mandatoryCount === MANDATORY_CHECKLIST.length;

    return (
        <div className="space-y-6">
            {/* Introduction */}
            <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Annexure-III Declaration</AlertTitle>
                <AlertDescription className="text-blue-700">
                    Complete the checklist below to confirm your property meets the HP Homestay Rules 2025 requirements.
                    All <strong>18 mandatory items</strong> must be confirmed before submission. Desirable items are optional but enhance your listing.
                </AlertDescription>
            </Alert>

            {/* SECTION 1: Mandatory Checklist */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Mandatory Requirements</h2>
                                <p className="text-red-100 text-sm">You must confirm ALL 18 items to proceed</p>
                            </div>
                        </div>
                        <Badge className={`${allMandatoryComplete ? "bg-green-500" : "bg-white/20"} text-white`}>
                            {mandatoryCount} / {MANDATORY_CHECKLIST.length}
                        </Badge>
                    </div>
                </div>
                <div className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {MANDATORY_CHECKLIST.map((item, index) => {
                            const IconComponent = item.icon;
                            const isChecked = mandatoryChecklist[item.id] || false;
                            return (
                                <label
                                    key={item.id}
                                    htmlFor={`mandatory-${item.id}`}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${isChecked
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Checkbox
                                        id={`mandatory-${item.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            setMandatoryChecklist(prev => ({ ...prev, [item.id]: !!checked }))
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className={`w-4 h-4 flex-shrink-0 ${isChecked ? "text-green-600" : "text-gray-400"}`} />
                                            <span className={`text-sm font-medium ${isChecked ? "text-green-800" : "text-gray-700"}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    </div>
                                    {isChecked && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                </label>
                            );
                        })}
                    </div>

                    {!allMandatoryComplete && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Incomplete</AlertTitle>
                            <AlertDescription>
                                {MANDATORY_CHECKLIST.length - mandatoryCount} mandatory requirement(s) remaining.
                                You must confirm all items to submit your application.
                            </AlertDescription>
                        </Alert>
                    )}

                    {allMandatoryComplete && (
                        <Alert className="mt-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">All Mandatory Requirements Confirmed</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Great! You have confirmed all mandatory requirements. These will be verified during site inspection.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {/* SECTION 2: Desirable Checklist */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Desirable Features</h2>
                                <p className="text-amber-100 text-sm">Optional - indicate which features your property has</p>
                            </div>
                        </div>
                        <Badge className="bg-white/20 text-white">
                            {desirableCount} / {DESIRABLE_CHECKLIST.length} selected
                        </Badge>
                    </div>
                </div>
                <div className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {DESIRABLE_CHECKLIST.map((item) => {
                            const IconComponent = item.icon;
                            const isChecked = desirableChecklist[item.id] || false;
                            return (
                                <label
                                    key={item.id}
                                    htmlFor={`desirable-${item.id}`}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${isChecked
                                        ? "border-amber-400 bg-amber-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Checkbox
                                        id={`desirable-${item.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            setDesirableChecklist(prev => ({ ...prev, [item.id]: !!checked }))
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className={`w-4 h-4 flex-shrink-0 ${isChecked ? "text-amber-600" : "text-gray-400"}`} />
                                            <span className={`text-sm font-medium ${isChecked ? "text-amber-800" : "text-gray-700"}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    </div>
                                    {isChecked && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                </label>
                            );
                        })}
                    </div>

                    {desirableCount > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <Star className="w-4 h-4 inline mr-1" />
                                You've indicated <strong>{desirableCount}</strong> desirable feature(s).
                                These enhance your property's appeal but are not mandatory for registration.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Declaration Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${allMandatoryComplete ? "bg-green-500" : "bg-red-500"}`} />
                            <span>Mandatory: {mandatoryCount}/{MANDATORY_CHECKLIST.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Desirable: {desirableCount}/{DESIRABLE_CHECKLIST.length}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        All declarations will be verified during site inspection as per HP Homestay Rules 2025.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Export constants for use in parent component
export { MANDATORY_CHECKLIST, DESIRABLE_CHECKLIST };
