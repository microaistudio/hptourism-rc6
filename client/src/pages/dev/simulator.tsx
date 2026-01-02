
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, ArrowRight, RotateCcw, CheckCircle2, ClipboardList, RefreshCw, Play, FileText, Check, X, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface TestApplication {
    id: string;
    applicationNumber: string;
    propertyName: string;
    ownerName: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    applicationKind: string;
}

interface TestReport {
    id?: string;
    scenarioName: string;
    startTime: string;
    endTime: string;
    status: 'PASSED' | 'FAILED';
    details: string;
    stepsExecuted: number;
    totalSteps: number;
    createdAt?: string;
}

const SCENARIOS = [
    {
        id: "new_happy_path",
        label: "Route 1a: New Project (Happy Path)",
        description: "New Project -> Submit -> Forward (DA) -> Schedule Insp (DTDO) -> Report (DA) -> Approve (DTDO)",
        steps: [
            { type: "seed", params: { type: "new_registration", projectType: "new_project" }, label: "Seed New Project App" },
            { type: "action", action: "forward_to_dtdo", label: "DA: Forward to DTDO" },
            { type: "action", action: "schedule_inspection", label: "DTDO: Schedule Inspection" },
            { type: "action", action: "submit_inspection_report", label: "DA: Submit Inspection Report" },
            { type: "action", action: "approve_application", label: "DTDO: Approve & Issue Cert" }
        ]
    },
    {
        id: "existing_property_happy",
        label: "Route 2: Existing Property (Happy Path)",
        description: "Existing Property -> Submit -> Forward (DA) -> Approve (DTDO). Skips Inspection (Legacy).",
        steps: [
            { type: "seed", params: { type: "new_registration", projectType: "existing_property" }, label: "Seed Existing Property App" },
            { type: "action", action: "forward_to_dtdo", label: "DA: Forward to DTDO" },
            { type: "action", action: "approve_application", label: "DTDO: Approve & Issue Cert" }
        ]
    },
    {
        id: "new_revert_loop",
        label: "Route 1b: New Project (Revert Loop)",
        description: "Submit -> Forward -> Revert (DTDO) -> Resubmit Direct -> Schedule -> Report -> Approve",
        steps: [
            { type: "seed", params: { type: "new_registration", projectType: "new_project" }, label: "Seed New Project App" },
            { type: "action", action: "forward_to_dtdo", label: "DA: Forward to DTDO" },
            { type: "action", action: "revert_by_dtdo", label: "DTDO: Revert to Owner" },
            { type: "action", action: "resubmit_to_dtdo", label: "Owner: Resubmit to DTDO (Skip DA)" },
            { type: "action", action: "schedule_inspection", label: "DTDO: Schedule Inspection" },
            { type: "action", action: "submit_inspection_report", label: "DA: Submit Inspection Report" },
            { type: "action", action: "approve_application", label: "DTDO: Approve & Issue Cert" }
        ]
    }
];

// Helper function to call dev API
const devApi = async (endpoint: string, data: any) => {
    const res = await fetch(`/api/dev/${endpoint}`, {
        method: devApi.isGet(endpoint) ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: devApi.isGet(endpoint) ? undefined : JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};
devApi.isGet = (endpoint: string) => endpoint === "applications" || endpoint === "reports";

export default function DeveloperConsole() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [seedCount, setSeedCount] = useState("1");
    // seedType now stores JSON string to handle complex params
    const [seedParams, setSeedParams] = useState(JSON.stringify({ type: "new_registration", projectType: "new_project" }));
    const [logs, setLogs] = useState<string[]>([]);

    // Scenario Runner State
    const [selectedScenarioId, setSelectedScenarioId] = useState("new_happy_path");
    const [isRunning, setIsRunning] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [currentReport, setCurrentReport] = useState<TestReport | null>(null);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // FETCH TEST APPS
    const { data: apps, isLoading: loadingApps } = useQuery<TestApplication[]>({
        queryKey: ["/api/dev/applications"],
        refetchInterval: 2000
    });

    // FETCH REPORTS
    const { data: pastReports, isLoading: loadingReports } = useQuery<TestReport[]>({
        queryKey: ["/api/dev/reports"],
        refetchInterval: 5000
    });

    // MUTATIONS
    const seedMutation = useMutation({
        mutationFn: () => {
            const params = JSON.parse(seedParams);
            return devApi("seed", { count: parseInt(seedCount), district: "Shimla", ...params });
        },
        onSuccess: (data) => {
            addLog(`Seeded ${data.ids.length} apps. IDs: ${data.ids.join(", ")}`);
            queryClient.invalidateQueries({ queryKey: ["/api/dev/applications"] });
        },
        onError: (err) => addLog(`❌ Seeding Failed: ${err.message}`)
    });

    const actionMutation = useMutation({
        mutationFn: (vars: { appId: string, action: string }) => devApi("action", { applicationId: vars.appId, action: vars.action }),
        onSuccess: (data, vars) => {
            addLog(`Action '${vars.action}' successful for App ${vars.appId}`);
            queryClient.invalidateQueries({ queryKey: ["/api/dev/applications"] });
        },
        onError: (err) => addLog(`Error: ${err.message}`)
    });

    const saveReportMutation = useMutation({
        mutationFn: (report: TestReport) => devApi("reports", report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/dev/reports"] });
        }
    });

    // SCENARIO RUNNER
    const runScenario = async () => {
        const scenario = SCENARIOS.find(s => s.id === selectedScenarioId);
        if (!scenario) return;

        setIsRunning(true);
        setCurrentReport(null);
        setCurrentStepIndex(-1);
        addLog(`🚀 Starting Scenario: ${scenario.label}...`);

        let appId: string | null = null;
        const startTime = new Date();
        let stepsCompleted = 0;
        let finalStatus: 'PASSED' | 'FAILED' = 'PASSED';
        let failureDetails = "All steps executed successfully.";

        try {
            for (let i = 0; i < scenario.steps.length; i++) {
                const step = scenario.steps[i];
                setCurrentStepIndex(i);
                addLog(`Step ${i + 1}: ${step.label}...`);

                await new Promise(r => setTimeout(r, 800));

                if (step.type === "seed") {
                    const seedRes = await devApi("seed", { count: 1, ...step.params, district: "Shimla" });
                    appId = seedRes.ids[0];
                    addLog(`Created App ID: ${appId}`);
                } else if (step.type === "action") {
                    if (!appId) throw new Error("No App ID found.");
                    await devApi("action", { applicationId: appId, action: step.action! });
                }
                stepsCompleted++;
            }
            addLog("✅ Scenario Completed Successfully!");
            toast({ title: "Test PASSED", description: `Scenario '${scenario.label}' passed.`, variant: "default" });
        } catch (error: any) {
            finalStatus = 'FAILED';
            failureDetails = error.message;
            addLog(`❌ Scenario Failed at Step ${currentStepIndex + 1}: ${error.message}`);
            toast({ title: "Test FAILED", description: error.message, variant: "destructive" });
        } finally {
            // Generate and Save Report
            const report: TestReport = {
                scenarioName: scenario.label,
                startTime: startTime.toLocaleTimeString(),
                endTime: new Date().toLocaleTimeString(),
                status: finalStatus,
                details: failureDetails,
                stepsExecuted: stepsCompleted,
                totalSteps: scenario.steps.length
            };
            setCurrentReport(report);
            saveReportMutation.mutate(report);

            setIsRunning(false);
            setCurrentStepIndex(-1);
            queryClient.invalidateQueries({ queryKey: ["/api/dev/applications"] });
        }
    };

    // Helper to get allowed actions context-aware
    const getActionsForStatus = (status: string, app: TestApplication) => {
        const actions = [];

        switch (status) {
            case "submitted":
                actions.push({ label: "Forward to DTDO", action: "forward_to_dtdo", color: "bg-blue-600" });
                actions.push({ label: "Revert (DA)", action: "revert_by_da", color: "bg-red-600" });
                actions.push({ label: "Reject (DA)", action: "reject_application", color: "bg-red-800" });
                break;
            case "reverted_by_da":
            case "reverted_by_dtdo":
                actions.push({ label: "Resubmit to DA", action: "resubmit_owner", color: "bg-orange-600" });
                actions.push({ label: "Resubmit to DTDO", action: "resubmit_to_dtdo", color: "bg-orange-700" });
                break;
            case "forwarded_to_dtdo":
                actions.push({ label: "Schedule Inspection", action: "schedule_inspection", color: "bg-purple-600" });
                actions.push({ label: "Approve (Direct)", action: "approve_application", color: "bg-emerald-600" });
                actions.push({ label: "Revert (DTDO)", action: "revert_by_dtdo", color: "bg-red-600" });
                actions.push({ label: "Reject (DTDO)", action: "reject_application", color: "bg-red-800" });
                break;
            case "inspection_scheduled":
                actions.push({ label: "Submit Report", action: "submit_inspection_report", color: "bg-green-600" });
                break;
            case "inspection_completed":
                actions.push({ label: "Approve & Issue Cert", action: "approve_application", color: "bg-emerald-600" });
                actions.push({ label: "Reject", action: "reject_application", color: "bg-red-800" });
                break;
            case "rejected":
                return [];
        }
        return actions;
    };

    const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId);

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="text-4xl">🛠️</span> Developer Testing Console
                    </h1>
                    <p className="text-gray-500 mt-2">
                        End-to-End Workflow Testing & Simulation
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dev/applications", "/api/dev/reports"] })}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="manual" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="manual">Manual Control</TabsTrigger>
                    <TabsTrigger value="scenarios">Scenario Testing</TabsTrigger>
                    <TabsTrigger value="reports">Test Reports</TabsTrigger>
                </TabsList>

                {/* MANUAL MODE */}
                <TabsContent value="manual" className="space-y-6">
                    {/* Seeder Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Create Test Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-end gap-4 p-1">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label>Application Type</Label>
                                    <Select value={seedParams} onValueChange={setSeedParams}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='{"type":"new_registration", "projectType":"new_project"}'>New Registration (New Project)</SelectItem>
                                            <SelectItem value='{"type":"new_registration", "projectType":"existing_property"}'>New Registration (Existing Property)</SelectItem>
                                            <SelectItem value='{"type":"renewal", "projectType":"existing_property"}'>Renewal Application</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid w-full max-w-[100px] items-center gap-1.5">
                                    <Label htmlFor="count">Count</Label>
                                    <Input
                                        type="number"
                                        id="count"
                                        value={seedCount}
                                        onChange={(e) => setSeedCount(e.target.value)}
                                        min={1} max={10}
                                    />
                                </div>
                                <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                                    {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Create
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applications List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Test Applications</CardTitle>
                            <CardDescription>Most recent simulations (Showing max 50)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm border-b">
                                    <div className="col-span-4">Application / Details</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-6 text-right">Available Actions</div>
                                </div>
                                <div className="divide-y max-h-[500px] overflow-auto">
                                    {loadingApps ? (
                                        <div className="p-8 text-center text-gray-500">Loading...</div>
                                    ) : apps?.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">No active test applications found. Create some above.</div>
                                    ) : (
                                        apps?.map((app) => (
                                            <div key={app.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white transition-colors">
                                                <div className="col-span-4">
                                                    <div className="font-semibold text-gray-900">{app.applicationNumber}</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-[10px]">{app.applicationKind}</Badge>
                                                        <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <Badge variant="outline" className={`px-2 py-1 uppercase tracking-tighter text-[10px] ${app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100'}`}>
                                                        {app.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-6 flex justify-end gap-2 flex-wrap">
                                                    {getActionsForStatus(app.status, app).map((action) => (
                                                        <Button
                                                            key={action.action}
                                                            size="sm"
                                                            className={`${action.color} text-white h-7 text-xs`}
                                                            onClick={() => actionMutation.mutate({ appId: app.id, action: action.action })}
                                                            disabled={actionMutation.isPending}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                    {getActionsForStatus(app.status, app).length === 0 && app.status !== 'rejected' && (
                                                        <span className="text-xs text-green-600 font-medium flex items-center">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                                                        </span>
                                                    )}
                                                    {app.status === 'rejected' && (
                                                        <span className="text-xs text-red-600 font-medium flex items-center">
                                                            <X className="w-4 h-4 mr-1" /> Rejected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SCENARIO MODE */}
                <TabsContent value="scenarios" className="space-y-6">
                    <Card className="border-2 border-blue-100 bg-slate-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Scenario Runner
                            </CardTitle>
                            <CardDescription>
                                Select a predefined workflow route to simulate automatically. Generates a test report upon completion.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <Label>Select Scenario Route</Label>
                                <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                                    <SelectTrigger className="w-full md:w-[600px] bg-white">
                                        <SelectValue placeholder="Select a scenario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SCENARIOS.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                <span className="font-medium">{s.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedScenario && (
                                    <div className="bg-white p-4 rounded-md border text-sm text-gray-600">
                                        <p className="font-semibold mb-2">Description:</p>
                                        <p>{selectedScenario.description}</p>
                                        <div className="mt-4">
                                            <p className="font-semibold mb-2">Steps to Execute:</p>
                                            <ol className="list-decimal list-inside space-y-1">
                                                {selectedScenario.steps.map((step, idx) => (
                                                    <li key={idx} className={idx === currentStepIndex ? "text-blue-600 font-bold" : ""}>
                                                        {step.label}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                                onClick={runScenario}
                                disabled={isRunning}
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" /> Start Scenario Test
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Current Run Report Card */}
                    {currentReport && (
                        <Card className={`border-2 ${currentReport.status === 'PASSED' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {currentReport.status === 'PASSED' ? <CheckCircle2 className="text-green-600" /> : <X className="text-red-600" />}
                                        Last Run Report: {currentReport.status}
                                    </CardTitle>
                                    <Badge className={currentReport.status === 'PASSED' ? 'bg-green-600' : 'bg-red-600'}>{currentReport.status}</Badge>
                                </div>
                                <CardDescription>
                                    Scenario: <strong>{currentReport.scenarioName}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500">Start Time:</span> <span className="font-medium">{currentReport.startTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">End Time:</span> <span className="font-medium">{currentReport.endTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Steps Executed:</span> <span className="font-medium">{currentReport.stepsExecuted} / {currentReport.totalSteps}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Result:</span> <span className="font-medium">{currentReport.details}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* REPORTS HISTORY MODE */}
                <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> Test History
                            </CardTitle>
                            <CardDescription>History of scenario test runs in this session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm border-b">
                                    <div className="col-span-4">Scenario</div>
                                    <div className="col-span-3">Time</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-3">Details</div>
                                </div>
                                <div className="divide-y max-h-[500px] overflow-auto">
                                    {loadingReports ? (
                                        <div className="p-8 text-center text-gray-500">Loading reports...</div>
                                    ) : pastReports?.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">No test reports available yet. Run a scenario.</div>
                                    ) : (
                                        pastReports?.map((report, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white transition-colors text-sm">
                                                <div className="col-span-4 font-medium text-gray-900">{report.scenarioName}</div>
                                                <div className="col-span-3 text-gray-500">{report.endTime}</div>
                                                <div className="col-span-2">
                                                    <Badge className={report.status === 'PASSED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3 text-gray-500 truncate" title={report.details}>{report.details}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* CONSOLE LOGS */}
            <Card className="mt-8 bg-black text-green-400 font-mono text-sm border-gray-800">
                <CardHeader className="py-3 border-b border-gray-800">
                    <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Execution Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-64 overflow-auto space-y-1">
                    {logs.length === 0 ? (
                        <div className="text-gray-600 italic">Ready...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="break-all">{log}</div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
