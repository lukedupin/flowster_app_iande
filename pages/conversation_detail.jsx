import React, {useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon} from "@heroicons/react/24/outline"
import * as Util from "../../src/helpers/util.js"
import {STATUS, buildDummyConversations, buildDummyMessages, initials} from "../components/dummy_conversations.js"

export const ConversationDetail = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const {id} = useParams()

    const [conversations] = useState(buildDummyConversations)
    const convo = conversations.find(c => c.id === Number(id))

    if (!convo) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Conversation not found.</p>
            </div>
        )
    }

    const messages = buildDummyMessages(convo)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={() => navigate('/i_e/conversation')}
                    className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <div className={Util.classNames(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                    STATUS[convo.status].color
                )}>
                    {initials(convo.name)}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{convo.name}</p>
                    <p className="text-xs text-gray-400">{STATUS[convo.status].label} · {convo.chat_count} chats · {convo.date}</p>
                </div>
            </div>

            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white px-4 py-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={Util.classNames("flex", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={Util.classNames(
                            "max-w-md px-4 py-2 text-sm shadow-sm",
                            msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-tl-sm'
                        )}>
                            <p>{msg.text}</p>
                            <p className={Util.classNames(
                                "mt-1 text-xs",
                                msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                            )}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
