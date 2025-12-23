import { ReactNode } from "react";

interface FormSectionHeaderProps {
    number: number;
    title: string;
    description?: string;
    variant?: "primary" | "secondary" | "tertiary";
}

/**
 * Numbered section header for application form steps
 * Uses gradient backgrounds that progress from darker to lighter
 */
export function FormSectionHeader({
    number,
    title,
    description,
    variant = "primary"
}: FormSectionHeaderProps) {
    const gradientClasses = {
        primary: "from-slate-800 to-slate-700",
        secondary: "from-slate-700 to-slate-600",
        tertiary: "from-slate-600 to-slate-500",
    };

    return (
        <div className={`bg-gradient-to-r ${gradientClasses[variant]} text-white px-6 py-4`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                    {number}
                </div>
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    {description && (
                        <p className="text-sm text-white/70">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface FormSectionContentProps {
    children: ReactNode;
    className?: string;
}

/**
 * Content wrapper for form sections with consistent padding
 */
export function FormSectionContent({ children, className = "" }: FormSectionContentProps) {
    return (
        <div className={`p-6 space-y-4 ${className}`}>
            {children}
        </div>
    );
}
