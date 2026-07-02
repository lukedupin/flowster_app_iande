# Scroll Management

The message list automatically scrolls to the latest content, with a lock mechanism to suppress scrolling when the user has manually scrolled up.

## Auto-Scroll

A `messagesEndRef` is attached to a `<div>` at the bottom of the message list. `scrollToBottom()` is called whenever `messages` or `isTyping` changes:

```js
const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

useEffect(() => {
    scrollToBottom()
}, [messages, isTyping])
```

This keeps new content in view automatically as the bot streams its response.

## Scroll Lock

A `scrollLock` boolean state controls whether mid-stream scroll updates are applied. It is checked inside `handleMessageChange`:

```js
const handleMessageChange = (messages) => {
    if (scrollLock) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    ...
}
```

And released when a stream ends:

```js
onStreamEnd={() => setScrollLock(false)}
```

This allows a user who has scrolled up to read earlier messages to stay in place while the bot is typing, and then have scroll resume when the response is complete.

## Typing Indicator

The `TypingIndicator` component is rendered while `isTyping === true` (between user submit and first stream chunk). Because it's part of the message list, the `useEffect` auto-scroll fires when it appears, keeping it visible.
