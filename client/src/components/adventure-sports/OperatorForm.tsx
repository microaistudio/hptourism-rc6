import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// HP Districts for dropdown
const HP_DISTRICTS = [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur",
    "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur",
    "Solan", "Una"
];

interface OperatorDetails {
    operatorType: 'individual' | 'company' | 'society';
    operatorName: string;
    localOfficeAddress: string;
    district: string;
    waterBodyName: string;
    areaOfOperation: string;
}

interface OperatorFormProps {
    data: OperatorDetails;
    onChange: (data: OperatorDetails) => void;
}

export function OperatorForm({ data, onChange }: OperatorFormProps) {
    const updateField = (field: keyof OperatorDetails, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Operator & Area Details</CardTitle>
                <CardDescription>
                    Provide information about the operator and location of operations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Operator Type */}
                <div className="space-y-2">
                    <Label htmlFor="operatorType">Operator Type *</Label>
                    <Select
                        value={data.operatorType}
                        onValueChange={(v) => updateField('operatorType', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select operator type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="society">Society / Trust</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Operator / Business Name */}
                <div className="space-y-2">
                    <Label htmlFor="operatorName">
                        {data.operatorType === 'individual' ? 'Operator Name' : 'Business / Organization Name'} *
                    </Label>
                    <Input
                        id="operatorName"
                        value={data.operatorName}
                        onChange={(e) => updateField('operatorName', e.target.value)}
                        placeholder={data.operatorType === 'individual' ? 'Enter your full name' : 'Enter business name'}
                        required
                    />
                </div>

                {/* Local Office Address */}
                <div className="space-y-2">
                    <Label htmlFor="address">Local Office Address *</Label>
                    <Textarea
                        id="address"
                        value={data.localOfficeAddress}
                        onChange={(e) => updateField('localOfficeAddress', e.target.value)}
                        placeholder="Enter complete address of local office"
                        rows={3}
                        required
                    />
                </div>

                {/* District */}
                <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select
                        value={data.district}
                        onValueChange={(v) => updateField('district', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                            {HP_DISTRICTS.map((district) => (
                                <SelectItem key={district} value={district}>
                                    {district}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Water Body Name */}
                <div className="space-y-2">
                    <Label htmlFor="waterBody">Water Body Name *</Label>
                    <Input
                        id="waterBody"
                        value={data.waterBodyName}
                        onChange={(e) => updateField('waterBodyName', e.target.value)}
                        placeholder="e.g., Gobind Sagar Dam, Pong Dam, Renuka Lake"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Enter the name of the dam, lake, or river where you will operate
                    </p>
                </div>

                {/* Area of Operation */}
                <div className="space-y-2">
                    <Label htmlFor="area">Specific Area of Operation *</Label>
                    <Textarea
                        id="area"
                        value={data.areaOfOperation}
                        onChange={(e) => updateField('areaOfOperation', e.target.value)}
                        placeholder="Describe the specific area where you will offer services (e.g., 'Near Bhakra Dam tourist point, Bilaspur')"
                        rows={2}
                        required
                    />
                </div>
            </CardContent>
        </Card>
    );
}
