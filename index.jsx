import React, {useState, useRef, useEffect, forwardRef} from 'react'
import 'github-markdown-css/github-markdown-light.css';
import { ChatTextArea } from "../../src/components/chat_text_area.jsx";
import {Conversation} from "../../src/components/conversation.jsx";
import * as Util from "../../src/helpers/util.js";
import Markdown from "react-markdown";
import {AssistantCard} from "../../src/cards/assistant_card.jsx";
import {MarkdownViewer} from "../../src/components/markdown_viewer.jsx";

export const InsightCard = props => {
    const {message, showToast} = props

    return (
        <div className="flex group justify-start sm:pr-12">
            <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 px-4 py-2 shadow-sm">
                <MarkdownViewer
                    content={message.content}
                    showToast={showToast}
                />
            </div>
        </div>
    )
}

export const IAndE = props => {
    const {showToast} = props
    const [contexts, setContexts] = useState([])
    const [scrollLock, setScrollLock] = useState(false)

    const [currentSection, setCurrentSection] = useState(null)
    const [sections, setSections] = useState({})
    const [section_order, setSectionOrder] = useState([])
    const [session, setSession] = useState(null)

    const messagesEndRef = useRef(null)
    const chatTextAreaRef = useRef(null)
    const conversationRef = useRef(null)
    const formUiRef = useRef(null)

    useEffect(() => {
        conversationRef.current.handleSend("Hello", null, [], "/api/iande/run_script?debug=true")
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
        conversationRef.current.handleSend(message, model, contexts, "/api/iande/run_script")
    }

    const handleChunk = (chunk) => {
        if (chunk.type === "memory") {
            const { memory, current_section } = chunk.content
            const merge = (current_section === currentSection)
            setCurrentSection( current_section )
        }
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

    const fields = []
    sections[currentSection]?.field_names?.forEach(key => {
        const field = sections[currentSection].fields[key]
        if (field) {
            fields.push(field)
        }
    })

    return (
        <div className="flex-1 h-full bg-gray-50">
            <div className="flex flex-col sm:grid grid-cols-1 sm:grid-cols-2 sm:h-full">
                {/* Left column – FormUI */}
                <div className="sm:flex sm:flex-col items-center border-r border-gray-200 sm:h-full">
                    <iframe
                        style={{ width: '100%', height: '900px', border: 'none' }}
                        src="https://www.insuranceandestates.com/"
                        />
                </div>

                {/* Right column – Conversation + ChatTextArea */}
                <div className="flex flex-col sm:h-full">
                    <Conversation
                        ref={conversationRef}
                        session={session}
                        onMessageChange={handleMessageChange}
                        onRetry={handleLocalRetry}
                        onStreamEnd={() => setScrollLock(false)}
                        onChunk={handleChunk}
                        onSessionChange={setSession}
                        showToast={showToast}
                    >
                        <InsightCard
                            sender="insight"
                            />
                    </Conversation>

                    <div ref={messagesEndRef}/>
                </div>

                <ChatTextArea
                    ref={chatTextAreaRef}
                    className="border-t pl-3 col-span-2"
                    onSend={handleSend}
                    onRetry={handleFullRetry}
                    showToast={showToast}
                />
            </div>
        </div>
    )
}
