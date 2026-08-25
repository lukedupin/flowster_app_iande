import React, {useState} from 'react'
import {useNavigate} from "react-router-dom"
import * as Util from "../../src/helpers/util.js"
import {Pagination, paginateArray} from "../../src/components/pagination.jsx"
import {STATUS, buildDummyConversations, initials} from "../components/dummy_conversations.js"

const PER_PAGE = 10

export const ConversationPage = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const [conversations] = useState(buildDummyConversations)
    const [page, setPage] = useState(1)

    const page_conversations = paginateArray(conversations, page, PER_PAGE)

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Conversations</h2>

            <ul role="list" className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden mx-4 sm:mx-6">
                {page_conversations.map(convo => (
                    <li key={convo.id}
                        className="flex items-center gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/i_e/conversation/${convo.id}`)}>
                        <div className={Util.classNames(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                            STATUS[convo.status].color
                        )}>
                            {initials(convo.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{convo.name}</p>
                            <p className="text-sm text-gray-500 truncate">{convo.summary}</p>
                            <p className="text-xs text-gray-400 mt-1">{convo.chat_count} chats · {convo.date}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <Pagination
                page={page}
                per_page={PER_PAGE}
                total={conversations.length}
                onPage={setPage}
            />
        </div>
    )
}
