/**
 * Dashboard Page
 * Modern AI chatbot interface with three-section layout
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  const router = useRouter();

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

  /* AUTO SAVE CHAT HISTORY */

  useEffect(() => {
    if (messages.length > 0 && currentChatId && recipe) {
      const recipeData = {
        title: recipe.title,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        food_quality: recipe.food_quality || null, // Explicitly use null for Firestore
      };

      saveChatHistory(messages, recipeData);
    }
  }, [messages, currentChatId, recipe, saveChatHistory]);

  /* LOAD CHAT FROM URL */

  useEffect(() => {
    const chatId = searchParams.get("chatId");

    if (chatId && user && chats.length > 0) {
      const chatExists = chats.find((c) => c.id === chatId);

      if (chatExists && currentChatId !== chatId) {
        handleSelectChat(chatId);
      }
    }
  }, [searchParams, user, chats, currentChatId]);

  /* RESPONSIVE SIDEBAR */

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

  /* IMAGE UPLOAD */

  const handleUpload = async (file: File) => {
    setLoading(true);

    try {
      const response = await apiClient.uploadRecipe(file);

      if (response.status === "success" && response.data) {
        setRecipe(response.data);

        await apiClient.initChat(
          response.data.title,
          response.data.ingredients,
          response.data.instructions,
        );

        // create new chat with initial recipe and food quality
        await createNewChat({
          title: response.data.title,
          image_url: response.data.image_url,
          ingredients: response.data.ingredients,
          instructions: response.data.instructions,
          food_quality: response.data.food_quality || null,
        });

        setMessages([]);
        setShowUploadView(false);
      } else {
        alert(response.message || "Failed to generate recipe");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  /* SAMPLE RECIPE */

  const handleSelectSample = async (name: string) => {
    setLoading(true);

    try {
      const response = await apiClient.getSampleRecipe(name);

      if (response.status === "success" && response.data) {
        setRecipe(response.data);

        await apiClient.initChat(
          response.data.title,
          response.data.ingredients,
          response.data.instructions,
        );

        // create new chat with initial recipe and food quality
        await createNewChat({
          title: response.data.title,
          image_url: response.data.image_url,
          ingredients: response.data.ingredients,
          instructions: response.data.instructions,
          food_quality: response.data.food_quality || null,
        });

        setMessages([]);
        setShowUploadView(false);
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

  /* SELECT EXISTING CHAT */

  const handleSelectChat = async (chatId: string) => {
    const chat = await selectChat(chatId);

    if (chat) {
      setMessages(chat.messages);

      if (chat.recipe) {
        setRecipe({
          title: chat.recipe.title,
          image_url: chat.recipe.image_url || "",
          ingredients: chat.recipe.ingredients || [],
          instructions: chat.recipe.instructions || [],
          food_quality: chat.recipe.food_quality,
        });

        setShowUploadView(false);
      }
    }
  };

  /* NEW CHAT */

  const handleNewChat = () => {
    // reset UI completely
    setRecipe(null);
    setMessages([]);
    setShowUploadView(true);

    // remove URL query params
    router.replace("/dashboard");
  };

  /* DELETE CHAT */

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);

    if (currentChatId === chatId) {
      setRecipe(null);
      setMessages([]);
      setShowUploadView(true);

      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
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

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {!user ? (
                <motion.div className="flex items-center justify-center h-full">
                  <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                      <h2 className="text-2xl font-bold">Sign In Required</h2>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <MultiStepLoader />
                </div>
              ) : showUploadView ? (
                <motion.div className="flex flex-col items-center justify-start h-full overflow-y-auto px-4 pt-20 pb-8">
                  <div className="w-full max-w-4xl mx-auto space-y-12">
                    <ImageUpload onUpload={handleUpload} loading={loading} />

                    <SampleGallery
                      onSelectSample={handleSelectSample}
                      loading={loading}
                    />
                  </div>
                </motion.div>
              ) : (
                <ChatInterface
                  recipeTitle={recipe?.title}
                  recipeImage={recipe?.image_url}
                  messages={messages}
                  onMessagesChange={setMessages}
                />
              )}
            </div>

            {recipe && !showUploadView && (
              <RecipeContextPanel
                recipe={{
                  title: recipe.title,
                  image_url: recipe.image_url,
                  ingredients: recipe.ingredients,
                  instructions: recipe.instructions,
                  food_quality: recipe.food_quality,
                  time: "30 mins",
                  servings: "2-4 servings",
                }}
                isOpen={recipePanelOpen}
                onToggle={() => setRecipePanelOpen(!recipePanelOpen)}
                chatId={currentChatId || undefined}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
