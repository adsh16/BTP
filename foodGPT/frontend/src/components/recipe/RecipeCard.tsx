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
                <CardContainer className="inter-var w-full py-4">
                    <CardBody className="bg-white dark:bg-slate-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border">
                        <div className="flex justify-between items-start">
                            <CardItem
                                translateZ="50"
                                className="text-xl font-bold text-neutral-600 dark:text-white"
                            >
                                {recipe.name}
                            </CardItem>
                            <div className="flex gap-2">
                                <CardItem translateZ="40" as="button" className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                    <Heart className="h-4 w-4" />
                                </CardItem>
                                <CardItem translateZ="40" as="button" className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                    <Share2 className="h-4 w-4" />
                                </CardItem>
                            </div>
                        </div>

                        <CardItem
                            as="p"
                            translateZ="60"
                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                        >
                            {recipe.description}
                        </CardItem>

                        <CardItem translateZ="100" className="w-full mt-4">
                            <div className="relative w-full h-60 rounded-xl overflow-hidden group-hover/card:shadow-xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={recipe.image_url ? `http://localhost:5000${recipe.image_url}` : "/placeholder-food.jpg"}
                                    alt={recipe.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </CardItem>

                        <div className="flex justify-between items-center mt-8">
                            <CardItem
                                translateZ={20}
                                as="div"
                                className="flex items-center gap-4"
                            >
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span>{recipe.time || '30 mins'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    <span>{recipe.servings || '2 servings'}</span>
                                </div>
                            </CardItem>
                        </div>
                    </CardBody>
                </CardContainer>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Ingredients */}
                <motion.div variants={item} className="md:col-span-1 space-y-6">
                    <Card className="h-full border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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
                <motion.div variants={item} className="md:col-span-2 space-y-6">
                    <Card className="h-full border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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
