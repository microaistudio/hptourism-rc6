import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaffMember {
    role: string;
    name: string;
    dob: string;
    registrationNo?: string;
    firstAidCertified: boolean;
    technicalQualification?: string;
    experienceYears?: number;
}

interface ManpowerFormProps {
    manpower: StaffMember[];
    onChange: (manpower: StaffMember[]) => void;
    activityType?: string; // To suggest roles
}

export function ManpowerForm({ manpower, onChange, activityType }: ManpowerFormProps) {

    const getDefaultRole = () => {
        if (!activityType) return 'staff';
        if (['paddle_boat', 'row_boat'].includes(activityType)) return 'boatman';
        if (['motor_boat', 'speed_boat', 'jet_ski'].includes(activityType)) return 'motor_boat_driver';
        if (['paragliding'].includes(activityType)) return 'pilot';
        if (['trekking', 'rock_climbing'].includes(activityType)) return 'guide';
        if (['river_rafting'].includes(activityType)) return 'guide';
        return 'instructor';
    };

    const addStaff = () => {
        onChange([
            ...manpower,
            {
                role: getDefaultRole(),
                name: '',
                dob: '',
                registrationNo: '',
                firstAidCertified: false,
                technicalQualification: '',
                experienceYears: 0,
            },
        ]);
    };

    const removeStaff = (index: number) => {
        onChange(manpower.filter((_, i) => i !== index));
    };

    const updateStaff = (index: number, field: keyof StaffMember, value: any) => {
        const updated = [...manpower];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const minRequired = 1;
    const hasMinimum = manpower.length >= minRequired;

    // Role options based on activity category
    const getRoleOptions = () => {
        const roles = [
            { value: 'guide', label: 'Guide' },
            { value: 'instructor', label: 'Instructor' },
            { value: 'helper', label: 'Helper' },
            { value: 'manager', label: 'Manager' }
        ];

        if (['paddle_boat', 'row_boat', 'kayak', 'canoe'].includes(activityType || '')) {
            roles.unshift({ value: 'boatman', label: 'Boatman' });
        }
        if (['motor_boat', 'speed_boat', 'jet_ski'].includes(activityType || '')) {
            roles.unshift({ value: 'motor_boat_driver', label: 'Motor Boat Driver' });
            roles.unshift({ value: 'life_guard', label: 'Life Guard' });
        }
        if (['paragliding'].includes(activityType || '')) {
            roles.unshift({ value: 'pilot', label: 'Pilot (Tandem)' });
        }

        return roles;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Manpower / Staff Details</CardTitle>
                        <CardDescription>
                            Add qualified staff details
                        </CardDescription>
                    </div>
                    <Button onClick={addStaff} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Staff
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasMinimum && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            At least {minRequired} qualified staff member required.
                        </AlertDescription>
                    </Alert>
                )}

                {manpower.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No staff added yet. Click "Add Staff" to get started.</p>
                    </div>
                ) : (
                    manpower.map((person, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 relative"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Staff Member #{index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStaff(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`role-${index}`}>Role</Label>
                                    <Select
                                        value={person.role}
                                        onValueChange={(v) => updateStaff(index, 'role', v)}
                                    >
                                        <SelectTrigger id={`role-${index}`}>
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getRoleOptions().map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                                    <Input
                                        id={`name-${index}`}
                                        value={person.name}
                                        onChange={(e) => updateStaff(index, 'name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`dob-${index}`}>Date of Birth *</Label>
                                    <Input
                                        id={`dob-${index}`}
                                        type="date"
                                        value={person.dob}
                                        onChange={(e) => updateStaff(index, 'dob', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`reg-${index}`}>License / Certificate No.</Label>
                                    <Input
                                        id={`reg-${index}`}
                                        value={person.registrationNo || ''}
                                        onChange={(e) => updateStaff(index, 'registrationNo', e.target.value)}
                                        placeholder="If applicable"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`qual-${index}`}>Tech. Qualification</Label>
                                    <Input
                                        id={`qual-${index}`}
                                        value={person.technicalQualification || ''}
                                        onChange={(e) => updateStaff(index, 'technicalQualification', e.target.value)}
                                        placeholder="e.g. Basic Course, P2"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox
                                        id={`firstaid-${index}`}
                                        checked={person.firstAidCertified}
                                        onCheckedChange={(checked) => updateStaff(index, 'firstAidCertified', !!checked)}
                                    />
                                    <Label htmlFor={`firstaid-${index}`}>First Aid Certified</Label>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
