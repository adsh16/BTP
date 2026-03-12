/**
 * ChatMessage Component
 * Modern chat bubble with avatar, timestamp, and markdown support
 */

"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChefHat, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/lib/firestore";

interface ChatMessageProps {
  message: ChatMessageType;
  userName?: string;
  userPhoto?: string | null;
  isLatest?: boolean;
}

export function ChatMessage({
  message,
  userName = "You",
  userPhoto,
  isLatest = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const formatTime = (timestamp: Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAssistant ? (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
        ) : (
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarImage src={userPhoto || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
              {userName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Name & Timestamp */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {isAssistant ? "Recipe Assistant" : userName}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className={`
            relative px-4 py-2.5 rounded-2xl shadow-sm
            ${
              isUser
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm"
                : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm"
            }
          `}
        >
          {/* Markdown Content */}
          <div
            className={`
              prose prose-sm max-w-none
              ${
                isUser
                  ? "prose-invert prose-p:text-white prose-strong:text-white prose-headings:text-white prose-li:text-white prose-code:text-white"
                  : "prose-gray dark:prose-invert prose-p:text-gray-900 dark:prose-p:text-gray-100"
              }
              prose-p:my-0.5 prose-p:leading-relaxed
              prose-ul:my-1 prose-ol:my-1
              prose-li:my-0
              prose-headings:my-1
              prose-code:bg-black/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-black/20 prose-pre:my-2
            `}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
