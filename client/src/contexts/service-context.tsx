/**
 * Service Context
 * 
 * Manages the currently selected service for officers.
 * Persists selection to localStorage and syncs with URL.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation, useSearch } from "wouter";

// All supported services (8 total as per roadmap)
export const SERVICES = [
    { id: "homestay", label: "Homestay B&B", icon: "🏠", active: true },
    { id: "adventure_sports", label: "Adventure Sports", icon: "🏔️", active: false },
    { id: "rafting", label: "Rafting", icon: "🚣", active: false },
    { id: "camping", label: "Camping", icon: "⛺", active: false },
    { id: "paragliding", label: "Paragliding", icon: "🪂", active: false },
    { id: "trekking", label: "Trekking", icon: "🥾", active: false },
    { id: "hotel", label: "Hotel/Resort", icon: "🏨", active: false },
    { id: "tour_operator", label: "Tour Operator", icon: "🎫", active: false },
] as const;

export type ServiceId = typeof SERVICES[number]["id"];

export interface ServiceInfo {
    id: ServiceId;
    label: string;
    icon: string;
    active: boolean;
}

interface ServiceContextValue {
    /** Currently selected service ID */
    selectedService: ServiceId;
    /** Service info object for selected service */
    currentServiceInfo: ServiceInfo;
    /** All available services */
    services: readonly ServiceInfo[];
    /** Only services that are currently active */
    activeServices: ServiceInfo[];
    /** Change selected service */
    setSelectedService: (serviceId: ServiceId) => void;
    /** Check if a specific service is currently selected */
    isSelected: (serviceId: ServiceId) => boolean;
}

const STORAGE_KEY = "hptourism_selected_service";
const DEFAULT_SERVICE: ServiceId = "homestay";

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
    const [selectedService, setSelectedServiceState] = useState<ServiceId>(() => {
        // Try to get from localStorage on initial load
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && SERVICES.some(s => s.id === stored)) {
                return stored as ServiceId;
            }
        }
        return DEFAULT_SERVICE;
    });

    const searchString = useSearch();
    const [, setLocation] = useLocation();

    // Sync with URL on mount
    useEffect(() => {
        const params = new URLSearchParams(searchString);
        const urlService = params.get("service");
        if (urlService && SERVICES.some(s => s.id === urlService)) {
            setSelectedServiceState(urlService as ServiceId);
        }
    }, []);

    // Persist to localStorage when selection changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, selectedService);
    }, [selectedService]);

    const setSelectedService = useCallback((serviceId: ServiceId) => {
        setSelectedServiceState(serviceId);
        // Optionally update URL (commented out to avoid disrupting navigation)
        // const params = new URLSearchParams(window.location.search);
        // params.set("service", serviceId);
        // setLocation(`${window.location.pathname}?${params.toString()}`);
    }, []);

    const currentServiceInfo = SERVICES.find(s => s.id === selectedService) || SERVICES[0];
    const activeServices = SERVICES.filter(s => s.active);

    const isSelected = useCallback((serviceId: ServiceId) => {
        return selectedService === serviceId;
    }, [selectedService]);

    return (
        <ServiceContext.Provider
            value={{
                selectedService,
                currentServiceInfo,
                services: SERVICES,
                activeServices,
                setSelectedService,
                isSelected,
            }}
        >
            {children}
        </ServiceContext.Provider>
    );
}

export function useService() {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error("useService must be used within a ServiceProvider");
    }
    return context;
}

// Optional hook for components that may be outside provider
export function useServiceOptional() {
    return useContext(ServiceContext);
}
