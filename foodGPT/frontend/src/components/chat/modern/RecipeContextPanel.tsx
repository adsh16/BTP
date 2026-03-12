/**
 * RecipeContextPanel Component
 * Displays recipe details alongside chat interface
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, Users, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Recipe {
  title: string;
  image_url?: string;
  ingredients: string[];
  instructions: string[];
  time?: string;
  servings?: string;
}

interface RecipeContextPanelProps {
  recipe: Recipe;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function RecipeContextPanel({
  recipe,
  isOpen = true,
  onToggle,
}: RecipeContextPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: collapsed ? 48 : 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50 overflow-hidden shrink-0"
        >
          {/* Toggle Button */}
          <Button
            onClick={handleToggle}
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 -left-3 z-10 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-300 ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          </Button>

          {/* Panel Content */}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Recipe Details
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Context for this conversation
                  </p>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* Recipe Image */}
                    {recipe.image_url && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm"
                      >
                        <img
                          src={
                            recipe.image_url.startsWith("http")
                              ? recipe.image_url
                              : `http://localhost:5000${recipe.image_url}`
                          }
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}

                    {/* Recipe Title */}
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {recipe.title}
                      </h4>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2">
                      {recipe.time && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs">
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {recipe.time}
                          </span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs">
                          <Users className="h-3 w-3 text-orange-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {recipe.servings}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ingredients */}
                    {recipe.ingredients &&
                      Array.isArray(recipe.ingredients) &&
                      recipe.ingredients.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            Ingredients
                          </h5>
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                              >
                                <span className="h-1 w-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                <span className="leading-relaxed">
                                  {ingredient}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                    {/* Instructions */}
                    {recipe.instructions &&
                      Array.isArray(recipe.instructions) &&
                      recipe.instructions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            Instructions
                          </h5>
                          <ol className="space-y-3">
                            {recipe.instructions.map((step, index) => (
                              <li
                                key={index}
                                className="flex gap-2 text-xs text-gray-600 dark:text-gray-400"
                              >
                                <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold text-[10px]">
                                  {index + 1}
                                </span>
                                <span className="leading-relaxed pt-0.5">
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
