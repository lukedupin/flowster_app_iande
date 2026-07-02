# Markdown Rendering

Bot messages are rendered as GitHub-flavored Markdown using the `marked` library with `github-markdown-css` for styling.

## Implementation

```jsx
import { marked } from 'marked';
import 'github-markdown-css/github-markdown-light.css';

export function MarkdownViewer({ content }) {
    return (
        <div
            className="markdown-body"
            data-color-mode="light"
            dangerouslySetInnerHTML={{ __html: marked(content) }}
        />
    )
}
```

- `marked(content)` converts markdown to an HTML string synchronously
- `dangerouslySetInnerHTML` injects it — safe here because content comes from the trusted API server, not user input
- The `markdown-body` class activates GitHub's stylesheet (typography, code blocks, tables, etc.)
- `data-color-mode="light"` locks the theme to light mode regardless of the host page's color scheme

## Live Streaming

`MarkdownViewer` re-renders on every chunk as `accumulatedText` grows. Because `marked` parses the full string each time, partial markdown (e.g. an unclosed code fence) renders gracefully — `marked` is lenient about incomplete syntax.

## Styling Scope

The GitHub Markdown CSS is injected into the Shadow DOM via the `adoptedStyleSheets` mechanism (see [web-component.md](web-component.md)), so it only applies inside the widget and doesn't affect the host page.

## Dependencies

| Package | Role |
|---|---|
| `marked` | Markdown → HTML conversion |
| `github-markdown-css` | GitHub-styled typography for rendered output |
| `highlight.js` | Listed as a dependency; available for code block syntax highlighting if wired up to `marked`'s `highlight` option |
