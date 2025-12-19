
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { HomestayApplication } from "@shared/schema";

interface IncompleteApplication extends HomestayApplication {
    ownerName: string;
    ownerMobile: string;
    ownerEmail: string;
}

export default function DAIncompleteApplications() {
    const [, setLocation] = useLocation();
    const { data: applications, isLoading } = useQuery<IncompleteApplication[]>({
        queryKey: ["/api/da/applications/incomplete"],
    });

    const getProgressLabel = (app: IncompleteApplication) => {
        // This is a heuristic based on what fields are filled
        // Using current_page if available, or inferring from data
        if (app.currentPage) {
            if (app.currentPage >= 6) return "Ready to Submit";
            return `Draft - Step ${app.currentPage} of 6`;
        }
        return "Draft - Initial";
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setLocation("/da/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Incomplete Applications</h1>
                        <p className="text-muted-foreground">
                            Draft applications that have not yet been submitted by the applicant.
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Draft Pipeline</CardTitle>
                    <CardDescription>
                        {applications?.length || 0} applications in progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : applications && applications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application #</TableHead>
                                    <TableHead>Property Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">
                                            {app.applicationNumber || <span className="text-muted-foreground italic">Not Generated</span>}
                                        </TableCell>
                                        <TableCell>{app.propertyName || <span className="text-muted-foreground italic">Untitled</span>}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{app.ownerName}</span>
                                                <span className="text-xs text-muted-foreground">{app.ownerMobile}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {app.district}
                                            {app.tehsil && <span className="text-muted-foreground">, {app.tehsil}</span>}
                                        </TableCell>
                                        <TableCell>
                                            {app.updatedAt ? format(new Date(app.updatedAt), "PP p") : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {getProgressLabel(app)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setLocation(`/da/applications/${app.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No incomplete applications found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
