# Conversation History

The widget maintains a rolling message history that is sent to the server as context with each request.

## Message Cap

The `Conversation` component enforces a maximum of 8 messages via `handleMessageChange`:

```js
const handleMessageChange = (messages) => {
    if (messages.length > 8) {
        conversationRef.current.setMessages(prev => prev.slice(-8))
    }
}
```

This keeps the context payload small and prevents unbounded memory growth in long sessions.

## Filtering Before Send

Before posting to the API, incomplete or invalid messages are stripped:

```js
let first_usr = false
const safe_messages = messages.filter(m => {
    if (m.isStreaming) { return false }        // drop mid-stream bot messages
    if (m.sender === 'user') { first_usr = true }
    if (first_usr) { return true }             // include everything after first user turn
})
```

This ensures:
- The initial welcome message (bot-only, before any user input) is excluded
- Any partially-streamed bot message is excluded
- Context always starts at the first user message

## Payload Format

Only the text content is sent — metadata (timestamps, IDs, sender) is stripped:

```js
conversation: safe_messages.map(x => x.text)
```

The server receives an ordered array of strings representing alternating turns (user, bot, user, bot...).

## Session State

A `session` state variable is maintained and passed to the `Conversation` component via `onSessionChange`. This is available for the server to use as a session identifier across requests, though the exact session protocol is defined by the backend.
