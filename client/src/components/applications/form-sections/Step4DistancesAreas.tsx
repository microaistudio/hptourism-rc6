import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { normalizeOptionalFloat, type ApplicationForm } from "@/lib/application-schema";
import {
    Mountain,
    Waves,
    Droplets,
    Wind,
    Tent,
    Bike,
    Landmark,
    Church,
    ShoppingBag,
    Home,
    Castle,
    Sunrise,
    Apple,
    TreePine,
    Snowflake,
    Thermometer,
    Bird,
    Ship,
    Fish,
    Plane,
    Train,
    Building2,
    Bus,
    Car,
    Check,
} from "lucide-react";

// Nearby Attractions within 5-10 km
const NEARBY_ATTRACTIONS = [
    { id: "hikingTrail", label: "Hiking/Trekking Trail", icon: Mountain },
    { id: "riverStream", label: "River/Stream Nearby", icon: Waves },
    { id: "waterfall", label: "Waterfall", icon: Droplets },
    { id: "paraglidingSite", label: "Paragliding Site", icon: Wind },
    { id: "campingGround", label: "Camping Ground", icon: Tent },
    { id: "mountainBiking", label: "Mountain Biking Trail", icon: Bike },
    { id: "historicTemple", label: "Ancient/Historic Temple", icon: Landmark },
    { id: "buddhistMonastery", label: "Buddhist Monastery", icon: Church },
    { id: "handicraftMarket", label: "Local Handicraft Market", icon: ShoppingBag },
    { id: "heritageVillage", label: "Traditional Heritage Village", icon: Home },
    { id: "historicFort", label: "Historic Fort/Heritage Site", icon: Castle },
    { id: "viewpoint", label: "Mountain/Valley Viewpoint", icon: Sunrise },
    { id: "appleOrchards", label: "Apple Orchards", icon: Apple },
    { id: "pineForest", label: "Pine/Deodar Forest", icon: TreePine },
    { id: "snowPoint", label: "Snow Point (Seasonal)", icon: Snowflake },
    { id: "hotSprings", label: "Hot Springs (Natural)", icon: Thermometer },
    { id: "wildlifeSanctuary", label: "Wildlife Sanctuary/National Park", icon: Bird },
    { id: "lakeBoating", label: "Lake/Boating", icon: Ship },
    { id: "fishingSpot", label: "Fishing Spot", icon: Fish },
];

const DISTANCE_FIELDS = [
    { key: "distanceAirport" as const, label: "Airport", icon: Plane },
    { key: "distanceRailway" as const, label: "Railway Station", icon: Train },
    { key: "distanceCityCenter" as const, label: "City Centre", icon: Building2 },
    { key: "distanceShopping" as const, label: "Shopping Centre", icon: ShoppingBag },
    { key: "distanceBusStand" as const, label: "Bus Stand", icon: Bus },
];

interface Step4DistancesAreasProps {
    form: UseFormReturn<ApplicationForm>;
    selectedAttractions: Record<string, boolean>;
    setSelectedAttractions: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export function Step4DistancesAreas({ form, selectedAttractions, setSelectedAttractions }: Step4DistancesAreasProps) {
    const selectedCount = Object.values(selectedAttractions).filter(Boolean).length;

    return (
        <Card className="shadow-lg border-0 overflow-hidden">
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
                        <FormField
                            control={form.control}
                            name="parkingArea"
                            render={({ field }) => (
                                <FormItem>
                                    <label className="text-xs text-gray-500 flex items-center gap-2">
                                        <Car className="w-4 h-4" />
                                        Parking Description
                                    </label>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe parking facilities (e.g., covered parking for 5 cars, open space for 2-wheelers)"
                                            className="min-h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-gray-400">Optional - describe available parking</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                            onCheckedChange={(checked) =>
                                                setSelectedAttractions(prev => ({ ...prev, [attraction.id]: !!checked }))
                                            }
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
    );
}
