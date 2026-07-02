# Configuration

`ChatWidget` accepts props that configure its behavior. All props have defaults so the widget is usable with zero configuration.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiUrl` | `string` | `'https://your-server.com/api/chat'` | Endpoint that receives POST requests and responds with an SSE stream |
| `title` | `string` | `'Chat Support'` | Text shown in the chat window header |
| `welcomeMessage` | `string` | `'Hello! How can I help you today? 👋'` | First bot message shown when the chat is opened for the first time |
| `position` | `'left' \| 'right'` | `'right'` | Which corner of the viewport the toggle button and window anchor to |

## How Defaults Are Applied

Props are merged into a `CONFIG` object inside the component:

```js
const CONFIG = {
    apiUrl: props.apiUrl || 'https://your-server.com/api/chat',
    welcomeMessage: props.welcomeMessage || 'Hello! How can I help you today? 👋',
    title: props.title || 'Chat Support',
    position: props.position || 'right'
}
```

## API Contract

The `apiUrl` endpoint must accept:

```json
POST /api/chat
{
    "question": "user message string",
    "conversation": ["prior message 1", "prior message 2"],
    "url": "https://page-context-url"
}
```

And respond with a streaming body — see [streaming-sse.md](streaming-sse.md) for the expected response format.

## As a Web Component Attribute

When embedded as `<flowster-chat>`, only `apiUrl` and `title` are declared as observed attributes and can be set via HTML:

```html
<flowster-chat apiUrl="https://..." title="Ask Us Anything"></flowster-chat>
```

`welcomeMessage` and `position` must be set programmatically if needed.
