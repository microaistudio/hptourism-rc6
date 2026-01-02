/**
 * Search View Component for DA Queue
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HomestayApplication } from "@shared/schema";
import { Search, Eye, Loader2 } from "lucide-react";
import type { SearchParams } from "./types";

const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "submitted", label: "New (Submitted)" },
    { value: "under_scrutiny", label: "Under Scrutiny" },
    { value: "forwarded_to_dtdo", label: "Forwarded to DTDO" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

interface SearchViewProps {
    onApplicationClick: (id: string) => void;
}

export function SearchView({ onApplicationClick }: SearchViewProps) {
    const { toast } = useToast();
    const [params, setParams] = useState<SearchParams>({
        applicationNumber: "",
        ownerMobile: "",
        status: "all",
        recentLimit: "10",
    });
    const [results, setResults] = useState<HomestayApplication[]>([]);

    const searchMutation = useMutation({
        mutationFn: async (payload: SearchParams) => {
            const response = await apiRequest("POST", "/api/officer/search", payload);
            return response.json();
        },
        onSuccess: (data: { results: HomestayApplication[] }) => {
            setResults(data.results || []);
            if (!data.results?.length) {
                toast({ title: "No results", description: "No applications found matching your criteria" });
            }
        },
        onError: () => {
            toast({ title: "Search failed", description: "Unable to search applications", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchMutation.mutate(params);
    };

    const resetFilters = () => {
        setParams({ applicationNumber: "", ownerMobile: "", status: "all", recentLimit: "10" });
        setResults([]);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Search Applications</CardTitle>
                    <CardDescription>Find applications by number, owner mobile, or status</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Application Number</label>
                                <Input
                                    placeholder="e.g., LG-HS-2024..."
                                    value={params.applicationNumber}
                                    onChange={e => setParams({ ...params, applicationNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Owner Mobile</label>
                                <Input
                                    placeholder="10-digit mobile"
                                    value={params.ownerMobile}
                                    onChange={e => setParams({ ...params, ownerMobile: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                <Select value={params.status} onValueChange={v => setParams({ ...params, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Recent Limit</label>
                                <Select value={params.recentLimit} onValueChange={v => setParams({ ...params, recentLimit: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">Last 10</SelectItem>
                                        <SelectItem value="25">Last 25</SelectItem>
                                        <SelectItem value="50">Last 50</SelectItem>
                                        <SelectItem value="100">Last 100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={searchMutation.isPending}>
                                {searchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                Search
                            </Button>
                            <Button type="button" variant="outline" onClick={resetFilters}>
                                Clear
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results ({results.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map(app => (
                                    <TableRow
                                        key={app.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => onApplicationClick(app.id)}
                                    >
                                        <TableCell className="font-medium">{app.applicationNumber}</TableCell>
                                        <TableCell>{app.propertyName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{app.status}</Badge>
                                        </TableCell>
                                        <TableCell>{app.submittedAt ? format(new Date(app.submittedAt), 'PP') : '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
