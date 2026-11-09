import React, {useState} from 'react'
import {Routes, Route, Navigate} from "react-router-dom";
import {Sidebar} from "../src/components/sidebar.jsx";
import {HeaderSearch} from "../src/components/header_search.jsx";
import {Dashboard} from "./pages/dashboard.jsx";
import {ConversationPage} from "./pages/conversation.jsx";
import {ConversationDetail} from "./pages/conversation_detail.jsx";
import {TrainingPage} from "./pages/training.jsx";
import {TrainingConversationPage} from "./pages/training_conversation.jsx";
import {ContextsPage} from "./pages/contexts.jsx";
import {ContextDetail} from "./pages/context_detail.jsx";
import {BlogCachePage} from "./pages/blog_cache.jsx";
import {ScriptPage} from "./pages/script.jsx";
import {VoicesPage} from "./pages/voices.jsx";
import {VoiceDetail} from "./pages/voice_detail.jsx";
import {ActiveOutreachPage} from "./pages/active_outreach.jsx";

const PLACES = [
    { name: 'Dashboard', path: '/i_e/dashboard', icon: 'ChartPieIcon' },
    { name: 'Conversation', path: '/i_e/conversation', icon: 'ChatBubbleLeftEllipsisIcon' },
    { name: 'Make Training', path: '/i_e/training', icon: 'AcademicCapIcon' },
    { name: 'Contexts', path: '/i_e/contexts', icon: 'TagIcon' },
    { name: 'Blog Cache', path: '/i_e/blog_cache', icon: 'DocumentTextIcon' },
    { name: 'Script', path: '/i_e/script', icon: 'CommandLineIcon' },
    { name: 'Voices', path: '/i_e/voices', icon: 'MicrophoneIcon' },
    { name: 'Active Outreach', path: '/i_e/active_outreach', icon: 'MegaphoneIcon' },
]

export const IAndE = props => {
    const {showToast} = props
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [search, setSearch] = useState('')

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
                <HeaderSearch
                    search={search}
                    onSearch={setSearch}
                    onSidebarOpen={setSidebarOpen}
                    showToast={showToast}
                />

                <Routes>
                    <Route path="dashboard" element={<Dashboard search={search} showToast={showToast} />} />
                    <Route path="conversation" element={<ConversationPage search={search} showToast={showToast} />} />
                    <Route path="training" element={<TrainingPage search={search} showToast={showToast} />} />
                    <Route path="conversation/:id" element={<ConversationDetail search={search} showToast={showToast} />} />
                    <Route path="conversation/:id/training" element={<TrainingConversationPage search={search} showToast={showToast} />} />
                    <Route path="contexts" element={<ContextsPage search={search} showToast={showToast} />} />
                    <Route path="contexts/:id" element={<ContextDetail search={search} showToast={showToast} />} />
                    <Route path="blog_cache" element={<BlogCachePage search={search} showToast={showToast} />} />
                    <Route path="script" element={<ScriptPage search={search} showToast={showToast} />} />
                    <Route path="voices" element={<VoicesPage search={search} showToast={showToast} />} />
                    <Route path="voices/:id" element={<VoiceDetail search={search} showToast={showToast} />} />
                    <Route path="active_outreach" element={<ActiveOutreachPage search={search} showToast={showToast} />} />
                    <Route path="*"element={<Navigate to="dashboard" replace />} />
                </Routes>
            </div>
        </div>
    )
}
