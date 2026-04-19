/**
 * Loading Skeleton Components
 * Professional loading placeholders
 */

export function RecipeCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-800 shadow-sm">
            {/* Image Skeleton */}
            <div className="h-64 w-full skeleton" />

            {/* Header Skeleton */}
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="h-8 w-3/4 skeleton" />
                        <div className="h-4 w-1/2 skeleton" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-full skeleton" />
                        <div className="h-10 w-10 rounded-full skeleton" />
                    </div>
                </div>

                {/* Ingredients Skeleton */}
                <div className="space-y-3 pt-4">
                    <div className="h-6 w-32 skeleton rounded-full" />
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="h-2 w-2 rounded-full skeleton mt-2" />
                                <div className="h-4 flex-1 skeleton" style={{ width: `${60 + Math.random() * 30}%` }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions Skeleton */}
                <div className="space-y-3 pt-4">
                    <div className="h-6 w-32 skeleton rounded-full" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-8 w-8 rounded-full skeleton flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full skeleton" />
                                    <div className="h-4 w-5/6 skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="h-12 w-full skeleton rounded-md" />
            </div>
        </div>
    );
}

export function ChatMessageSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* Assistant message */}
            <div className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                    <div className="h-4 w-64 skeleton" />
                    <div className="h-4 w-48 skeleton" />
                </div>
            </div>
            {/* User message */}
            <div className="flex justify-end">
                <div className="h-4 w-40 skeleton" />
            </div>
            {/* Assistant message */}
            <div className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                    <div className="h-4 w-56 skeleton" />
                    <div className="h-4 w-72 skeleton" />
                    <div className="h-4 w-48 skeleton" />
                </div>
            </div>
        </div>
    );
}

export function UploadingSkeleton() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12">
                <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full skeleton" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 mx-auto skeleton" />
                        <div className="h-4 w-64 mx-auto skeleton" />
                    </div>
                    <div className="h-10 w-32 mx-auto skeleton rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function SampleGallerySkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="aspect-square skeleton" />
                    <div className="p-3">
                        <div className="h-4 w-3/4 skeleton" />
                    </div>
                </div>
            ))}
        </div>
    );
}
