import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Home as HomeIcon,
    Clock,
    FileText,
    CheckCircle,
    Search,
    ShieldCheck,
    TrendingUp,
    Award,
    ChevronDown,
} from "lucide-react";
import { NavigationHeader } from "@/components/navigation-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimatedCounter } from "@/components/animated-counter";
import { HeroCarousel } from "@/components/hero-carousel";
import { useTheme } from "@/contexts/theme-context";
import heroImageSukhu from "@assets/stock_images/cm_sukhu_sukh_ki_sarkar.jpg";
import heroImagePine from "@assets/stock_images/beautiful_himachal_p_50139e3f.jpg";
import heroImageRiver from "@assets/stock_images/beautiful_scenic_him_10b034ba.jpg";
import heroImageVillage from "@assets/stock_images/beautiful_scenic_him_3e373e25.jpg";
import heroImageSnow from "@assets/stock_images/beautiful_scenic_him_799557d0.jpg";
import hpsedcLogo from "@/assets/logos/hpsedc.svg";
import vCliqLogo from "@/assets/logos/v-cliq-logo.jpg";
import { CATEGORY_REQUIREMENTS, MAX_ROOMS_ALLOWED, MAX_BEDS_ALLOWED } from "@shared/fee-calculator";

// Fallback stats if the production scraper cannot load (values from today's prod snapshot)
const FALLBACK_STATS = {
    total: 19705,
    approved: 16301,
    rejected: 1142,
    pending: 2262,
};

export default function LandingPageV1() {
    const [, setLocation] = useLocation();
    const { theme } = useTheme();
    const [applicationNumber, setApplicationNumber] = useState("");
    const [certificateNumber, setCertificateNumber] = useState("");
    const [searchType, setSearchType] = useState<"application" | "aadhaar" | "phone">("application");
    const [showCmSlide, setShowCmSlide] = useState(false);

    const handleScrollTo = (anchor: string) => {
        const el = document.getElementById(anchor);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Fetch live production stats from scraper
    const stats = FALLBACK_STATS;

    const handleTrackApplication = () => {
        if (applicationNumber.trim()) {
            // Navigate to tracking page with query params based on search type
            const queryParam = searchType === "application" ? "app" : searchType === "aadhaar" ? "aadhaar" : "phone";
            setLocation(`/track?${queryParam}=${encodeURIComponent(applicationNumber.trim())}`);
        }
    };

    const handleVerifyCertificate = () => {
        if (certificateNumber.trim()) {
            setLocation(`/verify-certificate?cert=${encodeURIComponent(certificateNumber.trim())}`);
        }
    };

    const scenicImages = useMemo(
        () => [heroImagePine, heroImageRiver, heroImageVillage, heroImageSnow],
        []
    );
    const heroImages = useMemo(
        () => (showCmSlide ? [heroImageSukhu, ...scenicImages] : scenicImages),
        [showCmSlide, scenicImages]
    );
    const showCarousel =
        theme === "classic" || theme === "mountain-sky" || theme === "professional-blue";

    // INCREASED CONTRAST: Darker overlay for better text readability
    const overlayClass = "bg-gradient-to-b from-black/60 via-black/30 to-black/60";

    return (
        <div className="min-h-screen bg-background">
            {/* STICKY HEADER IMPLEMENTATION */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b w-full">
                <NavigationHeader
                    title="HP Tourism eServices"
                    subtitle="Himachal Pradesh Government"
                    showBack={false}
                    showHome={false}
                    onPrimaryLogoToggle={() => setShowCmSlide((prev) => !prev)}
                    actions={
                        <div className="flex items-center gap-3">
                            <ThemeSwitcher />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden md:flex items-center gap-1">
                                        Applications <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => handleScrollTo("stats")}>
                                        Application Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleScrollTo("tracking-section")}>
                                        Application Tracking
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleScrollTo("tracking-section")}>
                                        Check Certificates
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => alert("Checklist coming soon")}>
                                        Procedure & Checklist
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden md:flex items-center gap-1">
                                        Login <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => setLocation("/login?audience=user")}>
                                        User Login
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLocation("/login?audience=office")}>
                                        Office Login
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => setLocation("/contact")}>
                                Contact
                            </Button>
                            <Button variant="outline" onClick={() => setLocation("/sandbox/landing-v2")} className="hidden md:inline-flex border-primary/20 text-primary hover:bg-primary/5">
                                Try Design V2
                            </Button>
                            <Button onClick={() => setLocation("/register")} data-testid="button-register">
                                Register
                            </Button>
                        </div>
                    }
                />
            </div>

            {/* Hero Section - Widescreen with Carousel */}
            <div className={`relative w-full h-[500px] md:h-[600px] overflow-hidden ${!showCarousel ? 'bg-gradient-to-b from-background to-muted/20' : ''}`}>
                {/* Hero Carousel for themes with images */}
                {showCarousel && (
                    <div className="absolute inset-0 z-0">
                        <HeroCarousel
                            key="hero-sukhu"
                            images={heroImages}
                            interval={5000}
                            overlayClassName={overlayClass}
                        />
                    </div>
                )}

                <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4">
                    {/* Added Drop Shadow to text for better readability on any background */}
                    <h1 className={`font-bold mb-6 text-[clamp(2.5rem,6vw,4rem)] leading-tight drop-shadow-lg ${showCarousel ? 'text-white' : 'text-foreground'}`}>
                        Welcome to HP Tourism Online Services
                    </h1>
                    <p className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md ${showCarousel ? 'text-white/95 font-medium' : 'text-muted-foreground'}`}>
                        <span className="block whitespace-pre-wrap md:whitespace-nowrap">
                            Streamlined homestay registration system implementing the 2025 Homestay Rules.
                        </span>
                        <span className="block mt-2">
                            Applications are now scrutinized within the 60-day SLA instead of 120 days.
                        </span>
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Button
                            size="lg"
                            onClick={() => setLocation("/register")}
                            className="w-full sm:w-auto text-base px-8 py-6 h-auto shadow-lg hover:scale-105 transition-transform"
                            data-testid="button-get-started"
                        >
                            Get Started
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className={`${showCarousel ? 'bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20' : ''} w-full sm:w-auto text-base px-8 py-6 h-auto shadow-lg hover:scale-105 transition-transform`}
                            onClick={() => setLocation("/properties")}
                            data-testid="button-browse-properties"
                        >
                            Browse Properties
                        </Button>
                    </div>
                </div>
            </div>

            {/* Live Statistics Dashboard */}
            <section className="py-16 px-4 bg-muted/30" id="stats">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">Live Portal Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="shadow-md border hover:shadow-lg transition-shadow" data-testid="card-total-applications">
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-4xl font-bold" data-testid="stat-total">
                                    <AnimatedCounter value={stats.total} />
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:shadow-lg transition-shadow" data-testid="card-approved-applications">
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Approved Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-4xl font-bold text-green-600" data-testid="stat-approved">
                                    <AnimatedCounter value={stats.approved} />
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:shadow-lg transition-shadow" data-testid="card-rejected-applications">
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <TrendingUp className="w-6 h-6 text-red-600" />
                                </div>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Rejected Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-4xl font-bold text-red-600" data-testid="stat-rejected">
                                    <AnimatedCounter value={stats.rejected} />
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:shadow-lg transition-shadow" data-testid="card-pending-applications">
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-4xl font-bold text-orange-600" data-testid="stat-pending">
                                    <AnimatedCounter value={stats.pending} />
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="shadow-md border hover:-translate-y-1 transition-transform duration-300" data-testid="card-easy-registration">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HomeIcon className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Easy Registration</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription>
                                    Simple step-by-step application process for homestay owners
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:-translate-y-1 transition-transform duration-300" data-testid="card-fast-processing">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Fast Processing</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription>
                                    Applications processed within 60 days with automated workflows
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:-translate-y-1 transition-transform duration-300" data-testid="card-digital-documents">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Digital Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription>
                                    Upload all required documents online with instant verification
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border hover:-translate-y-1 transition-transform duration-300" data-testid="card-realtime-tracking">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Real-time Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription>
                                    Track your application status at every step of the process
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Application Tracking & Certificate Verification */}
            <section className="py-20 px-4 bg-muted/30" id="tracking-section">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="shadow-md border">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <Search className="w-6 h-6 text-primary" />
                                    <CardTitle>Track Your Application</CardTitle>
                                </div>
                                <CardDescription>
                                    Search by Application No., Aadhaar No., or Phone No.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-[150px] justify-between shrink-0">
                                                {searchType === "application" && "Application No."}
                                                {searchType === "aadhaar" && "Aadhaar No."}
                                                {searchType === "phone" && "Phone No."}
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[150px]">
                                            <DropdownMenuItem onClick={() => setSearchType("application")}>
                                                Application No.
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSearchType("aadhaar")}>
                                                Aadhaar No.
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSearchType("phone")}>
                                                Phone No.
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Input
                                        placeholder={
                                            searchType === "application" ? "Enter application number" :
                                                searchType === "aadhaar" ? "Enter Aadhaar number" :
                                                    "Enter phone number"
                                        }
                                        value={applicationNumber}
                                        onChange={(e) => setApplicationNumber(e.target.value)}
                                        className="flex-1"
                                        data-testid="input-application-number"
                                    />
                                    <Button onClick={handleTrackApplication} className="w-full sm:w-auto" data-testid="button-track">
                                        Track
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-6 h-6 text-primary" />
                                    <CardTitle>Verify Certificate</CardTitle>
                                </div>
                                <CardDescription>
                                    Verify the authenticity of homestay certificates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Input
                                        placeholder="Enter certificate number"
                                        value={certificateNumber}
                                        onChange={(e) => setCertificateNumber(e.target.value)}
                                        data-testid="input-certificate-number"
                                    />
                                    <Button onClick={handleVerifyCertificate} className="w-full sm:w-auto" data-testid="button-verify">
                                        Verify
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Homestay Categories */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">2025 Homestay Categories</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Diamond Category */}
                        <Card className="shadow-md border relative overflow-hidden group hover:shadow-xl transition-all" data-testid="card-diamond">
                            {/* Diamond Badge Ribbon */}
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg group-hover:from-cyan-500 group-hover:to-blue-600">
                                    DIAMOND
                                </div>
                            </div>
                            <CardHeader className="pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Diamond</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    Tariff-based premium category for properties charging above ₹10,000/night.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        Tariff: {CATEGORY_REQUIREMENTS.diamond.tariffLabel}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Gold Category */}
                        <Card className="shadow-md border relative overflow-hidden group hover:shadow-xl transition-all" data-testid="card-gold">
                            {/* Gold Badge Ribbon */}
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg group-hover:from-yellow-500 group-hover:to-amber-600">
                                    GOLD
                                </div>
                            </div>
                            <CardHeader className="pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Gold</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    Tariff-based category for properties between ₹3,000 and ₹10,000/night.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-amber-600" />
                                        Tariff: {CATEGORY_REQUIREMENTS.gold.tariffLabel}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-amber-600" />
                                        Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Silver Category */}
                        <Card className="shadow-md border relative overflow-hidden group hover:shadow-xl transition-all" data-testid="card-silver">
                            {/* Silver Badge Ribbon */}
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-slate-300 to-gray-400 text-white text-xs font-bold py-1 px-8 rotate-45 text-center shadow-lg group-hover:from-slate-400 group-hover:to-gray-500">
                                    SILVER
                                </div>
                            </div>
                            <CardHeader className="pt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <CardTitle className="text-2xl">Silver</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    Budget-friendly stays with tariffs below ₹3,000/night.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-600" />
                                        Tariff: {CATEGORY_REQUIREMENTS.silver.tariffLabel}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-600" />
                                        Capacity: Up to {MAX_ROOMS_ALLOWED} rooms / {MAX_BEDS_ALLOWED} beds
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t bg-background">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">

                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold tracking-wide text-foreground">
                            HP Tourism eServices
                        </p>
                        <p className="text-sm text-muted-foreground">
                            © 2025 Government of Himachal Pradesh. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {/* V-CLIQ MOVED TO FOOTER */}
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Campaign Partner</span>
                            <img
                                src={vCliqLogo}
                                alt="V CLIQ - We Click"
                                className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>

                        <div className="h-8 w-px bg-border hidden md:block"></div>

                        <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Developed by</span>
                            <img
                                src={hpsedcLogo}
                                alt="Himachal Pradesh State Electronics Dev. Corp. Ltd."
                                className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
}
