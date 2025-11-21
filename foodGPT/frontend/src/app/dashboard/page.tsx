/**
 * Dashboard Page
 * Main interface with chat history sidebar
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ImageUpload } from '@/components/recipe/ImageUpload';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SampleGallery } from '@/components/recipe/SampleGallery';
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Recipe } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ChatMessage } from '@/lib/firestore';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { RecipeCardSkeleton, ChatMessageSkeleton } from '@/components/shared/LoadingSkeletons';

export default function DashboardPage() {
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const {
        chats,
        loading: chatsLoading,
        currentChatId,
        selectChat,
        createNewChat,
        refreshChats
    } = useChatHistory();

    // Initialize chat when recipe is loaded
    useEffect(() => {
        if (recipe && !currentChatId) {
            createNewChat();
        }
    }, [recipe, currentChatId, createNewChat]);

    const handleUpload = async (file: File) => {
        setLoading(true);
        try {
            const response = await apiClient.uploadRecipe(file);
            if (response.status === 'success' && response.data) {
                setRecipe(response.data);

                // Initialize chat with context
                await apiClient.initChat(
                    response.data.title,
                    response.data.ingredients,
                    response.data.instructions
                );

                // Create new chat session
                if (!currentChatId) {
                    await createNewChat();
                }
            } else {
                alert(response.message || 'Failed to generate recipe');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSample = async (name: string) => {
        setLoading(true);
        try {
            const response = await apiClient.getSampleRecipe(name);
            if (response.status === 'success' && response.data) {
                setRecipe(response.data);

                // Initialize chat with context
                await apiClient.initChat(
                    response.data.title,
                    response.data.ingredients,
                    response.data.instructions
                );

                // Create new chat session
                if (!currentChatId) {
                    await createNewChat();
                }
            } else {
                alert(response.message || 'Failed to load sample');
            }
        } catch (error) {
            console.error('Sample error:', error);
            alert('Failed to load sample recipe.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = async (chatId: string) => {
        const chat = await selectChat(chatId);
        if (chat) {
            setMessages(chat.messages);
            // If the chat has a recipe associated, we would load it here
            // For now, we might need to fetch the recipe details if stored in the chat
            // or just show the chat history
            setShowChat(true);
        }
    };

    const handleNewChat = async () => {
        await createNewChat();
        setRecipe(null);
        setMessages([]);
        setShowChat(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 relative w-full flex flex-col overflow-hidden">
            <Navbar />
            <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />

            <div className="flex flex-1 relative z-10 h-full">
                {/* Sidebar */}
                {user && (
                    <ChatHistorySidebar
                        chats={chats}
                        currentChatId={currentChatId}
                        onSelectChat={handleSelectChat}
                        onNewChat={handleNewChat}
                        loading={chatsLoading}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {!user ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center items-center h-[60vh]"
                            >
                                <Card className="max-w-2xl w-full border-white/10 bg-black/50 backdrop-blur-md">
                                    <CardContent className="p-12 text-center">
                                        <h2 className="text-2xl font-bold mb-4 text-white">
                                            Sign In Required
                                        </h2>
                                        <p className="text-neutral-300">
                                            Please sign in to upload images and generate recipes.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="w-full max-w-[95%] mx-auto space-y-8 pb-20 pt-4">
                                {/* Header */}
                                {!recipe && !showChat && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center text-center space-y-4"
                                    >
                                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                                            Upload Your Dish
                                        </h1>
                                        <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
                                            Upload a food image or try a sample to get started
                                        </p>
                                    </motion.div>
                                )}

                                {/* Upload Section */}
                                {!recipe && !showChat && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="space-y-12"
                                    >
                                        <div className="max-w-2xl mx-auto w-full">
                                            <ImageUpload onUpload={handleUpload} loading={loading} />
                                        </div>

                                        <div className="relative max-w-3xl mx-auto w-full">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-white/10" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-neutral-950 px-4 text-neutral-400">
                                                    Or try a sample
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full">
                                            <SampleGallery onSelectSample={handleSelectSample} />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Loading State */}
                                {loading && (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <RecipeCardSkeleton />
                                        <div className="space-y-4">
                                            <ChatMessageSkeleton />
                                            <ChatMessageSkeleton />
                                            <ChatMessageSkeleton />
                                        </div>
                                    </div>
                                )}

                                {/* Results Section */}
                                {!loading && (recipe || showChat) && (
                                    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
                                        {/* Recipe Card Column */}
                                        <AnimatePresence mode="wait">
                                            {recipe && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="h-full overflow-y-auto pr-2 custom-scrollbar"
                                                >
                                                    <RecipeCard recipe={recipe} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Chat Interface Column */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="h-full"
                                        >
                                            <ChatInterface
                                                recipeTitle={recipe?.title}
                                                messages={messages}
                                                onMessagesChange={setMessages}
                                            />
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
