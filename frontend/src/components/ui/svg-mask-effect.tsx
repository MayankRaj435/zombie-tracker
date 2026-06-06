"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface MaskContainerProps {
    children?: ReactNode;
    revealText?: ReactNode;
    size?: number;
    revealSize?: number;
    className?: string;
}

export const MaskContainer = ({
    children,
    revealText,
    size = 10,
    revealSize = 600,
    className,
}: MaskContainerProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateMousePosition = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        };

        container.addEventListener("mousemove", updateMousePosition);
        return () => container.removeEventListener("mousemove", updateMousePosition);
    }, []);

    return (
        <motion.div
            ref={containerRef}
            className={cn("relative h-full overflow-hidden", className)}
            animate={{
                backgroundColor: "var(--slate-900)",
            }}
        >
            <motion.div
                className="absolute flex h-full w-full items-center justify-center text-6xl text-white"
                animate={{
                    clipPath: isHovered
                        ? `circle(${revealSize}px at ${mousePosition.x}px ${mousePosition.y}px)`
                        : `circle(${size}px at ${mousePosition.x}px ${mousePosition.y}px)`,
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            >
                <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative z-20 mx-auto max-w-4xl text-center text-4xl font-bold text-white"
                >
                    {children}
                </div>
            </motion.div>

            <div className="flex h-full w-full items-center justify-center text-white">
                {revealText}
            </div>
        </motion.div>
    );
};
