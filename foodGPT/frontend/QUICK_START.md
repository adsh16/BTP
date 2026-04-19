# Dishcovery UI Redesign - Quick Start Guide

## 🎉 What's New?

Dishcovery now features a **modern AI chatbot interface** inspired by ChatGPT, Claude, and Gemini!

### Major Changes
- ✨ **Three-section layout**: Sidebar + Chat + Recipe Panel
- 💬 **Modern chat bubbles**: Professional message design with avatars
- 📱 **Mobile responsive**: Collapsible panels and touch-optimized
- 🎨 **Suggestion cards**: Click to start conversations
- ⌨️ **Better input**: Multi-line support with keyboard shortcuts
- 🎭 **Typing indicators**: Animated "thinking" dots
- 🗑️ **Delete chats**: Hover + click trash icon + confirm

---

## 🚀 Quick Start (Users)

### Starting a Conversation

1. **Upload an image** or **select a sample**
2. Wait for recipe generation (with animated progress)
3. **Click a suggestion card** or type your question
4. Press `Enter` to send (`Shift+Enter` for new line)
5. View recipe details in the right panel

### Navigating Chats

- **New Chat**: Click the orange "+ New Chat" button in sidebar
- **Switch Chats**: Click any chat in the sidebar
- **Delete Chat**: Hover over chat → click trash icon → confirm
- **Search Chats**: Use the search box at top of sidebar

### Mobile Tips

- **Toggle Sidebar**: Tap hamburger menu (☰) in top-left
- **Toggle Recipe Panel**: Tap panel icon in top-right
- Sidebar auto-closes after selecting a chat

---

## 🛠️ Quick Start (Developers)

### New Component Structure

```
src/components/chat/modern/
├── ChatInput.tsx           → Message input with auto-resize
├── ChatMessage.tsx         → Individual message bubbles
├── ChatHeader.tsx          → Recipe context header
├── PromptSuggestions.tsx   → Clickable suggestion cards
├── TypingIndicator.tsx     → Animated thinking dots
├── RecipeContextPanel.tsx  → Right-side recipe display
└── index.ts                → Barrel exports
```

### Using New Components

```tsx
// Import modern components
import { ChatInput, ChatMessage, PromptSuggestions } from '@/components/chat/modern';

// ChatInput
<ChatInput 
  onSend={(message) => handleSend(message)}
  loading={isLoading}
  placeholder="Ask about this recipe..."
/>

// ChatMessage
<ChatMessage
  message={messageData}
  userName="John Doe"
  userPhoto={user.photoURL}
/>

// PromptSuggestions
<PromptSuggestions
  suggestions={suggestionArray}
  onSelectSuggestion={handleSend}
  disabled={loading}
/>
```

### Key Props

**ChatInterface** (redesigned):
```tsx
<ChatInterface
  recipeTitle="Spaghetti Carbonara"
  recipeImage="/static/images/pasta.jpg"
  messages={messages}
  onMessagesChange={setMessages}
/>
```

**ChatHistorySidebar** (enhanced):
```tsx
<ChatHistorySidebar
  chats={chats}
  currentChatId={currentChatId}
  onSelectChat={handleSelectChat}
  onNewChat={handleNewChat}
  onDeleteChat={handleDeleteChat}
  isOpen={sidebarOpen}          // NEW
  onToggle={() => setSidebarOpen(!sidebarOpen)}  // NEW
  loading={loading}
/>
```

**RecipeContextPanel** (new):
```tsx
<RecipeContextPanel
  recipe={{
    title: recipe.title,
    image_url: recipe.image_url,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    time: "30 mins",
    servings: "2-4 servings"
  }}
  isOpen={recipePanelOpen}
  onToggle={() => setRecipePanelOpen(!recipePanelOpen)}
/>
```

---

## 📐 Layout Breakpoints

```css
Mobile:  < 1024px → Sidebar becomes overlay
Desktop: ≥ 1024px → Three-section layout
```

### Responsive State Management

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [recipePanelOpen, setRecipePanelOpen] = useState(true);

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
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🎨 Styling Guide

### Chat Message Colors

```tsx
// User message
className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"

// Assistant message
className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
```

### Accent Gradient

```tsx
// Primary accent (buttons, highlights)
className="bg-gradient-to-r from-orange-500 to-amber-500"

// Hover state
className="hover:from-orange-600 hover:to-amber-600"
```

### Dark Mode Colors

```tsx
// Background
className="bg-gray-50 dark:bg-slate-950"

// Cards
className="bg-white dark:bg-slate-900"

// Borders
className="border-gray-200 dark:border-gray-700"

// Text
className="text-gray-900 dark:text-gray-100"
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| Focus input | `/` (when not typing) |

---

## 🔧 Common Tasks

### Show/Hide Recipe Panel

```tsx
const [recipePanelOpen, setRecipePanelOpen] = useState(true);

<RecipeContextPanel
  recipe={recipe}
  isOpen={recipePanelOpen}
  onToggle={() => setRecipePanelOpen(!recipePanelOpen)}
/>
```

### Handle Mobile Sidebar

```tsx
// Auto-close on mobile after chat selection
onClick={() => {
  onSelectChat(chat.id);
  if (window.innerWidth < 1024 && onToggle) {
    onToggle();
  }
}}
```

### Add Custom Suggestions

```tsx
import { getRandomSuggestions } from '@/lib/chatSuggestions';

const [suggestions] = useState(getRandomSuggestions(4));

<PromptSuggestions
  suggestions={suggestions}
  onSelectSuggestion={handleSend}
/>
```

---

## 🐛 Troubleshooting

### Sidebar not collapsing on mobile
**Check**: Ensure `isOpen` and `onToggle` props are passed to `ChatHistorySidebar`

### Messages not auto-scrolling
**Check**: Verify `messagesEndRef` is placed after all messages:
```tsx
<div ref={messagesEndRef} />
```

### Typing indicator stuck
**Check**: `loading` state properly toggled in finally block:
```tsx
finally {
  setLoading(false);
}
```

### Recipe panel overlapping content
**Check**: Add proper responsive classes:
```tsx
className="hidden lg:block"  // Desktop only
className="lg:hidden"        // Mobile only
```

---

## 📦 What Stayed the Same?

✅ All API endpoints (`apiClient.*`)  
✅ Firestore integration (`saveChat`, `loadChat`)  
✅ Authentication flow  
✅ Backend logic  
✅ Data models  
✅ Chat history hook (`useChatHistory`)  

**Zero breaking changes to existing functionality!**

---

## 🎯 Quick Checklist

### For Testing
- [ ] Create new chat → messages save to Firestore
- [ ] Switch between chats → history loads correctly
- [ ] Delete chat → removes from list and Firestore
- [ ] Mobile: sidebar overlay works
- [ ] Mobile: recipe panel toggles
- [ ] Desktop: three-section layout renders
- [ ] Dark mode: all components styled properly
- [ ] Keyboard shortcuts: Enter/Shift+Enter work
- [ ] Suggestions: clickable and send message
- [ ] Typing indicator: shows while loading

---

## 📚 Next Steps

1. **Read Full Documentation**: See `REDESIGN_DOCUMENTATION.md`
2. **Explore Components**: Check `/components/chat/modern/`
3. **Test Responsive**: Try mobile and desktop views
4. **Customize**: Modify colors, suggestions, or layout

---

## 💡 Tips

- **Dark Mode**: Toggle in navbar (moon/sun icon)
- **Suggestions**: Randomized on each load (4 from 24 total)
- **Animations**: All use Framer Motion for consistency
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Messages virtualized for long conversations

---

**Need Help?** Check the full documentation or inspect component source code.

**Enjoying the redesign?** ⭐ Consider contributing improvements!