import { Button } from "@/components/ui/button";
import logo from "@/assets/vcliq/vcliq_final.jpg";
import woodGrain from "@/assets/vcliq/wood_grain.png";
import { ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function VCliqCard() {
    return (
        <Card
            className="group relative overflow-hidden border-none shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => window.location.href = "/login"} // Mock action
        >
            {/* Wood Grain Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${woodGrain})`,
                    filter: "brightness(0.9) contrast(1.1)"
                }}
            />

            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <CardContent className="relative z-10 p-8 flex flex-col items-center justify-center min-h-[320px] text-center space-y-6">
                <div className="relative">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center p-0 overflow-hidden ring-4 ring-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <img src={logo} alt="V CLIQ" className="w-full h-full object-cover scale-110" />
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#D2691E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    NEW
                </div>


                <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                        V CLIQ Portal
                    </h3>
                    <p className="text-white/80 font-medium text-sm">
                        Discover Himachal's Hidden Gems
                    </p>
                </div>

                <Button
                    className="bg-[#2D5A27] hover:bg-[#20401C] text-white border-0 shadow-lg group-hover:shadow-[0_0_20px_rgba(45,90,39,0.5)] transition-all duration-300"
                    size="lg"
                >
                    Start Journey <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardContent>
        </Card >
    );
}
