'use client';

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Clock, Users, ChefHat, Flame, Heart, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipeCardProps {
    recipe: any;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    if (!recipe) return null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-8"
        >
            {/* 3D Card Hero Section */}
            <motion.div variants={item} className="w-full flex justify-center">
                <CardContainer className="inter-var w-full" containerClassName="!py-0">
                    <CardBody className="bg-white dark:bg-slate-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-4 border">

                        <CardItem translateZ="100" className="w-full">
                            <div className="relative w-full h-80 rounded-xl overflow-hidden group-hover/card:shadow-xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={recipe.image_url ? `http://localhost:5000${recipe.image_url}` : "/placeholder-food.jpg"}
                                    alt={recipe.name}
                                    className="h-full w-full object-cover"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                {/* Top Left Dish Name */}
                                <div className="absolute top-4 left-4 right-4">
                                    <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
                                        {recipe.name}
                                    </h2>
                                    {recipe.cuisine && (
                                        <p className="text-gray-200 text-sm mt-1 font-medium flex items-center gap-2">
                                            <span className="bg-orange-500/80 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
                                                {recipe.cuisine}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Top Right Actions */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                                        <Heart className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                            <Clock className="h-3.5 w-3.5 text-orange-400" />
                                            <span>{recipe.time || '30 mins'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                            <Users className="h-3.5 w-3.5 text-orange-400" />
                                            <span>{recipe.servings || '2 servings'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardItem>

                        <CardItem
                            as="p"
                            translateZ="60"
                            className="text-neutral-500 text-sm mt-4 dark:text-neutral-300 leading-relaxed px-2"
                        >
                            {recipe.description}
                        </CardItem>
                    </CardBody>
                </CardContainer>
            </motion.div>

            <div className="flex flex-col gap-6">
                {/* Ingredients */}
                <motion.div variants={item} className="w-full space-y-6">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ChefHat className="h-5 w-5 text-orange-500" />
                                Ingredients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {recipe.ingredients?.map((ingredient: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                                        <span className="leading-relaxed">{ingredient}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Instructions */}
                <motion.div variants={item} className="w-full space-y-6">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Flame className="h-5 w-5 text-orange-500" />
                                Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recipe.instructions?.map((step: string, index: number) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm border border-orange-200 dark:border-orange-800 group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
