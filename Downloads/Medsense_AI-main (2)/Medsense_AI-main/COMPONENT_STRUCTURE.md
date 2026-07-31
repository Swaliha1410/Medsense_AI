# Chat Component Structure

## Visual Hierarchy

```
Chat.jsx
│
├─ State Management
│  ├─ messages[]          - Chat history
│  ├─ input              - Current input text
│  ├─ loading            - AI response loading
│  ├─ listening          - Voice recording active
│  ├─ sidebarOpen        - Mobile sidebar state
│  ├─ darkMode           - Theme (ready)
│  └─ hoveredMessage     - Message hover tracking
│
├─ Effects & Handlers
│  ├─ useEffect: Load chat history
│  ├─ useEffect: Auto-scroll to bottom
│  ├─ useEffect: Setup voice recognition
│  ├─ sendMessage()
│  ├─ newChat()
│  ├─ toggleListening()
│  ├─ speakText()
│  ├─ copyToClipboard()
│  └─ handleSuggestionClick()
│
└─ Render Tree
   │
   ├─ 🌐 Mobile Sidebar Overlay (AnimatePresence)
   │  ├─ Backdrop (onClick: close)
   │  └─ Slide-in Sidebar (motion.aside)
   │     └─ renderSidebarContent()
   │
   ├─ 🗂️ Desktop Sidebar (hidden on mobile)
   │  └─ renderSidebarContent()
   │     ├─ Header
   │     │  ├─ Logo
   │     │  ├─ "MedSense" text
   │     │  └─ Close button (mobile only)
   │     │
   │     ├─ New Chat Button
   │     │  └─ [Plus Icon] + "New Chat"
   │     │
   │     ├─ Recent Chats Section
   │     │  ├─ "RECENT" label
   │     │  └─ RECENT_CHATS.map()
   │     │     └─ Chat Item
   │     │        ├─ Icon (emoji)
   │     │        ├─ Title
   │     │        ├─ Timestamp
   │     │        └─ Three-dot menu (hover)
   │     │
   │     └─ Footer
   │        └─ if (isLoggedIn)
   │           ├─ User Profile
   │           │  ├─ Avatar (gradient + initial)
   │           │  └─ Username
   │           ├─ Settings button
   │           └─ Logout button
   │        else
   │           └─ Sign In button
   │
   └─ 📱 Main Content Area
      │
      ├─ Mobile Header (lg:hidden)
      │  ├─ Menu button (hamburger)
      │  ├─ Logo (center)
      │  └─ Spacer
      │
      ├─ 💬 Chat Area (scrollable)
      │  │
      │  ├─ if (messages.length === 0)
      │  │  └─ Welcome State (motion.div)
      │  │     ├─ Logo (80px, centered)
      │  │     ├─ Heading: "How can I help you?"
      │  │     ├─ Suggestion Chips
      │  │     │  └─ SUGGESTIONS.map()
      │  │     │     └─ Chip Button
      │  │     │        ├─ Emoji
      │  │     │        └─ Text
      │  │     └─ Background Pattern (subtle)
      │  │
      │  else
      │  │  └─ Messages View
      │  │     ├─ Loading indicator (if history loading)
      │  │     ├─ messages.map() (AnimatePresence)
      │  │     │  └─ Message (motion.div)
      │  │     │     ├─ Avatar
      │  │     │     │  ├─ if AI: Logo in circle
      │  │     │     │  └─ if User: Initial in gradient
      │  │     │     ├─ Message Bubble
      │  │     │     │  └─ Content text
      │  │     │     └─ if AI && hoveredMessage
      │  │     │        └─ Action Bar (motion.div)
      │  │     │           ├─ Copy button
      │  │     │           ├─ Speak button
      │  │     │           ├─ Like button
      │  │     │           ├─ Dislike button
      │  │     │           └─ Regenerate button
      │  │     │
      │  │     ├─ if (loading)
      │  │     │  └─ Loading Message
      │  │     │     ├─ AI Avatar
      │  │     │     └─ Spinner bubble
      │  │     │
      │  │     └─ Bottom ref (scroll anchor)
      │  │
      │  └─ Auto-scroll to bottom
      │
      └─ ⌨️ Input Area (fixed at bottom)
         ├─ Container (max-w-3xl centered)
         └─ Input Wrapper (motion.div)
            ├─ Background (#F8FAFC)
            ├─ Border + focus glow effect
            │
            ├─ Attachment Button
            │  └─ Paperclip icon
            │
            ├─ Textarea (auto-resize)
            │  ├─ Placeholder: "Ask anything..."
            │  ├─ Enter: send
            │  └─ Shift+Enter: newline
            │
            ├─ Voice Button
            │  ├─ if listening: MicOff (red, pulse)
            │  └─ else: Mic (gray, hover blue)
            │
            ├─ Send Button (gradient)
            │  ├─ Send icon
            │  └─ disabled if empty/loading
            │
            └─ Disclaimer text
               "MedSense AI provides general health info..."
```

## Data Flow

```
User Action
    │
    ├─ Click Suggestion → handleSuggestionClick()
    │                          │
    │                          └─→ sendMessage(text)
    │
    ├─ Type in Input → setInput()
    │                     │
    │                     └─→ Enter key → sendMessage()
    │
    ├─ Click Voice → toggleListening()
    │                    │
    │                    └─→ Speech Recognition
    │                         └─→ setInput(transcript)
    │
    └─ Click Send → sendMessage()
                       │
                       ├─→ Add user message to state
                       ├─→ Save to backend (if logged in)
                       ├─→ setLoading(true)
                       ├─→ Call AI (generateAIResponse)
                       ├─→ Add AI response to state
                       ├─→ Save to backend (if logged in)
                       └─→ setLoading(false)
```

## Animation Timeline

### Welcome State (Empty Chat)
```
0ms    │ Component mounts
       │
100ms  │ ━━━ Logo fades in + scales
       │
200ms  │ ━━━ Heading fades in + slides up
       │
300ms  │ ━━━ Suggestion chips appear:
       │     ├─ 400ms: Chip 1
       │     ├─ 450ms: Chip 2
       │     ├─ 500ms: Chip 3
       │     ├─ 550ms: Chip 4
       │     └─ 600ms: Chip 5
```

### Message Sent
```
0ms    │ User clicks send
       │
       │ ━━━ User message slides up + fades in (300ms)
       │
1200ms │ ━━━ Loading indicator appears (fade)
       │
       │ ... AI processing ...
       │
       │ ━━━ AI message slides up + fades in (300ms)
       │
       │ ━━━ Auto-scroll to bottom (smooth)
```

### Hover Interactions
```
Mouse enters message
    │
    └─→ setHoveredMessage(id)
         │
         └─→ Action bar fades in + slides up (150ms)

Mouse leaves message
    │
    └─→ setHoveredMessage(null)
         │
         └─→ Action bar fades out (150ms)
```

## Responsive Breakpoints

```
Mobile (< 1024px)
├─ Sidebar: Hidden, toggle with hamburger
├─ Welcome state: Smaller logo, stacked chips
└─ Input: Full width, smaller padding

Desktop (≥ 1024px)
├─ Sidebar: Fixed, always visible
├─ Welcome state: Large logo, wrapped chips
└─ Input: Max-width 3xl, centered
```

## Color Mapping

```css
Primary Blue    #0F6FFF  → Buttons, links, focus states
Primary Teal    #14C8A8  → Gradients, accents
Background      #F8FAFC  → Page, input background
White           #FFFFFF  → Cards, AI messages
Dark Text       #0F172A  → Primary text
Gray 600        #64748B  → Secondary text
Gray 400        #94A3B8  → Placeholder text
Border          #E2E8F0  → Dividers, borders
```

## Z-Index Layers

```
z-0   │ Background pattern
z-10  │ Main content
z-40  │ Mobile sidebar backdrop
z-50  │ Mobile sidebar panel
```

---

**This structure ensures a clean, maintainable, and performant chat interface.**
