import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Plus,
    Trash2,
    BedDouble,
    IndianRupee,
    Star,
    Crown,
    Gem,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Sparkles,
    AlertTriangle,
    ShieldCheck,
    Video,
    Flame,
    Check
} from "lucide-react";

// Category rate bands
const CATEGORY_RATE_BANDS = {
    silver: { min: 1, max: 2999, label: "Silver", icon: Star },
    gold: { min: 3000, max: 10000, label: "Gold", icon: Crown },
    diamond: { min: 10001, max: Infinity, label: "Diamond", icon: Gem },
};

// Room type configurations
const ROOM_TYPES = [
    { id: "single", label: "Single Bed Room", defaultBeds: 1, maxBeds: 2 },
    { id: "double", label: "Double Bed Room", defaultBeds: 2, maxBeds: 3 },
    { id: "family", label: "Family Suite", defaultBeds: 3, maxBeds: 4 },
];

// Area unit options
const AREA_UNITS = [
    { value: "sqm", label: "Sq.M" },
    { value: "sqft", label: "Sq.Ft" },
    { value: "kanal", label: "Kanal" },
    { value: "marla", label: "Marla" },
    { value: "bigha", label: "Bigha" },
    { value: "biswas", label: "Biswas" },
];

interface RoomConfig {
    id: string;
    type: string;
    count: number;
    beds: number;
    rate: number;
    area: number;
    areaUnit: string;
}

export default function RoomsCategoryPreview() {
    const [rooms, setRooms] = useState<RoomConfig[]>([
        { id: "1", type: "single", count: 1, beds: 1, rate: 0, area: 0, areaUnit: "sqm" }
    ]);

    // Safety & Infrastructure checklist
    const [syncAttachedBaths, setSyncAttachedBaths] = useState(true);
    const [hasFireEquipment, setHasFireEquipment] = useState(false);
    const [hasCCTV, setHasCCTV] = useState(false);
    const [gstin, setGstin] = useState("");

    // Calculate totals
    const totalRooms = rooms.reduce((sum, r) => sum + r.count, 0);
    const totalBeds = rooms.reduce((sum, r) => sum + (r.count * r.beds), 0);
    const highestRate = Math.max(...rooms.map(r => r.rate), 0);

    // Validation checks
    const allSafetyChecked = hasFireEquipment && hasCCTV && syncAttachedBaths;

    // Auto-determine category based on highest rate
    const determinedCategory = useMemo(() => {
        if (highestRate === 0) return null;
        if (highestRate <= CATEGORY_RATE_BANDS.silver.max) return "silver";
        if (highestRate <= CATEGORY_RATE_BANDS.gold.max) return "gold";
        return "diamond";
    }, [highestRate]);

    // GSTIN required for Gold/Diamond only
    const gstinRequired = determinedCategory === "gold" || determinedCategory === "diamond";
    const gstinValid = !gstinRequired || gstin.length === 15;

    const addRoom = () => {
        if (rooms.length < 3) {
            const usedTypes = rooms.map(r => r.type);
            const availableType = ROOM_TYPES.find(t => !usedTypes.includes(t.id));
            if (availableType) {
                setRooms([...rooms, {
                    id: Date.now().toString(),
                    type: availableType.id,
                    count: 1,
                    beds: availableType.defaultBeds,
                    rate: 0,
                    area: 0,
                    areaUnit: "sqm"
                }]);
            }
        }
    };

    const removeRoom = (id: string) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter(r => r.id !== id));
        }
    };

    const updateRoom = (id: string, field: keyof RoomConfig, value: number | string) => {
        setRooms(rooms.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const getRoomTypeConfig = (typeId: string) => {
        return ROOM_TYPES.find(t => t.id === typeId) || ROOM_TYPES[0];
    };

    const getCategoryBadgeColor = (cat: string | null) => {
        switch (cat) {
            case "silver": return "bg-gradient-to-r from-slate-400 to-gray-500 text-white";
            case "gold": return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white";
            case "diamond": return "bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-white";
            default: return "bg-gray-300 text-gray-600";
        }
    };

    const formatBandLabel = (band: { min: number; max: number }) => {
        if (band.max === Infinity) return `₹${band.min.toLocaleString()} - Above ₹10,000`;
        return `₹${band.min.toLocaleString()} - ₹${band.max.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Step 3: Rooms & Category
                    </h1>
                    <p className="text-gray-600">
                        Configure your rooms first. Category will be automatically selected based on your highest room rate.
                    </p>
                </div>

                {/* Summary Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Total Rooms</div>
                        <div className={`text-3xl font-bold ${totalRooms > 6 ? "text-red-500" : "text-gray-900"}`}>
                            {totalRooms}
                        </div>
                        <div className="text-xs text-emerald-600">Limit: 6 rooms</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Total Beds</div>
                        <div className={`text-3xl font-bold ${totalBeds > 12 ? "text-red-500" : "text-gray-900"}`}>
                            {totalBeds}
                        </div>
                        <div className="text-xs text-emerald-600">Limit: 12 beds</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Highest Rate</div>
                        <div className="text-3xl font-bold text-emerald-600">
                            {highestRate > 0 ? `₹${highestRate.toLocaleString()}` : "—"}
                        </div>
                        <div className="text-xs text-gray-500">Per night</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Category</div>
                        <div className="mt-1">
                            {determinedCategory ? (
                                <Badge className={`text-sm px-3 py-1 ${getCategoryBadgeColor(determinedCategory)}`}>
                                    {determinedCategory.charAt(0).toUpperCase() + determinedCategory.slice(1)}
                                </Badge>
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">—</span>
                            )}
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">Auto-selected</div>
                    </div>
                </div>

                {/* SECTION 1: Room Configuration */}
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    {/* Header with gradient */}
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
                                variant="secondary"
                                size="sm"
                                onClick={addRoom}
                                disabled={rooms.length >= 3 || totalRooms >= 6}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Room Type
                            </Button>
                        </div>
                    </div>

                    {/* Room rows */}
                    <div className="bg-white p-4 space-y-4">
                        {rooms.map((room) => {
                            const typeConfig = getRoomTypeConfig(room.type);
                            return (
                                <div
                                    key={room.id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    {/* Room Type */}
                                    <div className="md:col-span-2 min-w-0">
                                        <Label className="text-xs text-gray-500 mb-1.5 block">Room Type</Label>
                                        <Select
                                            value={room.type}
                                            onValueChange={(val) => {
                                                const newType = getRoomTypeConfig(val);
                                                updateRoom(room.id, "type", val);
                                                updateRoom(room.id, "beds", newType.defaultBeds);
                                            }}
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROOM_TYPES.map(type => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={type.id}
                                                        disabled={rooms.some(r => r.id !== room.id && r.type === type.id)}
                                                    >
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* No. of Rooms */}
                                    <div className="md:col-span-2 min-w-0">
                                        <Label className="text-xs text-gray-500 mb-1.5 block">No. of Rooms</Label>
                                        <Select
                                            value={room.count.toString()}
                                            onValueChange={(val) => updateRoom(room.id, "count", parseInt(val))}
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6].map(n => (
                                                    <SelectItem key={n} value={n.toString()}>
                                                        {n} Room{n > 1 ? "s" : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Beds/Room */}
                                    <div className="md:col-span-2 min-w-0">
                                        <Label className="text-xs text-gray-500 mb-1.5 block">Beds/Room</Label>
                                        <Select
                                            value={room.beds.toString()}
                                            onValueChange={(val) => updateRoom(room.id, "beds", parseInt(val))}
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: typeConfig.maxBeds }, (_, i) => i + 1).map(n => (
                                                    <SelectItem key={n} value={n.toString()}>
                                                        {n} Bed{n > 1 ? "s" : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Nightly Rate */}
                                    <div className="md:col-span-2 min-w-0">
                                        <Label className="text-xs text-gray-500 mb-1.5 block">Nightly Rate (₹)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <Input
                                                type="number"
                                                value={room.rate || ""}
                                                onChange={(e) => updateRoom(room.id, "rate", parseInt(e.target.value) || 0)}
                                                placeholder="Enter rate"
                                                className="h-11 pl-8 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex flex-col flex-1">
                                            <Label className="text-xs text-gray-500 mb-1.5 block">Area</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={room.area || ""}
                                                placeholder="0"
                                                className="h-11 bg-white"
                                                onChange={(e) => updateRoom(room.id, "area", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label className="text-xs text-gray-500 mb-1.5 block">Units</Label>
                                            <Select
                                                value={room.areaUnit}
                                                onValueChange={(val) => updateRoom(room.id, "areaUnit", val)}
                                            >
                                                <SelectTrigger className="h-11 w-[90px] shrink-0 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {AREA_UNITS.map(unit => (
                                                        <SelectItem key={unit.value} value={unit.value}>
                                                            {unit.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <div className="md:col-span-1 flex justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRoom(room.id)}
                                            disabled={rooms.length === 1}
                                            className="h-11 w-11 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Summary bar */}
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <BedDouble className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm text-gray-700">
                                        <strong className="text-emerald-700">{totalRooms}</strong> rooms, <strong className="text-emerald-700">{totalBeds}</strong> beds configured
                                    </span>
                                </div>
                                {highestRate > 0 && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm text-gray-700">
                                            Highest rate: <strong className="text-emerald-700">₹{highestRate.toLocaleString()}/night</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                            {determinedCategory && (
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <ArrowRight className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Applicable Category: {determinedCategory.toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Category Selection */}
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    {/* Header with gradient */}
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

                    {/* Category cards */}
                    <div className="bg-white p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {(["silver", "gold", "diamond"] as const).map((cat) => {
                                const isActive = determinedCategory === cat;
                                const config = CATEGORY_RATE_BANDS[cat];
                                const Icon = config.icon;

                                // Category-specific styling
                                const catStyles = {
                                    silver: {
                                        border: isActive ? "border-slate-400 ring-2 ring-slate-300" : "border-gray-200",
                                        bg: isActive ? "bg-gradient-to-br from-slate-50 to-gray-100" : "bg-white",
                                        iconBg: "bg-slate-100",
                                        iconColor: "text-slate-500",
                                        textColor: "text-slate-700"
                                    },
                                    gold: {
                                        border: isActive ? "border-amber-400 ring-2 ring-amber-300" : "border-gray-200",
                                        bg: isActive ? "bg-gradient-to-br from-amber-50 to-yellow-50" : "bg-white",
                                        iconBg: "bg-amber-100",
                                        iconColor: "text-amber-500",
                                        textColor: "text-amber-700"
                                    },
                                    diamond: {
                                        border: isActive ? "border-purple-400 ring-2 ring-purple-300" : "border-gray-200",
                                        bg: isActive ? "bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50" : "bg-white",
                                        iconBg: "bg-gradient-to-r from-cyan-100 to-purple-100",
                                        iconColor: "text-purple-500",
                                        textColor: "text-purple-700"
                                    }
                                };
                                const style = catStyles[cat];

                                return (
                                    <div
                                        key={cat}
                                        className={`relative p-5 rounded-xl border-2 transition-all ${style.border} ${style.bg} ${!isActive && "opacity-60"}`}
                                    >
                                        {isActive && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="bg-emerald-500 text-white px-3 py-1 shadow-lg">
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    APPLICABLE
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg}`}>
                                                <Icon className={`w-6 h-6 ${style.iconColor}`} />
                                            </div>
                                            {isActive && (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            )}
                                        </div>

                                        <h3 className={`text-xl font-bold mb-1 ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                                            {config.label}
                                        </h3>

                                        <p className={`text-sm mb-3 ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                                            {cat === "silver" && "Neighborhood-scale, budget stays"}
                                            {cat === "gold" && "Premium comforts & curated experiences"}
                                            {cat === "diamond" && "Luxury suites with bespoke amenities"}
                                        </p>

                                        <div className={`text-sm font-medium ${isActive ? style.textColor : "text-gray-400"}`}>
                                            Tariff Range: {formatBandLabel(config)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Confirmation message */}
                        {determinedCategory && (
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-emerald-800">
                                            Applicable Category: <strong>{determinedCategory.toUpperCase()}</strong>
                                        </p>
                                        <p className="text-sm text-emerald-600">
                                            Based on your highest room rate of ₹{highestRate.toLocaleString()}/night
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3: Attached Washrooms Confirmation */}
                <div className={`mb-6 rounded-xl overflow-hidden shadow-sm border ${syncAttachedBaths ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                    }`}>
                    <div className="p-4 flex items-start gap-4">
                        <Checkbox
                            id="attached-baths"
                            checked={syncAttachedBaths}
                            onCheckedChange={(checked) => setSyncAttachedBaths(!!checked)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <label htmlFor="attached-baths" className="font-semibold text-gray-800 cursor-pointer">
                                All rooms have attached washrooms
                            </label>
                            <p className={`text-sm ${syncAttachedBaths ? "text-gray-600" : "text-red-600"}`}>
                                {syncAttachedBaths
                                    ? `Total attached washrooms: ${totalRooms}`
                                    : "⚠️ Required: All rooms must have attached washrooms as per HP Tourism guidelines"
                                }
                            </p>
                        </div>
                        {syncAttachedBaths && <Check className="w-6 h-6 text-emerald-500" />}
                    </div>
                </div>

                {/* SECTION 4: GSTIN (Only for Gold/Diamond) */}
                {gstinRequired && (
                    <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                        <div className="p-4">
                            <Label className={`font-semibold ${!gstinValid && gstin.length > 0 ? "text-red-600" : "text-gray-800"}`}>
                                GSTIN Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                className={`mt-2 h-11 ${!gstinValid && gstin.length > 0 ? "border-red-500" : ""}`}
                            />
                            <p className="text-sm text-gray-500 mt-1">Required for Gold and Diamond categories</p>
                            {gstinRequired && gstin.length === 0 && (
                                <p className="text-sm text-red-600 font-medium mt-1">
                                    GSTIN is required for Diamond and Gold categories
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* SECTION 5: Mandatory Safety Checklist */}
                <Card className="mb-6 border-l-4 border-l-blue-500">
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
                            {/* CCTV */}
                            <div
                                className={`flex items-start space-x-3 p-4 border rounded-lg transition-all cursor-pointer ${hasCCTV ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50 border-gray-200"
                                    }`}
                                onClick={() => setHasCCTV(!hasCCTV)}
                            >
                                <Checkbox
                                    id="check-cctv"
                                    checked={hasCCTV}
                                    onCheckedChange={(checked) => setHasCCTV(!!checked)}
                                />
                                <label htmlFor="check-cctv" className="grid gap-1.5 cursor-pointer flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        <Video className="w-4 h-4 text-gray-500" />
                                        CCTV Surveillance
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Required at entrance and common areas
                                    </p>
                                </label>
                            </div>

                            {/* Fire Safety */}
                            <div
                                className={`flex items-start space-x-3 p-4 border rounded-lg transition-all cursor-pointer ${hasFireEquipment ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50 border-gray-200"
                                    }`}
                                onClick={() => setHasFireEquipment(!hasFireEquipment)}
                            >
                                <Checkbox
                                    id="check-fire"
                                    checked={hasFireEquipment}
                                    onCheckedChange={(checked) => setHasFireEquipment(!!checked)}
                                />
                                <label htmlFor="check-fire" className="grid gap-1.5 cursor-pointer flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-gray-500" />
                                        Fire Safety Equipment
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Extinguishers and smoke detectors installed
                                    </p>
                                </label>
                            </div>
                        </div>

                        {(!hasCCTV || !hasFireEquipment) && (
                            <Alert variant="destructive" className="py-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-sm font-medium">Safety Requirements Incomplete</AlertTitle>
                                <AlertDescription className="text-xs">
                                    You must confirm both CCTV and Fire Safety equipment availability to proceed.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button variant="outline" size="lg" className="gap-2">
                        ← Previous
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" size="lg">
                            Save Draft
                        </Button>
                        <Button
                            size="lg"
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            disabled={!determinedCategory || !allSafetyChecked || (gstinRequired && !gstinValid)}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
