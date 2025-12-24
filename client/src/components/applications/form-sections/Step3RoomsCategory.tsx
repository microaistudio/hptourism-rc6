import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, BedDouble, Check, CheckCircle2, Crown, Flame, Gem, Info, Plus, ShieldCheck, Sparkles, Star, Trash2, TrendingUp, Video } from "lucide-react";
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

    // Filter categories if looking for upgrade
    // Only show categories strictly higher than current
    const allowedCategories = isUpgradeMode && currentCategory
        ? CATEGORY_CARD_INFO.filter(info =>
            CATEGORY_ORDER[info.value] > CATEGORY_ORDER[currentCategory]
        )
        : CATEGORY_CARD_INFO;


    return (
        <>
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                    <div className="text-xs text-gray-500">Per night</div>
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
            </div>

            {/* SECTION 1: Room Configuration */}
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg font-bold">1</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Room Configuration</h2>
                                <p className="text-slate-300 text-sm">Add your rooms with beds per room and nightly rate</p>
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
                                const maxBedsForRow =
                                    row.quantity > 0
                                        ? Math.max(
                                            1,
                                            Math.min(
                                                MAX_BEDS_PER_ROOM,
                                                Math.floor(remainingBeds / Math.max(1, row.quantity)),
                                            ),
                                        )
                                        : Math.max(1, Math.min(MAX_BEDS_PER_ROOM, remainingBeds || 1));
                                const bedOptions = Array.from({ length: maxBedsForRow }, (_, idx) => idx + 1);

                                // Clamp values if limits shrink because of other rows
                                if (row.quantity > maxRoomsForRow) {
                                    updateType2Row(row.id, { quantity: maxRoomsForRow });
                                }
                                if (getRowBedsPerRoom(row) > maxBedsForRow) {
                                    updateType2Row(row.id, { bedsPerRoom: maxBedsForRow });
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
                                                                : maxBedsForRow;
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
                                                                {qty} Rms
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
                                                {roomCalcMode === "direct" ? "Nightly Rate" : "Tariff Range"}
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
                                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Area</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={row.area ?? ""}
                                                        placeholder="0"
                                                        className="h-9"
                                                        onChange={(e) => updateType2Row(row.id, { area: e.target.value === "" ? "" : Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Units</label>
                                                    <Select
                                                        value={row.areaUnit || "sqm"}
                                                        onValueChange={(val) => updateType2Row(row.id, { areaUnit: val })}
                                                    >
                                                        <SelectTrigger className="h-9 w-[85px] shrink-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="sqm">Sq.M</SelectItem>
                                                            <SelectItem value="sqft">Sq.Ft</SelectItem>
                                                            <SelectItem value="kanal">Kanal</SelectItem>
                                                            <SelectItem value="marla">Marla</SelectItem>
                                                            <SelectItem value="bigha">Bigha</SelectItem>
                                                            <SelectItem value="biswas">Biswas</SelectItem>
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
                                    <span className="font-medium">{totalRooms} rooms, {totalBeds} beds configured</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span>Highest rate: <strong className="text-emerald-700">₹{highestRoomRate.toLocaleString()}/night</strong></span>
                                </div>
                            </div>
                            {suggestedCategory && (
                                <div className="flex items-center gap-2 text-sm text-emerald-700">
                                    <ArrowRight className="w-4 h-4" />
                                    <span>Qualifies for <strong>{getCategoryBadge(suggestedCategory).label}</strong> category</span>
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
            </div>

            {/* SECTION 2: Category Selection */}
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
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
                                        silver: <Star className="w-6 h-6 text-slate-500" />,
                                        gold: <Crown className="w-6 h-6 text-amber-500" />,
                                        diamond: <Gem className="w-6 h-6 text-purple-500" />
                                    };

                                    const categoryStyles = {
                                        silver: {
                                            border: isSelected ? "border-slate-400 ring-2 ring-slate-300" : "border-gray-200",
                                            bg: isSelected ? "bg-gradient-to-br from-slate-50 to-gray-100" : "bg-white",
                                            iconBg: "bg-slate-100",
                                            text: "text-slate-700"
                                        },
                                        gold: {
                                            border: isSelected ? "border-amber-400 ring-2 ring-amber-300" : "border-gray-200",
                                            bg: isSelected ? "bg-gradient-to-br from-amber-50 to-yellow-50" : "bg-white",
                                            iconBg: "bg-amber-100",
                                            text: "text-amber-700"
                                        },
                                        diamond: {
                                            border: isSelected ? "border-purple-400 ring-2 ring-purple-300" : "border-gray-200",
                                            bg: isSelected ? "bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50" : "bg-white",
                                            iconBg: "bg-gradient-to-r from-cyan-100 to-purple-100",
                                            text: "text-purple-700"
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

                                            <p className={`text-sm mb-3 ${isSelected || isApplicable ? "text-gray-600" : "text-gray-400"}`}>
                                                {info.description}
                                            </p>

                                            <div className={`text-sm font-medium ${isSelected || isApplicable ? styles.text : "text-gray-400"}`}>
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
                                                Your property qualifies for the <strong>{getCategoryBadge(suggestedCategory).label.toUpperCase()}</strong> category
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
            </div>

            {/* Safety Checklist Card */}
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

                    {(!selectedAmenities["cctv"] || !selectedAmenities["fireSafety"]) && (
                        <Alert variant="destructive" className="py-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-medium">Safety Requirements Incomplete</AlertTitle>
                            <AlertDescription className="text-xs">
                                You must confirm both CCTV and Fire Safety equipment availability to proceed.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
