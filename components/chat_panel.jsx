import React, {useRef, useState} from 'react'
import {ScrollText, MessageCircle} from 'lucide-react'
import {ChatTextArea} from "../../src/components/chat_text_area.jsx"
import {Conversation} from "../../src/components/conversation.jsx"

export const ChatPanel = props => {
    const {showToast} = props
    const contexts = props.contexts || []
    const apiUrl = props.apiUrl || '/api/iande/chat_json'
    const payloadExtra = props.payloadExtra || {}
    const onUpdateContext = props.onUpdateContext || (() => {})
    const hasConversationToggle = props.conversationToggle !== null && props.conversationToggle !== undefined
    const [session, setSession] = useState(null)
    const [scrollLock, setScrollLock] = useState(false)
    const [conversationOn, setConversationOn] = useState(!!props.conversationToggle)

    const conversationRef = useRef(null)
    const chatTextAreaRef = useRef(null)
    const messagesEndRef = useRef(null)

    const handleMessageChange = () => {
        if ( scrollLock ) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleFullRetry = content => {
        conversationRef.current.handleRetry(content)
    }

    const handleLocalRetry = content => {
        chatTextAreaRef.current.setMessage(content)
    }

    const handleSend = (message, model, thinking) => {
        setScrollLock(true)
        const payload = (thinking !== null && thinking !== undefined) ? {model, thinking} : {model}
        const merged = {...payload, ...payloadExtra}
        if ( hasConversationToggle && !conversationOn ) {
            merged.conversation = []
            conversationRef.current.setMessages([])
        }
        conversationRef.current.handleSend(message, merged, contexts, apiUrl)
    }

    return (
        <div className="relative border-gray-200 bg-white overflow-hidden">
            {scrollLock && (
                <button
                    onClick={() => setScrollLock(false)}
                    className="absolute top-2 right-2 z-50 rounded-full bg-blue-500 shadow-md p-2 text-white hover:bg-blue-600 transition-colors"
                >
                    <ScrollText className="w-5 h-5" />
                </button>
            )}
            <Conversation
                ref={conversationRef}
                session={session}
                onMessageChange={handleMessageChange}
                onRetry={handleLocalRetry}
                onSessionChange={setSession}
                onStreamEnd={() => setScrollLock(false)}
                onUpdateContext={onUpdateContext}
                showToast={showToast}
            />

            <div ref={messagesEndRef} />

            <div className="flex items-stretch border-t border-gray-200">
                {hasConversationToggle && (
                    <button
                        onClick={() => setConversationOn(prev => !prev)}
                        title={conversationOn ? 'Conversation history is included' : 'Conversation history is excluded'}
                        className={`flex shrink-0 items-center justify-center w-12 bg-white transition-colors ${conversationOn ? 'text-blue-600' : 'text-gray-300'}`}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                )}

                <ChatTextArea
                    ref={chatTextAreaRef}
                    className="flex-1 sm:pl-2"
                    hide_mic={true}
                    onSend={handleSend}
                    onRetry={handleFullRetry}
                    showToast={showToast}
                />
            </div>
        </div>
    )
}
