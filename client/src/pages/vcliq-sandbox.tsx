import { useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationHeader } from "@/components/navigation-header";
import { HeroCarousel } from "@/components/hero-carousel";
import { VCliqFab } from "@/components/vcliq/VCliqFab";
import { VCliqCard } from "@/components/vcliq/VCliqCard";
import { Home, ArrowRight } from "lucide-react";

// Reuse images from home page
import heroImagePine from "@assets/stock_images/beautiful_himachal_p_50139e3f.jpg";
import heroImageRiver from "@assets/stock_images/beautiful_scenic_him_10b034ba.jpg";
import heroImageVillage from "@assets/stock_images/beautiful_scenic_him_3e373e25.jpg";
import heroImageSnow from "@assets/stock_images/beautiful_scenic_him_799557d0.jpg";

export default function VCliqSandboxPage() {
    const [, setLocation] = useLocation();

    const heroImages = useMemo(
        () => [heroImagePine, heroImageRiver, heroImageVillage, heroImageSnow],
        []
    );

    return (
        <div className="min-h-screen bg-background relative">
            <NavigationHeader
                title="HP Tourism eServices"
                subtitle="Himachal Pradesh Government"
                showBack={false}
                showHome={true}
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => setLocation("/login")}>Login</Button>
                        <Button onClick={() => setLocation("/register")}>Register</Button>
                    </div>
                }
            />

            {/* Hero Section */}
            <section className="relative h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <HeroCarousel
                        images={heroImages}
                        interval={5000}
                        overlayClassName="bg-gradient-to-b from-black/60 via-black/40 to-background"
                    />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                        Welcome to HP Tourism Online Services
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl drop-shadow-md">
                        Experience the magic of Himachal with our new improved services and the V CLIQ initiative.
                    </p>
                </div>
            </section>

            {/* Registration Block */}
            <section className="py-16 px-4 -mt-20 relative z-20">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Card 1: Standard Registration */}
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-emerald-100 min-h-[320px] flex flex-col items-center justify-center text-center p-6 hover:shadow-2xl transition-shadow">
                        <CardHeader>
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Home className="w-8 h-8 text-emerald-600" />
                            </div>
                            <CardTitle className="text-2xl">Standard Registration</CardTitle>
                            <CardDescription>
                                Register your Homestay or Bed & Breakfast unit using the standard process.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                                onClick={() => setLocation("/register")}
                            >
                                Register Now
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card 2: V CLIQ Portal */}
                    <VCliqCard />

                </div>
            </section>

            {/* Footer Mock */}
            <footer className="py-8 text-center text-muted-foreground text-sm border-t mt-12 bg-white">
                © 2025 Government of Himachal Pradesh. V CLIQ Integrated.
            </footer>

            {/* The Brand New FAB */}
            <VCliqFab />
        </div>
    );
}
