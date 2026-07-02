# SSE Streaming

Bot responses are streamed token-by-token using the Fetch API with a `ReadableStream` reader, compatible with Server-Sent Events (SSE) formatted responses.

## Flow

1. User sends a message → `sendMessageSSE(text)` is called
2. A `POST` request is made to `CONFIG.apiUrl` with an `AbortController` signal attached
3. On the first chunk received, a bot message entry is added to state with `isStreaming: true` and `text: ''`
4. Each subsequent chunk is decoded, parsed, and appended to `accumulatedText`
5. The message entry is updated in-place via `updateStreamingMessage()`
6. When the stream ends (either `done === true` or a `[DONE]` sentinel), `finalizeStreamingMessage()` stamps the final timestamp and clears `isStreaming`

## Supported Response Formats

Each line of the response body is inspected:

| Line prefix | Behavior |
|---|---|
| `data: [DONE]` | Ends the stream |
| `data: {...}` | JSON parsed; looks for `content`, `token`, or `text` field |
| `data: <plain text>` | Appended directly if JSON parse fails |
| `agents: [...]` | JSON parsed as an agent card array; inserted as a separate `agent` message |

## Abort / Cancellation

An `AbortController` is created per-request and stored in `abortControllerRef`. The component cleans up on unmount:

```js
useEffect(() => {
    return () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }
}, [])
```

If the abort fires mid-stream, the error is caught and silently ignored (logged as `'Stream cancelled by user'`).

## Error Handling

- Network or HTTP errors update the streaming message with a user-visible error string
- If the error fires before the bot message was added, `addMessage()` is called as a fallback
- `isStreaming` and `streamingMessageId` are always reset in the `finally`-equivalent path

## Conversation Context

Before sending, incomplete streaming messages are filtered out of the history:

```js
const safe_messages = messages.filter(m => {
    if (m.isStreaming) { return false }
    if (m.sender === 'user') { first_usr = true }
    if (first_usr) { return true }
})
```

This ensures only complete user+bot pairs are sent as context — see [conversation-history.md](conversation-history.md).
