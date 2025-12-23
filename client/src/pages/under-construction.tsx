/**
 * Under Construction Page
 * 
 * Placeholder for features that are planned but not yet implemented.
 */

import { Construction, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

interface UnderConstructionProps {
    title?: string;
    description?: string;
    featureName?: string;
    expectedPhase?: string;
}

export function UnderConstruction({
    title = "Under Construction",
    description = "This feature is coming soon!",
    featureName,
    expectedPhase,
}: UnderConstructionProps) {
    const [, setLocation] = useLocation();

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
            <Card className="max-w-lg w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                        <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {featureName && (
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{featureName}</span>
                                {expectedPhase && (
                                    <span> is planned for {expectedPhase}</span>
                                )}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={() => setLocation("/")}>
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Pre-configured pages for specific features
export function GrievancesUnderConstruction() {
    return (
        <UnderConstruction
            title="Grievances System"
            description="The ticket-based grievance management system is under development."
            featureName="Grievance System"
            expectedPhase="Phase 4"
        />
    );
}

export function HelpUnderConstruction() {
    return (
        <UnderConstruction
            title="Help & FAQ"
            description="Help documentation and frequently asked questions are being prepared."
            featureName="Help Center"
            expectedPhase="Phase 4"
        />
    );
}
