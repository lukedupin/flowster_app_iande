import { createRoot } from 'react-dom/client'
import { ChatWidget } from './ChatWidget'
import stylez from './style.css?inline'

const host = document.getElementById('flowster')
const shadow = host.attachShadow({ mode: 'open' })

const sheet = new CSSStyleSheet()
sheet.replaceSync(stylez)
shadow.adoptedStyleSheets = [sheet]

const container = document.createElement('div')
shadow.appendChild(container)

console.log("Dev is running")

createRoot(container).render(
    <ChatWidget
        apiUrl={host.getAttribute('apiurl') || host.getAttribute('apiUrl')}
        title={host.getAttribute('title')}
    />
)
