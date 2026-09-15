import React, {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon, PencilSquareIcon} from "@heroicons/react/24/outline"
import * as Util from "../../src/helpers/util.js"
import {useStore} from "../../src/store.js"

// Groups a flat [user, assistant, user, assistant, ...] message list into
// [user, assistant] pairs -- these are what training mode lets you pick from.
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

export const TrainingConversationPage = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const {id: uid} = useParams()

    const selectedConversation = useStore(state => state.selected_conversation)
    const setSelectedConversation = useStore(state => state.setSelectedConversation)

    const [convo, setConvo] = useState(selectedConversation?.uid === uid ? selectedConversation : null)
    const [loading, setLoading] = useState(!(selectedConversation?.uid === uid))

    useEffect(() => {
        if (selectedConversation?.uid === uid) {
            setConvo(selectedConversation)
            setLoading(false)
            return
        }

        setLoading(true)
        Util.fetch_js('/api/iande/conversation', {uid}, js => {
            setSelectedConversation(js.conversation)
            setConvo(js.conversation)
            setLoading(false)
        }, () => {
            setConvo(null)
            setLoading(false)
        })
    }, [uid])

    const messages = convo?.conversation || []
    const pairs = useMemo(() => buildPairs(messages), [convo?.uid])

    const [selectedPairs, setSelectedPairs] = useState({})
    const [editedPairs, setEditedPairs] = useState({})
    const [editingIdx, setEditingIdx] = useState(null)
    const [editDraft, setEditDraft] = useState({user: '', assistant: ''})

    useEffect(() => {
        setSelectedPairs(Object.fromEntries(pairs.map((_, idx) => [idx, true])))
        setEditedPairs({})
        setEditingIdx(null)
    }, [convo?.uid])

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        )
    }

    if (!convo) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Conversation not found.</p>
            </div>
        )
    }

    const getPairText = (idx, pair) => {
        const override = editedPairs[idx]
        return {
            user: override?.user ?? pair[0]?.text ?? '',
            assistant: override?.assistant ?? pair[1]?.text ?? '',
        }
    }

    const handleTogglePair = (idx) => {
        setSelectedPairs(prev => ({...prev, [idx]: !prev[idx]}))
    }

    const handleEditStart = (idx, pair) => {
        setEditDraft(getPairText(idx, pair))
        setEditingIdx(idx)
    }

    const handleConfirmEdit = () => {
        setEditedPairs(prev => ({...prev, [editingIdx]: {...editDraft}}))
        setEditingIdx(null)
    }

    const handleRevertEdit = () => {
        setEditingIdx(null)
    }

    const handleCancel = () => {
        navigate(`/i_e/conversation/${uid}`)
    }

    const handleDownload = () => {
        const lines = pairs
            .map((pair, idx) => [pair, idx])
            .filter(([, idx]) => selectedPairs[idx])
            .map(([pair, idx]) => {
                const text = getPairText(idx, pair)
                return JSON.stringify({
                    messages: [
                        {role: 'user', content: text.user},
                        {role: 'assistant', content: text.assistant},
                    ],
                })
            })

        downloadFile(lines.join('\n'), `training_${uid}.jsonl`, 'application/jsonl')
        showToast?.('Downloaded', 'success')
        navigate(`/i_e/conversation/${uid}`)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Make Training Data</h2>
                    <p className="text-xs text-gray-400">{convo.profile?.name || 'Unknown'}</p>
                </div>
            </div>

            <div className="mx-4 sm:mx-6 space-y-4 pb-8">
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200">
                    {pairs.map((pair, idx) => {
                        const editing = editingIdx === idx
                        const text = getPairText(idx, pair)

                        return (
                            <div
                                key={idx}
                                onClick={() => !editing && handleTogglePair(idx)}
                                className={Util.classNames(
                                    "flex items-start gap-3 px-4 py-3",
                                    editing ? "" : "cursor-pointer",
                                    selectedPairs[idx] ? "bg-blue-50" : "bg-white opacity-50"
                                )}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedPairs[idx]}
                                    onChange={() => handleTogglePair(idx)}
                                    onClick={e => e.stopPropagation()}
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                {editing ? (
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

                                {!editing &&
                                <button
                                    onClick={e => { e.stopPropagation(); handleEditStart(idx, pair) }}
                                    className="shrink-0 text-gray-400 hover:text-gray-600">
                                    <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                }
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCancel}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}
