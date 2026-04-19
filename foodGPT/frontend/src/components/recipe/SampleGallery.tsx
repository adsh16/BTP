/**
 * Sample Recipe Gallery
 * Grid of sample food images to try
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { FocusCards } from '@/components/ui/focus-cards';

interface Sample {
    name: string;
    url: string;
}

interface SampleGalleryProps {
    onSelectSample: (name: string) => void;
    loading?: boolean;
}

export function SampleGallery({ onSelectSample, loading = false }: SampleGalleryProps) {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loadingSamples, setLoadingSamples] = useState(true);
    const [selectedSample, setSelectedSample] = useState<string | null>(null);

    useEffect(() => {
        const fetchSamples = async () => {
            try {
                const response = await apiClient.getSamples();
                if (response.status === 'success' && response.data) {
                    setSamples(response.data);
                }
            } catch (error) {
                console.error('Failed to load samples:', error);
            } finally {
                setLoadingSamples(false);
            }
        };

        fetchSamples();
    }, []);

    const handleSelectSample = (name: string) => {
        setSelectedSample(name);
        onSelectSample(name);
    };

    if (loadingSamples) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    const cards = samples.map(sample => ({
        title: sample.name.charAt(0).toUpperCase() + sample.name.slice(1),
        src: `http://localhost:5000${sample.url}`,
        originalName: sample.name
    }));

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Try Sample Images</h3>
            <FocusCards cards={cards} onCardClick={handleSelectSample} />
            {loading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                        <p className="text-lg font-medium">Analyzing recipe...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
