import React, {useEffect, useRef, useState} from 'react'
import {
    XMarkIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftIcon, ChatBubbleOvalLeftEllipsisIcon, QueueListIcon,
    CursorArrowRaysIcon, HeartIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, PencilSquareIcon,
    SparklesIcon, PaperAirplaneIcon, LightBulbIcon, PaperClipIcon,
} from "@heroicons/react/24/outline"
import {getLeadDetail} from "./dummy_lead_details.js"

const INTERACTION_ICON = {
    Like: HeartIcon,
    Comment: ChatBubbleLeftIcon,
    Email: EnvelopeIcon,
    Text: ChatBubbleOvalLeftEllipsisIcon,
    Drip: QueueListIcon,
    Click: CursorArrowRaysIcon,
    Call: PhoneIcon,
    Meeting: CalendarDaysIcon,
}

const FILTERS = [
    {key: 'all', label: 'All'},
    {key: 'note', label: 'Notes'},
    {key: 'success', label: 'Succeeded'},
    {key: 'failed', label: 'Failed'},
]

// Actions that can be attached to a note (mock only, nothing is scheduled). `needs` lists the extra
// fields the tag asks for.
const ATTACH_TYPES = [
    {key: 'pass', label: 'Pass to agent', style: 'bg-violet-100 text-violet-700', needs: ['agent']},
    {key: 'xdate', label: 'X-Date', style: 'bg-amber-100 text-amber-700', needs: ['date']},
    {key: 'call', label: 'Call', style: 'bg-blue-100 text-blue-700', needs: []},
    {key: 'email', label: 'Email', style: 'bg-sky-100 text-sky-700', needs: []},
    {key: 'drip', label: 'Start new drip', style: 'bg-emerald-100 text-emerald-700', needs: ['campaign', 'date']},
    {key: 'follow', label: 'Follow up', style: 'bg-rose-100 text-rose-700', needs: ['date']},
]

const AGENTS = ['Sam Rivera', 'Jordan Lee', 'Alex Kim']

const formatWhen = at => new Date(at).toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})
const formatDay = day => new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})

// Click the text to turn it into a box. Enter or clicking away keeps the change, Escape drops it.
// Mock only: nothing is saved anywhere.
const EditableText = props => {
    const {value, onSave, multiline, type = 'text', format, placeholder, className = ''} = props
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState('')

    const start = () => {
        setDraft(value ?? '')
        setEditing(true)
    }

    const commit = () => {
        setEditing(false)
        if (draft !== (value ?? '')) {
            onSave(draft)
        }
    }

    const handleKey = e => {
        if (e.key === 'Escape') {
            setEditing(false)
        }
        if (e.key === 'Enter' && (!multiline || !e.shiftKey)) {
            e.preventDefault()
            commit()
        }
    }

    if (editing && multiline) {
        return (
            <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKey}
                rows={3}
                className="w-full resize-none rounded-md border border-blue-400 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            />
        )
    }

    if (editing) {
        return (
            <input
                autoFocus
                type={type}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKey}
                className="w-full rounded-md border border-blue-400 px-2 py-0.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
        )
    }

    const shown = value ? (format ? format(value) : value) : null
    return (
        <div
            onClick={start}
            title="Click to edit"
            className={`-mx-1 cursor-text rounded px-1 hover:bg-blue-50 ${className}`}>
            {shown ? shown : <span className="text-gray-300">{placeholder || '—'}</span>}
        </div>
    )
}

// A label with an editable value under it
const Fact = props => {
    const {label, value, onSave, type, format} = props
    return (
        <div>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-900">
                <EditableText value={value === null || value === undefined ? '' : String(value)} onSave={onSave} type={type} format={format} />
            </dd>
        </div>
    )
}

// An attached action, shown like a tag. While the note is being written it has inputs for what it needs and
// an X; once the note is added it is just text.
const AttachmentTag = props => {
    const {attachment, campaigns, onChange, onRemove} = props
    const type = ATTACH_TYPES.find(t => t.key === attachment.type)
    const editable = !!onChange

    return (
        <span className={`inline-flex flex-wrap items-center gap-1.5 rounded-full py-0.5 pl-2.5 text-xs font-medium ${type.style} ${onRemove ? 'pr-1' : 'pr-2.5'}`}>
            {type.label}

            {type.needs.includes('agent') && (editable ? (
                <select
                    value={attachment.agent}
                    onChange={e => onChange({agent: e.target.value})}
                    className="rounded border-0 bg-white/70 py-0 pl-1 pr-6 text-xs focus:ring-1 focus:ring-blue-500">
                    {AGENTS.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            ) : (
                <span className="font-normal">· {attachment.agent}</span>
            ))}

            {type.needs.includes('campaign') && (editable ? (
                <select
                    value={attachment.campaign}
                    onChange={e => onChange({campaign: e.target.value})}
                    className="rounded border-0 bg-white/70 py-0 pl-1 pr-6 text-xs focus:ring-1 focus:ring-blue-500">
                    {campaigns.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            ) : (
                <span className="font-normal">· {attachment.campaign}</span>
            ))}

            {type.needs.includes('date') && (editable ? (
                <input
                    type="date"
                    value={attachment.date}
                    onChange={e => onChange({date: e.target.value})}
                    className={`rounded border-0 bg-white/70 py-0 text-xs focus:ring-1 focus:ring-blue-500 ${attachment.date ? '' : 'ring-1 ring-red-400'}`}
                />
            ) : (
                <span className="font-normal">· {formatDay(attachment.date)}</span>
            ))}

            {onRemove && (
                <button onClick={onRemove} title="Remove" className="rounded-full p-0.5 opacity-60 hover:bg-black/10 hover:opacity-100">
                    <XMarkIcon className="h-3 w-3" />
                </button>
            )}
        </span>
    )
}

export const LeadCommandModal = props => {
    const {lead, column, campaigns, campaignStyle, onClose, onUpdateLead, showToast} = props
    const [filter, setFilter] = useState('all')
    const [draft, setDraft] = useState('')
    const [campaignsOpen, setCampaignsOpen] = useState(false)
    const [attachments, setAttachments] = useState([])
    const [attachMenuOpen, setAttachMenuOpen] = useState(false)

    // Mock edits, kept per lead for as long as the page is open
    const [edits, setEdits] = useState({})
    const [noteStore, setNoteStore] = useState({})

    const feedEndRef = useRef(null)

    useEffect(() => {
        setFilter('all')
        setDraft('')
        setCampaignsOpen(false)
        setAttachments([])
        setAttachMenuOpen(false)
    }, [lead?.id])

    useEffect(() => {
        if (!lead) {
            return
        }
        const onKey = e => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lead, onClose])

    const detail = lead ? getLeadDetail(lead) : null
    const notes = lead ? (noteStore[lead.id] ?? detail.notes) : []
    const noteCount = notes.length

    // The story reads top to bottom, so keep the newest at the bottom, next to the box
    useEffect(() => {
        feedEndRef.current?.scrollIntoView()
    }, [lead?.id, noteCount, filter])

    if (!lead) {
        return null
    }

    const valueOf = field => edits[lead.id]?.[field] ?? detail[field]
    const handleEdit = (field, value) => {
        setEdits(prev => ({...prev, [lead.id]: {...prev[lead.id], [field]: value}}))
    }

    const handleNoteEdit = (note, text) => {
        setNoteStore(prev => ({...prev, [lead.id]: notes.map(n => n === note ? {...n, text} : n)}))
    }

    // A tag can only be added once, and needs its date filled in before the note can go
    const missingDate = attachments.some(a => ATTACH_TYPES.find(t => t.key === a.type).needs.includes('date') && !a.date)
    const canAdd = (draft.trim() || attachments.length > 0) && !missingDate

    const handleAttach = type => {
        setAttachMenuOpen(false)
        if (attachments.some(a => a.type === type)) {
            return
        }
        setAttachments(prev => [...prev, {type, date: '', agent: AGENTS[0], campaign: campaigns[0]}])
    }

    const handleAttachmentChange = (type, patch) => {
        setAttachments(prev => prev.map(a => a.type === type ? {...a, ...patch} : a))
    }

    const handleAddNote = () => {
        if (!canAdd) {
            return
        }
        setNoteStore(prev => ({...prev, [lead.id]: [...notes, {at: new Date().toISOString(), author: 'You', text: draft.trim(), attachments}]}))
        setDraft('')
        setAttachments([])
    }

    const handleToggleCampaign = campaign => {
        if (lead.campaigns.includes(campaign)) {
            onUpdateLead(lead.id, {campaigns: lead.campaigns.filter(c => c !== campaign)})
        }
        else {
            onUpdateLead(lead.id, {campaigns: [...lead.campaigns, campaign]})
        }
    }

    const handleAge = text => {
        const age = parseInt(text, 10)
        onUpdateLead(lead.id, {age: Number.isNaN(age) ? undefined : age})
    }

    // Interactions and notes together are the journey, oldest first
    const interactionCount = detail.interactions.length
    const succeeded = detail.interactions.filter(x => x.outcome === 'success').length
    const failed = detail.interactions.filter(x => x.outcome === 'failed').length

    const journey = [
        ...detail.interactions.map(x => ({...x, kind: 'interaction'})),
        ...notes.map(n => ({...n, kind: 'note', source: n})),
    ]
        .filter(x => {
            if (filter === 'all') {
                return true
            }
            if (filter === 'note') {
                return x.kind === 'note'
            }
            return x.kind === 'interaction' && x.outcome === filter
        })
        .sort((a, b) => new Date(a.at) - new Date(b.at))

    const summary = detail.summary

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />

            <div className="relative flex h-[92vh] w-full max-w-7xl flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                <span className="h-2 w-2 rounded-full" style={{backgroundColor: column.dot}} />
                                {column.name}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {lead.age ? `${lead.age} · ` : ''}{lead.job || 'Occupation unknown'} · {lead.product}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => showToast?.(`Calling ${lead.name} is not wired up yet`)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <PhoneIcon className="h-4 w-4" /> Call
                        </button>
                        <button onClick={() => showToast?.(`Emailing ${lead.name} is not wired up yet`)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <EnvelopeIcon className="h-4 w-4" /> Email
                        </button>
                        <button onClick={() => showToast?.(`Texting ${lead.name} is not wired up yet`)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" /> Text
                        </button>
                        <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
                    {/* Left half: everything we know, click any of it to change it */}
                    <div className="border-b border-gray-200 p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
                        <p className="mb-4 text-xs text-gray-400">Click any value to edit it</p>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
                                <dl className="space-y-2.5">
                                    <Fact label="Name" value={lead.name} onSave={v => onUpdateLead(lead.id, {name: v})} />
                                    <Fact label="Email" value={valueOf('email')} onSave={v => handleEdit('email', v)} />
                                    <Fact label="Phone" value={valueOf('phone')} onSave={v => handleEdit('phone', v)} />
                                    <Fact label="Location" value={valueOf('location')} onSave={v => handleEdit('location', v)} />
                                    <Fact label="Preferred contact" value={valueOf('preferred')} onSave={v => handleEdit('preferred', v)} />
                                    <Fact label="Best time" value={valueOf('best_time')} onSave={v => handleEdit('best_time', v)} />
                                </dl>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">About</p>
                                <dl className="space-y-2.5">
                                    <Fact label="Age" value={lead.age} onSave={handleAge} />
                                    <Fact label="Occupation" value={lead.job} onSave={v => onUpdateLead(lead.id, {job: v})} />
                                    <Fact label="Employer" value={valueOf('employer')} onSave={v => handleEdit('employer', v)} />
                                    <Fact label="Household" value={valueOf('household')} onSave={v => handleEdit('household', v)} />
                                    <Fact label="Came from" value={valueOf('source')} onSave={v => handleEdit('source', v)} />
                                </dl>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Policy</p>
                                <dl className="space-y-2.5">
                                    <Fact label="Product" value={lead.product} onSave={v => onUpdateLead(lead.id, {product: v})} />
                                    <Fact label="Coverage" value={valueOf('coverage')} onSave={v => handleEdit('coverage', v)} />
                                    <Fact label="Premium" value={valueOf('premium')} onSave={v => handleEdit('premium', v)} />
                                    <Fact label="Managed since" value={valueOf('managed_since')} type="date" format={formatDay} onSave={v => handleEdit('managed_since', v)} />
                                    {lead.due && (
                                        <Fact label={lead.due_label} value={lead.due} type="date" format={formatDay} onSave={v => onUpdateLead(lead.id, {due: v})} />
                                    )}
                                </dl>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Campaigns</p>
                                    <button
                                        onClick={() => setCampaignsOpen(prev => !prev)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                                        <PencilSquareIcon className="h-3.5 w-3.5" />
                                        {campaignsOpen ? 'Done' : 'Edit'}
                                    </button>
                                </div>

                                {campaignsOpen ? (
                                    <ul className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-2">
                                        {campaigns.map(campaign => (
                                            <li key={campaign}>
                                                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={lead.campaigns.includes(campaign)}
                                                        onChange={() => handleToggleCampaign(campaign)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${campaignStyle[campaign]}`}>{campaign}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                ) : lead.campaigns.length === 0 ? (
                                    <p className="text-sm text-gray-300">Not on any campaign</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {lead.campaigns.map(campaign => (
                                            <span key={campaign} className={`rounded-full px-2 py-0.5 text-xs font-medium ${campaignStyle[campaign]}`}>{campaign}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right half: the journey, with the box to add to it at the bottom */}
                    <div className="flex min-h-[32rem] flex-col lg:min-h-0">
                        <div className="flex-1 overflow-y-auto">
                            <div className="m-5 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-blue-600">
                                    <SparklesIcon className="h-4 w-4" /> AI summary
                                </p>
                                <p className="text-sm leading-relaxed text-gray-800">{summary.text}</p>

                                <p className="mt-3 text-sm text-gray-900">
                                    <span className="font-semibold">Best next action: </span>{summary.action}
                                </p>

                                <div className="mt-3">
                                    <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-500">
                                        <LightBulbIcon className="h-3.5 w-3.5" /> Bring up
                                    </p>
                                    <ul className="space-y-1">
                                        {summary.bring_up.map(point => (
                                            <li key={point} className="flex gap-2 text-sm text-gray-700">
                                                <span className="text-blue-400">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-y border-gray-200 bg-white px-5 py-2.5">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-semibold text-gray-900">Journey</span>
                                    <span className="text-xs text-gray-400">{interactionCount} interactions</span>
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircleIcon className="h-4 w-4" /> {succeeded}</span>
                                    <span className="inline-flex items-center gap-1 text-xs text-red-600"><XCircleIcon className="h-4 w-4" /> {failed}</span>
                                </div>

                                <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                                    {FILTERS.map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setFilter(f.key)}
                                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ul className="space-y-4 p-5">
                                {journey.length === 0 && (
                                    <li className="py-10 text-center text-sm text-gray-400">Nothing here</li>
                                )}
                                {journey.map((item, idx) => {
                                    if (item.kind === 'note') {
                                        return (
                                            <li key={`n${idx}`} className="flex items-start gap-3">
                                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                                                    <EditableText
                                                        multiline
                                                        value={item.text}
                                                        onSave={text => handleNoteEdit(item.source, text)}
                                                        className="whitespace-pre-wrap text-sm text-gray-800"
                                                    />
                                                    {item.attachments?.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {item.attachments.map(a => (
                                                                <AttachmentTag key={a.type} attachment={a} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="mt-1.5 text-xs text-gray-400">Note · {item.author} · {formatWhen(item.at)}</p>
                                                </div>
                                            </li>
                                        )
                                    }

                                    const Icon = INTERACTION_ICON[item.type] || ChatBubbleLeftIcon
                                    const ok = item.outcome === 'success'
                                    return (
                                        <li key={`i${idx}`} className="flex items-start gap-3">
                                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                    <span className="text-sm font-medium text-gray-900">{item.summary}</span>
                                                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {ok ? 'Succeeded' : 'Failed'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">{item.type} · {formatWhen(item.at)}</p>
                                                {item.from && (
                                                    <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                                                        <span className={`rounded px-1.5 py-0.5 ${item.from.drip ? campaignStyle[item.from.drip] : 'bg-gray-100 text-gray-600'}`}>
                                                            <span className="opacity-60">Drip </span>{item.from.drip || 'None, done by hand'}
                                                        </span>
                                                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
                                                            <span className="opacity-60">Funnel </span>{item.from.funnel}
                                                        </span>
                                                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
                                                            <span className="opacity-60">Touch point </span>{item.from.touch}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.reason && (
                                                    <p className="mt-1 text-sm text-red-600">{item.reason}</p>
                                                )}
                                                {item.text && (
                                                    <p className="mt-1 whitespace-pre-wrap border-l-2 border-gray-300 pl-3 text-sm text-gray-600">{item.text}</p>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                                <li ref={feedEndRef} />
                            </ul>
                        </div>

                        <div className="border-t border-gray-200 p-4">
                            {attachments.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                    {attachments.map(a => (
                                        <AttachmentTag
                                            key={a.type}
                                            attachment={a}
                                            campaigns={campaigns}
                                            onChange={patch => handleAttachmentChange(a.type, patch)}
                                            onRemove={() => setAttachments(prev => prev.filter(x => x.type !== a.type))}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setAttachMenuOpen(prev => !prev)}
                                        title="Attach an action to this note"
                                        className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                        <PaperClipIcon className="h-4 w-4" /> Attach
                                    </button>

                                    {attachMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setAttachMenuOpen(false)} />
                                            <ul className="absolute bottom-full left-0 z-20 mb-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                                {ATTACH_TYPES.map(t => (
                                                    <li key={t.key}>
                                                        <button
                                                            onClick={() => handleAttach(t.key)}
                                                            disabled={attachments.some(a => a.type === t.key)}
                                                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300">
                                                            <span className={`h-2 w-2 rounded-full ${t.style}`} />
                                                            {t.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>

                            <textarea
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleAddNote()
                                    }
                                }}
                                rows={2}
                                placeholder={`Add to ${lead.name.split(' ')[0]}'s journey...`}
                                className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={!canAdd}
                                title={missingDate ? 'Pick a date for the attached action' : undefined}
                                className="inline-flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
                                <PaperAirplaneIcon className="h-4 w-4" /> Add
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
