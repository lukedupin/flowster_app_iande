import React, {useEffect, useState} from 'react'
import {PencilSquareIcon} from "@heroicons/react/24/outline"
import * as Util from "../../src/helpers/util.js"
import {Pagination} from "../../src/components/pagination.jsx"

const PER_PAGE = 25

// Groups a flat [user, assistant, user, assistant, ...] message list into [user, assistant] pairs
const buildPairs = (messages) => {
    const pairs = []
    for (let i = 0; i < messages.length; i += 2) {
        pairs.push([messages[i], messages[i + 1]])
    }
    return pairs
}

const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], {type: mimeType})
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const TrainingPage = props => {
    const {showToast} = props

    const [conversations, setConversations] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [selectedPairs, setSelectedPairs] = useState({})
    const [editedPairs, setEditedPairs] = useState({})
    const [editing, setEditing] = useState(null)
    const [editDraft, setEditDraft] = useState({user: '', assistant: ''})

    useEffect(() => {
        Util.fetch_js('/api/iande/conversations', {page, per_page: PER_PAGE}, js => {
            setConversations(js.conversations)
            setTotal(js.total)
            setSelectedPairs(prev => {
                const next = {...prev}
                js.conversations.forEach(convo => {
                    if (next[convo.uid]) {
                        return
                    }
                    const pairs = buildPairs(convo.conversation || [])
                    next[convo.uid] = Object.fromEntries(pairs.map((_, idx) => [idx, true]))
                })
                return next
            })
        }, showToast)
    }, [page])

    const getPairText = (uid, idx, pair) => {
        const override = editedPairs[uid]?.[idx]
        return {
            user: override?.user ?? pair[0]?.text ?? '',
            assistant: override?.assistant ?? pair[1]?.text ?? '',
        }
    }

    const handleTogglePair = (uid, idx) => {
        setSelectedPairs(prev => ({
            ...prev,
            [uid]: {...prev[uid], [idx]: !prev[uid]?.[idx]},
        }))
    }

    const handleToggleAll = (uid, pairs) => {
        setSelectedPairs(prev => {
            const current = prev[uid] || {}
            const allSelected = pairs.every((_, idx) => current[idx])
            return {...prev, [uid]: Object.fromEntries(pairs.map((_, idx) => [idx, !allSelected]))}
        })
    }

    const handleEditStart = (uid, idx, pair) => {
        setEditDraft(getPairText(uid, idx, pair))
        setEditing({uid, idx})
    }

    const handleConfirmEdit = () => {
        const {uid, idx} = editing
        setEditedPairs(prev => ({
            ...prev,
            [uid]: {...prev[uid], [idx]: {...editDraft}},
        }))
        setEditing(null)
    }

    const handleRevertEdit = () => {
        setEditing(null)
    }

    const handleDownload = () => {
        const lines = conversations.flatMap(convo => {
            const pairs = buildPairs(convo.conversation || [])

            return pairs
                .map((pair, idx) => [pair, idx])
                .filter(([pair, idx]) => pair[0] && pair[1] && selectedPairs[convo.uid]?.[idx])
                .map(([pair, idx]) => {
                    const text = getPairText(convo.uid, idx, pair)
                    return JSON.stringify({
                        messages: [
                            {role: 'user', content: text.user},
                            {role: 'assistant', content: text.assistant},
                        ],
                    })
                })
        })

        downloadFile(lines.join('\n'), 'training_conversations.jsonl', 'application/jsonl')
        showToast?.('Downloaded', 'success')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Make Training Data</h2>
                    <p className="text-xs text-gray-400">Pick which request/response pairs to include</p>
                </div>

                <button
                    onClick={handleDownload}
                    className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                    Download
                </button>
            </div>

            <div className="mx-4 sm:mx-6 space-y-4 pb-8">
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200">
                    {conversations.map(convo => {
                        const pairs = buildPairs(convo.conversation || [])

                        return (
                            <React.Fragment key={convo.uid}>
                                <div
                                    onClick={() => handleToggleAll(convo.uid, pairs)}
                                    className="px-4 py-1.5 cursor-pointer hover:bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-900">{convo.profile?.name || 'Unknown'}</p>
                                </div>

                                {pairs.map((pair, idx) => {
                                    const isEditing = editing?.uid === convo.uid && editing?.idx === idx
                                    const text = getPairText(convo.uid, idx, pair)
                                    const isSelected = !!selectedPairs[convo.uid]?.[idx]

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => !isEditing && handleTogglePair(convo.uid, idx)}
                                            className={Util.classNames(
                                                "flex items-start gap-3 px-4 py-3",
                                                isEditing ? "" : "cursor-pointer",
                                                isSelected ? "bg-blue-50" : "bg-white opacity-50"
                                            )}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleTogglePair(convo.uid, idx)}
                                                onClick={e => e.stopPropagation()}
                                                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />

                                            {isEditing ? (
                                                <div className="min-w-0 flex-1 space-y-2" onClick={e => e.stopPropagation()}>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
                                                        <textarea
                                                            value={editDraft.user}
                                                            onChange={e => setEditDraft(prev => ({...prev, user: e.target.value}))}
                                                            rows={2}
                                                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Assistant</label>
                                                        <textarea
                                                            value={editDraft.assistant}
                                                            onChange={e => setEditDraft(prev => ({...prev, assistant: e.target.value}))}
                                                            rows={2}
                                                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleRevertEdit}
                                                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                                            Revert
                                                        </button>
                                                        <button
                                                            onClick={handleConfirmEdit}
                                                            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500">
                                                            Confirm
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="text-sm text-gray-900"><span className="font-semibold">User:</span> {text.user}</p>
                                                    <p className="text-sm text-gray-600"><span className="font-semibold">Assistant:</span> {text.assistant}</p>
                                                </div>
                                            )}

                                            {!isEditing &&
                                            <button
                                                onClick={e => { e.stopPropagation(); handleEditStart(convo.uid, idx, pair) }}
                                                className="shrink-0 text-gray-400 hover:text-gray-600">
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            }
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                </div>

                <Pagination
                    page={page}
                    per_page={PER_PAGE}
                    total={total}
                    onPage={setPage}
                />
            </div>
        </div>
    )
}
