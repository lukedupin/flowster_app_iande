import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom"
import {PlusIcon} from "@heroicons/react/24/outline"
import * as Util from "../../src/helpers/util.js"
import {ContextCreateModal} from "../components/context_create_modal.jsx"
import {formatLength} from "../components/format_size.js"
import {makeUniqueKey} from "../components/dummy_contexts.js"

export const ContextsPage = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const [contexts, setContexts] = useState([])
    const [createOpen, setCreateOpen] = useState(false)

    useEffect(() => {
        Util.fetch_js('/api/iande/contexts', {}, js => {
            setContexts(js.contexts)
        }, showToast)
    }, [])

    const handleCreate = title => {
        const key = makeUniqueKey(title, contexts)

        Util.fetch_js('/api/iande/context/create', {title, key, content: ''}, js => {
            setContexts(prev => [...prev, js.context])
            setCreateOpen(false)
            navigate(`/i_e/contexts/${js.context.id}`)
        }, showToast)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Contexts</h2>

                <button
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="h-4 w-4" />
                    Create
                </button>
            </div>

            <ul role="list" className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden mx-4 sm:mx-6">
                {contexts.map(ctx => (
                    <li key={ctx.id}
                        className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/i_e/contexts/${ctx.id}`)}>
                        <p className="text-sm font-medium text-gray-900 truncate">{ctx.title}</p>
                        <span className="shrink-0 text-xs text-gray-400">{formatLength(ctx.content.length)}</span>
                    </li>
                ))}
            </ul>

            <ContextCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    )
}
