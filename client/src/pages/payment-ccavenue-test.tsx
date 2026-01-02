
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, LockIcon, UnlockIcon } from "lucide-react";

export default function CCAvenueTestPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState({
        workingKey: "",
        accessCode: "",
        merchantId: "",
        environment: "test" // test (test.ccavenue.com) or prod (secure.ccavenue.com)
    });

    const [transaction, setTransaction] = useState({
        order_id: `ORD-${Date.now()}`,
        currency: "INR",
        amount: "1.00",
        redirect_url: `${window.location.origin}/api/ccavenue/test/callback?frontendUrl=${window.location.origin}/payment/ccavenue-test`,
        cancel_url: `${window.location.origin}/api/ccavenue/test/callback?frontendUrl=${window.location.origin}/payment/ccavenue-test`,
        language: "EN"
    });

    const [encRequest, setEncRequest] = useState("");
    const [decryptionInput, setDecryptionInput] = useState("");
    const [decryptionResult, setDecryptionResult] = useState("");

    // Read result from URL search params if present (callback)
    const urlParams = new URL(window.location.href).searchParams;
    const responseParam = urlParams.get('response');
    if (responseParam && !decryptionResult) {
        try {
            const decoded = atob(responseParam);
            setDecryptionResult(decoded);
            setDecryptionInput(decoded); // Populate the raw input as well just in case
            window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
            toast({ title: "Callback Received", description: "Response decrypted automatically." });
        } catch (e) {
            console.error(e);
        }
    }

    const handleEncrypt = async () => {
        if (!config.workingKey) {
            toast({ title: "Error", description: "Working Key is required", variant: "destructive" });
            return;
        }

        try {
            const payload = {
                merchant_id: config.merchantId,
                order_id: transaction.order_id,
                currency: transaction.currency,
                amount: transaction.amount,
                redirect_url: `${transaction.redirect_url}&workingKey=${config.workingKey}`, // Pass key for auto-decrypt
                cancel_url: `${transaction.cancel_url}&workingKey=${config.workingKey}`,
                language: transaction.language,
                // Add other mandatory fields if necessary
            };

            const res = await fetch('/api/ccavenue/test/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workingKey: config.workingKey,
                    data: payload
                })
            });
            const data = await res.json();
            if (data.encRequest) {
                setEncRequest(data.encRequest);
                toast({ title: "Success", description: "Request Encrypted" });
            } else {
                toast({ title: "Error", description: data.error || "Encryption failed", variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDecrypt = async () => {
        if (!config.workingKey || !decryptionInput) {
            toast({ title: "Error", description: "Working Key and Encrypted Data required", variant: "destructive" });
            return;
        }

        try {
            const res = await fetch('/api/ccavenue/test/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workingKey: config.workingKey,
                    encResponse: decryptionInput
                })
            });
            const data = await res.json();
            if (data.decrypted) {
                setDecryptionResult(data.decrypted);
                toast({ title: "Success", description: "Data Decrypted" });
            } else {
                toast({ title: "Error", description: data.error || "Decryption failed", variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const paymentUrl = config.environment === "test"
        ? "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
        : "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-4">CCAvenue Payment Interface Test</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Enter Sandbox/Production Credentials</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Environment</Label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={config.environment}
                                    onChange={e => setConfig({ ...config, environment: e.target.value })}
                                >
                                    <option value="test">Sandbox (test.ccavenue.com)</option>
                                    <option value="prod">Production (secure.ccavenue.com)</option>
                                </select>
                            </div>
                            <div>
                                <Label>Merchant ID</Label>
                                <Input
                                    value={config.merchantId}
                                    onChange={e => setConfig({ ...config, merchantId: e.target.value })}
                                    placeholder="Enter Merchant ID"
                                />
                            </div>
                            <div>
                                <Label>Access Code</Label>
                                <Input
                                    value={config.accessCode}
                                    onChange={e => setConfig({ ...config, accessCode: e.target.value })}
                                    placeholder="Enter Access Code"
                                />
                            </div>
                            <div>
                                <Label>Working Key</Label>
                                <Input
                                    type="password"
                                    value={config.workingKey}
                                    onChange={e => setConfig({ ...config, workingKey: e.target.value })}
                                    placeholder="Enter Working Key (32 chars)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Order ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={transaction.order_id}
                                        onChange={e => setTransaction({ ...transaction, order_id: e.target.value })}
                                    />
                                    <Button variant="outline" onClick={() => setTransaction({ ...transaction, order_id: `ORD-${Date.now()}` })}>
                                        Gen
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        value={transaction.amount}
                                        onChange={e => setTransaction({ ...transaction, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Currency</Label>
                                    <Input
                                        value={transaction.currency}
                                        onChange={e => setTransaction({ ...transaction, currency: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleEncrypt} className="w-full">
                                <LockIcon className="w-4 h-4 mr-2" />
                                Encrypt Request
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-50">
                        <CardHeader>
                            <CardTitle>Proceed to Payment</CardTitle>
                            <CardDescription>Perform Standard Checkout</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {encRequest ? (
                                <div className="space-y-4">
                                    <div className="p-2 bg-slate-200 rounded break-all text-xs font-mono max-h-32 overflow-auto">
                                        {encRequest}
                                    </div>
                                    <form method="POST" action={paymentUrl} target="_blank">
                                        <input type="hidden" name="encRequest" value={encRequest} />
                                        <input type="hidden" name="access_code" value={config.accessCode} />
                                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Pay Now (Opens in New Tab)
                                        </Button>
                                    </form>
                                    <p className="text-xs text-muted-foreground">
                                        Note: This will open a new tab pointing to {config.environment === "test" ? "test" : "secure"}.ccavenue.com
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm text-center text-muted-foreground py-8">
                                    Generate an encrypted request first.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Decryption Tool</CardTitle>
                            <CardDescription>Decrypt the response from CCAvenue</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Encrypted Response (encResp)</Label>
                                <Textarea
                                    value={decryptionInput}
                                    onChange={e => setDecryptionInput(e.target.value)}
                                    placeholder="Paste encResp here..."
                                    rows={4}
                                />
                            </div>
                            <Button onClick={handleDecrypt} variant="secondary" className="w-full">
                                <UnlockIcon className="w-4 h-4 mr-2" />
                                Decrypt Data
                            </Button>
                            {decryptionResult && (
                                <div className="mt-4 p-4 bg-slate-100 rounded overflow-auto font-mono text-sm">
                                    {decryptionResult}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="api">
                <TabsList>
                    <TabsTrigger value="api">Status API (API Call)</TabsTrigger>
                </TabsList>
                <TabsContent value="api">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status API</CardTitle>
                            <CardDescription>
                                Native API status check (orderStatusTracker)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                To be implemented: This tab would construct the JSON payload for `orderStatusTracker`, encrypt it, and verify against the API URL directly (Server-to-Server).
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
