/**
 * ChatInput Component
 * Professional input area with multiline support and keyboard shortcuts
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = "Ask a question about this recipe...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      // Max height of ~5 lines (120px)
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled || loading) return;
    onSend(value.trim());
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter creates newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled && !loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      {/* Input Container */}
      <div
        className={`
          relative flex items-end gap-2 p-3
          bg-white dark:bg-slate-800/50
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-lg
          transition-all duration-200
          ${
            disabled || loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-orange-400 dark:hover:border-orange-500 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
          }
        `}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={placeholder}
          rows={1}
          className="
            flex-1 resize-none
            bg-transparent
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            text-sm leading-6
            outline-none
            min-h-[24px] max-h-[120px]
            overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
            disabled:cursor-not-allowed
          "
          style={{ scrollbarWidth: "thin" }}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className={`
            shrink-0 h-9 w-9 rounded-xl
            transition-all duration-200
            ${
              canSend
                ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hint Text */}
      <div className="flex items-center justify-between mt-2 px-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {value.length}/2000
        </p>
      </div>
    </motion.div>
  );
}
