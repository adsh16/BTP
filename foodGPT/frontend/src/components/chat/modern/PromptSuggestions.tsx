/**
 * PromptSuggestions Component
 * Suggestion cards for starting conversations
 */

"use client";

import { motion } from "framer-motion";
import { Lightbulb, Utensils, Leaf, Scale, Clock } from "lucide-react";

interface PromptSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

// Icon mapping for common suggestion themes
const getIconForSuggestion = (suggestion: string) => {
  const lower = suggestion.toLowerCase();
  if (lower.includes("healthy") || lower.includes("nutrition") || lower.includes("calories")) {
    return Scale;
  }
  if (lower.includes("vegetarian") || lower.includes("vegan") || lower.includes("substitute")) {
    return Leaf;
  }
  if (lower.includes("cuisine") || lower.includes("origin")) {
    return Utensils;
  }
  if (lower.includes("time") || lower.includes("quick") || lower.includes("prepare")) {
    return Clock;
  }
  return Lightbulb;
};

export function PromptSuggestions({
  suggestions,
  onSelectSuggestion,
  disabled = false,
}: PromptSuggestionsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Ask me anything about your recipe
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Get cooking tips, substitutions, nutritional info, and more
        </p>
      </motion.div>

      {/* Suggestion Cards Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {suggestions.map((suggestion, index) => {
          const Icon = getIconForSuggestion(suggestion);

          return (
            <motion.button
              key={index}
              variants={item}
              onClick={() => !disabled && onSelectSuggestion(suggestion)}
              disabled={disabled}
              whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              className={`
                group relative
                p-4 rounded-xl
                text-left
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-slate-800/50
                shadow-sm hover:shadow-md
                transition-all duration-200
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer"
                }
              `}
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/5 group-hover:to-amber-500/5 transition-all duration-200" />

              {/* Content */}
              <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-900/50 dark:group-hover:to-amber-900/50 transition-colors">
                    <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                    {suggestion}
                  </p>
                </div>

                {/* Arrow indicator on hover */}
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="h-4 w-4 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
