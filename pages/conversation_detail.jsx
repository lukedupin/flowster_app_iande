import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon, AcademicCapIcon} from "@heroicons/react/24/outline"
import {ChatTextArea} from "../../src/components/chat_text_area.jsx"
import {Conversation} from "../../src/components/conversation.jsx"
import * as Util from "../../src/helpers/util.js"
import {useStore} from "../../src/store.js"
import {SeparatorCard} from "../components/separator_card.jsx"
import {STATUS, initials} from "../components/dummy_conversations.js"

const CONVO_SYSTEM_PROMPT = 'You are answering questions about the data in the CONVERSATION context below -- '
    + 'this conversation\'s profile, summary, and full message history. Base your answers only on that data, and '
    + 'say so if something asked about isn\'t covered by it.'

const buildKeyValueTable = (data) => {
    const rows = Object.entries(data).map(([key, value]) => `| ${key} | ${value} |`)
    return [
        '| Key | Value |',
        '| --- | ----- |',
        ...rows,
    ].join('\n')
}

const buildProfileMarkdown = (profile) => `# Profile\n\n${buildKeyValueTable(profile)}`

const buildConversationMarkdown = (convo) => {
    const lines = [
        '# Conversation',
        '',
        '## Summary',
        convo.summary || '(no summary)',
        '',
        buildProfileMarkdown(convo.profile || {}),
        '',
        '## Messages',
    ]

    ;(convo.conversation || []).forEach(msg => {
        lines.push(`**${msg.sender}:** ${msg.text}`)
        if (msg.meta) {
            lines.push('', buildKeyValueTable(msg.meta))
        }
        lines.push('')
    })

    return lines.join('\n')
}

const statusFor = (label) => Object.values(STATUS).find(s => s.label === label) || {label: label || 'Unknown', color: 'bg-gray-400'}

export const ConversationDetail = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const {id: uid} = useParams()

    const selectedConversation = useStore(state => state.selected_conversation)
    const setSelectedConversation = useStore(state => state.setSelectedConversation)

    const [convo, setConvo] = useState(selectedConversation?.uid === uid ? selectedConversation : null)
    const [loading, setLoading] = useState(!(selectedConversation?.uid === uid))

    const [scrollLock, setScrollLock] = useState(false)
    const [session, setSession] = useState(null)

    const messagesEndRef = useRef(null)
    const chatTextAreaRef = useRef(null)
    const conversationRef = useRef(null)

    useEffect(() => {
        if (selectedConversation?.uid === uid) {
            setConvo(selectedConversation)
            setLoading(false)
            return
        }

        setLoading(true)
        Util.fetch_js('/api/iande/conversation', {uid}, js => {
            setSelectedConversation(js.conversation)
            setConvo(js.conversation)
            setLoading(false)
        }, () => {
            setConvo(null)
            setLoading(false)
        })
    }, [uid])

    useEffect(() => {
        if ( !convo ) {
            return
        }

        conversationRef.current?.setMessages([])
        conversationRef.current?.addMessage({
            sender: 'assistant',
            content: `# Summary\n\n${convo.summary}\n\n${buildProfileMarkdown(convo.profile || {})}`,
        })

        ;(convo.conversation || []).forEach(msg => {
            const content = msg.meta
                ? `${msg.text}\n\n${buildKeyValueTable(msg.meta)}`
                : msg.text

            conversationRef.current?.addMessage({
                sender: msg.sender,
                content,
            })
        })

        conversationRef.current?.addMessage({
            sender: 'separator',
        })
    }, [convo?.uid])

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        )
    }

    if (!convo) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Conversation not found.</p>
            </div>
        )
    }

    const status = statusFor(convo.profile?.status)

    const handleMessageChange = () => {
        if ( scrollLock ) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
        }
    }

    const handleFullRetry = (content) => {
        conversationRef.current.handleRetry(content)
    }

    const handleLocalRetry = (content) => {
        chatTextAreaRef.current.setMessage(content)
    }

    const handleSend = (message, model) => {
        if ( conversationRef.current === null ) {
            return
        }

        setScrollLock(true)
        const contexts = [
            {name: 'system', content: CONVO_SYSTEM_PROMPT, file_type: 'text'},
            {name: 'CONVERSATION', content: buildConversationMarkdown(convo), file_type: 'text'},
        ]
        conversationRef.current.handleSend(message, model, contexts, "/api/iande/chat")
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={() => navigate('/i_e/conversation')}
                    className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <button
                    onClick={() => navigate('/i_e/conversation')}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <div className={Util.classNames(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                        status.color
                    )}>
                        {initials(convo.profile?.name || '?')}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{convo.profile?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">
                            {status.label} · {(convo.conversation || []).length} messages
                            {convo.created_on && ` · ${new Date(convo.created_on).toLocaleDateString()}`}
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate(`/i_e/conversation/${uid}/training`)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <AcademicCapIcon className="h-4 w-4" />
                    Make Training
                </button>
            </div>

            <div className="flex flex-col pb-32">
                <Conversation
                    ref={conversationRef}
                    session={session}
                    hide_advanced={true}
                    onMessageChange={handleMessageChange}
                    onRetry={handleLocalRetry}
                    onStreamEnd={() => setScrollLock(false)}
                    onSessionChange={setSession}
                    showToast={showToast}
                >
                    <SeparatorCard sender="separator" text="User Conversation" />
                </Conversation>

                <div ref={messagesEndRef}/>
            </div>

            <ChatTextArea
                ref={chatTextAreaRef}
                className="border-t pl-3 sticky bottom-0 z-10"
                onSend={handleSend}
                onRetry={handleFullRetry}
                showToast={showToast}
            />
        </div>
    )
}
