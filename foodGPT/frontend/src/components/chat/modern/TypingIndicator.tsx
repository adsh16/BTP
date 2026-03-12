/**
 * TypingIndicator Component
 * Animated indicator showing assistant is thinking/typing
 */

"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
          <ChefHat className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col gap-1">
        {/* Name */}
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">
          Recipe Assistant
        </span>

        {/* Bubble with animated dots */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="
            px-4 py-3 rounded-2xl rounded-tl-sm
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-gray-700
            shadow-sm
          "
        >
          <div className="flex items-center gap-1">
            {/* Animated Dots */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  ...dotTransition,
                  delay: index * 0.15,
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
