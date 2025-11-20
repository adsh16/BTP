"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden bg-neutral-950 flex flex-col items-end justify-center",
                className
            )}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#1f2937,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#374151,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_50%,#111827,transparent)]" />

            {/* Beams */}
            <div className="absolute inset-0 opacity-30">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: -100, y: -100 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: 100, y: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                />
            </div>

            <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        </div>
    );
};
