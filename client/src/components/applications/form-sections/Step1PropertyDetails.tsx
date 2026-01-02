import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { getTehsilsForDistrict } from "@shared/regions";
import {
    HP_STATE,
    HP_DISTRICTS,
    LOCATION_TYPES,
    PROJECT_TYPE_OPTIONS,
    PINCODE_PREFIX,
    PINCODE_SUFFIX_LENGTH,
    sanitizePincodeSuffix,
    type ApplicationForm,
} from "@/lib/application-schema";

interface Step1PropertyDetailsProps {
    form: UseFormReturn<ApplicationForm>;
    step: number;
    isServiceDraft: boolean;
    watchedDistrict: string;
    locationType: "mc" | "tcp" | "gp";
    pincodeSuffixValue: string;
    showPincodeHint: boolean;
    showRequiredWarning?: boolean; // Highlight empty required fields
    gramFieldConfig: {
        label: string;
        placeholder: string;
        description: string;
        requiredMessage: string;
    } | null;
    urbanBodyConfig: {
        label: string;
        placeholder: string;
        description: string;
    };
}

export function Step1PropertyDetails({
    form,
    step,
    isServiceDraft,
    watchedDistrict,
    locationType,
    pincodeSuffixValue,
    showPincodeHint,
    showRequiredWarning = false,
    gramFieldConfig,
    urbanBodyConfig,
}: Step1PropertyDetailsProps) {
    const isHydratingDraft = useRef(false);

    // Track initial values to determine if fields should be locked
    // (Only lock if they had data when the form loaded)
    const initialGramPanchayat = useRef<string | null>(null);
    const initialUrbanBody = useRef<string | null>(null);

    // Capture initial values on first render
    if (initialGramPanchayat.current === null) {
        initialGramPanchayat.current = form.getValues('gramPanchayat') || '';
    }
    if (initialUrbanBody.current === null) {
        initialUrbanBody.current = form.getValues('urbanBody') || '';
    }

    const gramWasPopulated = !!initialGramPanchayat.current;
    const urbanWasPopulated = !!initialUrbanBody.current;

    return (
        <Card className="shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
                {isServiceDraft && (
                    <div className="m-6 mb-0 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Property identity is inherited from your approved application. Start a new registration if structural details need to change.
                        </p>
                    </div>
                )}
                <div className="space-y-0">
                    {/* Section 1: Basic Information */}
                    <div className="border-b">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                                <div>
                                    <h2 className="font-semibold">Basic Information</h2>
                                    <p className="text-sm text-white/70">Property name and registration type</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="propertyName"
                                    rules={{ required: "Property name is required" }}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Homestay Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Himalayan View Homestay"
                                                    data-testid="input-property-name"
                                                    aria-invalid={fieldState.invalid}
                                                    className={fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : showRequiredWarning && !field.value?.trim() ? "border-amber-400 ring-2 ring-amber-200" : ""}
                                                    disabled={isServiceDraft}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Choose a memorable name for your homestay</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="projectType"
                                    rules={{ required: "Property type is required" }}
                                    render={({ field }) => {
                                        // Auto-determine the label based on context
                                        const displayLabel = isServiceDraft
                                            ? "Existing Property (Service Request)"
                                            : "New Homestay Registration";

                                        return (
                                            <FormItem>
                                                <FormLabel>
                                                    {isServiceDraft ? "Service Request" : "New Registration"} <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        value={displayLabel}
                                                        readOnly
                                                        className="bg-gray-50 cursor-not-allowed"
                                                        data-testid="input-project-type"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {isServiceDraft
                                                        ? "Amendment request for your approved property."
                                                        : "Submit a fresh homestay registration."}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location Hierarchy */}
                    <div className="border-b">
                        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                                <div>
                                    <h2 className="font-semibold">Location Hierarchy</h2>
                                    <p className="text-sm text-white/70">State, District, and Tehsil selection</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">State</label>
                                    <Input value={HP_STATE} readOnly className="h-11 bg-gray-50" />
                                    <p className="text-xs text-gray-400">Portal supports HP only</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="district"
                                    rules={{ required: "District is required" }}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>
                                                District <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (isHydratingDraft.current) {
                                                        return;
                                                    }

                                                    form.setValue('gramPanchayat', '');
                                                    form.setValue('urbanBody', '');
                                                    form.setValue('ward', '');
                                                    form.clearErrors("ward");

                                                    const tehsilOptions = getTehsilsForDistrict(value);
                                                    const nextTehsilValue =
                                                        tehsilOptions.length === 0 ? '__other' : '';
                                                    form.setValue('tehsil', nextTehsilValue, {
                                                        shouldDirty: false,
                                                        shouldValidate: step >= 1,
                                                    });
                                                    form.setValue('tehsilOther', '', {
                                                        shouldDirty: false,
                                                        shouldValidate: step >= 1,
                                                    });
                                                }}
                                                value={field.value || undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger
                                                        data-testid="select-district"
                                                        className={fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : showRequiredWarning && !field.value?.trim() ? "border-amber-400 ring-2 ring-amber-200" : ""}
                                                        aria-invalid={fieldState.invalid}
                                                    >
                                                        <SelectValue placeholder="Select district" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {HP_DISTRICTS.map((district) => (
                                                        <SelectItem key={district} value={district}>
                                                            {district}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Select your district first</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tehsil"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tehsil <span className="text-destructive">*</span>
                                            </FormLabel>
                                            {(() => {
                                                const districtValue = watchedDistrict || '';
                                                const fallbackTehsils = getTehsilsForDistrict(districtValue);
                                                const currentTehsil = field.value;
                                                const includeCurrentValue =
                                                    currentTehsil &&
                                                    typeof currentTehsil === "string" &&
                                                    !fallbackTehsils.includes(currentTehsil);

                                                return (
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const previousTehsil = form.getValues('tehsil');
                                                            field.onChange(value);

                                                            if (isHydratingDraft.current) {
                                                                return;
                                                            }

                                                            const tehsilChanged = value !== previousTehsil;
                                                            if (!isHydratingDraft.current && tehsilChanged) {
                                                                form.setValue('gramPanchayat', '', { shouldDirty: false, shouldValidate: step >= 1 });
                                                                form.setValue('urbanBody', '', { shouldDirty: false, shouldValidate: step >= 1 });
                                                                form.setValue('ward', '', { shouldDirty: false, shouldValidate: step >= 1 });
                                                                form.clearErrors("ward");
                                                            }

                                                            if (!isHydratingDraft.current && value !== '__other') {
                                                                form.setValue('tehsilOther', '', { shouldDirty: false, shouldValidate: step >= 1 });
                                                            }
                                                        }}
                                                        value={field.value || undefined}
                                                        disabled={!districtValue || isServiceDraft}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger
                                                                data-testid="select-tehsil"
                                                                className={fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : showRequiredWarning && !field.value?.trim() ? "border-amber-400 ring-2 ring-amber-200" : ""}
                                                                aria-invalid={fieldState.invalid}
                                                            >
                                                                <SelectValue placeholder="Select tehsil" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {fallbackTehsils.map((tehsil) => (
                                                                <SelectItem key={tehsil} value={tehsil}>
                                                                    {tehsil}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="__other">Other (Manual Entry)</SelectItem>
                                                            {includeCurrentValue && (
                                                                <SelectItem key={currentTehsil} value={currentTehsil}>
                                                                    {currentTehsil}
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                );
                                            })()}
                                            <FormDescription>Select tehsil after district</FormDescription>
                                            <FormMessage />
                                            {form.watch('tehsil') === '__other' && (
                                                <FormField
                                                    control={form.control}
                                                    name="tehsilOther"
                                                    rules={{ required: "Please enter the tehsil name" }}
                                                    render={({ field, fieldState }) => (
                                                        <FormItem className="mt-3">
                                                            <FormLabel>Manual Tehsil Entry <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Type tehsil or subdivision name"
                                                                    data-testid="input-tehsil-other"
                                                                    value={field.value ?? ""}
                                                                    onChange={(event) => field.onChange(event.target.value)}
                                                                    aria-invalid={fieldState.invalid}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>Provide the correct tehsil if it is not listed above.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Location Type Cards */}
                            <FormField
                                control={form.control}
                                name="locationType"
                                rules={{ required: "Location type is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">Location Type <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {LOCATION_TYPES.map((type) => (
                                                <div
                                                    key={type.value}
                                                    onClick={() => {
                                                        if (isServiceDraft) return;
                                                        field.onChange(type.value);
                                                        if (type.value === "gp") {
                                                            form.setValue("urbanBody", "", { shouldDirty: false, shouldValidate: step >= 1 });
                                                            form.setValue("ward", "", { shouldDirty: false, shouldValidate: step >= 1 });
                                                            form.clearErrors("ward");
                                                        }
                                                    }}
                                                    className={`p-4 rounded-lg border-2 transition-all ${isServiceDraft ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${field.value === type.value
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">{type.label}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {type.value === "gp" ? "Lower registration fees" :
                                                                    type.value === "mc" ? "Higher registration fees" :
                                                                        "Standard fees apply"}
                                                            </p>
                                                        </div>
                                                        {field.value === type.value && (
                                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {gramFieldConfig && (
                                <FormField
                                    control={form.control}
                                    name="gramPanchayat"
                                    rules={{
                                        validate: (value) => {
                                            if (!value?.trim()) {
                                                return gramFieldConfig.requiredMessage;
                                            }
                                            return true;
                                        },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                {gramFieldConfig.label}
                                                <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={gramFieldConfig.placeholder}
                                                    data-testid="input-gram-panchayat"
                                                    value={field.value ?? ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                    disabled={isServiceDraft && gramWasPopulated}
                                                    aria-invalid={fieldState.invalid}
                                                    className={fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : showRequiredWarning && !field.value?.trim() ? "border-amber-400 ring-2 ring-amber-200" : ""}
                                                />
                                            </FormControl>
                                            <FormDescription>{gramFieldConfig.description}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Conditional: Urban Address (MC/TCP) */}
                            {(locationType === 'mc' || locationType === 'tcp') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="urbanBody"
                                        rules={{ required: "Urban local body is required" }}
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {urbanBodyConfig.label} <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={urbanBodyConfig.placeholder}
                                                        data-testid="input-urban-body"
                                                        value={field.value ?? ""}
                                                        onChange={(event) => {
                                                            field.onChange(event.target.value);
                                                            // Re-validate to clear error if value is now valid
                                                            if (event.target.value?.trim()) {
                                                                form.clearErrors("urbanBody");
                                                            }
                                                            form.setValue("ward", "", { shouldDirty: false, shouldValidate: step >= 1 });
                                                            form.clearErrors("ward");
                                                        }}
                                                        disabled={isServiceDraft && urbanWasPopulated}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                </FormControl>
                                                <FormDescription>{urbanBodyConfig.description}</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ward"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>Ward / Zone (optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ward number or zone"
                                                        data-testid="input-ward-manual"
                                                        value={field.value ?? ""}
                                                        onChange={(event) => field.onChange(event.target.value)}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                </FormControl>
                                                <FormDescription>Provide the ward or zone if assigned by the urban body.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Address Details */}
                    <div>
                        <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                                <div>
                                    <h2 className="font-semibold">Address Details</h2>
                                    <p className="text-sm text-white/70">Complete postal address and PIN code</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="address"
                                rules={{ required: "Address is required" }}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <label className="text-xs text-gray-500">House/Building Number, Street & Locality <span className="text-red-500">*</span></label>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., House No. 123, Main Road, Near Post Office"
                                                className={`min-h-20 ${fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : showRequiredWarning && !field.value?.trim() ? "border-amber-400 ring-2 ring-amber-200" : ""}`}
                                                data-testid="input-address"
                                                aria-invalid={fieldState.invalid}
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-400">Specific address details with landmarks</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pincode"
                                rules={{
                                    required: "PIN code is required",
                                    validate: (value) => (/^[1-9]\d{5}$/.test(value) ? true : "Enter a valid 6-digit PIN code"),
                                }}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>
                                            PIN Code <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-md border bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
                                                    {PINCODE_PREFIX}-
                                                </span>
                                                <Input
                                                    placeholder="Last 4 digits"
                                                    data-testid="input-pincode"
                                                    aria-invalid={fieldState.invalid}
                                                    className={`bg-muted/60 ${showPincodeHint ? "border-amber-500 focus-visible:ring-amber-500 ring-offset-background" : ""
                                                        }`}
                                                    value={pincodeSuffixValue}
                                                    onChange={(event) => {
                                                        const suffix = sanitizePincodeSuffix(event.target.value);
                                                        field.onChange((PINCODE_PREFIX + suffix).slice(0, 6));
                                                    }}
                                                    onBlur={(event) => {
                                                        const suffix = sanitizePincodeSuffix(event.target.value);
                                                        field.onChange((PINCODE_PREFIX + suffix).slice(0, 6));
                                                        field.onBlur();
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Prefix <span className="font-semibold">{PINCODE_PREFIX}</span> is fixed—enter the last 4 digits of your PIN code.
                                        </p>
                                        {showPincodeHint && (
                                            <p className="text-xs text-amber-600 mt-1">Enter all remaining digits to continue.</p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="telephone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telephone (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Landline number" data-testid="input-telephone" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
