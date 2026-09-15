import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom"
import * as Util from "../../src/helpers/util.js"
import {useStore} from "../../src/store.js"
import {Pagination} from "../../src/components/pagination.jsx"
import {STATUS, initials} from "./dummy_conversations.js"

const PER_PAGE_OPTIONS = [10, 50, 100]

const statusFor = (label) => Object.values(STATUS).find(s => s.label === label) || {label: label || 'Unknown', color: 'bg-gray-400'}

const buildContextMarkdown = (conversations) => {
    const statusCounts = {}
    for (const convo of conversations) {
        const label = convo.profile?.status || 'Unknown'
        statusCounts[label] = (statusCounts[label] || 0) + 1
    }

    const lines = [
        '# Conversations',
        '',
        `**Total conversations:** ${conversations.length}`,
        '',
        '## By Status',
        ...Object.entries(statusCounts).map(([label, count]) => `- ${label}: ${count}`),
        '',
        '## Conversations',
        ...conversations.map(convo =>
            `- ${convo.profile?.name || 'Unknown'} (${convo.profile?.status || 'Unknown'}, ${convo.conversation.length} messages, `
            + `${new Date(convo.created_on).toLocaleDateString()}): ${convo.summary}`
        ),
    ]

    return lines.join('\n')
}

export const ConversationCard = props => {
    const {showToast} = props
    const onContextChange = props.onContextChange || (() => {})
    const navigate = useNavigate()
    const setSelectedConversation = useStore(state => state.setSelectedConversation)

    const [conversations, setConversations] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0])

    useEffect(() => {
        Util.fetch_js('/api/iande/conversations', {page, per_page: perPage}, js => {
            setConversations(js.conversations)
            setTotal(js.total)
        }, showToast)
    }, [page, perPage])

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
                        className="w-36 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {PER_PAGE_OPTIONS.map(n => (
                            <option key={n} value={n}>{n} per page</option>
                        ))}
                    </select>
                </div>

                <ul role="list" className="divide-y divide-gray-200">
                    {conversations.map(convo => {
                        const status = statusFor(convo.profile?.status)

                        return (
                            <li key={convo.uid}
                                className="flex items-center gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    setSelectedConversation(convo)
                                    navigate(`/i_e/conversation/${convo.uid}`)
                                }}>
                                <div className={Util.classNames(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                                    status.color
                                )}>
                                    {initials(convo.profile?.name || '?')}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{convo.profile?.name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500 truncate">{convo.summary}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {convo.conversation.length} messages · {new Date(convo.created_on).toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>

                <Pagination
                    page={page}
                    per_page={perPage}
                    total={total}
                    onPage={setPage}
                />
            </div>
        </div>
    )
}
