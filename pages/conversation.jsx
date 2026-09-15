import React, {useState, useRef, useEffect} from 'react'
import {ChatTextArea} from "../../src/components/chat_text_area.jsx";
import {Conversation} from "../../src/components/conversation.jsx";
import {ConversationCard} from "../components/conversation_card.jsx";

const CONVERSATIONS_SYSTEM_PROMPT = 'You are answering questions about the data in the CONVERSATIONS context below -- '
    + 'the list of chat conversations, their status, chat counts, and summaries. '
    + 'Base your answers only on that data, and say so if something asked about isn\'t covered by it.'

export const ConversationPage = props => {
    const {showToast} = props
    const [scrollLock, setScrollLock] = useState(false)
    const [conversationsContext, setConversationsContext] = useState('')

    const [session, setSession] = useState(null)

    const messagesEndRef = useRef(null)
    const chatTextAreaRef = useRef(null)
    const conversationRef = useRef(null)

    useEffect(() => {
        conversationRef.current?.setMessages([
            {
                sender: 'conversations',
                timestamp: new Date().toISOString(),
            }
        ])
    }, [])

    const handleMessageChange = (messages) => {
        if (scrollLock) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
        }

        /*
        if (messages.length > 8) {
            conversationRef.current.setMessages(prev => prev.slice(-8))
        }
        */
    }

    const prevScrollYRef = useRef(0);
    useEffect(() => {
        const onScroll = () => {
            const currentScrollY = window.scrollY ?? window.pageYOffset;
            const prevScrollY = prevScrollYRef.current;

            if (currentScrollY > prevScrollY) {
                //
            } else if (currentScrollY < prevScrollY) {
                setScrollLock(false)
            }

            prevScrollYRef.current = currentScrollY;
        };

        window.addEventListener('scroll', onScroll, {passive: true});

        return () => window.removeEventListener('scroll', onScroll);
    }, [])

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
            {name: 'system', content: CONVERSATIONS_SYSTEM_PROMPT, file_type: 'text'},
            {name: 'CONVERSATIONS', content: conversationsContext, file_type: 'text'},
        ]
        conversationRef.current.handleSend(message, model, contexts, "/api/iande/chat")
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col pb-32">
                <Conversation
                    ref={conversationRef}
                    session={session}
                    onMessageChange={handleMessageChange}
                    onRetry={handleLocalRetry}
                    onStreamEnd={() => setScrollLock(false)}
                    onSessionChange={setSession}
                    showToast={showToast}
                >
                    <ConversationCard
                        sender="conversations"
                        showToast={showToast}
                        onContextChange={setConversationsContext}
                        />
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
