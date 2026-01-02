
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertGrievanceSchema, type InsertGrievance } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function CreateGrievanceDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<InsertGrievance>({
        resolver: zodResolver(insertGrievanceSchema),
        defaultValues: {
            subject: "",
            description: "",
            category: "other",
            priority: "medium",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertGrievance) => {
            const res = await apiRequest("POST", "/api/grievances", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Grievance Submitted",
                description: "Your ticket has been created successfully.",
            });
            setOpen(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
        },
        onError: (error: any) => {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive"
            })
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report a Grievance</DialogTitle>
                    <DialogDescription>
                        Submit your issue related to HPTourism services.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="application">Application Issue</SelectItem>
                                            <SelectItem value="payment">Payment Issue</SelectItem>
                                            <SelectItem value="portal">Portal/Technical</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief summary of the issue" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detailed Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please provide full details..." className="h-32" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Attachments could go here later */}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? "Submitting..." : "Submit Ticket"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
