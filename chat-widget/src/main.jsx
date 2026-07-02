import { createRoot } from 'react-dom/client'
import { ChatWidget } from './ChatWidget'
import stylez from './output.css?inline'

function convertRemToPx(text) {
    const base_px = 16
    const regex = /font-size:\s*(\d+\.?\d*)rem/g
    const _text = text.replace(regex, (match, remValue) => {
        const pxValue = parseFloat(remValue) * base_px
        return `font-size: ${pxValue}px`
    })
    const _regex = /line-height:\s*(\d+\.?\d*)rem/g
    return _text.replace(_regex, (match, remValue) => {
        const pxValue = parseFloat(remValue) * base_px
        return `line-height: ${pxValue}px`
    })
}

const sheet = new CSSStyleSheet()
sheet.replaceSync(convertRemToPx(stylez))

console.log("Main is running")

class FlowsterChat extends HTMLElement {
    static get observedAttributes() {
        return ['apiurl', 'title']
    }

    connectedCallback() {
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.adoptedStyleSheets = [sheet]

        this._container = document.createElement('div')
        this._shadow.appendChild(this._container)

        this._root = createRoot(this._container)
        this._render()
    }

    attributeChangedCallback() {
        if (this._root) this._render()
    }

    disconnectedCallback() {
        if (this._root) this._root.unmount()
    }

    _render() {
        this._root.render(
            <ChatWidget
                apiUrl={this.getAttribute('apiurl') || this.getAttribute('apiUrl')}
                title={this.getAttribute('title')}
            />
        )
    }
}

customElements.define('flowster-chat', FlowsterChat)

function initChatWidget(config = {}) {}

if (typeof window !== 'undefined') {
    window.initChatWidget = initChatWidget
    window.process = { env: { NODE_ENV: 'production' } }

    document.addEventListener('DOMContentLoaded', () => { window.initChatWidget() })
}
