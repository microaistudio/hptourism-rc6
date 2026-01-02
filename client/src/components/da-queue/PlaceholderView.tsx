/**
 * Placeholder View - Coming Soon component
 */
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface PlaceholderViewProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function PlaceholderView({ title, description, icon: Icon }: PlaceholderViewProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{description}</p>
            <Badge variant="outline" className="mt-4">Coming Soon</Badge>
        </div>
    );
}
