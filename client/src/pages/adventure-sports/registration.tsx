import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send, Save, CheckCircle } from "lucide-react";
import { ActivitySelector, EquipmentForm, ManpowerForm, OperatorForm } from "@/components/adventure-sports";
import type { AdventureSportsApplicationData, User } from "@shared/schema";

const STEPS = [
    { id: 1, title: "Activity Selection", description: "Choose your adventure activity" },
    { id: 2, title: "Operator Details", description: "Your business information" },
    { id: 3, title: "Equipment", description: "Boat and safety equipment details" },
    { id: 4, title: "Manpower", description: "Boatman credentials" },
    { id: 5, title: "Review & Submit", description: "Review and submit application" },
];

const initialFormData: AdventureSportsApplicationData = {
    activityCategory: 'water_sports',
    activityType: 'non_motorized',
    activity: 'paddle_boat',
    operatorType: 'individual',
    operatorName: '',
    localOfficeAddress: '',
    district: '',
    waterBodyName: '',
    areaOfOperation: '',
    equipment: [],
    manpower: [],
};

export default function AdventureSportsRegistration() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<AdventureSportsApplicationData>(initialFormData);

    // Auth check
    const { data: userData, isLoading: authLoading } = useQuery<{ user: User }>({
        queryKey: ["/api/auth/me"],
        retry: false,
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !userData?.user) {
            setLocation("/login");
        }
    }, [authLoading, userData, setLocation]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-12 w-96 mb-2" />
                <Skeleton className="h-6 w-64 mb-8" />
                <Skeleton className="h-2 w-full mb-8" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!userData?.user) {
        return null;
    }

    const progress = (currentStep / STEPS.length) * 100;

    // Create / Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("POST", "/api/adventure-sports/applications", {
                adventureSportsData: formData,
            });
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Application Saved",
                description: "Your application has been saved as a draft.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Save Failed",
                description: error.message || "Failed to save application.",
                variant: "destructive",
            });
        },
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            // First save, then submit
            const saveResponse = await apiRequest("POST", "/api/adventure-sports/applications", {
                adventureSportsData: formData,
            });
            const { application } = await saveResponse.json();

            const submitResponse = await apiRequest("POST", `/api/adventure-sports/applications/${application.id}/submit`, {});
            return submitResponse.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Application Submitted",
                description: "Your application has been submitted for review.",
            });
            setLocation("/services");
        },
        onError: (error: Error) => {
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to submit application.",
                variant: "destructive",
            });
        },
    });

    const getMinEquipment = () => {
        if (!formData.activity) return 1;
        // This could be moved to a shared config or derived from activity type
        if (['paddle_boat', 'row_boat'].includes(formData.activity)) return 3;
        if (['kayak', 'canoe', 'motor_boat', 'speed_boat', 'jet_ski', 'river_rafting'].includes(formData.activity)) return 2; // Example
        if (['paragliding', 'zipline'].includes(formData.activity)) return 1;
        if (['trekking'].includes(formData.activity)) return 0; // Maybe no equipment unit needed? Or 1 kit?
        return 1;
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.activity !== null;
            case 2:
                return formData.operatorName && formData.district && formData.waterBodyName && formData.areaOfOperation;
            case 3:
                return formData.equipment.length >= getMinEquipment();
            case 4:
                return formData.manpower.length >= 1 && formData.manpower.every(m => m.name && m.dob);
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        submitMutation.mutate();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ActivitySelector
                        value={formData.activity as any}
                        onChange={(activity) => setFormData({ ...formData, activity })} // simplified for now
                    />
                );
            case 2:
                return (
                    <OperatorForm
                        data={{
                            operatorType: formData.operatorType,
                            operatorName: formData.operatorName,
                            localOfficeAddress: formData.localOfficeAddress,
                            district: formData.district,
                            waterBodyName: formData.waterBodyName,
                            areaOfOperation: formData.areaOfOperation,
                        }}
                        onChange={(data) => setFormData({ ...formData, ...data })}
                    />
                );
            case 3:
                return (
                    <EquipmentForm
                        activityType={formData.activity}
                        equipment={formData.equipment}
                        onChange={(equipment) => setFormData({ ...formData, equipment })}
                        minRequired={getMinEquipment()}
                    />
                );
            case 4:
                return (
                    <ManpowerForm
                        manpower={formData.manpower}
                        onChange={(manpower) => setFormData({ ...formData, manpower })}
                        activityType={formData.activity}
                    />
                );
            case 5:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Review & Submit
                            </CardTitle>
                            <CardDescription>
                                Please review your application before submitting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Summary */}
                            <div className="grid gap-4">
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium">Activity</h4>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {formData.activity?.replace('_', ' ')}
                                    </p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium">Operator</h4>
                                    <p className="text-sm">{formData.operatorName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.operatorType.charAt(0).toUpperCase() + formData.operatorType.slice(1)} • {formData.district}
                                    </p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium">Location / Area</h4>
                                    <p className="text-sm">{formData.waterBodyName}</p>
                                    <p className="text-sm text-muted-foreground">{formData.areaOfOperation}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                        <h4 className="font-medium">Equipment / Units</h4>
                                        <p className="text-2xl font-bold">{formData.equipment.length}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                        <h4 className="font-medium">Staff</h4>
                                        <p className="text-2xl font-bold">{formData.manpower.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Declarations */}
                            <div className="text-sm text-muted-foreground border-t pt-4">
                                <p>By submitting this application, you declare that:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>All information provided is true and accurate</li>
                                    <li>You agree to comply with HP Adventure Sports Rules</li>
                                    <li>You will maintain safety standards as required</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => setLocation("/services")} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                </Button>
                <h1 className="text-3xl font-bold">Adventure Tourism Registration</h1>
                <p className="text-muted-foreground mt-1">
                    Register for water sports, air sports, and land adventure operations
                </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
                    <span className="text-muted-foreground">{STEPS[currentStep - 1].title}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mb-8">
                {STEPS.map((step) => (
                    <div key={step.id} className="flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.id < currentStep
                                ? 'bg-green-600 text-white'
                                : step.id === currentStep
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {step.id < currentStep ? '✓' : step.id}
                        </div>
                        <span className="text-xs mt-1 hidden md:block text-muted-foreground">
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <div className="mb-8">
                {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || submitMutation.isPending}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Submit Application
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
