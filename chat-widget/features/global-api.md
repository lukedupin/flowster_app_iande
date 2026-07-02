# Global API

The widget exposes two functions on `window` for external page scripts to interact with.

## `window.initChatWidget(config?)`

Initializes and registers the `<flowster-chat>` custom element. Called automatically when the IIFE bundle loads.

```js
window.initChatWidget = initChatWidget
```

In practice, you don't need to call this manually — loading the script is enough because `initChatWidget()` is invoked at the bottom of `main.jsx` if `window` is available. It's exposed on `window` in case you need to defer initialization or pass a config object programmatically.

## `window.flowsterSendMessage(msg)`

Sends a message into the chat programmatically from outside the widget, as if the user typed and submitted it.

```js
window.flowsterSendMessage = (msg) => {
    if (!msg.trim() || isStreaming) return

    const text = msg.trim()
    addMessage('user', text)
    setInputValue('')
    setIsTyping(true)

    sendMessageSSE(text)
    setIsOpen(true)   // opens the chat window if it's closed
}
```

**Behavior:**
- Ignored if the widget is currently streaming a response
- Automatically opens the chat window if it's minimized
- The message appears in the conversation as a user turn, then triggers the same SSE fetch as a normal send

**Usage example:**

```js
// Trigger a canned prompt from a CTA button on the page
document.querySelector('#ask-about-pricing').addEventListener('click', () => {
    window.flowsterSendMessage('Tell me about your pricing options')
})
```

**Note:** `flowsterSendMessage` is re-registered on each render because it's defined inside the component body. It always closes over the current `isStreaming` state, so it's safe to call at any time.
