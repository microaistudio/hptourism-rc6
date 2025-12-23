import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Building2, Lock, Phone, ArrowRight } from "lucide-react";
import hpsedcLogo from "@/assets/logos/hpsedc.svg";
import heroImage from "@assets/stock_images/beautiful_scenic_him_3e373e25.jpg"; // Using the village image for a warm feel

// Groww-inspired color palette (reusing from landing-v2 for consistence)
const COLORS = {
    primary: "#00d09c",
    primaryDark: "#00b386",
    text: "#44475b",
    background: "#ffffff",
};

const loginSchema = z.object({
    username: z.string().min(1, "Username/Phone is required"),
    password: z.string().min(1, "Password is required"),
});

export default function LoginV2() {
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<"user" | "office">("user");

    const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
    const [captcha, setCaptcha] = useState("");

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    function onSubmit(values: z.infer<typeof loginSchema>) {
        console.log("Login attempt:", { ...values, loginMethod, captcha });
        alert(`Logging in with ${loginMethod}. Captcha: ${captcha} (Sandbox)`);
    }

    // Generate a random string for captcha visual
    const captchaCode = "8X2A";

    return (
        <div className="min-h-screen flex bg-white font-sans text-gray-800">

            {/* 1. LEFT COLUMN: Visual & Branding (40-50% width)
          Groww often uses clean illustration or flat color, but for Tourism,
          a high-quality, unobscured photo works best to sell the 'dream'.
      */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                {/* Background Image with slight overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
                    style={{ backgroundImage: `url(${heroImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Content over image */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
                    <div className="flex items-center gap-3" onClick={() => setLocation("/sandbox/landing-v2")}>
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg cursor-pointer hover:bg-white/20 transition">
                            <ArrowLeft className="w-6 h-6" />
                        </div>
                        <span className="font-semibold tracking-wide cursor-pointer">Back to Home</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold leading-tight">
                            Start your <br />
                            <span style={{ color: COLORS.primary }}>Homestay Journey</span>
                        </h1>
                        <p className="text-lg text-gray-200 leading-relaxed opacity-90">
                            Join thousands of hosts in Himachal Pradesh. Register your property,
                            manage bookings, and grow your business with the official government portal.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">19k+</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Properties</span>
                            </div>
                            <div className="w-px bg-white/30 h-10"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">60 Days</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Approval SLA</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-white/40">
                        © 2025 HP Tourism. Beautiful Himachal.
                    </div>
                </div>
            </div>

            {/* 2. RIGHT COLUMN: Clean Login Form (Center aligned) */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                <div className="max-w-[420px] w-full space-y-6">

                    {/* Header Mobile Only */}
                    <div className="lg:hidden flex items-center gap-2 mb-6 text-gray-500" onClick={() => setLocation("/")}>
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500">
                            Please enter your details to access your dashboard.
                        </p>
                    </div>

                    {/* TABS: Clean Pill Style */}
                    <Tabs
                        defaultValue="user"
                        value={activeTab}
                        onValueChange={(v) => {
                            setActiveTab(v as any);
                            setLoginMethod("password"); // Reset to password default on switch
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-12 rounded-xl mb-6">
                            <TabsTrigger
                                value="user"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm text-gray-600 font-medium transition-all"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Citizen / Owner
                            </TabsTrigger>
                            <TabsTrigger
                                value="office"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 font-medium transition-all"
                            >
                                <Building2 className="w-4 h-4 mr-2" />
                                Department
                            </TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">
                                                {activeTab === 'user' ? "Mobile Number or Email" : "Username"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400">
                                                        {activeTab === 'user' ? <Phone className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all rounded-lg"
                                                        placeholder={activeTab === 'user' ? "e.g. 9876543210" : "Enter official username"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password / OTP Section */}
                                {loginMethod === "password" ? (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                                    {activeTab === 'user' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setLoginMethod("otp")}
                                                            className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
                                                        >
                                                            Login via OTP
                                                        </button>
                                                    )}
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-3 text-gray-400">
                                                            <Lock className="w-5 h-5" />
                                                        </div>
                                                        <Input
                                                            type="password"
                                                            {...field}
                                                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all rounded-lg"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <div className="block text-right">
                                                    <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Forgot Password?</a>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-center mb-1">
                                            <FormLabel className="text-gray-700 font-medium">One Time Password (OTP)</FormLabel>
                                            <button
                                                type="button"
                                                onClick={() => setLoginMethod("password")}
                                                className="text-xs font-bold text-gray-500 hover:text-gray-700 hover:underline"
                                            >
                                                Back to Password
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-green-500 transition-all rounded-lg tracking-widest text-center text-lg font-bold"
                                                placeholder="- - - - - -"
                                                maxLength={6}
                                            />
                                            <Button type="button" variant="outline" className="h-12 px-4 border-gray-200 text-green-700 hover:bg-green-50 font-semibold whitespace-nowrap">
                                                Get OTP
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* CAPTCHA Section */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                                    <div className="h-10 w-28 bg-white border border-gray-200 rounded flex items-center justify-center relative overflow-hidden select-none">
                                        {/* Fake stylized captcha text */}
                                        <span className="font-mono text-xl font-bold tracking-widest text-gray-500 line-through decoration-gray-300 decoration-2">
                                            {captchaCode}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent pointer-events-none"></div>
                                    </div>
                                    <Input
                                        value={captcha}
                                        onChange={(e) => setCaptcha(e.target.value)}
                                        className="h-10 border-gray-300 focus-visible:ring-green-500 bg-white"
                                        placeholder="Enter Captcha"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg text-white ${activeTab === 'office' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' :
                                        'shadow-green-100 hover:bg-[#00b386]'
                                        }`}
                                    style={activeTab === 'user' ? { backgroundColor: COLORS.primary } : {}}
                                >
                                    {loginMethod === 'otp' ? 'Verify & Sign In' : 'Sign In'}
                                    <ArrowRight className="w-5 h-5 ml-2 opacity-90" />
                                </Button>

                            </form>
                        </Form>
                    </Tabs>

                    {/* Registration Footer - Clean & Single Action */}
                    {activeTab === 'user' && (
                        <div className="pt-4 text-center border-t border-gray-100">
                            <Button
                                variant="ghost"
                                className="w-full text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all font-semibold"
                                onClick={() => setLocation("/register")}
                            >
                                Don't have an account? <span className="underline ml-1">Create one</span>
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-center pt-8 opacity-60">
                        <img src={hpsedcLogo} alt="HPSEDC" className="h-8 grayscale" />
                    </div>

                </div>
            </div>
        </div>
    );
}
