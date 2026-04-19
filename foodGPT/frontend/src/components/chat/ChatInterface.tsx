/**
 * Modern Chat Interface Component
 * Professional AI chatbot interface with ChatGPT-style layout
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage as ChatMessageType } from "@/lib/firestore";
import { getRandomSuggestions } from "@/lib/chatSuggestions";
import {
  ChatInput,
  ChatMessage,
  PromptSuggestions,
  TypingIndicator,
  ChatHeader,
} from "./modern";
import { Sparkles } from "lucide-react";

interface ChatInterfaceProps {
  recipeTitle?: string;
  recipeImage?: string;
  messages: ChatMessageType[];
  onMessagesChange: (messages: ChatMessageType[]) => void;
}

export function ChatInterface({
  recipeTitle,
  recipeImage,
  messages,
  onMessagesChange,
}: ChatInterfaceProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState<string[]>(getRandomSuggestions(4));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessageType = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    onMessagesChange(updatedMessages);

    setLoading(true);

    try {
      const response = await apiClient.sendChatMessage(messageText);

      if (response?.status === "success" && response?.data?.message) {
        const assistantMessage: ChatMessageType = {
          role: "assistant",
          content: response.data.message,
          timestamp: new Date(),
        };

        onMessagesChange([...updatedMessages, assistantMessage]);
      } else {
        console.error("Backend returned error:", response);

        const assistantMessage: ChatMessageType = {
          role: "assistant",
          content:
            response?.message ||
            "Sorry, something went wrong while generating a response.",
          timestamp: new Date(),
        };

        onMessagesChange([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat request failed:", error);

      const errorMessage: ChatMessageType = {
        role: "assistant",
        content:
          "⚠️ Sorry, the AI assistant is currently unavailable. Please try again.",
        timestamp: new Date(),
      };

      onMessagesChange([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900/50">
      {/* Header */}
      <ChatHeader
        recipeTitle={recipeTitle}
        recipeImage={recipeImage}
        showImage={!!recipeImage}
      />

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {isEmpty ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px] space-y-8"
            >
              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-3"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg mb-2">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {recipeTitle
                    ? `Let's talk about ${recipeTitle}`
                    : "Start a conversation"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Ask me anything about cooking techniques, ingredient
                  substitutions, nutritional information, or recipe
                  modifications
                </p>
              </motion.div>

              {/* Suggestions */}
              <PromptSuggestions
                suggestions={suggestions}
                onSelectSuggestion={handleSend}
                disabled={loading}
              />
            </motion.div>
          ) : (
            /* Messages List */
            <div className="space-y-6 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    userName={user?.displayName || "You"}
                    userPhoto={user?.photoURL}
                    isLatest={index === messages.length - 1}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {loading && <TypingIndicator />}
              </AnimatePresence>

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput
            onSend={handleSend}
            disabled={false}
            loading={loading}
            placeholder={
              recipeTitle
                ? `Ask about ${recipeTitle}...`
                : "Ask a question about this recipe..."
            }
          />
        </div>
      </div>
    </div>
  );
}
