/**
 * Service Settings Page
 * 
 * Allows property owners to select which services they offer.
 * Their sidebar will only show enabled services.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/navigation-header";
import { Loader2, Save, Home, Building2, Mountain, Ship, Tent, Plane, UtensilsCrossed, Snowflake } from "lucide-react";
import type { User } from "@shared/schema";

// Available services matching roadmap
const AVAILABLE_SERVICES = [
    {
        id: "homestay",
        name: "Homestay B&B",
        description: "Register and manage your bed & breakfast property",
        icon: Home,
        status: "active" as const,
    },
    {
        id: "adventure_sports",
        name: "Adventure Sports",
        description: "Water sports, rafting, paragliding activities",
        icon: Mountain,
        status: "coming_soon" as const,
    },
    {
        id: "rafting",
        name: "Rafting",
        description: "River rafting operations",
        icon: Ship,
        status: "coming_soon" as const,
    },
    {
        id: "camping",
        name: "Camping",
        description: "Campsite operations",
        icon: Tent,
        status: "coming_soon" as const,
    },
    {
        id: "paragliding",
        name: "Paragliding",
        description: "Paragliding services",
        icon: Plane,
        status: "coming_soon" as const,
    },
    {
        id: "hotel",
        name: "Hotel/Resort",
        description: "Hotel and resort registration",
        icon: Building2,
        status: "coming_soon" as const,
    },
    {
        id: "tour_operator",
        name: "Tour Operator",
        description: "Tour and travel services",
        icon: UtensilsCrossed,
        status: "coming_soon" as const,
    },
    {
        id: "trekking",
        name: "Trekking",
        description: "Trekking and mountaineering",
        icon: Snowflake,
        status: "coming_soon" as const,
    },
] as const;

export default function ServiceSettings() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: userData, isLoading } = useQuery<{ user: User }>({
        queryKey: ["/api/auth/me"],
    });

    const user = userData?.user;

    // Local state for service toggles
    const [enabledServices, setEnabledServices] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize from user data
    useEffect(() => {
        if (user?.enabledServices) {
            setEnabledServices(user.enabledServices as string[]);
        } else {
            setEnabledServices(["homestay"]); // Default
        }
    }, [user]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (services: string[]) => {
            const response = await fetch("/api/users/me/services", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabledServices: services }),
            });
            if (!response.ok) {
                throw new Error("Failed to save service preferences");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setHasChanges(false);
            toast({
                title: "Services updated",
                description: "Your service preferences have been saved.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleToggle = (serviceId: string, enabled: boolean) => {
        let newServices: string[];
        if (enabled) {
            newServices = [...enabledServices, serviceId];
        } else {
            // Don't allow disabling all services - keep at least one
            if (enabledServices.length === 1 && enabledServices[0] === serviceId) {
                toast({
                    title: "Cannot disable",
                    description: "You must have at least one service enabled.",
                    variant: "destructive",
                });
                return;
            }
            newServices = enabledServices.filter(id => id !== serviceId);
        }
        setEnabledServices(newServices);
        setHasChanges(true);
    };

    const handleSave = () => {
        saveMutation.mutate(enabledServices);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <NavigationHeader
                title="My Services"
                subtitle="Select which services you offer"
                showBack={true}
                backTo="/dashboard"
            />

            <div className="container max-w-3xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Service Preferences</CardTitle>
                        <CardDescription>
                            Enable the services you want to manage. Only enabled services will appear in your sidebar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {AVAILABLE_SERVICES.map((service) => {
                            const Icon = service.icon;
                            const isEnabled = enabledServices.includes(service.id);
                            const isActive = service.status === "active";

                            return (
                                <div
                                    key={service.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${isEnabled ? "border-primary/50 bg-primary/5" : "border-border"
                                        } ${!isActive ? "opacity-60" : ""}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                                            <Icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                                                    {service.name}
                                                </Label>
                                                {!isActive && (
                                                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id={service.id}
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => handleToggle(service.id, checked)}
                                        disabled={!isActive}
                                    />
                                </div>
                            );
                        })}

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Preferences
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
