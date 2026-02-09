'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Only show once per session (in real app), or simulate here
        const timer = setTimeout(() => {
            setIsVisible(false);
            
            // Fire confetti when splash disappears
            const duration = 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FF6B9D', '#FF9E6D', '#A88BFF']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FF6B9D', '#FF9E6D', '#A88BFF']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[100] bg-[#FFF9FB] flex flex-col items-center justify-center text-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-gray-800 font-heading tracking-tight mb-4">
                            Our Little <span className="text-primary">Universe</span>
                        </h1>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-xl md:text-2xl text-primary font-romantic"
                    >
                        Where your dreams are safe with me ✨
                    </motion.p>

                    <motion.div 
                        className="mt-8 flex gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 rounded-full bg-accent animate-bounce"></div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}