"use client";
import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { createNoise3D } from "simplex-noise";
import { cn } from "../../lib/utils";

interface WavyBackgroundProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    className?: string;
    containerClassName?: string;
    colors?: string[];
    waveWidth?: number;
    backgroundFill?: string;
    blur?: number;
    speed?: "slow" | "fast";
    waveOpacity?: number;
}

export const WavyBackground = ({
    children,
    className,
    containerClassName,
    colors,
    waveWidth = 50,
    backgroundFill = "black",
    blur = 10,
    speed = "fast",
    waveOpacity = 0.5,
    ...props
}: WavyBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationIdRef = useRef<number | null>(null);
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const noise = createNoise3D();
        const waveColors = colors ?? ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"];
        const velocity = speed === "fast" ? 0.002 : 0.001;
        let width = 0;
        let height = 0;
        let tick = 0;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx.filter = `blur(${blur}px)`;
        };

        const drawWave = (count: number) => {
            tick += velocity;
            for (let index = 0; index < count; index += 1) {
                ctx.beginPath();
                ctx.lineWidth = waveWidth;
                ctx.strokeStyle = waveColors[index % waveColors.length];
                for (let x = 0; x < width; x += 5) {
                    const y = noise(x / 800, 0.3 * index, tick) * 100;
                    ctx.lineTo(x, y + height * 0.5);
                }
                ctx.stroke();
                ctx.closePath();
            }
        };

        const render = () => {
            ctx.fillStyle = backgroundFill;
            ctx.globalAlpha = waveOpacity;
            ctx.fillRect(0, 0, width, height);
            drawWave(5);
            animationIdRef.current = requestAnimationFrame(render);
        };

        resize();
        render();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            if (animationIdRef.current !== null) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [backgroundFill, blur, colors, speed, waveOpacity, waveWidth]);

    useEffect(() => {
        setIsSafari(
            typeof window !== "undefined" &&
            navigator.userAgent.includes("Safari") &&
            !navigator.userAgent.includes("Chrome")
        );
    }, []);

    return (
        <div
            className={cn(
                "flex h-screen flex-col items-center justify-center",
                containerClassName
            )}
        >
            <canvas
                className="absolute inset-0 z-0"
                ref={canvasRef}
                id="canvas"
                style={{
                    ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
                }}
            />
            <div className={cn("relative z-10", className)} {...props}>
                {children}
            </div>
        </div>
    );
};
