/**
 * Chat Interface Component
 * Real-time chat with recipe assistant using Firestore
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Sparkles, ChefHat } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/lib/firestore';
import { getRandomSuggestions } from '@/lib/chatSuggestions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
    recipeTitle?: string;
    messages: ChatMessage[];
    onMessagesChange: (messages: ChatMessage[]) => void;
}

export function ChatInterface({ recipeTitle, messages, onMessagesChange }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions] = useState<string[]>(getRandomSuggestions(4));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || loading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
        };
        onMessagesChange([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await apiClient.sendChatMessage(textToSend);

            if (response.status === 'success' && response.data) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date(),
                };
                onMessagesChange([...messages, userMessage, assistantMessage]);
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            onMessagesChange([...messages, userMessage, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="h-[800px] flex flex-col border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Recipe Assistant
                    {recipeTitle && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            - {recipeTitle}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-full">
                                <Sparkles className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Ask me anything about this recipe!
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Get cooking tips, substitutions, and more
                                </p>
                            </div>
                            {suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                    {suggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSend(suggestion)}
                                                disabled={loading}
                                                className="text-xs border-gray-200 dark:border-slate-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                            >
                                                {suggestion}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex gap-3 items-start"
                                    >
                                        {/* Avatar */}
                                        {message.role === 'assistant' ? (
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                                    <ChefHat className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs">
                                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        <div className="flex-1 space-y-1">
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {message.role === 'assistant' ? 'Recipe Assistant' : (user?.displayName || 'You')}
                                            </div>
                                            <div
                                                className={`rounded-lg px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100'
                                                    }`}
                                            >
                                                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ ...props }) => <p className="whitespace-pre-wrap" {...props} />,
                                                            ul: ({ ...props }) => <ul className="list-disc ml-4" {...props} />,
                                                            ol: ({ ...props }) => <ol className="list-decimal ml-4" {...props} />,
                                                            li: ({ ...props }) => <li className="ml-2" {...props} />,
                                                            strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                                                            code: ({ className, children, ...props }) => {
                                                                const inline = !className;
                                                                return inline ? (
                                                                    <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-sm" {...props}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <code className="block p-2 rounded bg-gray-200 dark:bg-gray-600 text-sm overflow-x-auto" {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 items-start"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                            <ChefHat className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-4 py-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about this recipe..."
                        disabled={loading}
                        className="flex-1 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
