/**
 * ChatHeader Component
 * Header showing current recipe context with title and image
 */

"use client";

import { motion } from "framer-motion";
import { ChefHat, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  recipeTitle?: string;
  recipeImage?: string;
  showImage?: boolean;
}

export function ChatHeader({
  recipeTitle,
  recipeImage,
  showImage = true,
}: ChatHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
    >
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Recipe Image Preview (if available) */}
          {showImage && recipeImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <img
                src={
                  recipeImage.startsWith("http")
                    ? recipeImage
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}${recipeImage}`
                }
                alt={recipeTitle || "Recipe"}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Assistant Icon (if no image) */}
          {(!showImage || !recipeImage) && (
            <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recipe Assistant
              </h2>
            </div>
            {recipeTitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {recipeTitle}
              </p>
            )}
          </div>

          {/* Status Indicator */}
          <div className="shrink-0 flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Online
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
