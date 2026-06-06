"use client";
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
}

interface AnimatedBackgroundProps {
    children?: ReactNode;
    className?: string;
    particleCount?: number;
    colors?: string[];
}

export const AnimatedBackground = ({
    children,
    className,
    particleCount = 34,
    colors = ['#22d3ee', '#34d399', '#f59e0b', '#60a5fa']
}: AnimatedBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const resizeCanvas = () => {
            const scale = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * scale;
            canvas.height = window.innerHeight * scale;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.28,
                    vy: (Math.random() - 0.5) * 0.28,
                    size: Math.random() * 1.9 + 0.8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: Math.random() * 0.32 + 0.12
                });
            }
        };
        initParticles();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            particlesRef.current.forEach((particle, i) => {
                if (!reduceMotion) {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                }

                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (!reduceMotion && distance > 0 && distance < 130) {
                    const force = (130 - distance) / 130;
                    particle.vx -= (dx / distance) * force * 0.1;
                    particle.vy -= (dy / distance) * force * 0.1;
                }

                if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
                if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

                particle.vx *= 0.99;
                particle.vy *= 0.99;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();

                // Draw connections
                particlesRef.current.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = particle.color;
                        ctx.globalAlpha = (1 - distance / 150) * 0.13;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            ctx.globalAlpha = 1;
            if (!reduceMotion) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount, colors]);

    return (
        <div className={cn('premium-shell relative w-full min-h-screen', className)}>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none opacity-70"
            />
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
};
