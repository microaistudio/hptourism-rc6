import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { ApplicationForm } from "@/lib/application-schema";

interface Step6CancellationReviewProps {
    form: UseFormReturn<ApplicationForm>;
    cancellationConfirmed: boolean;
    setCancellationConfirmed: (confirmed: boolean) => void;
    activeDraftApplication: any;
}

export function Step6CancellationReview({
    form,
    cancellationConfirmed,
    setCancellationConfirmed,
    activeDraftApplication,
}: Step6CancellationReviewProps) {
    const propertyName = activeDraftApplication?.propertyName || "your property";
    const certificateNumber = activeDraftApplication?.parentCertificateNumber || activeDraftApplication?.certificateNumber || "this certificate";

    return (
        <div className="space-y-6">
            <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-900">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <AlertTitle className="text-rose-700 font-semibold">Warning: Irreversible Action</AlertTitle>
                <AlertDescription className="text-rose-800">
                    You are about to submit a request to <strong>cancel the registration certificate</strong> for <strong>{propertyName}</strong> ({certificateNumber}).
                    <br /><br />
                    Once processed by the department, this action cannot be undone. You will need to apply for a fresh registration if you wish to operate this homestay again in the future.
                </AlertDescription>
            </Alert>

            <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    Reason for Cancellation
                </h3>
                <FormField
                    control={form.control}
                    name="serviceNotes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Please tell us why you are canceling (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="E.g., shutting down business, sold the property, etc."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-6 space-y-4">
                <h3 className="font-semibold text-lg text-rose-900">Confirmation</h3>
                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="confirm-cancel"
                        checked={cancellationConfirmed}
                        onCheckedChange={(checked) => setCancellationConfirmed(checked === true)}
                        className="mt-1 border-rose-400 data-[state=checked]:bg-rose-600 data-[state=checked]:text-white"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="confirm-cancel"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-rose-900"
                        >
                            I understand the consequences and confirm that I want to cancel this certificate.
                        </label>
                        <p className="text-sm text-rose-700">
                            I certify that I am the authorized owner/representative of this property.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
