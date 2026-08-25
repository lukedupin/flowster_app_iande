import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon, LinkIcon} from "@heroicons/react/24/outline"
import * as Util from "../../src/helpers/util.js"
import {MarkdownViewer} from "../../src/components/markdown_viewer.jsx"
import {ContextUrlModal} from "../components/context_url_modal.jsx"

export const ContextDetail = props => {
    const {contexts, showToast} = props
    const onUpdate = props.onUpdate || (() => {})
    const navigate = useNavigate()
    const {id} = useParams()

    const context = contexts.find(c => c.id === Number(id))

    const [title, setTitle] = useState(context?.title || '')
    const [key, setKey] = useState(context?.key || '')
    const [content, setContent] = useState(context?.content || '')
    const [url, setUrl] = useState(context?.url || '')
    const [mode, setMode] = useState('preview')
    const [urlModalOpen, setUrlModalOpen] = useState(false)

    useEffect(() => {
        setTitle(context?.title || '')
        setKey(context?.key || '')
        setContent(context?.content || '')
        setUrl(context?.url || '')
    }, [context?.id])

    if (!context) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Context not found.</p>
            </div>
        )
    }

    const dirty = content !== context.content || title !== context.title || key !== context.key || url !== (context.url || '')

    const handleSave = () => {
        onUpdate(context.id, {title, key, content, url})
        showToast?.('Saved', 'success')
    }

    const handleUrlSave = new_url => {
        setUrl(new_url)
        setUrlModalOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={() => navigate('/i_e/contexts')}
                    className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setUrlModalOpen(true)}
                        className={Util.classNames(
                            "inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium",
                            url ? "border-blue-300 text-blue-600 hover:bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}>
                        <LinkIcon className="h-4 w-4" />
                        URL
                    </button>

                    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-sm">
                        <button
                            onClick={() => setMode('preview')}
                            className={Util.classNames(
                                "px-3 py-2 font-medium",
                                mode === 'preview' ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                            )}>
                            Preview
                        </button>
                        <button
                            onClick={() => setMode('edit')}
                            className={Util.classNames(
                                "px-3 py-2 font-medium border-l border-gray-300",
                                mode === 'edit' ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                            )}>
                            Edit
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!dirty}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        Save
                    </button>
                </div>
            </div>

            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 pt-4 pb-4 border-b border-gray-200 space-y-4">
                    {mode === 'edit' ? (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Key</label>
                                <input
                                    type="text"
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    placeholder="key"
                                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-mono text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-900">{title}</p>
                            <p className="text-xs text-gray-400 font-mono">{key}</p>
                        </>
                    )}
                </div>

                {mode === 'preview' ? (
                    <div className="px-4 pb-4">
                        <MarkdownViewer content={content} showToast={showToast} />
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={20}
                        placeholder="Write markdown..."
                        className="w-full p-4 text-sm font-mono border-0 focus:ring-0 resize-y"
                    />
                )}
            </div>

            <ContextUrlModal
                open={urlModalOpen}
                url={url}
                onClose={() => setUrlModalOpen(false)}
                onSave={handleUrlSave}
            />
        </div>
    )
}
