import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Menu,
    Search,
    ChevronDown,
    Calculator,
    ArrowRight,
    ChevronRight,
    User,
} from "lucide-react";

import hpsedcLogo from "@/assets/logos/hpsedc.svg";
import vCliqLogo from "@/assets/logos/v-cliq-logo.jpg";
import heroImagePine from "@assets/stock_images/beautiful_himachal_p_50139e3f.jpg";
import hpTourismLogo from "@/assets/logos/hp-tourism.png";
import { CATEGORY_REQUIREMENTS, MAX_ROOMS_ALLOWED, MAX_BEDS_ALLOWED } from "@shared/fee-calculator";
import { Award, CheckCircle } from "lucide-react";

// Groww-inspired color palette
const COLORS = {
    primary: "#00d09c", // The 'Groww Green' approximation
    primaryDark: "#00b386",
    text: "#44475b",
    textLight: "#7c7e8c",
    background: "#ffffff",
    backgroundAlt: "#f6f8fb", // Very light blue/gray for sections
    border: "#eef0f3",
};

export default function LandingPageV2() {
    const [, setLocation] = useLocation();
    const [rooms, setRooms] = useState(3);
    const [rate, setRate] = useState(2500);
    const [occupancy, setOccupancy] = useState(40);

    // Calculator Logic
    const monthlyRevenue = useMemo(() => {
        return rooms * rate * 30 * (occupancy / 100);
    }, [rooms, rate, occupancy]);

    const annualRevenue = useMemo(() => {
        return monthlyRevenue * 12;
    }, [monthlyRevenue]);

    const estimatedCategory = useMemo(() => {
        if (rate >= 10000) return { name: "Diamond", color: "text-blue-500", bg: "bg-blue-50" };
        if (rate >= 3000) return { name: "Gold", color: "text-amber-500", bg: "bg-amber-50" };
        return { name: "Silver", color: "text-gray-500", bg: "bg-gray-50" };
    }, [rate]);

    return (
        <div className="min-h-screen font-sans" style={{ color: COLORS.text, backgroundColor: COLORS.background }}>
            {/* 1. Header - Groww Style: Minimal, White, Sticky */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 dark:border-gray-800 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-8">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
                        <div className="w-8 h-8 md:w-10 md:h-10 relative">
                            <img src={hpTourismLogo} alt="HP Tourism" className="w-full h-full object-contain" />
                        </div>
                        <div className="hidden md:block leading-tight">
                            <h1 className="font-bold text-lg tracking-tight">HP Tourism</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">eServices</p>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-black transition-colors">Explore</a>
                        <a href="#" className="hover:text-black transition-colors">Homestays</a>
                        <a href="#" className="hover:text-black transition-colors flex items-center gap-1">
                            Resources <ChevronDown className="w-3 h-3" />
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Bar (Fake) */}
                    <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Track application..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        className="hidden md:inline-flex text-gray-600 hover:text-green-600 hover:bg-green-50"
                        onClick={() => setLocation("/sandbox/landing-v1")}
                    >
                        Try Design V1
                    </Button>

                    <Button
                        style={{ backgroundColor: COLORS.primary }}
                        className="hover:bg-[#00b386] text-white font-medium rounded-md px-6 shadow-sm shadow-green-100"
                        onClick={() => setLocation("/login")}
                    >
                        Login/Register
                    </Button>

                    <div className="md:hidden">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </div>
                </div>
            </header>

            {/* 2. Hero Section - Widescreen (Original Style) */}
            <div className="relative w-full h-[500px] bg-gray-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImagePine})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-3xl drop-shadow-lg">
                        Empower your <span className="text-green-400">Homestay Business</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-100 max-w-2xl leading-relaxed drop-shadow-md">
                        Join Himachal's official tourism network. Register your property, get verified, and start hosting travelers from around the world.
                    </p>
                </div>
            </div>

            {/* 3. Main Layout: Two Columns (Calculator + Sidebar) */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* LEFT COLUMN: Calculator Only (Text moved to Hero) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* THE CALCULATOR (The "Groww" Feature) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-gray-400" />
                                    Homestay Income Estimator
                                </h2>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${estimatedCategory.bg} ${estimatedCategory.color}`}>
                                    {estimatedCategory.name} Category
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Inputs */}
                                <div className="space-y-8">
                                    {/* Slider 1: Rooms */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-600">Total Rooms</label>
                                            <span className="text-lg font-bold bg-green-50 text-green-700 px-3 py-1 rounded-md">{rooms}</span>
                                        </div>
                                        <Slider
                                            value={[rooms]}
                                            min={1}
                                            max={6}
                                            step={1}
                                            onValueChange={(v) => setRooms(v[0])}
                                            className="cursor-pointer"
                                        />
                                    </div>

                                    {/* Slider 2: Average Rate */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-600">Avg. Nightly Rate (₹)</label>
                                            <span className="text-lg font-bold bg-green-50 text-green-700 px-3 py-1 rounded-md">₹{rate.toLocaleString()}</span>
                                        </div>
                                        <Slider
                                            value={[rate]}
                                            min={500}
                                            max={15000}
                                            step={100}
                                            onValueChange={(v) => setRate(v[0])}
                                            className="cursor-pointer"
                                        />
                                    </div>

                                    {/* Slider 3: Occupancy */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-600">Occupancy Rate (%)</label>
                                            <span className="text-lg font-bold bg-green-50 text-green-700 px-3 py-1 rounded-md">{occupancy}%</span>
                                        </div>
                                        <Slider
                                            value={[occupancy]}
                                            min={10}
                                            max={100}
                                            step={5}
                                            onValueChange={(v) => setOccupancy(v[0])}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Results (Visual) */}
                                <div className="flex flex-col justify-center items-center bg-gray-50 rounded-xl p-6 relative overflow-hidden">
                                    <div className="text-center z-10">
                                        <p className="text-sm text-gray-500 font-medium mb-1">Estimated Annual Revenue</p>
                                        <p className="text-4xl font-bold tracking-tight text-gray-900">
                                            ₹{(annualRevenue / 100000).toFixed(2)} Lakh
                                        </p>
                                        <p className="text-sm text-green-600 font-medium mt-2">
                                            ₹{monthlyRevenue.toLocaleString()} / month
                                        </p>

                                        <Button
                                            className="mt-6 w-full"
                                            style={{ backgroundColor: COLORS.primary }}
                                            onClick={() => setLocation("/register")}
                                        >
                                            Start Earning Now
                                        </Button>
                                    </div>

                                    {/* Decorative background element */}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-200/20 rounded-full blur-2xl"></div>
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"></div>
                                </div>
                            </div>
                        </div>

                        {/* Informational Content (SEO/Explanation) */}
                        <div className="prose prose-gray max-w-none">
                            <h3 className="text-2xl font-bold mb-4">Why register your Homestay?</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Under the <strong>Himachal Pradesh Homestay Schemes 2008 & 2025</strong>, registering provides legal compliance and connects you to a vast network of tourists seeking authentic local experiences.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">State Recognition</h4>
                                        <p className="text-sm text-gray-600">Official certificate and listing on the government portal.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Tax Benefits</h4>
                                        <p className="text-sm text-gray-600">Exemptions on luxury tax and domestic rates for electricity/water (as per scheme).</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>

                    {/* RIGHT COLUMN: Sidebar / Quick Tools */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* CTA Card */}
                        <Card className="border-none shadow-lg bg-gray-900 text-white overflow-hidden relative">
                            <CardContent className="p-6 relative z-10">
                                <h3 className="text-xl font-bold mb-2">New User?</h3>
                                <p className="text-gray-300 mb-6 text-sm">Create an account to register your property or simplify your travel plans.</p>
                                <Button variant="outline" className="w-full text-black hover:bg-gray-100 border-white bg-white">
                                    Create Account
                                </Button>
                            </CardContent>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        </Card>

                        {/* Quick Tools List (Groww Sidebar Style) */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-700 text-sm">QUICK TOOLS</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <button
                                    onClick={() => setLocation("/track")}
                                    className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                                >
                                    <span className="text-gray-600 group-hover:text-green-600 font-medium text-sm">Track Application</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                                </button>
                                <button className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                                    <span className="text-gray-600 group-hover:text-green-600 font-medium text-sm">Verify Certificate</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                                </button>
                                <button className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                                    <span className="text-gray-600 group-hover:text-green-600 font-medium text-sm">Homestay Types</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                                </button>
                            </div>
                        </div>

                        {/* Partner / Footer Mini */}
                        <div className="text-center pt-8 border-t border-gray-100 mt-8">
                            <p className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-widest">Powered By</p>
                            <img src={vCliqLogo} alt="V CLIQ" className="h-48 w-auto mx-auto shadow-sm rounded-lg" />
                        </div>

                    </div>
                </div>

                {/* Homestay Categories (Moved to Full Width) */}
                <div className="mt-24">
                    <h3 className="text-3xl font-bold mb-10 text-center text-gray-900">2025 Homestay Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Diamond Category */}
                        <Card className="shadow-md border relative overflow-hidden h-full hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg">
                                    DIAMOND
                                </div>
                            </div>
                            <CardHeader className="pb-2 pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Award className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Diamond</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <p className="text-base text-gray-500 leading-relaxed">
                                    Tariff-based premium category for properties charging above ₹10,000/night.
                                </p>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="leading-tight font-medium">Tariff: Tariff above ₹10,000 per room per night</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="font-medium">Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gold Category */}
                        <Card className="shadow-md border relative overflow-hidden h-full hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg">
                                    GOLD
                                </div>
                            </div>
                            <CardHeader className="pb-2 pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
                                        <Award className="w-7 h-7 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Gold</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <p className="text-base text-gray-500 leading-relaxed">
                                    Tariff-based category for properties between ₹3,000 and ₹10,000/night.
                                </p>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="leading-tight font-medium">Tariff: Tariff between ₹3,000 and ₹10,000 per room per night</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="font-medium">Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Silver Category */}
                        <Card className="shadow-md border relative overflow-hidden h-full hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-slate-300 to-gray-400 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg">
                                    SILVER
                                </div>
                            </div>
                            <CardHeader className="pb-2 pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Award className="w-7 h-7 text-gray-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Silver</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <p className="text-base text-gray-500 leading-relaxed">
                                    Budget-friendly stays with tariffs below ₹3,000/night.
                                </p>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                                        <span className="leading-tight font-medium">Tariff: Tariff below ₹3,000 per room per night</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                                        <span className="font-medium">Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </main>

            {/* 3. Footer Section (Minimal) */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold mb-4">HP Tourism</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>About Us</li>
                            <li>Contact</li>
                            <li>Terms & Conditions</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Discover</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>Attractions</li>
                            <li>Accommodations</li>
                            <li>Adventures</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">For Owners</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>Register Homestay</li>
                            <li>Renew License</li>
                            <li>Guidelines</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Developed By</h4>
                        <img src={hpsedcLogo} className="h-10 opacity-80" alt="HPSEDC" loading="lazy" />
                        <p className="text-xs text-gray-400 mt-2">Himachal Pradesh State Electronics Dev. Corp.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
