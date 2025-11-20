/**
 * Image Upload Component
 * Drag-and-drop file upload with mobile camera support
 */

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ImageUploadProps {
    onUpload: (file: File) => void;
    loading?: boolean;
}

export function ImageUpload({ onUpload, loading = false }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
        maxFiles: 1,
        disabled: loading,
    });

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    const handleClear = () => {
        setPreview(null);
        setSelectedFile(null);
    };

    return (
        <div className="space-y-4">
            {!preview ? (
                <Card
                    {...getRootProps()}
                    className={`
            border-2 border-dashed p-12 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-full">
                            {loading ? (
                                <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                            ) : (
                                <Upload className="h-12 w-12 text-orange-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-700">
                                {isDragActive ? 'Drop the image here' : 'Drag & drop a food image'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                or click to browse from your device
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={loading}
                            >
                                <Camera className="h-4 w-4" />
                                Take Photo
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Supported formats: PNG, JPG, JPEG, GIF, WebP
                        </p>
                    </div>
                </Card>
            ) : (
                <Card className="p-6 space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpload}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Generate Recipe'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            Change Image
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
