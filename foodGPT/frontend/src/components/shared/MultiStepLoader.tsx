'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Step {
    id: number;
    title: string;
    duration: number; // milliseconds
}

const steps: Step[] = [
    { id: 1, title: 'Uploading image...', duration: 2000 },
    { id: 2, title: 'Analyzing recipe...', duration: 3000 },
    { id: 3, title: 'Extracting ingredients...', duration: 400 },
    { id: 4, title: 'Getting instructions...', duration: 4000 },
];

export function MultiStepLoader() {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < steps.length) {
            const timer = setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
            }, steps[currentStep].duration);

            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[400px]"
        >
            <div className="max-w-md w-full space-y-6 p-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-4"
                    >
                        <Loader2 className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Processing Your Recipe
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please wait while we analyze your food image
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isPending = index > currentStep;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                {/* Step Indicator */}
                                <div className="flex-shrink-0">
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                                        >
                                            <Check className="h-5 w-5 text-white" />
                                        </motion.div>
                                    ) : isCurrent ? (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {step.id}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Step Title */}
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-medium transition-colors ${isCompleted
                                                ? 'text-green-600 dark:text-green-400'
                                                : isCurrent
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                    >
                                        {step.title}
                                    </p>
                                </div>

                                {/* Progress Bar (for current step only) */}
                                {isCurrent && (
                                    <motion.div
                                        className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                                        initial={{ width: 0 }}
                                    >
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: step.duration / 1000, ease: 'linear' }}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
