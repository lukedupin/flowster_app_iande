# Responsive Layout

The widget is mobile-first and adapts its size and positioning across breakpoints using Tailwind CSS.

## Toggle Button

| Breakpoint | Size |
|---|---|
| Mobile (default) | `w-14 h-14` (56×56px) |
| `sm` (640px+) | `w-24 h-24` (96×96px) |

## Chat Window

| Breakpoint | Width | Height |
|---|---|---|
| Mobile (default) | `calc(100vw - 2rem)` | `32rem` (512px) |
| `sm` (640px+) | `48vw` | `52rem` (832px) |

On mobile the window fills nearly the full viewport width, making it usable on small screens without horizontal scrolling.

## Positioning

Controlled by the `position` prop (`'left'` or `'right'`, default `'right'`):

```js
const positionClasses = CONFIG.position === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
```

Both the toggle button and the chat window use this same class, so they always anchor to the same corner.

The outer wrapper is `fixed bottom-0 z-50`, so the widget floats above all page content with a high stacking context.

## Chat Window Anchor

The chat window itself is `fixed bottom-20` plus the position class, placing it just above the toggle button with a small gap.

## Input Area

The send button is a fixed `w-16 h-16` circle. The text input uses `flex-1` to fill the remaining space, keeping the layout stable regardless of the window width.
