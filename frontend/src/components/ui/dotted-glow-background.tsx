import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface DottedGlowBackgroundProps {
    className?: string;
    opacity?: number;
    gap?: number;
    radius?: number;
    colorLightVar?: string;
    glowColorLightVar?: string;
    colorDarkVar?: string;
    glowColorDarkVar?: string;
    backgroundOpacity?: number;
    speedMin?: number;
    speedMax?: number;
    speedScale?: number;
}

export const DottedGlowBackground = ({
    className,
    opacity = 1,
    gap = 10,
    radius = 1.6,
    colorLightVar = "--color-neutral-500",
    glowColorLightVar: _glowColorLightVar = "--color-neutral-600",
    colorDarkVar: _colorDarkVar = "--color-neutral-500",
    glowColorDarkVar: _glowColorDarkVar = "--color-sky-800",
    backgroundOpacity: _backgroundOpacity = 0,
    speedMin: _speedMin = 0.3,
    speedMax: _speedMax = 1.6,
    speedScale: _speedScale = 1,
}: DottedGlowBackgroundProps) => {
    return (
        <div className={cn("absolute inset-0 h-full w-full bg-slate-950", className)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-950 via-slate-950 to-slate-950 opacity-90" />

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-emerald-500/10 opacity-40 blur-3xl" />

            {/* Dot Pattern */}
            <div
                className="absolute inset-0 h-full w-full"
                style={{ opacity }}
            >
                <svg
                    className="h-full w-full text-slate-600/30"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="dotted-pattern"
                            x="0"
                            y="0"
                            width={gap}
                            height={gap}
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx={radius}
                                cy={radius}
                                r={radius}
                                className="fill-current"
                                style={{
                                    fill: `var(${colorLightVar})`
                                }}
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
                </svg>
            </div>

            {/* Animated Glow Spot */}
            <motion.div
                className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]"
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Mask to fade out edges if needed, though user requested specific mask classes */}
            <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        </div>
    );
};
