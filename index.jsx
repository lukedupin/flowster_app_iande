import React, {useState} from 'react'
import {Routes, Route, Navigate} from "react-router-dom";
import {Sidebar} from "../src/components/sidebar.jsx";
import {Dashboard} from "./pages/dashboard.jsx";
import {ConversationPage} from "./pages/conversation.jsx";
import {ConversationDetail} from "./pages/conversation_detail.jsx";
import {ContextsPage} from "./pages/contexts.jsx";
import {ContextDetail} from "./pages/context_detail.jsx";
import {BlogCachePage} from "./pages/blog_cache.jsx";
import {ScriptPage} from "./pages/script.jsx";
import {INITIAL_CONTEXTS, makeUniqueKey} from "./components/dummy_contexts.js";

const PLACES = [
    { name: 'Dashboard', path: '/i_e/dashboard', icon: 'ChartPieIcon' },
    { name: 'Conversation', path: '/i_e/conversation', icon: 'ChatBubbleLeftEllipsisIcon' },
    { name: 'Contexts', path: '/i_e/contexts', icon: 'TagIcon' },
    { name: 'Blog Cache', path: '/i_e/blog_cache', icon: 'DocumentTextIcon' },
    { name: 'Script', path: '/i_e/script', icon: 'CommandLineIcon' },
]

export const IAndE = props => {
    const {showToast} = props
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [contexts, setContexts] = useState(INITIAL_CONTEXTS)

    const handleCreateContext = title => {
        setContexts(prev => [...prev, {
            id: Date.now(),
            title,
            key: makeUniqueKey(title, prev),
            content: '',
            url: '',
        }])
    }

    const handleUpdateContext = (id, updates) => {
        setContexts(prev => prev.map(c => c.id === id ? {...c, ...updates} : c))
    }

    return (
        <div className="flex-1 min-h-screen bg-gray-50">
            <Sidebar
                navigation={PLACES}
                sidebarOpen={sidebarOpen}
                onSidebarOpen={setSidebarOpen}
                onTutorial={() => ({})}
                showToast={showToast}
            />

            <div className="lg:pl-52 min-h-screen">
                <Routes>
                    <Route path="dashboard" element={<Dashboard showToast={showToast} />} />
                    <Route path="conversation" element={<ConversationPage showToast={showToast} />} />
                    <Route path="conversation/:id" element={<ConversationDetail showToast={showToast} />} />
                    <Route path="contexts" element={<ContextsPage contexts={contexts} onCreate={handleCreateContext} showToast={showToast} />} />
                    <Route path="contexts/:id" element={<ContextDetail contexts={contexts} onUpdate={handleUpdateContext} showToast={showToast} />} />
                    <Route path="blog_cache" element={<BlogCachePage showToast={showToast} />} />
                    <Route path="script" element={<ScriptPage showToast={showToast} />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </div>
        </div>
    )
}
