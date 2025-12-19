import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Anchor, Ship, Waves, Mountain, Wind, Bike, Footprints, Cable } from "lucide-react";

// Activity types - expanded beyond Phase 1A
type ActivityType =
    | 'paddle_boat'
    | 'row_boat'
    | 'kayak'
    | 'canoe'
    | 'motor_boat'
    | 'speed_boat'
    | 'jet_ski'
    | 'river_rafting'
    | 'paragliding'
    | 'zipline'
    | 'trekking'
    | 'mountain_biking'
    | 'rock_climbing'
    | 'bungee_jumping';

interface ActivitySelectorProps {
    value: ActivityType | null;
    onChange: (activity: ActivityType) => void;
}

// Activity categories organized by type
const ACTIVITY_CATEGORIES = {
    water_non_motorized: {
        name: 'Non-Motorized Water Sports',
        status: 'active',
        activities: [
            {
                id: 'paddle_boat' as const,
                name: 'Paddle Boat',
                description: 'Recreational paddle boats for calm water activities',
                minEquipment: 3,
                icon: Ship,
            },
            {
                id: 'row_boat' as const,
                name: 'Row Boat',
                description: 'Traditional row boats for water body operations',
                minEquipment: 3,
                icon: Anchor,
            },
            {
                id: 'kayak' as const,
                name: 'Kayak',
                description: 'Single or double kayaks for river/lake exploration',
                minEquipment: 5,
                icon: Waves,
            },
            {
                id: 'canoe' as const,
                name: 'Canoe',
                description: 'Open canoes for group water activities',
                minEquipment: 3,
                icon: Anchor,
            },
        ],
    },
    water_motorized: {
        name: 'Motorized Water Sports',
        status: 'active',
        activities: [
            {
                id: 'motor_boat' as const,
                name: 'Motor Boat',
                description: 'Motorized boats for touring and transport',
                minEquipment: 2,
                icon: Ship,
            },
            {
                id: 'speed_boat' as const,
                name: 'Speed Boat',
                description: 'High-speed boats for recreational use',
                minEquipment: 2,
                icon: Ship,
            },
            {
                id: 'jet_ski' as const,
                name: 'Jet Ski',
                description: 'Personal watercraft for adventure seekers',
                minEquipment: 3,
                icon: Waves,
            },
        ],
    },
    river_adventure: {
        name: 'River & Rapids',
        status: 'active',
        activities: [
            {
                id: 'river_rafting' as const,
                name: 'River Rafting',
                description: 'White water rafting on rivers and rapids',
                minEquipment: 5,
                icon: Waves,
            },
        ],
    },
    air_adventure: {
        name: 'Air Adventure',
        status: 'active',
        activities: [
            {
                id: 'paragliding' as const,
                name: 'Paragliding',
                description: 'Tandem and solo paragliding operations',
                minEquipment: 1,
                icon: Wind,
            },
            {
                id: 'zipline' as const,
                name: 'Zipline',
                description: 'Zipline and aerial rope courses',
                minEquipment: 1,
                icon: Cable,
            },
            {
                id: 'bungee_jumping' as const,
                name: 'Bungee Jumping',
                description: 'Bungee jumping platforms and facilities',
                minEquipment: 1,
                icon: Mountain,
            },
        ],
    },
    land_adventure: {
        name: 'Land Adventure',
        status: 'active',
        activities: [
            {
                id: 'trekking' as const,
                name: 'Trekking',
                description: 'Guided trekking and hiking expeditions',
                minEquipment: 1,
                icon: Footprints,
            },
            {
                id: 'mountain_biking' as const,
                name: 'Mountain Biking',
                description: 'Off-road mountain biking trails and tours',
                minEquipment: 5,
                icon: Bike,
            },
            {
                id: 'rock_climbing' as const,
                name: 'Rock Climbing',
                description: 'Natural and artificial climbing walls',
                minEquipment: 5,
                icon: Mountain,
            },
        ],
    },
};

export function ActivitySelector({ value, onChange }: ActivitySelectorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Activity Selection</CardTitle>
                <CardDescription>
                    Select the type of adventure activity you want to register
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="water_non_motorized" className="space-y-4">
                    <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1">
                        <TabsTrigger value="water_non_motorized" className="text-xs">
                            Non-Motor Boats
                        </TabsTrigger>
                        <TabsTrigger value="water_motorized" className="text-xs">
                            Motor Boats
                        </TabsTrigger>
                        <TabsTrigger value="river_adventure" className="text-xs">
                            Rafting
                        </TabsTrigger>
                        <TabsTrigger value="air_adventure" className="text-xs">
                            Air Sports
                        </TabsTrigger>
                        <TabsTrigger value="land_adventure" className="text-xs">
                            Land Sports
                        </TabsTrigger>
                    </TabsList>

                    {Object.entries(ACTIVITY_CATEGORIES).map(([key, category]) => (
                        <TabsContent key={key} value={key} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">{category.name}</h3>
                                {category.status === 'development' && (
                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                        Coming Soon
                                    </Badge>
                                )}
                            </div>

                            <RadioGroup
                                value={value || ''}
                                onValueChange={(v) => onChange(v as ActivityType)}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                disabled={category.status === 'development'}
                            >
                                {category.activities.map((activity) => (
                                    <Label
                                        key={activity.id}
                                        htmlFor={activity.id}
                                        className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${category.status === 'development'
                                            ? 'opacity-50 cursor-not-allowed'
                                            : value === activity.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <RadioGroupItem
                                            value={activity.id}
                                            id={activity.id}
                                            className="mt-1"
                                            disabled={category.status === 'development'}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <activity.icon className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{activity.name}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Min. Equipment: {activity.minEquipment}
                                            </p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}

