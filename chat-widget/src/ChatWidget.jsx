import { useState, useEffect, useRef } from 'react'
import { MessageCircleMore, X, Send } from 'lucide-react'
import * as Util from "../../../../src/helpers/util.js"

import { marked } from 'marked';
//import 'github-markdown-css/github-markdown.css';
import 'github-markdown-css/github-markdown-light.css';
import {Conversation} from "../../../../src/components/conversation.jsx";
import {useHeaderInView} from "./header_in_view.jsx";
//import {InsightCard} from "../../index.jsx";
import {DEFAULT_CONFIG} from "./config.jsx";

// Main Chat Widget Component
export const ChatWidget = props => {
    // Configuration with defaults
    const CONFIG = {
        apiUrl: props.apiUrl || DEFAULT_CONFIG.apiUrl,
        welcomeMessage: props.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
        title: props.title || DEFAULT_CONFIG.title,
        position: props.position || DEFAULT_CONFIG.position,
        icon: props.icon || DEFAULT_CONFIG.icon,
        bounce: props.bounce !== undefined ? props.bounce : DEFAULT_CONFIG.bounce,
    }

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingMessageId, setStreamingMessageId] = useState(null)
    const [session, setSession] = useState(null)
    const [scrollLock, setScrollLock] = useState(false)
    const [suggestions, setSuggestions] = useState([])

    const messagesEndRef = useRef(null)
    const abortControllerRef = useRef(null)
    const conversationRef = useRef(null)
    const headerCountRef = useRef(0)
    const [isBouncing, setIsBouncing] = useState(false)

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useHeaderInView((header) => {
        const text = header.textContent.trim()
        const trimmed = text?.length > 30 ? `${text.slice(0, 30)}…` : text
        const newItem = {title: trimmed, header: text}
        setSuggestions(prev => {
            if (prev.some(s => s.title === trimmed)) {
                return prev
            }
            return [newItem, ...(prev.length >= 3 ? prev.slice(0, 2) : prev)]
        })

        if (CONFIG.bounce && !isOpen) {
            headerCountRef.current += 1
            if (headerCountRef.current % 10 === 0) {
                setIsBouncing(prev => {
                    if ( !prev ) {
                        setTimeout(() => setIsBouncing(false), 1500)
                    }
                    return true
                })
            }
        }
    })

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const handleBoot = () => {
        conversationRef.current.handleSend("Hello", null, null, CONFIG.apiUrl + "/run_script?first=true&article_url=" + encodeURIComponent(window.location.href))
    }

    const addMessage = (sender, text, id = null) => {
        const messageId = id || Date.now() + Math.random()
        const newMessage = {
            sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: messageId,
            isStreaming: false,
        }
        setMessages(prev => [...prev, newMessage])
        return messageId
    }

    const updateStreamingMessage = (messageId, text) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, text, isStreaming: true }
                : msg
        ))
    }

    const finalizeStreamingMessage = (messageId) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? {
                        ...msg,
                        isStreaming: false,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                : msg
        ))
    }

    const showToast = x => {
        console.log(X)
    }

    const handleSendMessage = (text) => {
        if ( text === null || text === undefined ) {
            text = inputValue.trim()
        }
        if (!text || isStreaming) {
            return
        }

        addMessage('user', text)
        setInputValue('')
        setScrollLock(true)

        //sendMessageSSE(text)
        console.log(window.location.href)
        console.log(encodeURIComponent(window.location.href))
        conversationRef.current.handleSend(text, null, null, CONFIG.apiUrl + "/run_script?article_url=" + encodeURIComponent(window.location.href))
    }

    window.flowsterSendMessage = (msg) => {
        if (!msg.trim() || isStreaming) return

        const text = msg.trim()
        addMessage('user', text)
        setInputValue('')

        //sendMessageSSE(text)
        conversationRef.current.handleSend(text, null, null, CONFIG.apiUrl + "/run_script?article_url=" + encodeURIComponent(window.location.href))
        setIsOpen(true)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleToggleChat = () => {
        setIsOpen(!isOpen)
        if (!isOpen && messages.length === 0) {
            setTimeout(() => {
                addMessage('bot', CONFIG.welcomeMessage)
            }, 300)
        }
    }

    const handleMessageChange = (messages) => {
        if (scrollLock) {
            scrollToBottom()
        }

        if (messages.length > 8) {
            conversationRef.current.setMessages(prev => prev.slice(-8))
        }
    }

    const handleChunk = (chunk) => {
        if (chunk.type === "memory") {
            //const { memory, current_section } = chunk.content
            //const merge = (current_section === currentSection)
            //setCurrentSection( current_section )
        }
    }

    const handleSuggestion = (sug) => {
        handleSendMessage(`Describe ${sug}`)
    }

    const positionClasses = CONFIG.position === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'

    return (
        <div className={Util.classNames("fixed bottom-0 z-[9999] p-4 sm:p-12 sm:pb-4", positionClasses)}>
            {/* Chat Toggle Button */}
            <button
                onClick={handleToggleChat}
                className={Util.classNames("w-14 h-14 sm:w-24 sm:h-24 rounded-full ring ring-2 ring-gray-200 bg-white text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center", isBouncing && "custom-bounce")}
                aria-label="Toggle chat"
            >
                {isOpen
                    ? <X size={24} />
                    : CONFIG.icon
                        ? CONFIG.icon.trimStart().startsWith('<')
                            ? <span className='size-8 sm:size-14 flex items-center justify-center' dangerouslySetInnerHTML={{ __html: CONFIG.icon }} />
                            : <img src={CONFIG.icon} className='size-8 sm:size-14 object-contain' alt="" />
                        : <MessageCircleMore className='size-8 sm:size-14 text-blue-400' />
                }
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-10 ${positionClasses} w-[calc(100vw-2rem)] sm:w-[48vw] h-[calc(100vh-5rem)] sm:h-[52rem] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{CONFIG.title}</h3>
                            </div>
                            <button
                                onClick={handleToggleChat}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        <Conversation
                            ref={conversationRef}
                            session={session}
                            hide_advanced={true}
                            onMessageChange={handleMessageChange}
                            onStreamEnd={() => setScrollLock(false)}
                            onChunk={handleChunk}
                            onSessionChange={setSession}
                            onBoot={handleBoot}
                            showToast={showToast}
                        >
                            {/*}
                            <InsightCard
                                sender="insight"
                            />
                            {*/}
                        </Conversation>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        {suggestions.length > 0 && (
                            <div className="w-full inline-flex gap-6 pl-2 pb-4 flex-wrap">
                                {suggestions.map((action, i) => (
                                    <div key={`suggy_${i}`}
                                         onClick={() => handleSuggestion(action.header)}
                                        className="rounded-md px-2 py-1 font-medium ring-1 ring-inset cursor-pointer bg-blue-50 text-blue-700 ring-blue-700/10">
                                        {action.title}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isStreaming}
                                className="flex-1 pl-5 pr-4 py-3 bg-gray-100 text-sm border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim() || isStreaming}
                                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 text-white flex items-center justify-center hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
