/**
 * Chat History Sidebar
 * Displays previous chat conversations
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Search, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/lib/firestore';
import { useState } from 'react';

interface ChatHistorySidebarProps {
    chats: Chat[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    loading?: boolean;
}

export function ChatHistorySidebar({
    chats,
    currentChatId,
    onSelectChat,
    onNewChat,
    loading = false,
}: ChatHistorySidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.aside
            initial={{ width: isOpen ? 280 : 0 }}
            animate={{ width: isOpen ? 280 : 0 }}
            className="border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Button
                        onClick={onNewChat}
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No chats yet</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredChats.map((chat) => (
                                    <motion.button
                                        key={chat.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onClick={() => onSelectChat(chat.id)}
                                        className={`
                      w-full text-left p-3 rounded-lg mb-2 transition-all
                      ${currentChatId === chat.id
                                                ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }
                    `}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate max-w-[220px]">
                                                    {chat.title}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(chat.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </motion.aside>
    );
}
