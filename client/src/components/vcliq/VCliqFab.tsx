import { useState, useEffect } from "react";
import logo from "@/assets/vcliq/vcliq_final.jpg";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";

interface VCliqFabProps {
    className?: string;
}

import { cn } from "@/lib/utils";

export function VCliqFab({ className }: VCliqFabProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [, setLocation] = useLocation();

    // Periodic hint animation - shows "Click to register" every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isHovered) {
                setShowHint(true);
                setTimeout(() => setShowHint(false), 2500);
            }
        }, 5000);

        // Show initial hint after 2 seconds
        const initialTimeout = setTimeout(() => {
            if (!isHovered) setShowHint(true);
            setTimeout(() => setShowHint(false), 2500);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimeout);
        };
    }, [isHovered]);

    return (
        <div className={cn("fixed top-20 right-16 z-50 flex items-center gap-3", className)}>
            {/* Animated hint text - LEFT of FAB */}
            <AnimatePresence>
                {(showHint || isHovered) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#D2691E] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl whitespace-nowrap"
                    >
                        {isHovered ? "Start V CLIQ Registration →" : "👆 Click to Register"}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                className="relative group bg-white rounded-full p-1.5 shadow-2xl border-4 border-white hover:border-[#D2691E]/50 transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation("/register")}
            >
                {/* Outer glow ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#D2691E]/40 to-[#2D5A27]/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Logo container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                    <img
                        src={logo}
                        alt="V CLIQ - Register Your Homestay"
                        className="w-full h-full object-cover scale-125"
                    />
                    <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-black/10" />
                </div>

                {/* Pulse animation ring */}
                <div className="absolute inset-0 rounded-full animate-ping bg-[#D2691E]/20 pointer-events-none" style={{ animationDuration: '2s' }} />
            </motion.button>
        </div>
    );
}
