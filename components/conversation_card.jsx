import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom"
import * as Util from "../../src/helpers/util.js"
import {Pagination, paginateArray} from "../../src/components/pagination.jsx"
import {STATUS, buildDummyConversations, initials} from "./dummy_conversations.js"

const PER_PAGE_OPTIONS = [10, 25, 50]

const buildContextMarkdown = (conversations) => {
    const statusCounts = {}
    for (const convo of conversations) {
        statusCounts[convo.status] = (statusCounts[convo.status] || 0) + 1
    }

    const lines = [
        '# Conversations',
        '',
        `**Total conversations:** ${conversations.length}`,
        '',
        '## By Status',
        ...Object.entries(statusCounts).map(([status, count]) => `- ${STATUS[status]?.label || status}: ${count}`),
        '',
        '## Conversations',
        ...conversations.map(convo =>
            `- ${convo.name} (${STATUS[convo.status]?.label || convo.status}, ${convo.chat_count} chats, ${convo.date}): ${convo.summary}`
        ),
    ]

    return lines.join('\n')
}

export const ConversationCard = props => {
    const {showToast} = props
    const onContextChange = props.onContextChange || (() => {})
    const navigate = useNavigate()
    const [conversations] = useState(buildDummyConversations)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0])

    const page_conversations = paginateArray(conversations, page, perPage)

    useEffect(() => {
        onContextChange(buildContextMarkdown(conversations))
    }, [conversations])

    const handlePerPageChange = e => {
        setPerPage(Number(e.target.value))
        setPage(1)
    }

    return (
        <div className="flex group justify-start sm:pr-12">
            <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-6">
                    <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>

                    <select
                        value={perPage}
                        onChange={handlePerPageChange}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {PER_PAGE_OPTIONS.map(n => (
                            <option key={n} value={n}>{n} per page</option>
                        ))}
                    </select>
                </div>

                <ul role="list" className="divide-y divide-gray-200">
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
                    per_page={perPage}
                    total={conversations.length}
                    onPage={setPage}
                />
            </div>
        </div>
    )
}
