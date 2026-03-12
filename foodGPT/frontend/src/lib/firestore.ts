/**
 * Firestore Chat Operations
 * Handles saving and loading chat conversations
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  recipe?: {
    title: string;
    image_url?: string;
    ingredients: string[];
    instructions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecipe {
  id: string; // chatId
  title: string;
  image_url?: string;
  createdAt: Date;
}

/**
 * Save a chat conversation to Firestore
 */
export async function saveChat(
  userId: string,
  chatId: string,
  messages: ChatMessage[],
  recipe?: Chat["recipe"],
): Promise<void> {
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);

    const firstUserMessage =
      messages.find((m) => m.role === "user")?.content || "New Chat";
    const title =
      firstUserMessage.slice(0, 50) +
      (firstUserMessage.length > 50 ? "..." : "");

    const chatData = {
      userId,
      title,
      messages: messages.map((m) => ({
        ...m,
        timestamp:
          m.timestamp instanceof Date
            ? Timestamp.fromDate(m.timestamp)
            : m.timestamp,
      })),
      recipe: recipe || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(chatRef, chatData, { merge: true });
  } catch (error) {
    console.error("Error saving chat:", error);
    throw error;
  }
}

/**
 * Load a specific chat conversation
 */
export async function loadChat(
  userId: string,
  chatId: string,
): Promise<Chat | null> {
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      return null;
    }

    const data = chatSnap.data();
    return {
      id: chatSnap.id,
      userId: data.userId,
      title: data.title,
      messages: data.messages.map((m: any) => ({
        ...m,
        timestamp: m.timestamp?.toDate() || new Date(),
      })),
      recipe: data.recipe,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error loading chat:", error);
    return null;
  }
}

/**
 * Get all chat conversations for a user
 */
export async function getUserChats(
  userId: string,
  limitCount = 50,
): Promise<Chat[]> {
  try {
    const chatsRef = collection(db, "users", userId, "chats");
    const q = query(chatsRef, orderBy("updatedAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        messages: data.messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp?.toDate() || new Date(),
        })),
        recipe: data.recipe,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    return [];
  }
}

/**
 * Delete a chat conversation from Firestore
 */
export async function deleteChat(
  userId: string,
  chatId: string,
): Promise<void> {
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

/**
 * 🔥 NEW: Get unique recipes derived from user chats
 */
export async function getUserRecipesFromChats(
  userId: string,
): Promise<UserRecipe[]> {
  try {
    const chats = await getUserChats(userId);

    const recipesMap = new Map<string, UserRecipe>();

    chats.forEach((chat) => {
      if (!chat.recipe) return;

      const key = chat.recipe.title;

      // Keep latest chat for same recipe
      if (!recipesMap.has(key)) {
        recipesMap.set(key, {
          id: chat.id,
          title: chat.recipe.title,
          image_url: chat.recipe.image_url,
          createdAt: chat.createdAt,
        });
      }
    });

    return Array.from(recipesMap.values());
  } catch (error) {
    console.error("Error getting user recipes:", error);
    return [];
  }
}
