# Multi-Chat Conversation System Documentation

## 🎯 Overview

Dishcovery implements a **ChatGPT-style multi-conversation system** where each uploaded recipe becomes its own persistent chat thread. Users can upload multiple food images, with each creating a separate chat conversation that can be revisited anytime.

---

## 📊 System Architecture

### Data Structure

**Firestore Path**: `users/{userId}/chats/{chatId}`

Each chat document contains:

```typescript
{
  id: string;                    // Unique chat identifier
  userId: string;                // Owner's Firebase UID
  title: string;                 // Recipe name (e.g., "Avocado Sandwich")
  messages: ChatMessage[];       // Full conversation history
  recipe: {                      // Complete recipe data
    title: string;
    image_url: string;           // Uploaded image URL
    ingredients: string[];
    instructions: string[];
  };
  createdAt: Timestamp;         // Chat creation time
  updatedAt: Timestamp;         // Last message time
}
```

### Message Structure

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

---

## 🔄 Core Workflows

### 1. Creating a New Chat (Image Upload)

**Trigger**: User uploads a food image

**Flow**:
```
1. User uploads image → Backend identifies recipe
2. Recipe data returned (title, ingredients, instructions)
3. System generates unique chatId: `chat_${timestamp}`
4. createNewChat() creates chat entry in Firestore
5. Recipe title becomes chat title
6. Image URL stored with chat
7. Chat appears in sidebar
8. User can start conversation
```

**Code Implementation**:
```typescript
// In dashboard/page.tsx - handleUpload()
const response = await apiClient.uploadRecipe(file);
if (response.status === "success" && response.data) {
  setRecipe(response.data);
  
  // Initialize Gemini chat context
  await apiClient.initChat(
    response.data.title,
    response.data.ingredients,
    response.data.instructions
  );
  
  // Always create new chat for each upload
  await createNewChat();
  
  setShowUploadView(false);
  setMessages([]);
}
```

**Firestore Operation**:
```typescript
// In useChatHistory.ts
const createNewChat = () => {
  const newChatId = `chat_${Date.now()}`;
  setCurrentChatId(newChatId);
  return newChatId;
};
```

### 2. Auto-Saving Messages

**Trigger**: Any message sent (user or assistant)

**Flow**:
```
1. Message added to messages array
2. React useEffect detects change
3. saveChatHistory() called with:
   - Current messages
   - Recipe data (title, image_url, ingredients, instructions)
4. Data saved to Firestore with timestamp
5. Chat's updatedAt field updated
```

**Code Implementation**:
```typescript
// Auto-save effect in dashboard/page.tsx
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
```

**Firestore Save Logic**:
```typescript
// In firestore.ts - saveChat()
export async function saveChat(
  userId: string,
  chatId: string,
  messages: ChatMessage[],
  recipe?: Chat['recipe']
): Promise<void> {
  const chatRef = doc(db, 'users', userId, 'chats', chatId);
  
  // Use recipe title as chat title
  let title: string;
  if (recipe && recipe.title) {
    title = recipe.title;
  } else {
    // Fallback to first message
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Chat';
    title = firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : '');
  }
  
  const chatData = {
    userId,
    title,
    messages: messages.map(m => ({
      ...m,
      timestamp: m.timestamp instanceof Date 
        ? Timestamp.fromDate(m.timestamp) 
        : m.timestamp
    })),
    recipe: recipe || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(chatRef, chatData, { merge: true });
}
```

### 3. Loading Previous Chats

**Trigger**: User clicks chat in sidebar

**Flow**:
```
1. User clicks chat title in sidebar
2. selectChat(chatId) called
3. Chat document fetched from Firestore
4. Recipe data restored
5. Messages array restored
6. Image URL restored
7. UI updates to show chat
8. User can continue conversation
```

**Code Implementation**:
```typescript
// In dashboard/page.tsx
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
```

**Firestore Load Logic**:
```typescript
// In firestore.ts - loadChat()
export async function loadChat(
  userId: string, 
  chatId: string
): Promise<Chat | null> {
  const chatRef = doc(db, 'users', userId, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);
  
  if (!chatSnap.exists()) return null;
  
  const data = chatSnap.data();
  return {
    id: chatSnap.id,
    userId: data.userId,
    title: data.title,
    messages: data.messages.map((m: any) => ({
      ...m,
      timestamp: m.timestamp?.toDate() || new Date()
    })),
    recipe: data.recipe,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
```

### 4. Continuing Existing Chats

**Behavior**: When user sends new messages in a loaded chat

**Flow**:
```
1. User types message in loaded chat
2. Message added to messages state
3. API call sends message to Gemini
4. Assistant response received
5. Both messages appended to messages array
6. Auto-save effect triggers
7. saveChatHistory() updates Firestore
8. Messages persist in that specific chat
```

**Key Point**: The `currentChatId` determines which chat document is updated.

---

## 🎨 UI Components

### Chat Sidebar (ChatHistorySidebar)

**Features**:
- Displays all user's chats
- Shows recipe name as title
- Sorted by `updatedAt` (most recent first)
- Click to load chat
- Delete chat option
- Search functionality
- Mobile responsive (overlay)

**Props**:
```typescript
interface ChatHistorySidebarProps {
  chats: Chat[];                              // All user chats
  currentChatId: string | null;               // Active chat
  onSelectChat: (chatId: string) => void;     // Load handler
  onNewChat: () => void;                      // New chat handler
  onDeleteChat: (chatId: string) => Promise<void>;  // Delete handler
  loading?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}
```

**Display Logic**:
```typescript
// Chats sorted by updatedAt descending
const chatsRef = collection(db, 'users', userId, 'chats');
const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(50));
```

### Chat Interface (ChatInterface)

**Features**:
- Displays current chat messages
- Shows recipe context in header
- AI assistant responses
- Message input with auto-resize
- Typing indicators
- Markdown support
- Auto-scroll to latest message

**Props**:
```typescript
interface ChatInterfaceProps {
  recipeTitle?: string;     // Shown in header
  recipeImage?: string;     // Small preview
  messages: ChatMessage[];  // Full history
  onMessagesChange: (messages: ChatMessage[]) => void;
}
```

### Recipe Context Panel (RecipeContextPanel)

**Features**:
- Shows recipe image
- Lists ingredients
- Shows instructions
- Collapsible
- Scroll-able
- Responsive

**Purpose**: Provides context while chatting about the recipe

---

## 🔑 Key Implementation Details

### 1. Unique Chat IDs

```typescript
// Format: chat_{timestamp}
const newChatId = `chat_${Date.now()}`;

// Example: "chat_1704067200000"
```

**Benefits**:
- Guaranteed uniqueness
- Chronological ordering
- Human-readable
- No UUID library needed

### 2. Chat Title Strategy

```typescript
// Priority 1: Recipe title (preferred)
title = recipe.title;  // "Avocado Sandwich"

// Priority 2: First user message (fallback)
title = firstUserMessage.slice(0, 50) + "...";

// Priority 3: Default (last resort)
title = "New Chat";
```

### 3. Data Persistence

**When is data saved?**
- ✅ After every message (auto-save)
- ✅ When recipe is identified
- ✅ When chat is created
- ✅ When chat is updated

**What is saved?**
- ✅ Full message history
- ✅ Complete recipe data
- ✅ Image URL
- ✅ Timestamps
- ✅ User ID

### 4. State Management

```typescript
// Global chat state (from useChatHistory hook)
const {
  chats,              // All user's chats
  currentChatId,      // Active chat ID
  loading,            // Loading state
  createNewChat,      // Create new chat
  selectChat,         // Load existing chat
  saveChatHistory,    // Save messages
  deleteChat,         // Delete chat
  refreshChats        // Reload chat list
} = useChatHistory();

// Local chat state (in dashboard)
const [recipe, setRecipe] = useState<Recipe | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [showUploadView, setShowUploadView] = useState(true);
```

### 5. Session Persistence

**Problem**: Page refresh loses state

**Solution**: 
```typescript
// Load user's chats on mount
useEffect(() => {
  if (user) {
    loadUserChats();
  }
}, [user?.uid]);

// Load chat from URL parameter
useEffect(() => {
  const chatId = searchParams.get("chatId");
  if (chatId && chatExists) {
    handleSelectChat(chatId);
  }
}, [searchParams, chats]);
```

**Result**: Users can bookmark specific chats or navigate from "My Recipes" page

---

## 🚀 User Experience Flow

### Complete Journey

1. **First Time User**
   ```
   Dashboard → Upload Image → Recipe Generated → 
   Chat Created ("Pasta Carbonara") → Ask Questions →
   Messages Auto-Saved → Sidebar Shows Chat
   ```

2. **Upload Second Recipe**
   ```
   Click "New Chat" → Upload New Image → 
   New Recipe Generated → New Chat Created ("Caesar Salad") →
   Old Chat Still in Sidebar → Can Switch Between Both
   ```

3. **Return to Old Chat**
   ```
   Click "Pasta Carbonara" in Sidebar → 
   Recipe Loaded → Messages Restored → 
   Image Displayed → Continue Conversation →
   New Messages Saved to Same Chat
   ```

4. **After Logout & Login**
   ```
   Login → Chats Load from Firestore →
   All Previous Chats Visible → Click Any Chat →
   Full History Restored → Everything Persists
   ```

5. **Navigate from My Recipes**
   ```
   My Recipes Page → Click Recipe Card →
   Navigate to `/dashboard?chatId=chat_123` →
   Dashboard Loads That Chat → Continue Conversation
   ```

---

## 📋 API Integration

### Backend Chat Initialization

```typescript
// Initialize Gemini with recipe context
await apiClient.initChat(
  recipe.title,
  recipe.ingredients,
  recipe.instructions
);

// Backend stores context in session
// Subsequent messages use this context
```

### Sending Messages

```typescript
// Send message to Gemini
const response = await apiClient.sendChatMessage(messageText);

// Response structure
{
  status: 'success',
  data: {
    message: 'Assistant response...'
  }
}
```

### Recipe Upload

```typescript
// Upload image
const response = await apiClient.uploadRecipe(file);

// Response structure
{
  status: 'success',
  data: {
    title: 'Avocado Sandwich',
    ingredients: ['bread', 'avocado', ...],
    instructions: ['Step 1', 'Step 2', ...],
    image_url: '/static/demo_imgs/image.jpg'
  }
}
```

---

## ⚠️ Important Considerations

### 1. Race Conditions

**Problem**: Messages sent before chat created

**Solution**: Always create chat before allowing messages
```typescript
// In handleUpload - create chat immediately
await createNewChat();
setMessages([]);  // Clear messages for new chat
```

### 2. Data Validation

**Problem**: Invalid data types from Firestore

**Solution**: Validate on load
```typescript
ingredients: Array.isArray(chat.recipe.ingredients)
  ? chat.recipe.ingredients
  : [],
```

### 3. State Synchronization

**Problem**: UI state out of sync with Firestore

**Solution**: Auto-save on every change
```typescript
useEffect(() => {
  if (messages.length > 0 && currentChatId && recipe) {
    saveChatHistory(messages, recipeData);
  }
}, [messages]);
```

### 4. Memory Management

**Problem**: Loading too many chats

**Solution**: Pagination and limits
```typescript
query(chatsRef, orderBy('updatedAt', 'desc'), limit(50))
```

---

## 🔧 Troubleshooting Guide

### Chat Not Saving

**Check**:
1. User is logged in: `user?.uid` exists
2. Chat ID is set: `currentChatId !== null`
3. Recipe data is present: `recipe !== null`
4. Messages array has content: `messages.length > 0`

**Debug**:
```typescript
console.log('Saving chat:', {
  userId: user?.uid,
  chatId: currentChatId,
  messageCount: messages.length,
  hasRecipe: !!recipe
});
```

### Chat Not Loading

**Check**:
1. Chat exists in Firestore
2. User has permission to access chat
3. Chat ID is correct
4. Data structure is valid

**Debug**:
```typescript
const chat = await loadChat(user.uid, chatId);
console.log('Loaded chat:', chat);
```

### Messages Not Appearing

**Check**:
1. Current chat ID matches loaded chat
2. Messages state is updated
3. Auto-save effect is running
4. No TypeScript errors in console

### Title Not Updating

**Check**:
1. Recipe title is available when saving
2. `saveChat` receives recipe parameter
3. Title logic uses recipe.title first

---

## ✅ Testing Checklist

### Functional Tests

- [ ] Upload image creates new chat
- [ ] Chat title matches recipe name
- [ ] Messages save to Firestore
- [ ] Click chat loads history
- [ ] New messages append correctly
- [ ] Image URL persists
- [ ] Recipe data restores
- [ ] Can switch between chats
- [ ] Works after page refresh
- [ ] Works after logout/login

### UI Tests

- [ ] Sidebar shows all chats
- [ ] Active chat is highlighted
- [ ] Chats sorted by recent
- [ ] Delete chat works
- [ ] Search filters chats
- [ ] Mobile sidebar toggles
- [ ] Recipe panel shows data

### Edge Cases

- [ ] Empty message handling
- [ ] Invalid recipe data
- [ ] Network failures
- [ ] Concurrent uploads
- [ ] Very long conversations
- [ ] Special characters in titles

---

## 🎓 Best Practices

### 1. Always Create New Chat on Upload

```typescript
// ✅ Good - New chat for each upload
await createNewChat();
setMessages([]);

// ❌ Bad - Reusing existing chat
if (!currentChatId) {
  await createNewChat();
}
```

### 2. Use Recipe Title as Chat Title

```typescript
// ✅ Good - Descriptive title
title: recipe.title  // "Margherita Pizza"

// ❌ Bad - Generic title
title: "New Chat"
```

### 3. Save Complete Recipe Data

```typescript
// ✅ Good - Full context
const recipeData = {
  title: recipe.title,
  image_url: recipe.image_url,
  ingredients: recipe.ingredients,
  instructions: recipe.instructions
};

// ❌ Bad - Partial data
const recipeData = { title: recipe.title };
```

### 4. Validate Data on Load

```typescript
// ✅ Good - Safe access
ingredients: Array.isArray(chat.recipe.ingredients)
  ? chat.recipe.ingredients
  : []

// ❌ Bad - Assumes structure
ingredients: chat.recipe.ingredients
```

---

## 📚 Related Files

### Core Implementation
- `src/lib/firestore.ts` - Firestore operations
- `src/hooks/useChatHistory.ts` - Chat state management
- `src/app/dashboard/page.tsx` - Main chat interface

### Components
- `src/components/chat/ChatHistorySidebar.tsx` - Chat list
- `src/components/chat/ChatInterface.tsx` - Message UI
- `src/components/chat/modern/RecipeContextPanel.tsx` - Recipe display

### Types
- `src/types/index.ts` - TypeScript interfaces
- `src/lib/firestore.ts` - Chat and Message types

---

## 🎯 Summary

Dishcovery's multi-chat system provides a **ChatGPT-style conversation experience** where:

✅ Each uploaded recipe = New chat conversation  
✅ Recipe name = Chat title  
✅ All messages persisted in Firestore  
✅ Switch between chats anytime  
✅ Full history restoration  
✅ Image URL stored with chat  
✅ Works across sessions  
✅ Mobile responsive  
✅ Production ready  

The system maintains **complete context** for each recipe conversation and allows users to manage multiple recipe discussions simultaneously, creating an intuitive and powerful AI cooking assistant experience.

---

**Version**: 2.1.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready