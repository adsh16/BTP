/**
 * My Recipes Page
 * Modern gallery view of user's recipe collection with chat history integration
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserChats, Chat } from "@/lib/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChefHat,
  MessageSquare,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Filter,
  Grid3x3,
  List,
} from "lucide-react";

type ViewMode = "grid" | "list";

export default function RecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch all chats with recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userChats = await getUserChats(user.uid);
        // Filter only chats that have recipes
        const recipeChats = userChats.filter((chat) => chat.recipe);
        setChats(recipeChats);
        setFilteredChats(recipeChats);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(
      (chat) =>
        chat.recipe?.title.toLowerCase().includes(query) ||
        chat.recipe?.ingredients.some((ing) =>
          ing.toLowerCase().includes(query),
        ),
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleOpenChat = (chatId: string) => {
    router.push(`/dashboard?chatId=${chatId}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center animate-pulse">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your recipes...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                My Recipes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {chats.length} {chats.length === 1 ? "recipe" : "recipes"} in
                your collection
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : ""
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : ""
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredChats.length === 0 ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center py-20"
            >
              <Card className="max-w-md w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                    <ChefHat className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {searchQuery ? "No recipes found" : "No recipes yet"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? "Try a different search term or clear your filters"
                      : "Start by uploading a food image to generate your first recipe"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => router.push("/dashboard")}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg mt-4"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create First Recipe
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <div onClick={() => handleOpenChat(chat.id)}>
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {chat.recipe?.image_url ? (
                          <img
                            src={
                              chat.recipe.image_url.startsWith("http")
                                ? chat.recipe.image_url
                                : `http://localhost:5000${chat.recipe.image_url}`
                            }
                            alt={chat.recipe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Message count badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                          <MessageSquare className="h-3 w-3" />
                          {chat.messages.length}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {chat.recipe?.title || "Untitled Recipe"}
                        </h3>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(chat.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(chat.updatedAt)}
                          </div>
                        </div>

                        {/* Ingredients Preview */}
                        {chat.recipe?.ingredients &&
                          chat.recipe.ingredients.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {chat.recipe.ingredients.slice(0, 3).join(", ")}
                              {chat.recipe.ingredients.length > 3 && "..."}
                            </p>
                          )}

                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                        >
                          Open Chat
                          <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className="group overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenChat(chat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {chat.recipe?.image_url ? (
                            <img
                              src={
                                chat.recipe.image_url.startsWith("http")
                                  ? chat.recipe.image_url
                                  : `http://localhost:5000${chat.recipe.image_url}`
                              }
                              alt={chat.recipe.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                                {chat.recipe?.title || "Untitled Recipe"}
                              </h3>

                              {/* Meta */}
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(chat.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {chat.messages.length} messages
                                </div>
                              </div>

                              {/* Ingredients */}
                              {chat.recipe?.ingredients &&
                                chat.recipe.ingredients.length > 0 && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                    {chat.recipe.ingredients
                                      .slice(0, 5)
                                      .join(", ")}
                                    {chat.recipe.ingredients.length > 5 &&
                                      "..."}
                                  </p>
                                )}
                            </div>

                            {/* Arrow */}
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
