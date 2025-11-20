/**
/**
 * Chat History Hook
 * React hook for managing chat conversations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChats, loadChat, saveChat, Chat, ChatMessage } from '@/lib/firestore';

export function useChatHistory() {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const loadUserChats = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userChats = await getUserChats(user.uid);
            setChats(userChats);
        } catch (error) {
            console.error('Failed to load chats:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load all chats when user logs in (only once)
    useEffect(() => {
        if (user) {
            loadUserChats();
        } else {
            setChats([]);
        }
    }, [user?.uid, loadUserChats]); // Only re-run when user ID changes

    const createNewChat = useCallback(() => {
        const newChatId = `chat_${Date.now()}`;
        setCurrentChatId(newChatId);
        return newChatId;
    }, []);

    const selectChat = useCallback(async (chatId: string) => {
        if (!user) return null;
        setCurrentChatId(chatId);
        return await loadChat(user.uid, chatId);
    }, [user]);

    const saveChatHistory = useCallback(async (
        messages: ChatMessage[],
        recipe?: Chat['recipe']
    ) => {
        if (!user || !currentChatId) return;

        try {
            await saveChat(user.uid, currentChatId, messages, recipe);
            // Reload chats to update list
            await loadUserChats();
        } catch (error) {
            console.error('Failed to save chat:', error);
        }
    }, [user, currentChatId, loadUserChats]);

    return {
        chats,
        currentChatId,
        loading,
        createNewChat,
        selectChat,
        saveChatHistory,
        refreshChats: loadUserChats,
    };
}
