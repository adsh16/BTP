/**
 * Dashboard Page
 * Modern AI chatbot interface with three-section layout
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ImageUpload } from "@/components/recipe/ImageUpload";
import { SampleGallery } from "@/components/recipe/SampleGallery";
import { ChatHistorySidebar } from "@/components/chat/ChatHistorySidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { RecipeContextPanel } from "@/components/chat/modern/RecipeContextPanel";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { Recipe } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatMessage } from "@/lib/firestore";
import { MultiStepLoader } from "@/components/shared/MultiStepLoader";

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recipePanelOpen, setRecipePanelOpen] = useState(true);
  const [showUploadView, setShowUploadView] = useState(true);

  const {
    chats,
    loading: chatsLoading,
    currentChatId,
    selectChat,
    createNewChat,
    saveChatHistory,
    deleteChat,
  } = useChatHistory();

  // Initialize chat when recipe is loaded
  useEffect(() => {
    if (recipe && !currentChatId) {
      createNewChat();
      setShowUploadView(false);
    }
  }, [recipe, currentChatId, createNewChat]);

  // Auto-save messages to Firestore whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentChatId && recipe) {
      const recipeData = {
        title: recipe.title,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      };
      saveChatHistory(messages, recipeData);
    }
  }, [messages, currentChatId, recipe, saveChatHistory]);

  // Handle chatId from URL query parameter (from My Recipes page)
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId && user && !loading && chats.length > 0) {
      // Check if this chat exists
      const chatExists = chats.find((c) => c.id === chatId);
      if (chatExists && currentChatId !== chatId) {
        handleSelectChat(chatId);
      }
    }
  }, [searchParams, user, chats, currentChatId, loading]);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setRecipePanelOpen(false);
      } else {
        setSidebarOpen(true);
        setRecipePanelOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const response = await apiClient.uploadRecipe(file);
      if (response.status === "success" && response.data) {
        setRecipe(response.data);

        // Initialize chat with context
        await apiClient.initChat(
          response.data.title,
          response.data.ingredients,
          response.data.instructions,
        );

        // Create new chat session
        if (!currentChatId) {
          await createNewChat();
        }

        setShowUploadView(false);
        setMessages([]);
      } else {
        alert(response.message || "Failed to generate recipe");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = async (name: string) => {
    setLoading(true);
    try {
      const response = await apiClient.getSampleRecipe(name);
      if (response.status === "success" && response.data) {
        setRecipe(response.data);

        // Initialize chat with context
        await apiClient.initChat(
          response.data.title,
          response.data.ingredients,
          response.data.instructions,
        );

        // Create new chat session
        if (!currentChatId) {
          await createNewChat();
        }

        setShowUploadView(false);
        setMessages([]);
      } else {
        alert(response.message || "Failed to load sample");
      }
    } catch (error) {
      console.error("Sample error:", error);
      alert("Failed to load sample recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    const chat = await selectChat(chatId);
    if (chat) {
      setMessages(chat.messages);
      // Restore recipe from chat history
      if (chat.recipe) {
        setRecipe({
          title: chat.recipe.title,
          image_url: chat.recipe.image_url || "",
          ingredients: Array.isArray(chat.recipe.ingredients)
            ? chat.recipe.ingredients
            : [],
          instructions: Array.isArray(chat.recipe.instructions)
            ? chat.recipe.instructions
            : [],
        });
        setShowUploadView(false);
      }
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    setRecipe(null);
    setMessages([]);
    setShowUploadView(true);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    // If the deleted chat was the one currently open, reset the view
    if (currentChatId === chatId) {
      setRecipe(null);
      setMessages([]);
      setShowUploadView(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat History */}
        {user && (
          <ChatHistorySidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            loading={chatsLoading}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Mobile Topbar */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {recipe?.title || "Dishcovery"}
            </h1>
            {recipe && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRecipePanelOpen(!recipePanelOpen)}
                className="shrink-0"
              >
                {recipePanelOpen ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRightOpen className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              {!user ? (
                /* Not Signed In */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center h-full p-4"
                >
                  <Card className="max-w-md w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-xl">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Sign In Required
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please sign in to start chatting with our recipe
                        assistant and generate personalized recipes from your
                        food images.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : loading ? (
                /* Loading State */
                <div className="flex items-center justify-center h-full">
                  <MultiStepLoader />
                </div>
              ) : showUploadView ? (
                /* Upload View */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-start h-full overflow-y-auto px-4 pt-20 pb-8 lg:pt-24 lg:pb-12"
                >
                  <div className="w-full max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4"
                    >
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        Transform Your Food Photos
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Upload a picture of any dish and get instant recipes
                        with ingredients, instructions, and an AI assistant to
                        help you cook
                      </p>
                    </motion.div>

                    {/* Upload Component */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="max-w-2xl mx-auto"
                    >
                      <ImageUpload onUpload={handleUpload} loading={loading} />
                    </motion.div>

                    {/* Divider */}
                    <div className="relative max-w-3xl mx-auto">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-50 dark:bg-slate-950 px-4 text-gray-500 dark:text-gray-400 font-medium">
                          Or try a sample
                        </span>
                      </div>
                    </div>

                    {/* Sample Gallery */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <SampleGallery
                        onSelectSample={handleSelectSample}
                        loading={loading}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                /* Chat View */
                <ChatInterface
                  recipeTitle={recipe?.title}
                  recipeImage={recipe?.image_url}
                  messages={messages}
                  onMessagesChange={setMessages}
                />
              )}
            </div>

            {/* Right Panel - Recipe Context */}
            {recipe && !showUploadView && (
              <RecipeContextPanel
                recipe={{
                  title: recipe.title,
                  image_url: recipe.image_url,
                  ingredients: Array.isArray(recipe.ingredients)
                    ? recipe.ingredients
                    : [],
                  instructions: Array.isArray(recipe.instructions)
                    ? recipe.instructions
                    : [],
                  time: "30 mins",
                  servings: "2-4 servings",
                }}
                isOpen={recipePanelOpen}
                onToggle={() => setRecipePanelOpen(!recipePanelOpen)}
              />
            )}
          </div>

          {/* Desktop Recipe Panel Toggle */}
          {recipe && !showUploadView && (
            <Button
              onClick={() => setRecipePanelOpen(!recipePanelOpen)}
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex absolute bottom-4 right-4 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
            >
              {recipePanelOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          )}
        </main>
      </div>
    </div>
  );
}
