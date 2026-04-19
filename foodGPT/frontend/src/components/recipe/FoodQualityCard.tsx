/**
 * FoodQualityCard Component
 * Displays a summary of the food quality analysis
 */

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Info, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface FoodQualityData {
  quality_score: number;
  rating: string;
  analysis: {
    freshness: string;
    texture: string;
    color_quality: string;
    cooking_level: string;
    presentation: string;
    hygiene_estimate: string;
  };
  explanation: string;
}

interface FoodQualityCardProps {
  data: FoodQualityData;
  chatId?: string;
}

export function FoodQualityCard({ data, chatId }: FoodQualityCardProps) {
  const router = useRouter();

  const getRatingColor = (rating: string) => {
    const r = rating.toLowerCase();
    if (r === "excellent") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (r === "good") return "text-green-500 bg-green-500/10 border-green-500/20";
    if (r === "acceptable") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (r === "poor") return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (r === "unsafe") return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-green-500";
    if (score >= 70) return "from-green-500 to-emerald-400";
    if (score >= 50) return "from-amber-400 to-orange-400";
    if (score >= 30) return "from-orange-500 to-red-400";
    return "from-red-600 to-red-400";
  };

  const handleViewDetails = () => {
    if (chatId) {
      router.push(`/food-quality/${chatId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <ShieldCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Food Quality Analysis
            </h4>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRatingColor(data.rating)} uppercase tracking-wider`}>
            {data.rating}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
             <div className="w-16 h-16 rounded-full border-4 border-gray-100 dark:border-gray-800 flex items-center justify-center">
                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-orange-500 to-amber-500">
                    {data.quality_score}
                </span>
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {data.explanation}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleViewDetails}
          variant="outline"
          size="sm"
          className="w-full text-xs font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <BarChart3 className="mr-2 h-3.5 w-3.5 text-orange-500" />
          View Detailed Quality Analysis
          <ChevronRight className="ml-auto h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
