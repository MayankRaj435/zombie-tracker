import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface EncryptedTextProps {
    text: string;
    className?: string; // Container class
    encryptedClassName?: string; // Class for scrambling chars
    revealedClassName?: string; // Class for final text
    revealDelayMs?: number; // Delay between revealing each char
    charset?: string;
    flipDelayMs?: number; // Speed of scrambling
}

export const EncryptedText = ({
    text,
    className,
    encryptedClassName,
    revealedClassName,
    revealDelayMs = 50,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
    flipDelayMs = 50,
}: EncryptedTextProps) => {
    const [displayText, setDisplayText] = useState<string[]>([]);
    const [revealedIndex, setRevealedIndex] = useState(0);

    const targetChars = useMemo(() => text.split(""), [text]);

    useEffect(() => {
        let localRevealedIndex = 0;

        // Initialize
        setDisplayText(
            targetChars.map(() => charset[Math.floor(Math.random() * charset.length)])
        );

        const scrambleInterval = setInterval(() => {
            setDisplayText((current) => {
                return current.map((_char, index) => {
                    if (index < localRevealedIndex) {
                        return targetChars[index];
                    }
                    return charset[Math.floor(Math.random() * charset.length)];
                })
            });
        }, flipDelayMs);


        const revealInterval = setInterval(() => {
            if (localRevealedIndex < targetChars.length) {
                localRevealedIndex++;
                setRevealedIndex(localRevealedIndex);
            } else {
                clearInterval(revealInterval);
                clearInterval(scrambleInterval);
                setDisplayText(targetChars);
            }
        }, revealDelayMs);

        return () => {
            clearInterval(scrambleInterval);
            clearInterval(revealInterval);
        };
    }, [targetChars, charset, revealDelayMs, flipDelayMs]);

    return (
        <span className={cn("inline-block whitespace-pre-wrap", className)}>
            {displayText.map((char, index) => {
                const isRevealed = index < revealedIndex;

                return (
                    <motion.span
                        key={index}
                        className={cn(
                            isRevealed ? revealedClassName : encryptedClassName
                        )}
                    >
                        {char}
                    </motion.span>
                );
            })}
        </span>
    );
};
