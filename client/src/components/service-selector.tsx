/**
 * Service Selector
 * 
 * Dropdown component for the header bar that allows users
 * to switch between different tourism services.
 * - Officers: See all services (with "coming soon" for inactive ones)
 * - Owners: See only their enabled services
 */

import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useService, SERVICES, type ServiceId } from "@/contexts/service-context";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
    /** Only show active services */
    activeOnly?: boolean;
    /** Filter to only these service IDs (for owners) */
    allowedServices?: string[];
    /** Additional CSS classes */
    className?: string;
}

export function ServiceSelector({ activeOnly = false, allowedServices, className }: ServiceSelectorProps) {
    const { selectedService, setSelectedService, currentServiceInfo } = useService();

    // Filter services based on props
    let displayedServices = [...SERVICES];

    // If allowedServices provided, filter to only those
    if (allowedServices && allowedServices.length > 0) {
        displayedServices = displayedServices.filter(s => allowedServices.includes(s.id));
    }

    // If activeOnly, filter to only active services
    if (activeOnly) {
        displayedServices = displayedServices.filter(s => s.active);
    }

    // Don't show if no services available
    if (displayedServices.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 px-3 gap-2 font-medium border-primary/20 hover:border-primary/40",
                        "bg-background/80 backdrop-blur-sm",
                        className
                    )}
                >
                    <span className="text-lg">{currentServiceInfo.icon}</span>
                    <span className="hidden sm:inline">{currentServiceInfo.label}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Select Service</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {displayedServices.map((service) => (
                    <DropdownMenuItem
                        key={service.id}
                        className={cn(
                            "flex items-center gap-3 cursor-pointer",
                            !service.active && "opacity-50"
                        )}
                        disabled={!service.active}
                        onClick={() => service.active && setSelectedService(service.id)}
                    >
                        <span className="text-lg w-6 text-center">{service.icon}</span>
                        <span className="flex-1">{service.label}</span>
                        {selectedService === service.id && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                        {!service.active && (
                            <span className="text-xs text-muted-foreground">Soon</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
