import { Dispatch, SetStateAction, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, BedDouble, Check, CheckCircle2, Crown, Flame, Gem, Plus, ShieldCheck, Sparkles, Star, Trash2, TrendingUp, Video } from "lucide-react";
import {
    CATEGORY_CARD_INFO,
    ROOM_TYPE_OPTIONS,
    TARIFF_BUCKETS,
    CATEGORY_ORDER,
    MAX_ROOMS_ALLOWED,
    MAX_BEDS_ALLOWED,
    MAX_BEDS_PER_ROOM,
    type Type2Row,
    type RoomCalculationMode,
    type ApplicationForm,
    getRowBedsPerRoom,
    summarizeRows,
    sanitizeGstinInput,
    clampInt,
} from "@/lib/application-schema";
import { type CategoryType } from "@shared/fee-calculator";
import { type CategoryRateBands } from "@shared/appSettings";

// =============================================================================
// PROPERTY AREA UNITS
// All units available for all districts with user-editable conversion rates.
// =============================================================================

// All available units for property area
const PROPERTY_AREA_UNITS = [
    { value: "sqm", label: "Sq.M" },
    { value: "sqft", label: "Sq.Ft" },
    { value: "marla", label: "Marla" },
    { value: "kanal", label: "Kanal" },
    { value: "biswa", label: "Biswa" },
    { value: "bigha", label: "Bigha" },
];

// =============================================================================


// Helper functions local to this component or imported
const getCategoryBadge = (cat: string) => {
    switch (cat) {
        case "silver":
            return { label: "Silver", variant: "secondary" as const, color: "bg-slate-200 text-slate-800" };
        case "gold":
            return { label: "Gold", variant: "default" as const, color: "bg-amber-100 text-amber-800 border-amber-200" };
        case "diamond":
            return { label: "Diamond", variant: "outline" as const, color: "bg-cyan-50 text-cyan-900 border-cyan-200" };
        default:
            return { label: cat, variant: "outline" as const, color: "" };
    }
};

const evaluateBandStatus = (rate: number, band: { min: number; max: number | null }) => {
    if (rate < band.min) return "below";
    if (band.max !== null && rate > band.max) return "above";
    return "within";
};

const formatBandLabel = (band: { min: number; max: number | null }) => {
    if (band.max === null) return `Above ₹${band.min}`;
    return `₹${band.min} - ₹${band.max}`;
};

interface Step3RoomsCategoryProps {
    form: UseFormReturn<ApplicationForm>;
    category: CategoryType;
    totalRooms: number;
    totalBeds: number;
    highestTariffLabel: string;
    highestRoomRate: number;
    categoryRateBands: CategoryRateBands;
    roomCalcMode: RoomCalculationMode;
    type2CategoryConflict: boolean;
    categoryWarnings: string[];
    lockToRecommendedCategory: boolean;
    suggestedCategory: CategoryType | null;
    type2Rows: Type2Row[];
    addType2Row: () => void;
    removeType2Row: (id: string) => void;
    updateType2Row: (id: string, updates: Partial<Type2Row>) => void;
    resetType2Rows: () => void;
    syncAttachedBaths: boolean;
    setSyncAttachedBaths: (value: boolean) => void;
    selectedAmenities: Record<string, boolean>;
    setSelectedAmenities: Dispatch<SetStateAction<Record<string, boolean>>>;
    openAreaConverter: (rowId: string) => void;
    resolvedCategory: CategoryType;
    resolvedCategoryBand: { min: number; max: number | null };
    shouldLockCategoryWarning: boolean;
    // New props for change_category
    activeApplicationKind?: string;
    currentCategory?: CategoryType;
}

export function Step3RoomsCategory({
    form,
    category,
    totalRooms,
    totalBeds,
    highestTariffLabel,
    highestRoomRate,
    categoryRateBands,
    roomCalcMode,
    type2CategoryConflict,
    categoryWarnings,
    lockToRecommendedCategory,
    suggestedCategory,
    type2Rows,
    addType2Row,
    removeType2Row,
    updateType2Row,
    resetType2Rows,
    syncAttachedBaths,
    setSyncAttachedBaths,
    selectedAmenities,
    setSelectedAmenities,
    openAreaConverter,
    resolvedCategory,
    resolvedCategoryBand,
    shouldLockCategoryWarning,
    activeApplicationKind,
    currentCategory,
}: Step3RoomsCategoryProps) {
    const isUpgradeMode = activeApplicationKind === 'change_category';

    // All units available for all districts now
    const availableUnits = PROPERTY_AREA_UNITS;

    // Filter categories if looking for upgrade
    // Only show categories strictly higher than current
    const allowedCategories = isUpgradeMode && currentCategory
        ? CATEGORY_CARD_INFO.filter(info =>
            CATEGORY_ORDER[info.value] > CATEGORY_ORDER[currentCategory]
        )
        : CATEGORY_CARD_INFO;

    // Auto-calculate property area in Sq.M whenever area, unit, or conversion rate changes
    const watchedArea = form.watch("propertyArea");
    const watchedUnit = form.watch("propertyAreaUnit");
    const watchedRate = form.watch("propertyAreaConversionRate");

    useEffect(() => {
        const areaValue = watchedArea || 0;
        const unit = watchedUnit || "sqm";
        const conversionRate = watchedRate;

        let calculatedSqM: number | null = null;
        if (unit === "sqm") {
            calculatedSqM = areaValue;
        } else if (areaValue > 0 && conversionRate && conversionRate > 0) {
            calculatedSqM = areaValue * conversionRate;
        }

        if (calculatedSqM !== null) {
            form.setValue("propertyAreaSqM", parseFloat(calculatedSqM.toFixed(2)));
        }
    }, [watchedArea, watchedUnit, watchedRate, form]);


    return (
        <>

            {/* Property Area Section - Annexure-I #6a */}
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg font-bold">📐</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Property Area</h2>
                                <p className="text-blue-100 text-sm">As per Annexure-I #6a</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Column 1: Area Value */}
                        <FormField
                            control={form.control}
                            name="propertyArea"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Area Value <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={999999}
                                            step="0.01"
                                            placeholder="Enter area"
                                            className="h-11"
                                            value={field.value === 0 || field.value === null || field.value === undefined ? "" : field.value}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "") {
                                                    field.onChange(null);
                                                    return;
                                                }
                                                const num = parseFloat(val);
                                                field.onChange(Math.min(999999, Math.max(0, num)));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Column 2: Unit */}
                        <FormField
                            control={form.control}
                            name="propertyAreaUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            // Reset conversion rate when unit changes (except for sqft which has fixed rate)
                                            if (value === "sqft") {
                                                form.setValue("propertyAreaConversionRate", 0.092903);
                                            } else if (value === "sqm") {
                                                form.setValue("propertyAreaConversionRate", 1);
                                            } else {
                                                // Clear rate for other units - user must enter
                                                form.setValue("propertyAreaConversionRate", undefined);
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableUnits.map((u) => (
                                                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Column 3: Conversion Rate */}
                        <FormField
                            control={form.control}
                            name="propertyAreaConversionRate"
                            render={({ field }) => {
                                const unit = form.watch("propertyAreaUnit") || "sqm";
                                const isFixed = unit === "sqft" || unit === "sqm";
                                const showField = unit !== "sqm"; // Hide for Sq.M (no conversion needed)

                                if (!showField) {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-gray-400">Conversion Rate</FormLabel>
                                            <div className="h-11 flex items-center text-sm text-gray-400 italic">
                                                Not needed for Sq.M
                                            </div>
                                        </FormItem>
                                    );
                                }

                                return (
                                    <FormItem>
                                        <FormLabel>
                                            Conversion Rate
                                            {isFixed && <span className="text-xs text-gray-500 ml-1">(fixed)</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min={0.001}
                                                    max={99999}
                                                    step="0.01"
                                                    placeholder={isFixed ? "" : "Enter rate"}
                                                    className={`h-11 pr-16 ${isFixed ? "bg-gray-50" : ""}`}
                                                    readOnly={isFixed}
                                                    value={field.value === null || field.value === undefined ? "" : field.value}
                                                    onChange={(e) => {
                                                        if (isFixed) return;
                                                        const val = e.target.value;
                                                        if (val === "") {
                                                            field.onChange(undefined);
                                                            return;
                                                        }
                                                        field.onChange(parseFloat(val));
                                                    }}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                                    → Sq.M
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            {isFixed ? (
                                                <span className="text-gray-500">1 {unit === "sqft" ? "Sq.Ft" : "Sq.M"} = {field.value} Sq.M</span>
                                            ) : (
                                                <span className="text-amber-600">Enter your district's rate</span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Column 4: Area in Sq.M (calculated) */}
                        <FormField
                            control={form.control}
                            name="propertyAreaSqM"
                            render={({ field }) => {
                                const areaValue = form.watch("propertyArea") || 0;
                                const unit = form.watch("propertyAreaUnit") || "sqm";
                                const conversionRate = form.watch("propertyAreaConversionRate");

                                // Auto-calculate Sq.M
                                let calculatedSqM: number | null = null;
                                if (unit === "sqm") {
                                    calculatedSqM = areaValue;
                                } else if (areaValue > 0 && conversionRate && conversionRate > 0) {
                                    calculatedSqM = areaValue * conversionRate;
                                }



                                const needsRate = unit !== "sqm" && (!conversionRate || conversionRate <= 0);

                                return (
                                    <FormItem>
                                        <FormLabel>Area in Sq.M</FormLabel>
                                        <div className={`h-11 flex items-center px-3 rounded-md border ${needsRate ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                                            {needsRate ? (
                                                <span className="text-amber-600 text-sm">Enter conversion rate</span>
                                            ) : calculatedSqM !== null ? (
                                                <span className="text-emerald-700 font-semibold text-lg">
                                                    {calculatedSqM.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </div>
                                        <FormDescription className="text-xs text-gray-500">
                                            Used in certificate
                                        </FormDescription>
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                </div>
            </div >

            {/* Summary Stats Cards */}
            < div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" >
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Total Rooms</div>
                    <div className={`text-3xl font-bold ${totalRooms > MAX_ROOMS_ALLOWED ? "text-red-500" : "text-gray-900"}`}>
                        {totalRooms}
                    </div>
                    <div className="text-xs text-emerald-600">Limit: {MAX_ROOMS_ALLOWED} rooms</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Total Beds</div>
                    <div className={`text-3xl font-bold ${totalBeds > MAX_BEDS_ALLOWED ? "text-red-500" : "text-gray-900"}`}>
                        {totalBeds}
                    </div>
                    <div className="text-xs text-emerald-600">Limit: {MAX_BEDS_ALLOWED} beds</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Highest Rate</div>
                    <div className="text-3xl font-bold text-emerald-600">
                        {highestRoomRate > 0 ? `₹${highestRoomRate.toLocaleString()}` : "—"}
                    </div>
                    <div className="text-xs text-gray-500">Per Day</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <div className="mt-1">
                        <Badge variant={getCategoryBadge(category).variant} className="text-sm font-semibold">
                            {getCategoryBadge(category).label}
                        </Badge>
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">Auto-selected</div>
                </div>
            </div >

            {/* SECTION 1: Room Configuration */}
            < div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200" >
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg font-bold">1</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Room Configuration</h2>
                                <p className="text-slate-300 text-sm">Add your rooms with beds per room and daily rate</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addType2Row}
                            disabled={totalRooms >= MAX_ROOMS_ALLOWED}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Room Type
                        </Button>
                    </div>
                </div>
                <div className="bg-white p-4 space-y-4">



                    {/* Dynamic Room Configuration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Room Configuration</label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                                onClick={resetType2Rows}
                                disabled={type2Rows.length <= 1 && type2Rows[0].quantity === 1}
                            >
                                Reset Rooms
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {type2Rows.map((row, index) => {
                                const { rooms: roomsUsedElsewhere, beds: bedsUsedElsewhere } = summarizeRows(type2Rows, row.id);
                                const remainingRooms = Math.max(0, MAX_ROOMS_ALLOWED - roomsUsedElsewhere);
                                const remainingBeds = Math.max(0, MAX_BEDS_ALLOWED - bedsUsedElsewhere);
                                const currentBedsPerRoom = Math.max(1, getRowBedsPerRoom(row));
                                const maxRoomsByBeds = Math.floor(remainingBeds / currentBedsPerRoom);
                                const maxRoomsForRow = Math.max(1, Math.min(remainingRooms, maxRoomsByBeds));
                                const quantityOptions = Array.from({ length: maxRoomsForRow }, (_, idx) => idx + 1);

                                // Bed options based on room type per policy:
                                // Single (Type 1) = 1 bed only
                                // Double (Type 2) = 2 beds only
                                // Suite = 3 or 4 beds
                                let bedOptions: number[];
                                if (row.roomType === "single") {
                                    bedOptions = [1];
                                } else if (row.roomType === "double") {
                                    bedOptions = [2];
                                } else if (row.roomType === "suite") {
                                    bedOptions = [3, 4];
                                } else {
                                    // Fallback - shouldn't happen
                                    bedOptions = [1, 2, 3, 4];
                                }

                                // Clamp values if limits shrink because of other rows
                                if (row.quantity > maxRoomsForRow) {
                                    updateType2Row(row.id, { quantity: maxRoomsForRow });
                                }
                                // Auto-set bedsPerRoom based on room type if not valid
                                const validBeds = bedOptions.includes(getRowBedsPerRoom(row));
                                if (!validBeds && bedOptions.length > 0) {
                                    updateType2Row(row.id, { bedsPerRoom: bedOptions[0] });
                                }

                                // Determine rate status for direct mode
                                let rateStatus: "below" | "within" | "above" = "within";
                                if (roomCalcMode === "direct" && typeof row.customRate === "number") {
                                    rateStatus = evaluateBandStatus(row.customRate, resolvedCategoryBand);
                                }

                                return (
                                    <div
                                        key={row.id}
                                        className="relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg border transition-all bg-card hover:border-primary/30"
                                    >
                                        {/* Room Type */}
                                        <div className="md:col-span-2 min-w-0">
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                                Room Type
                                            </label>
                                            <Select
                                                value={row.roomType}
                                                onValueChange={(val: any) => updateType2Row(row.id, { roomType: val })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROOM_TYPE_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Quantity & Beds */}
                                        <div className="md:col-span-4 grid grid-cols-2 gap-2 min-w-0">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                                    No. of Rooms
                                                </label>
                                                <Select
                                                    value={String(row.quantity)}
                                                    onValueChange={(val) => {
                                                        const nextQty = clampInt(val);
                                                        const nextMaxBeds =
                                                            nextQty > 0
                                                                ? Math.max(
                                                                    1,
                                                                    Math.min(
                                                                        MAX_BEDS_PER_ROOM,
                                                                        Math.floor(
                                                                            remainingBeds / Math.max(1, nextQty),
                                                                        ),
                                                                    ),
                                                                )
                                                                : MAX_BEDS_PER_ROOM;
                                                        const clampedBeds = Math.min(getRowBedsPerRoom(row), nextMaxBeds);
                                                        updateType2Row(row.id, {
                                                            quantity: nextQty,
                                                            bedsPerRoom: clampedBeds,
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {quantityOptions.map((qty) => (
                                                            <SelectItem key={qty} value={String(qty)}>
                                                                {qty} {qty === 1 ? "Room" : "Rooms"}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                                    Beds/Rm
                                                </label>
                                                <Select
                                                    value={String(getRowBedsPerRoom(row))}
                                                    onValueChange={(val) => {
                                                        const nextBeds = clampInt(val);
                                                        const maxRoomsByBedsNext = Math.floor(
                                                            remainingBeds / Math.max(1, nextBeds),
                                                        );
                                                        const allowableRooms = Math.min(remainingRooms, maxRoomsByBedsNext);
                                                        const clampedRooms = Math.min(row.quantity, Math.max(0, allowableRooms));
                                                        updateType2Row(row.id, {
                                                            bedsPerRoom: nextBeds,
                                                            quantity: clampedRooms,
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {bedOptions.map((beds) => (
                                                            <SelectItem key={beds} value={String(beds)}>
                                                                {beds} Beds
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Tariff / Rate */}
                                        <div className="md:col-span-2 min-w-0">
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                                {roomCalcMode === "direct" ? "Tariff Per Day" : "Tariff Range"}
                                            </label>

                                            {roomCalcMode === "direct" ? (
                                                (() => {
                                                    const isRateMissing = row.quantity > 0 && (row.customRate === "" || row.customRate === undefined || row.customRate === null || row.customRate <= 0);
                                                    return (
                                                        <div>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">₹</span>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    max={999999}
                                                                    placeholder="Enter tariff"
                                                                    className={`h-9 pl-7 w-full ${isRateMissing ? "ring-2 ring-amber-500 border-amber-500 focus:ring-amber-500" : ""}`}
                                                                    value={row.customRate === "" ? "" : row.customRate}
                                                                    onChange={(e) => {
                                                                        const rawVal = e.target.value;
                                                                        if (rawVal === "") {
                                                                            updateType2Row(row.id, { customRate: "" });
                                                                            return;
                                                                        }
                                                                        const parsed = parseFloat(rawVal);
                                                                        const capped = Math.min(999999, Math.max(0, parsed));
                                                                        updateType2Row(row.id, { customRate: capped });
                                                                    }}
                                                                />
                                                            </div>
                                                            {isRateMissing && (
                                                                <p className="text-xs text-amber-600 mt-1 font-medium">Required</p>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <Select
                                                    value={row.tariffBucket}
                                                    onValueChange={(val: any) => updateType2Row(row.id, { tariffBucket: val })}
                                                >
                                                    <SelectTrigger className={`h-9 ${
                                                        // Highlight if bucket exceeds category
                                                        CATEGORY_ORDER[TARIFF_BUCKETS.find(b => b.value === row.tariffBucket)?.minCategory || "silver"] > CATEGORY_ORDER[category]
                                                            ? "border-destructive text-destructive"
                                                            : ""
                                                        }`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TARIFF_BUCKETS.map((bucket) => (
                                                            <SelectItem key={bucket.value} value={bucket.value}>
                                                                {bucket.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>

                                        {/* Area */}
                                        <div className="md:col-span-3 min-w-0">
                                            <div className="flex gap-2">
                                                <div className="flex flex-col flex-1">
                                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Room Area</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={999999}
                                                        step="0.01"
                                                        value={row.area === 0 || row.area === null || row.area === undefined || row.area === "" ? "" : row.area}
                                                        placeholder="Enter area"
                                                        className="h-9"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "") {
                                                                updateType2Row(row.id, { area: "" });
                                                                return;
                                                            }
                                                            const num = parseFloat(val);
                                                            updateType2Row(row.id, { area: Math.min(999999, Math.max(0, num)) });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Units</label>
                                                    <Select
                                                        value={row.areaUnit || "sqft"}
                                                        onValueChange={(val) => updateType2Row(row.id, { areaUnit: val })}
                                                    >
                                                        <SelectTrigger className="h-9 w-[85px] shrink-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="sqft">Sq.Ft</SelectItem>
                                                            <SelectItem value="sqm">Sq.M</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="md:col-span-1 flex items-end justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => removeType2Row(row.id)}
                                                disabled={type2Rows.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Compact Summary Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <BedDouble className="w-4 h-4 text-emerald-600" />
                                    <span className="font-medium">{totalRooms} {totalRooms === 1 ? "room" : "rooms"}, {totalBeds} {totalBeds === 1 ? "bed" : "beds"} configured</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span>Highest rate: <strong className="text-emerald-700">₹{highestRoomRate.toLocaleString()}/night</strong></span>
                                </div>
                            </div>
                            {suggestedCategory && (
                                <div className="flex items-center gap-2 text-sm text-emerald-700">
                                    <ArrowRight className="w-4 h-4" />
                                    <span>Applicable Category: <strong>{getCategoryBadge(suggestedCategory).label.toUpperCase()}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attached Washrooms */}
                    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${!syncAttachedBaths ? "bg-destructive/10 border-destructive/50" : "bg-muted/30"}`}>
                        <Checkbox
                            id="attached-baths"
                            checked={syncAttachedBaths}
                            onCheckedChange={(checked) => {
                                const val = !!checked;
                                setSyncAttachedBaths(val);
                                if (val) {
                                    form.setValue("attachedWashrooms", totalRooms);
                                }
                            }}
                        />
                        <div className="space-y-1">
                            <label
                                htmlFor="attached-baths"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                All rooms have attached washrooms
                            </label>
                            {syncAttachedBaths ? (
                                <p className="text-xs text-muted-foreground">
                                    Total attached washrooms: {totalRooms}
                                </p>
                            ) : (
                                <p className="text-xs text-destructive font-medium">
                                    ⚠️ Required: All rooms must have attached washrooms as per HP Tourism guidelines
                                </p>
                            )}
                        </div>
                    </div>

                    {/* GSTIN Field (Conditional) */}
                    {(category === "gold" || category === "diamond") && (
                        <div className="pt-4 border-t">
                            <FormField
                                control={form.control}
                                name="gstin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GSTIN Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="22AAAAA0000A1Z5"
                                                maxLength={15}
                                                {...field}
                                                onChange={(e) => field.onChange(sanitizeGstinInput(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Required for Gold and Diamond categories
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div >

            {/* SECTION 2: Category Selection */}
            < div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200" >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-lg font-bold">2</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Category Selection</h2>
                            <p className="text-emerald-100 text-sm">Category is automatically selected based on your highest room rate</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6">
                    {isUpgradeMode && currentCategory && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="text-sm text-blue-800 font-medium mb-1">
                                Current Category
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={getCategoryBadge(currentCategory).variant} className="text-sm">
                                    {getCategoryBadge(currentCategory).label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Select a higher category to upgrade your property.
                                </span>
                            </div>
                        </div>
                    )}

                    {allowedCategories.length === 0 ? (
                        <div className="text-center p-8 border-2 border-dashed rounded-xl bg-slate-50">
                            <p className="text-muted-foreground">You are already at the highest category ({getCategoryBadge(currentCategory || 'diamond').label}).</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {allowedCategories.map((info) => {
                                    const isSelected = category === info.value;
                                    const isApplicable = suggestedCategory === info.value;
                                    const isDisabled = lockToRecommendedCategory && !isApplicable;
                                    const band = categoryRateBands[info.value];

                                    // Icons for each category
                                    const categoryIcons = {
                                        silver: <Star className="w-6 h-6 text-gray-700" />,
                                        gold: <Crown className="w-6 h-6 text-amber-500" />,
                                        diamond: <Gem className="w-6 h-6 text-neutral-600" />
                                    };

                                    const categoryStyles = {
                                        silver: {
                                            border: isSelected ? "border-gray-700 ring-2 ring-gray-600" : "border-gray-500",
                                            bg: isSelected ? "bg-gradient-to-br from-gray-300 via-slate-300 to-gray-400" : "bg-gradient-to-br from-gray-200 to-slate-300",
                                            iconBg: "bg-gradient-to-br from-gray-400 to-slate-500",
                                            text: "text-gray-900"
                                        },
                                        gold: {
                                            border: isSelected ? "border-amber-500 ring-2 ring-amber-400" : "border-amber-300",
                                            bg: isSelected ? "bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200" : "bg-gradient-to-br from-amber-50 to-yellow-100",
                                            iconBg: "bg-gradient-to-br from-amber-200 to-yellow-300",
                                            text: "text-amber-800"
                                        },
                                        diamond: {
                                            border: isSelected ? "border-neutral-400 ring-2 ring-neutral-300" : "border-neutral-300",
                                            bg: isSelected ? "bg-gradient-to-br from-neutral-50 via-white to-zinc-100" : "bg-gradient-to-br from-white to-neutral-100",
                                            iconBg: "bg-gradient-to-br from-neutral-200 to-zinc-300",
                                            text: "text-neutral-700"
                                        }
                                    };

                                    const styles = categoryStyles[info.value as keyof typeof categoryStyles] || categoryStyles.silver;
                                    const Icon = categoryIcons[info.value as keyof typeof categoryIcons];

                                    return (
                                        <div
                                            key={info.value}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    form.setValue("category", info.value);
                                                }
                                            }}
                                            className={`
                                                relative p-5 rounded-xl border-2 cursor-pointer transition-all
                                                ${styles.border} ${styles.bg}
                                                ${!isSelected && !isApplicable ? "opacity-60" : ""}
                                                ${isDisabled ? "opacity-50 cursor-not-allowed grayscale" : "hover:shadow-md"}
                                            `}
                                        >
                                            {isApplicable && (
                                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 shadow-lg">
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    APPLICABLE
                                                </Badge>
                                            )}

                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                                                    {Icon}
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                )}
                                            </div>

                                            <h3 className={`text-xl font-bold mb-1 ${isSelected || isApplicable ? "text-gray-900" : "text-gray-500"}`}>
                                                {info.title}
                                            </h3>

                                            {info.description && (
                                                <p className={`text-sm mb-3 ${isSelected || isApplicable ? "text-gray-600" : "text-gray-400"}`}>
                                                    {info.description}
                                                </p>
                                            )}

                                            <div className={`text-base font-semibold mt-2 ${isSelected || isApplicable ? styles.text : "text-gray-400"}`}>
                                                Tariff Range: {formatBandLabel(band)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Confirmation message */}
                            {suggestedCategory && (
                                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-emerald-800">
                                                Applicable Category: <strong>{getCategoryBadge(suggestedCategory).label.toUpperCase()}</strong>
                                            </p>
                                            <p className="text-sm text-emerald-600">
                                                Based on your highest room rate of ₹{highestRoomRate.toLocaleString()}/night
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >

            {/* Safety Checklist Card - Hidden for delete_rooms */}
            {activeApplicationKind !== 'delete_rooms' && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            <CardTitle>Mandatory Safety Checklist</CardTitle>
                        </div>
                        <CardDescription>
                            Confirm availability of critical safety infrastructure
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${selectedAmenities["cctv"] ? "bg-blue-50/50 border-blue-200" : "hover:bg-muted/50"}`}>
                                <Checkbox
                                    id="check-cctv"
                                    checked={selectedAmenities["cctv"] || false}
                                    onCheckedChange={(checked) =>
                                        setSelectedAmenities(prev => ({ ...prev, cctv: !!checked }))
                                    }
                                />
                                <label htmlFor="check-cctv" className="grid gap-1.5 cursor-pointer">
                                    <div className="font-medium flex items-center gap-2">
                                        <Video className="w-4 h-4 text-muted-foreground" />
                                        CCTV Surveillance
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Required at entrance and common areas
                                    </p>
                                </label>
                            </div>

                            <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${selectedAmenities["fireSafety"] ? "bg-blue-50/50 border-blue-200" : "hover:bg-muted/50"}`}>
                                <Checkbox
                                    id="check-fire"
                                    checked={selectedAmenities["fireSafety"] || false}
                                    onCheckedChange={(checked) =>
                                        setSelectedAmenities(prev => ({ ...prev, fireSafety: !!checked }))
                                    }
                                />
                                <label htmlFor="check-fire" className="grid gap-1.5 cursor-pointer">
                                    <div className="font-medium flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-muted-foreground" />
                                        Fire Safety Equipment
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Extinguishers and smoke detectors installed
                                    </p>
                                </label>
                            </div>
                        </div>

                        {/* Fire Equipment Details - shows when fire safety is checked */}
                        {selectedAmenities["fireSafety"] && (
                            <FormField
                                control={form.control}
                                name="fireEquipmentDetails"
                                render={({ field }) => {
                                    const charCount = field.value?.length || 0;
                                    const isInvalid = charCount < 10;
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-sm">Fire Safety Equipment Details (Annexure-I #6g) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <textarea
                                                    {...field}
                                                    value={field.value || ""}
                                                    placeholder="E.g., 2 fire extinguishers (kitchen, lobby), smoke detectors in all rooms, fire alarm system..."
                                                    className={`w-full min-h-[80px] p-3 text-sm border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent ${isInvalid ? 'border-red-500 border-2 bg-red-50' : 'border-gray-300'}`}
                                                    required
                                                />
                                            </FormControl>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs ${isInvalid ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                                    {isInvalid ? '⚠ Required: Enter at least 10 characters to proceed' : 'Fire fighting equipment details provided'}
                                                </p>
                                                <span className={`text-xs font-medium ${isInvalid ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {charCount} chars (min. 10)
                                                </span>
                                            </div>
                                        </FormItem>
                                    );
                                }}
                            />
                        )}

                        {(!selectedAmenities["cctv"] || !selectedAmenities["fireSafety"]) && (
                            <Alert variant="destructive" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-sm font-medium">Safety Requirements Incomplete</AlertTitle>
                                <AlertDescription className="text-xs">
                                    You must confirm both CCTV and Fire Safety equipment availability to proceed.
                                </AlertDescription>
                            </Alert>
                        )}

                        {selectedAmenities["cctv"] && selectedAmenities["fireSafety"] && (form.watch("fireEquipmentDetails")?.trim().length || 0) < 10 && (
                            <Alert className="py-2 border-amber-300 bg-amber-50">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-sm font-medium text-amber-800">Fire Safety Details Required</AlertTitle>
                                <AlertDescription className="text-xs text-amber-700">
                                    Please provide details of fire fighting equipment (Annexure-I #6g) - at least 10 characters to proceed to next step.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card >
            )
            }
        </>
    );
}
