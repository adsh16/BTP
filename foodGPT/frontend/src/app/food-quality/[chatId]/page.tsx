/**
 * Food Quality Analysis Page
 * Detailed breakdown of the food quality assessment
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowLeft, 
  ChefHat, 
  Info, 
  Leaf, 
  Utensils, 
  Palette, 
  Flame, 
  Sparkles, 
  Activity,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadChat, Chat } from "@/lib/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function FoodQualityPage() {
  const { chatId } = useParams() as { chatId: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      if (!user || !chatId) {
        if (!authLoading && !user) router.push("/");
        return;
      }

      try {
        const chatData = await loadChat(user.uid, chatId);
        setChat(chatData);
      } catch (error) {
        console.error("Error loading quality data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [user, chatId, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
           <Activity className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!chat || !chat.recipe || !chat.recipe.food_quality) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
           <h2 className="text-xl font-bold mb-4">No quality analysis found</h2>
           <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const { food_quality, title, image_url } = chat.recipe;

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
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const parameters = [
    { label: "Freshness", value: food_quality.analysis.freshness, icon: Leaf, color: "text-emerald-500" },
    { label: "Texture", value: food_quality.analysis.texture, icon: Utensils, color: "text-blue-500" },
    { label: "Color Quality", value: food_quality.analysis.color_quality, icon: Palette, color: "text-purple-500" },
    { label: "Cooking Level", value: food_quality.analysis.cooking_level, icon: Flame, color: "text-orange-500" },
    { label: "Presentation", value: food_quality.analysis.presentation, icon: Sparkles, color: "text-amber-500" },
    { label: "Hygiene Estimate", value: food_quality.analysis.hygiene_estimate, icon: ShieldCheck, color: "text-green-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipe
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image and Summary */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
            >
              <div className="aspect-square relative">
                {image_url && (
                   <img 
                    src={image_url.startsWith("http") ? image_url : `http://localhost:5000${image_url}`} 
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-lg backdrop-blur-md ${getRatingColor(food_quality.rating)}`}>
                      {food_quality.rating}
                   </div>
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                   <ChefHat className="h-4 w-4" />
                   <span className="text-sm">Analyzed by Dishcovery AI</span>
                </div>
              </div>
            </motion.div>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 overflow-hidden">
               <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Overall Quality Score</p>
                  <div className="relative inline-flex items-center justify-center">
                     <svg className="w-32 h-32">
                        <circle
                           className="text-gray-200 dark:text-gray-800"
                           strokeWidth="8"
                           stroke="currentColor"
                           fill="transparent"
                           r="58"
                           cx="64"
                           cy="64"
                        />
                        <circle
                           className={getScoreColor(food_quality.quality_score).replace('bg-', 'text-')}
                           strokeWidth="8"
                           strokeDasharray={364.4}
                           strokeDashoffset={364.4 - (364.4 * food_quality.quality_score) / 100}
                           strokeLinecap="round"
                           stroke="currentColor"
                           fill="transparent"
                           r="58"
                           cx="64"
                           cy="64"
                        />
                     </svg>
                     <span className="absolute text-4xl font-black text-gray-900 dark:text-gray-100">
                        {food_quality.quality_score}
                     </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                     Based on multi-parameter visual analysis.
                  </p>
               </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parameters.map((param, index) => (
                  <Card key={index} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                       <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${param.color}`}>
                             <param.icon className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{param.label}</span>
                       </div>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {param.value}
                       </p>
                       {/* Placeholder for a secondary bar or indicator */}
                       <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreColor(food_quality.quality_score)} opacity-60 w-full`} />
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Explanation */}
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 border-l-4 border-l-orange-500">
                 <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                       <Info className="h-5 w-5 text-orange-500" />
                       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Quality Report</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                       {food_quality.explanation}
                    </p>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                       <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          * This analysis is generated by DishCovery AI model based on visual indicators and should be used as a reference only. Always use your best judgment before consuming food.
                       </p>
                    </div>
                 </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
