"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const MaskContainer = ({
    children,
    revealText,
    size = 10,
    revealSize = 600,
    className,
}: {
    children?: React.ReactNode;
    revealText?: React.ReactNode;
    size?: number;
    revealSize?: number;
    className?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState<any>({ x: null, y: null });
    const containerRef = useRef<any>(null);
    const updateMousePosition = (e: any) => {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    useEffect(() => {
        containerRef.current.addEventListener("mousemove", updateMousePosition);
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener(
                    "mousemove",
                    updateMousePosition
                );
            }
        };
    }, []);


    return (
        <motion.div
            ref={containerRef}
            className={cn("h-full relative overflow-hidden", className)}
            animate={{
                backgroundColor: isHovered ? "var(--slate-900)" : "var(--slate-900)",
            }}
        >
            <motion.div
                className="w-full h-full flex items-center justify-center text-6xl absolute text-white"
                animate={{
                    clipPath: isHovered
                        ? `polygon(0 0, ${mousePosition.x ?? 0}px 0, ${mousePosition.x ?? 0}px 100%, 0 100%)`
                        : "polygon(0 0, 0 0, 0 100%, 0 100%)",
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            >
                <div className="absolute inset-0 bg-black/50 h-full w-full z-0" />
                <div
                    onMouseEnter={() => {
                        setIsHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsHovered(false);
                    }}
                    className="max-w-4xl mx-auto text-center text-white text-4xl font-bold relative z-20"
                >
                    {children}
                </div>
            </motion.div>

            <div className="w-full h-full flex items-center justify-center text-white">
                {revealText}
            </div>
        </motion.div>
    );
};
