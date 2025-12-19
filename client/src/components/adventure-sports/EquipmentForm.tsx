import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Ship, AlertCircle, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface Equipment {
    type: string;
    manufacturer: string;
    identificationNo: string;
    yearOfManufacture: string;
    safetyEquipment: {
        lifeJackets?: number;
        lifebuoys?: number;
        firstAidKit: boolean;
        helmet?: boolean;
        harness?: boolean;
        reserveParachute?: boolean;
        communicationDevice?: boolean;
        insuranceValid?: boolean;
        fitnessCertificate?: boolean;
        [key: string]: any;
    };
}

interface EquipmentFormProps {
    activityType: string; // Generic string to support all types
    equipment: Equipment[];
    onChange: (equipment: Equipment[]) => void;
    minRequired?: number; // Optional custom minimum
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function EquipmentForm({ activityType, equipment, onChange, minRequired = 1 }: EquipmentFormProps) {
    const addEquipment = () => {
        // Default safety equipment based on broader categories
        let defaultSafety: Equipment['safetyEquipment'] = { firstAidKit: true };

        if (['paddle_boat', 'row_boat', 'kayak', 'canoe', 'motor_boat', 'speed_boat', 'jet_ski', 'river_rafting'].includes(activityType)) {
            defaultSafety = { ...defaultSafety, lifeJackets: 4, lifebuoys: 2 };
        } else if (['paragliding', 'zipline', 'bungy_jumping'].includes(activityType)) {
            defaultSafety = { ...defaultSafety, helmet: true, harness: true, insuranceValid: true };
        } else if (['trekking', 'rock_climbing', 'mountain_biking'].includes(activityType)) {
            defaultSafety = { ...defaultSafety, helmet: true, communicationDevice: true };
        }

        onChange([
            ...equipment,
            {
                type: activityType,
                manufacturer: '',
                identificationNo: '',
                yearOfManufacture: currentYear.toString(),
                safetyEquipment: defaultSafety,
            },
        ]);
    };

    const removeEquipment = (index: number) => {
        onChange(equipment.filter((_, i) => i !== index));
    };

    const updateEquipment = (index: number, field: keyof Equipment, value: any) => {
        const updated = [...equipment];
        if (field === 'safetyEquipment') {
            updated[index] = { ...updated[index], safetyEquipment: value };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        onChange(updated);
    };

    const updateSafetyEquipment = (index: number, field: string, value: any) => {
        const updated = [...equipment];
        updated[index] = {
            ...updated[index],
            safetyEquipment: {
                ...updated[index].safetyEquipment,
                [field]: value,
            },
        };
        onChange(updated);
    };

    const hasMinimum = equipment.length >= minRequired;

    // Helper to determine unit label
    const getUnitLabel = () => {
        if (['paddle_boat', 'row_boat', 'kayak', 'canoe', 'motor_boat', 'speed_boat', 'jet_ski', 'river_rafting'].includes(activityType)) return "Boat/Craft";
        if (['paragliding'].includes(activityType)) return "Glider";
        if (['zipline', 'bungee_jumping'].includes(activityType)) return "Setup/Unit";
        if (['mountain_biking'].includes(activityType)) return "Bike";
        return "Unit";
    };

    const unitLabel = getUnitLabel();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Equipment / Unit Details</CardTitle>
                        <CardDescription>
                            Add details for each {unitLabel.toLowerCase()}
                        </CardDescription>
                    </div>
                    <Button onClick={addEquipment} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add {unitLabel}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasMinimum && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Minimum {minRequired} {unitLabel.toLowerCase()}(s) required. Currently: {equipment.length}
                        </AlertDescription>
                    </Alert>
                )}

                {equipment.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No equipment added yet. Click "Add {unitLabel}" to get started.</p>
                    </div>
                ) : (
                    equipment.map((item, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 relative"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">{unitLabel} #{index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEquipment(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`manufacturer-${index}`}>Manufacturer / Make</Label>
                                    <Input
                                        id={`manufacturer-${index}`}
                                        value={item.manufacturer}
                                        onChange={(e) => updateEquipment(index, 'manufacturer', e.target.value)}
                                        placeholder="e.g., Yamaha, Niviuk, Local"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`id-${index}`}>ID / Serial Number</Label>
                                    <Input
                                        id={`id-${index}`}
                                        value={item.identificationNo}
                                        onChange={(e) => updateEquipment(index, 'identificationNo', e.target.value)}
                                        placeholder="Unique ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`year-${index}`}>Year of Manufacture</Label>
                                    <Select
                                        value={item.yearOfManufacture}
                                        onValueChange={(v) => updateEquipment(index, 'yearOfManufacture', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Dynamic Safety Equipment Section */}
                            <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                                <Label className="text-sm font-medium">Safety Equipment & Certifications</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Water Sports Specific */}
                                    {['paddle_boat', 'row_boat', 'kayak', 'canoe', 'motor_boat', 'speed_boat', 'jet_ski', 'river_rafting'].includes(activityType) && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor={`jackets-${index}`} className="text-xs">Life Jackets</Label>
                                                <Input
                                                    id={`jackets-${index}`}
                                                    type="number"
                                                    min="0"
                                                    value={item.safetyEquipment.lifeJackets || 0}
                                                    onChange={(e) => updateSafetyEquipment(index, 'lifeJackets', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`buoys-${index}`} className="text-xs">Lifebuoys</Label>
                                                <Input
                                                    id={`buoys-${index}`}
                                                    type="number"
                                                    min="0"
                                                    value={item.safetyEquipment.lifebuoys || 0}
                                                    onChange={(e) => updateSafetyEquipment(index, 'lifebuoys', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Air Sports Specific */}
                                    {['paragliding', 'zipline', 'bungee_jumping'].includes(activityType) && (
                                        <>
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Checkbox
                                                    id={`helmet-${index}`}
                                                    checked={item.safetyEquipment.helmet}
                                                    onCheckedChange={(checked) => updateSafetyEquipment(index, 'helmet', !!checked)}
                                                />
                                                <Label htmlFor={`helmet-${index}`} className="text-xs">Helmet Available</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Checkbox
                                                    id={`harness-${index}`}
                                                    checked={item.safetyEquipment.harness}
                                                    onCheckedChange={(checked) => updateSafetyEquipment(index, 'harness', !!checked)}
                                                />
                                                <Label htmlFor={`harness-${index}`} className="text-xs">Harness Certified</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Checkbox
                                                    id={`insurance-${index}`}
                                                    checked={item.safetyEquipment.insuranceValid}
                                                    onCheckedChange={(checked) => updateSafetyEquipment(index, 'insuranceValid', !!checked)}
                                                />
                                                <Label htmlFor={`insurance-${index}`} className="text-xs">Valid Insurance</Label>
                                            </div>
                                        </>
                                    )}

                                    {/* Common/Standard */}
                                    <div className="flex items-center space-x-2 pt-6">
                                        <Checkbox
                                            id={`firstaid-${index}`}
                                            checked={item.safetyEquipment.firstAidKit}
                                            onCheckedChange={(checked) => updateSafetyEquipment(index, 'firstAidKit', !!checked)}
                                        />
                                        <Label htmlFor={`firstaid-${index}`} className="text-xs">First Aid Kit</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
