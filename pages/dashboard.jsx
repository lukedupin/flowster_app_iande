import React, {useState, useRef, useEffect} from 'react'
import 'github-markdown-css/github-markdown-light.css';
import {ChatTextArea} from "../../src/components/chat_text_area.jsx";
import {Conversation} from "../../src/components/conversation.jsx";
import * as Util from "../../src/helpers/util.js";
import {DashboardCard} from "../components/dashboard_card.jsx";

const DASHBOARD_SYSTEM_PROMPT = 'You are answering questions about the data in the DASHBOARD context below -- '
    + 'chats per day, average Q/A per chat, script states touched, and top blogs by chat interactions, all over '
    + 'the last 30 days. Base your answers only on that data, and say so if something asked about isn\'t covered by it.'

export const Dashboard = props => {
    const {showToast} = props
    const [scrollLock, setScrollLock] = useState(false)
    const [dashboardContext, setDashboardContext] = useState('')

    const [session, setSession] = useState(null)

    const messagesEndRef = useRef(null)
    const chatTextAreaRef = useRef(null)
    const conversationRef = useRef(null)

    useEffect(() => {
        conversationRef.current?.setMessages([
            {
                sender: 'dashboard',
                timestamp: new Date().toISOString(),
            }
        ])
    }, [])

    const handleMessageChange = (messages) => {
        if (scrollLock) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
        }

        if (messages.length > 8) {
            conversationRef.current.setMessages(prev => prev.slice(-8))
        }
    }

    const prevScrollYRef = useRef(0);
    useEffect(() => {
        //if (!scrollLock) {
        //return
        //}

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
            {name: 'system', content: DASHBOARD_SYSTEM_PROMPT, file_type: 'text'},
            {name: 'DASHBOARD', content: dashboardContext, file_type: 'text'},
        ]
        conversationRef.current.handleSend(message, model, contexts, "/api/iande/chat")
    }

    const handleUpdateContext = (contents) => {
        const headers = { Authorization: `Bearer ${session}` }
        Util.fetch_js('/api/iande/update_context', contents,
            js => {
            console.log(js)
                setSession( js.token )
            }, showToast,
            headers)
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
                    <DashboardCard
                        sender="dashboard"
                        showToast={showToast}
                        onContextChange={setDashboardContext}
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
