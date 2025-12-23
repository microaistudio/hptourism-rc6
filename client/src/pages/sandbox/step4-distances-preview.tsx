import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    MapPin, Plane, Train, Building2, ShoppingBag, Bus, Car,
    Mountain, Waves, Droplets, Wind, Tent, Bike, Landmark,
    Church, Home, Castle, Sunrise, Apple, TreePine, Snowflake,
    Thermometer, Bird, Ship, Fish, Check
} from "lucide-react";

// Nearby Attractions
const NEARBY_ATTRACTIONS = [
    { id: "hikingTrail", label: "Hiking/Trekking Trail", icon: Mountain },
    { id: "riverStream", label: "River/Stream Nearby", icon: Waves },
    { id: "waterfall", label: "Waterfall", icon: Droplets },
    { id: "paraglidingSite", label: "Paragliding Site", icon: Wind },
    { id: "campingGround", label: "Camping Ground", icon: Tent },
    { id: "mountainBiking", label: "Mountain Biking Trail", icon: Bike },
    { id: "historicTemple", label: "Ancient/Historic Temple", icon: Landmark },
    { id: "buddhistMonastery", label: "Buddhist Monastery", icon: Church },
    { id: "heritageVillage", label: "Traditional Heritage Village", icon: Home },
    { id: "historicFort", label: "Historic Fort/Heritage Site", icon: Castle },
    { id: "viewpoint", label: "Mountain/Valley Viewpoint", icon: Sunrise },
    { id: "appleOrchards", label: "Apple Orchards", icon: Apple },
    { id: "pineForest", label: "Pine/Deodar Forest", icon: TreePine },
    { id: "snowPoint", label: "Snow Point (Seasonal)", icon: Snowflake },
    { id: "hotSprings", label: "Hot Springs (Natural)", icon: Thermometer },
    { id: "wildlifeSanctuary", label: "Wildlife Sanctuary", icon: Bird },
    { id: "lakeBoating", label: "Lake/Boating", icon: Ship },
    { id: "fishingSpot", label: "Fishing Spot", icon: Fish },
];

interface DistanceFormData {
    airport: string;
    railway: string;
    cityCenter: string;
    shopping: string;
    busStand: string;
    parking: string;
}

export default function Step4DistancesPreview() {
    const [distances, setDistances] = useState<DistanceFormData>({
        airport: "",
        railway: "",
        cityCenter: "",
        shopping: "",
        busStand: "",
        parking: "",
    });

    const [selectedAttractions, setSelectedAttractions] = useState<Record<string, boolean>>({});

    const updateDistance = (field: keyof DistanceFormData, value: string) => {
        setDistances(prev => ({ ...prev, [field]: value }));
    };

    const toggleAttraction = (id: string) => {
        setSelectedAttractions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectedCount = Object.values(selectedAttractions).filter(Boolean).length;

    const distanceFields = [
        { key: "airport" as const, label: "Airport", icon: Plane, placeholder: "Distance in KM" },
        { key: "railway" as const, label: "Railway Station", icon: Train, placeholder: "Distance in KM" },
        { key: "cityCenter" as const, label: "City Centre", icon: Building2, placeholder: "Distance in KM" },
        { key: "shopping" as const, label: "Shopping Centre", icon: ShoppingBag, placeholder: "Distance in KM" },
        { key: "busStand" as const, label: "Bus Stand", icon: Bus, placeholder: "Distance in KM" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">Step 4: Distances & Nearby Attractions</h1>
                    <p className="text-slate-500">Sandbox Preview - Location details and nearby tourist attractions (all fields optional)</p>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        {/* Section 1: Distances */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                                    <div>
                                        <h2 className="font-semibold">Distances from Key Locations</h2>
                                        <p className="text-sm text-white/70">Approximate distances in kilometers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {distanceFields.map(field => {
                                        const IconComponent = field.icon;
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="text-xs text-gray-500 flex items-center gap-2">
                                                    <IconComponent className="w-4 h-4" />
                                                    {field.label}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder={field.placeholder}
                                                        value={distances[field.key]}
                                                        onChange={(e) => updateDistance(field.key, e.target.value)}
                                                        className="h-11 pr-12"
                                                        min="0"
                                                        step="0.1"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                                                        KM
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Parking */}
                        <div className="border-b">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                                    <div>
                                        <h2 className="font-semibold">Parking Facilities</h2>
                                        <p className="text-sm text-white/70">Describe available parking options</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-500 flex items-center gap-2">
                                        <Car className="w-4 h-4" />
                                        Parking Description
                                    </Label>
                                    <Textarea
                                        placeholder="Describe parking facilities (e.g., covered parking for 5 cars, open space for 2-wheelers)"
                                        value={distances.parking}
                                        onChange={(e) => updateDistance("parking", e.target.value)}
                                        className="min-h-20"
                                    />
                                    <p className="text-xs text-gray-400">Optional - describe available parking</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Nearby Attractions */}
                        <div>
                            <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="font-semibold">Explore Himachal: Nearby Attractions</h2>
                                                <p className="text-sm text-white/70">Select attractions within 5-20 km of your property</p>
                                            </div>
                                            {selectedCount > 0 && (
                                                <Badge className="bg-white/20 text-white hover:bg-white/30">
                                                    {selectedCount} selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {NEARBY_ATTRACTIONS.map(attraction => {
                                        const IconComponent = attraction.icon;
                                        const isChecked = selectedAttractions[attraction.id] || false;
                                        return (
                                            <label
                                                key={attraction.id}
                                                htmlFor={`attraction-${attraction.id}`}
                                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${isChecked
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={`attraction-${attraction.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() => toggleAttraction(attraction.id)}
                                                />
                                                <div className="flex items-center gap-2 flex-1">
                                                    <IconComponent className={`w-4 h-4 ${isChecked ? "text-primary" : "text-gray-400"}`} />
                                                    <span className={`text-sm font-medium ${isChecked ? "text-primary" : "text-gray-700"}`}>
                                                        {attraction.label}
                                                    </span>
                                                </div>
                                                {isChecked && <Check className="w-4 h-4 text-primary" />}
                                            </label>
                                        );
                                    })}
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
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                    <span className="text-sm font-medium">Location Details</span>
                                </div>
                                {Object.values(distances).filter(v => v).length > 0 && (
                                    <Badge variant="outline">
                                        {Object.values(distances).filter(v => v).length} distances entered
                                    </Badge>
                                )}
                                {selectedCount > 0 && (
                                    <Badge variant="secondary">
                                        {selectedCount} attractions nearby
                                    </Badge>
                                )}
                            </div>
                            <Button>
                                Continue to Step 5
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">All fields on this step are optional</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Adding distance information and nearby attractions helps tourists discover your property.
                                You can skip this step and come back later if needed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
