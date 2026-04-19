/**
 * Chat History Sidebar
 * Modern, mobile-responsive sidebar with chat history and delete functionality
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Clock,
  AlertTriangle,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Chat } from "@/lib/firestore";
import { useState } from "react";

interface ChatHistorySidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => Promise<void>;
  loading?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ChatHistorySidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  loading = false,
  isOpen = true,
  onToggle,
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setChatToDelete(chatId);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteChat(chatToDelete);
    } finally {
      setIsDeleting(false);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setChatToDelete(null);
  };

  const chatTitleToDelete =
    chats.find((c) => c.id === chatToDelete)?.title ?? "";

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[280px] lg:w-[280px]
          border-r border-gray-200 dark:border-gray-700
          bg-white dark:bg-slate-900
          flex flex-col
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Chat History
            </h2>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="shrink-0 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {loading ? (
              // Loading Skeletons
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              // Empty State
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 px-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No chats found" : "No chats yet"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "Start a new conversation"}
                </p>
              </motion.div>
            ) : (
              // Chat Items
              <AnimatePresence mode="popLayout">
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                  >
                    {/* Chat Item Button */}
                    <button
                      onClick={() => {
                        onSelectChat(chat.id);
                        // Close sidebar on mobile after selection
                        if (window.innerWidth < 1024 && onToggle) {
                          onToggle();
                        }
                      }}
                      className={`
                        group relative w-full text-left
                        px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${
                          currentChatId === chat.id
                            ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/50 shadow-sm"
                            : "hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-transparent"
                        }
                      `}
                    >
                      {/* Content */}
                      <div className="flex items-start gap-2 pr-8">
                        {/* Message Icon */}
                        <div className="shrink-0 mt-0.5">
                          <div
                            className={`
                            h-2 w-2 rounded-full
                            ${
                              currentChatId === chat.id
                                ? "bg-orange-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }
                          `}
                          />
                        </div>

                        {/* Title and Date */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`
                            text-sm font-medium truncate
                            ${
                              currentChatId === chat.id
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-700 dark:text-gray-300"
                            }
                          `}
                          >
                            {chat.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(chat.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Indicator */}
                      {currentChatId === chat.id && (
                        <motion.div
                          layoutId="activeChat"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </button>

                    {/* Delete Button — revealed on hover */}
                    <AnimatePresence>
                      {(hoveredChatId === chat.id ||
                        currentChatId === chat.id) && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                          aria-label="Delete chat"
                          className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            p-1.5 rounded-md
                            text-gray-400 hover:text-red-500
                            hover:bg-red-50 dark:hover:bg-red-950/30
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-red-400
                            z-10
                          "
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            {chats.length}{" "}
            {chats.length === 1 ? "conversation" : "conversations"}
          </div>
        </div>
      </motion.aside>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={chatToDelete !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                Delete Chat?
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                &ldquo;{chatTitleToDelete}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
