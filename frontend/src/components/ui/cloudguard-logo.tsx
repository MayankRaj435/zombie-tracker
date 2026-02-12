interface CloudGuardLogoProps {
    size?: number;
    className?: string;
}

export const CloudGuardLogo = ({ size = 40, className = '' }: CloudGuardLogoProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer Gear */}
            <circle
                cx="100"
                cy="100"
                r="85"
                stroke="url(#gradient1)"
                strokeWidth="3"
                fill="none"
            />

            {/* Gear Teeth */}
            {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 100 + 85 * Math.cos(angle);
                const y1 = 100 + 85 * Math.sin(angle);
                const x2 = 100 + 95 * Math.cos(angle);
                const y2 = 100 + 95 * Math.sin(angle);
                return (
                    <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#gradient1)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                );
            })}

            {/* Shield */}
            <path
                d="M100 40 L140 60 L140 100 Q140 130 100 150 Q60 130 60 100 L60 60 Z"
                fill="url(#shieldGradient)"
                stroke="url(#gradient2)"
                strokeWidth="2"
            />

            {/* Cloud */}
            <ellipse cx="85" cy="85" rx="12" ry="10" fill="url(#cloudGradient)" />
            <ellipse cx="100" cy="82" rx="15" ry="12" fill="url(#cloudGradient)" />
            <ellipse cx="115" cy="85" rx="12" ry="10" fill="url(#cloudGradient)" />
            <rect x="85" y="85" width="30" height="10" fill="url(#cloudGradient)" />

            {/* Dollar Sign */}
            <text
                x="100"
                y="105"
                fontSize="28"
                fontWeight="bold"
                fill="#a3f542"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
            >
                $
            </text>

            {/* Circuit Lines */}
            <path
                d="M30 100 L50 100 M150 100 L170 100 M100 30 L100 50 M100 150 L100 170"
                stroke="url(#gradient1)"
                strokeWidth="1.5"
                opacity="0.6"
            />

            {/* Gradients */}
            <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>

                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                    <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
                </linearGradient>

                <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>
        </svg>
    );
};
