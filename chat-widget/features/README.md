# Chat Widget — Feature Index

A Preact-based embeddable chat widget built as a native Web Component with Shadow DOM isolation.

## Features

| Feature | File | Summary |
|---|---|---|
| Web Component Registration | [web-component.md](web-component.md) | Packaged as `<flowster-chat>` custom element with Shadow DOM |
| Configuration | [configuration.md](configuration.md) | Props: `apiUrl`, `title`, `welcomeMessage`, `position` |
| SSE Streaming | [streaming-sse.md](streaming-sse.md) | Real-time token streaming over Server-Sent Events with abort support |
| Message Types | [message-types.md](message-types.md) | User, bot, agent card, and typing indicator messages |
| Markdown Rendering | [markdown-rendering.md](markdown-rendering.md) | Bot messages rendered as GitHub-flavored Markdown |
| Conversation History | [conversation-history.md](conversation-history.md) | Rolling window of last 8 messages sent as context |
| Scroll Management | [scroll-management.md](scroll-management.md) | Auto-scroll to bottom with scroll-lock during streaming |
| Global API | [global-api.md](global-api.md) | `window.flowsterSendMessage()` and `window.initChatWidget()` |
| Responsive Layout | [responsive-layout.md](responsive-layout.md) | Mobile-first sizing, configurable left/right positioning |

## Build

```bash
npm run dev        # development server
npm run tailwind   # watch Tailwind CSS
npm run build      # IIFE bundle → dist/chat-widget.iife.js
```

## Embed

```html
<script src="dist/chat-widget.iife.js"></script>
<flowster-chat apiUrl="https://your-server.com/api/chat" title="Chat Support"></flowster-chat>
```
