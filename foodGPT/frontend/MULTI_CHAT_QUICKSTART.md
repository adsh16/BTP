# Multi-Chat System - Quick Start Guide

## 🎯 How It Works

Dishcovery creates a **separate chat for each recipe** you upload, just like ChatGPT manages multiple conversations.

---

## 📸 Upload Image → New Chat

```
┌─────────────────────────────────────────────┐
│  STEP 1: Upload Food Image                 │
│  ┌─────────────────────────────────┐        │
│  │  [Drag & Drop Image]            │        │
│  │  or click to browse             │        │
│  └─────────────────────────────────┘        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  STEP 2: AI Identifies Recipe              │
│  ✓ Title: "Avocado Sandwich"               │
│  ✓ Ingredients: [bread, avocado, ...]      │
│  ✓ Instructions: [Step 1, Step 2, ...]     │
│  ✓ Image URL: /static/images/...           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  STEP 3: New Chat Created Automatically    │
│  ┌───────────────────────────────┐          │
│  │ Chat ID: chat_1704067200000   │          │
│  │ Title: "Avocado Sandwich"     │          │
│  │ Recipe: [Full data stored]    │          │
│  │ Messages: []                  │          │
│  └───────────────────────────────┘          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  STEP 4: Chat Appears in Sidebar           │
│  ┌─────────────────┐                        │
│  │ + New Chat      │                        │
│  │ ─────────────── │                        │
│  │ ● Avocado Sand  │ ← Your new chat!       │
│  │   Today         │                        │
│  └─────────────────┘                        │
└─────────────────────────────────────────────┘
```

---

## 💬 Chat & Auto-Save

Every message you send is **automatically saved** to that chat:

```
You: "How healthy is this?"
  ↓ [Saved to Firestore]
  
Assistant: "This sandwich is quite healthy..."
  ↓ [Saved to Firestore]

Chat Document in Firestore:
{
  title: "Avocado Sandwich",
  messages: [
    { role: "user", content: "How healthy is this?" },
    { role: "assistant", content: "This sandwich is..." }
  ],
  recipe: { title, ingredients, instructions, image_url },
  updatedAt: [timestamp]
}
```

---

## 🔄 Upload Another Recipe

When you upload a **second image**, a **new chat** is automatically created:

```
Sidebar Before:                Sidebar After:
┌─────────────────┐           ┌─────────────────┐
│ + New Chat      │           │ + New Chat      │
│ ─────────────── │           │ ─────────────── │
│ ● Avocado Sand  │           │ ● Caesar Salad  │ ← New!
│   Today         │           │   Today         │
│                 │           │ Avocado Sand    │ ← Still here
│                 │           │   Today         │
└─────────────────┘           └─────────────────┘

Each chat has:
✓ Its own recipe
✓ Its own conversation history
✓ Its own image
✓ Separate message threads
```

---

## 🔍 Switch Between Chats

Click any chat in the sidebar to load it:

```
Click "Avocado Sandwich" →
  ↓
┌─────────────────────────────────────────────┐
│ Recipe Assistant                            │
│ Avocado Sandwich                            │
├─────────────────────────────────────────────┤
│ [Recipe Image Preview]                      │
│                                             │
│ Previous Messages Restored:                 │
│ ┌─────────────────────────────────┐         │
│ │ You: How healthy is this?       │         │
│ │ AI: This sandwich is quite...   │         │
│ │ You: Can I add tomatoes?        │         │
│ │ AI: Yes! Tomatoes would be...   │         │
│ └─────────────────────────────────┘         │
│                                             │
│ [Type your message...]         [Send]       │
└─────────────────────────────────────────────┘

Continue the conversation where you left off!
```

---

## 🗂️ Data Structure

Each chat is stored in Firestore:

```
Firestore Database:
  users/
    {userId}/
      chats/
        chat_1704067200000/          ← Chat #1
          ├─ title: "Avocado Sandwich"
          ├─ recipe: { ... }
          ├─ messages: [ ... ]
          ├─ image_url: "/static/..."
          ├─ createdAt: timestamp
          └─ updatedAt: timestamp
        
        chat_1704067300000/          ← Chat #2
          ├─ title: "Caesar Salad"
          ├─ recipe: { ... }
          ├─ messages: [ ... ]
          ├─ image_url: "/static/..."
          ├─ createdAt: timestamp
          └─ updatedAt: timestamp
```

---

## 🎬 Complete User Flow

### Scenario: First Time User

```
1. Upload "pasta.jpg"
   → Chat "Pasta Carbonara" created
   → Ask: "How do I cook the bacon?"
   → Get answer, messages saved
   
2. Upload "salad.jpg"
   → NEW chat "Caesar Salad" created
   → Old chat still in sidebar
   → Ask: "Is this gluten-free?"
   → Get answer, messages saved
   
3. Click "Pasta Carbonara" in sidebar
   → Recipe loads
   → All previous messages appear
   → Continue: "What wine pairs with this?"
   → New message appends to Pasta chat
   
4. Logout and login next day
   → Both chats still in sidebar
   → Click any chat to resume
   → Full history restored
```

---

## 🔑 Key Features

### ✅ Automatic Chat Creation
- Upload image → New chat created
- Recipe name becomes chat title
- No manual "new chat" needed

### ✅ Persistent Storage
- Every message auto-saved
- Recipe data stored with chat
- Image URL preserved
- Works across sessions

### ✅ Easy Navigation
- Sidebar shows all chats
- Click to switch instantly
- Search to find chats
- Sorted by recent activity

### ✅ Complete Context
- Recipe details available
- Ingredients displayed
- Instructions shown
- Image preview visible

---

## 📱 UI Overview

```
┌──────────────────────────────────────────────────────┐
│  Dishcovery                        🌙  Profile       │ ← Navbar
├────────────┬─────────────────────────┬───────────────┤
│ SIDEBAR    │   CHAT INTERFACE        │ RECIPE PANEL  │
│            │                         │               │
│ + New Chat │  Recipe Assistant       │ [Image]       │
│ ─────────  │  Avocado Sandwich       │               │
│            │  ──────────────────     │ Ingredients:  │
│ ● Pasta    │                         │ • Bread       │
│   Today    │  Messages:              │ • Avocado     │
│            │                         │               │
│ Caesar     │  [Chat bubbles]         │ Instructions: │
│   Yester   │                         │ 1. Toast...   │
│            │  [Type message...]      │ 2. Slice...   │
│ Pizza      │                         │               │
│   2d ago   │                         │ [Collapse →]  │
│            │                         │               │
└────────────┴─────────────────────────┴───────────────┘
```

---

## 🎯 Quick Actions

### Start New Chat
```
Click "New Chat" → Upload Image → Chat Created
```

### Resume Old Chat
```
Click Chat Title in Sidebar → Everything Loads
```

### View Recipe While Chatting
```
Recipe Panel on Right → See Ingredients & Steps
```

### Find Specific Chat
```
Search Box in Sidebar → Type Recipe Name
```

### Delete Old Chat
```
Hover over Chat → Trash Icon → Confirm
```

---

## 💡 Pro Tips

1. **Each Upload = New Chat**
   - Don't worry about creating chats manually
   - System does it automatically

2. **Recipe Name = Chat Title**
   - Easy to identify chats
   - "Margherita Pizza" better than "New Chat"

3. **Everything Persists**
   - Close browser → Chats remain
   - Logout → Chats still there
   - Refresh page → Everything loads

4. **Switch Anytime**
   - No saving needed
   - Messages auto-save
   - Just click and switch

5. **Mobile Friendly**
   - Sidebar collapses
   - Full screen chat
   - Touch optimized

---

## 🆚 Comparison

### Before (Single Chat)
```
❌ One conversation at a time
❌ Upload new image = lose old chat
❌ Can't return to previous recipes
❌ No chat history
```

### After (Multi-Chat)
```
✅ Multiple conversations
✅ Each recipe = separate chat
✅ Access any previous recipe
✅ Full chat history
✅ ChatGPT-style experience
```

---

## 🚀 Try It Now!

1. **Upload a food image**
2. **See the recipe appear**
3. **Notice the chat in sidebar**
4. **Ask questions**
5. **Upload another image**
6. **See a new chat created**
7. **Switch between them**
8. **Messages saved automatically**

That's it! You're using a multi-chat system! 🎉

---

**Questions?** Check the full documentation in `MULTI_CHAT_SYSTEM.md`
