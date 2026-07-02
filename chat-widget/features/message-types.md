# Message Types

The chat window renders four distinct message types determined by the `sender` field on each message object.

## Message Object Shape

```js
{
    id: number,          // unique ID (Date.now() + Math.random())
    sender: string,      // 'user' | 'bot' | 'agent'
    text: string,        // message content (markdown for bot)
    time: string,        // formatted HH:MM timestamp
    isStreaming: boolean // true while bot response is mid-stream
    agents?: array       // only present on 'agent' messages
}
```

## UserMessage (`sender === 'user'`)

- Right-aligned bubble
- Blue gradient background (`from-blue-600 to-sky-600`)
- Plain text, no markdown
- Rounded corners with flat bottom-right (`rounded-br-sm`)

## BotMessage (`sender === 'bot'`)

- Left-aligned bubble
- White background with drop shadow
- Content rendered as GitHub-flavored Markdown — see [markdown-rendering.md](markdown-rendering.md)
- Rounded corners with flat bottom-left (`rounded-bl-sm`)
- During streaming, `isStreaming: true` is set on the message and it updates in-place as chunks arrive

## AgentMessage (`sender === 'agent'`)

Rendered when the server sends an `agents: [...]` line in the stream. Displays a responsive grid of agent cards, each with:

- Profile photo
- Name, title, subtitle
- Contact button

The grid adapts from 1 → 2 → 3 → 4 columns at `sm` / `lg` / `xl` breakpoints.

## TypingIndicator

Not a message object — rendered as a separate component when `isTyping === true` (set between the user submitting and the first streaming chunk arriving). Shows three animated bouncing dots with staggered `animationDelay`.

## Rendering Logic (in JSX)

```jsx
{messages.map(msg => {
    if (msg.sender === 'user') return <UserMessage ... />
    if (msg.sender === 'agent') return <AgentMessage ... />
    return <BotMessage ... />
})}
{isTyping && <TypingIndicator />}
```
