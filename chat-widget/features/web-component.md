# Web Component Registration

The widget is packaged as a native custom element (`<flowster-chat>`) using `preact-custom-element` with a closed Shadow DOM for full CSS isolation from the host page.

## How It Works

`main.jsx` calls `register()` after building a compatible stylesheet:

```js
register(ChatWidget, 'flowster-chat', ['apiUrl', 'title'], {
    shadow: true,
    mode: 'closed',
    adoptedStyleSheets: [sheet]
})
```

- **`shadow: true`** — renders into a shadow root so host-page styles don't bleed in
- **`mode: 'closed'`** — shadow root is inaccessible from outside JS
- **`adoptedStyleSheets`** — injects the compiled Tailwind CSS into the shadow root

## CSS Isolation

Tailwind compiles to `rem`-based units. Because Shadow DOM inherits the host page's root `font-size`, rem values can be unpredictable. `main.jsx` converts all `font-size` and `line-height` rem values to absolute `px` before injecting:

```js
function convertRemToPx(text) {
    const base_px = 16
    // replaces font-size: Xrem → font-size: Ypx
    // replaces line-height: Xrem → line-height: Ypx
}
```

## Build Output

Vite builds a single IIFE bundle (`dist/chat-widget.iife.js`) containing JS + inlined CSS. No separate CSS file is required.

## Observed Attributes

Only `apiUrl` and `title` are declared as observed attributes. Changes to these after mount trigger a re-render. `welcomeMessage` and `position` are read once at mount from the element's props.

## Usage

```html
<script src="dist/chat-widget.iife.js"></script>
<flowster-chat
    apiUrl="https://your-server.com/api/chat"
    title="Chat Support">
</flowster-chat>
```
