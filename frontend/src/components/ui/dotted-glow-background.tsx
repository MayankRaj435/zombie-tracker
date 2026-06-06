import { cn } from "../../lib/utils";

interface DottedGlowBackgroundProps {
    className?: string;
    opacity?: number;
    gap?: number;
    radius?: number;
    colorLightVar?: string;
}

export const DottedGlowBackground = ({
    className,
    opacity = 1,
    gap = 10,
    radius = 1.6,
    colorLightVar = "--color-neutral-500",
}: DottedGlowBackgroundProps) => {
    return (
        <div className={cn("absolute inset-0 h-full w-full bg-slate-950", className)}>
            <div className="absolute inset-0 bg-slate-950/90" />
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
            <div className="pointer-events-none absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_24%,black)]" />
        </div>
    );
};
