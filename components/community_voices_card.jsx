import React, {useState} from 'react'
import {XMarkIcon, FilmIcon, DocumentTextIcon, EnvelopeIcon, Bars3Icon} from "@heroicons/react/24/outline"

// Topics pulled out of community voices (comments, DMs, replies). Static placeholder data.
const TOPICS = [
    {id: 't1', name: 'Term vs whole life', mentions: 184, color: '#60a5fa',
        quote: '"Is term really cheaper long run?"',
        snippet: 'Break down term vs whole life using the exact cost questions families ask us.'},
    {id: 't2', name: 'Affordability', mentions: 143, color: '#34d399',
        quote: '"We just can\'t afford another monthly bill."',
        snippet: 'Show real monthly premium ranges and where people trim cost without losing coverage.'},
    {id: 't3', name: 'Trusts & probate', mentions: 112, color: '#a78bfa',
        quote: '"Does this apply if the house is in a trust?"',
        snippet: 'Explain how a trust changes the probate timeline and what still goes through court.'},
    {id: 't4', name: 'Funeral costs', mentions: 97, color: '#f59e0b',
        quote: '"My dad passed and we had no plan at all."',
        snippet: 'Walk through what a funeral actually costs and how final expense coverage handles it.'},
    {id: 't5', name: 'Beneficiaries', mentions: 88, color: '#f472b6',
        quote: '"I never updated mine after getting married."',
        snippet: 'Remind viewers to review beneficiaries after major life events.'},
    {id: 't6', name: 'Online will vs lawyer', mentions: 71, color: '#22d3ee',
        quote: '"Do I need a lawyer or can I do a will online?"',
        snippet: 'Cover when an online will works and three situations where it does not.'},
    {id: 't7', name: 'Business owners', mentions: 54, color: '#fb923c',
        quote: '"We just closed our seed round."',
        snippet: 'Cover key-person coverage and buy-sell basics for founders.'},
    {id: 't8', name: 'Medical exams', mentions: 39, color: '#94a3b8',
        quote: '"Do I need a physical to qualify?"',
        snippet: 'Clear up what no-exam policies really mean for price and approval.'},
]

// Finance influencers whose audiences we listen to. Static placeholder data. A category can show up
// under more than one channel, `count` is how many times it came up in that channel's comments.
const CHANNELS = [
    {id: 'c1', name: 'Caleb Hammer', initials: 'CH', color: '#ef4444', videos: 14, comments: 8420, moods: [
        {name: 'Frustrated', pct: 24, color: '#ef4444'},
        {name: 'Anxious', pct: 19, color: '#f97316'},
        {name: 'Skeptical', pct: 16, color: '#f59e0b'},
        {name: 'Overwhelmed', pct: 14, color: '#a78bfa'},
        {name: 'Hopeful', pct: 13, color: '#34d399'},
        {name: 'Curious', pct: 9, color: '#60a5fa'},
        {name: 'Grateful', pct: 5, color: '#10b981'},
    ], categories: [
        {topic: 't2', count: 62},
        {topic: 't5', count: 18},
        {topic: 't4', count: 11},
    ]},
    {id: 'c2', name: 'Graham Stephan', initials: 'GS', color: '#3b82f6', videos: 22, comments: 12960, moods: [
        {name: 'Curious', pct: 28, color: '#60a5fa'},
        {name: 'Skeptical', pct: 20, color: '#f59e0b'},
        {name: 'Hopeful', pct: 18, color: '#34d399'},
        {name: 'Grateful', pct: 12, color: '#10b981'},
        {name: 'Anxious', pct: 10, color: '#f97316'},
        {name: 'Frustrated', pct: 8, color: '#ef4444'},
        {name: 'Overwhelmed', pct: 4, color: '#a78bfa'},
    ], categories: [
        {topic: 't1', count: 71},
        {topic: 't2', count: 44},
        {topic: 't7', count: 21},
    ]},
    {id: 'c3', name: 'Andrei Jikh', initials: 'AJ', color: '#10b981', videos: 17, comments: 6310, moods: [
        {name: 'Curious', pct: 31, color: '#60a5fa'},
        {name: 'Hopeful', pct: 22, color: '#34d399'},
        {name: 'Skeptical', pct: 15, color: '#f59e0b'},
        {name: 'Grateful', pct: 14, color: '#10b981'},
        {name: 'Overwhelmed', pct: 9, color: '#a78bfa'},
        {name: 'Anxious', pct: 6, color: '#f97316'},
        {name: 'Frustrated', pct: 3, color: '#ef4444'},
    ], categories: [
        {topic: 't1', count: 40},
        {topic: 't3', count: 33},
        {topic: 't6', count: 28},
        {topic: 't8', count: 17},
    ]},
]

const INITIAL_DRAFTS = [
    {id: 'd1', type: 'Video script', title: 'Pre-roll: What families ask us most', icon: FilmIcon, topics: ['t1', 't2']},
    {id: 'd2', type: 'Blog post', title: 'Estate planning questions, answered', icon: DocumentTextIcon, topics: ['t3']},
    {id: 'd3', type: 'Email drip', title: 'Final expense: step 1', icon: EnvelopeIcon, topics: []},
]

const topicById = id => TOPICS.find(t => t.id === id)

const TopicChip = props => {
    const {topic, count, onRemove, draggable = true, compact} = props

    return (
        <span
            draggable={draggable}
            onDragStart={e => {
                e.dataTransfer.setData('text/plain', topic.id)
                e.dataTransfer.effectAllowed = 'copy'
            }}
            title={topic.quote}
            className={`inline-flex select-none items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-sm text-gray-800 shadow-sm ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <span className="h-2 w-2 rounded-full" style={{backgroundColor: topic.color}} />
            {topic.name}
            {!compact && <span className="text-xs text-gray-400">{count ?? topic.mentions}</span>}
            {onRemove && (
                <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-3.5 w-3.5" />
                </button>
            )}
        </span>
    )
}

const DraftCard = props => {
    const {draft, onAdd, onRemove} = props
    const [over, setOver] = useState(false)
    const Icon = draft.icon

    const handleDrop = e => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (topicById(id)) {
            onAdd(draft.id, id)
        }
    }

    return (
        <div
            onDragOver={e => {
                e.preventDefault()
                setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 p-4 transition-colors ${over ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{draft.type}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-900">{draft.title}</p>

            {draft.topics.length === 0 ? (
                <p className="mt-3 rounded-md border border-dashed border-gray-300 py-4 text-center text-xs text-gray-400">
                    Drag topics here to include them
                </p>
            ) : (
                <>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {draft.topics.map(id => (
                            <TopicChip key={id} topic={topicById(id)} compact draggable={false} onRemove={() => onRemove(draft.id, id)} />
                        ))}
                    </div>

                    <ol className="mt-3 space-y-1.5 border-t border-gray-200 pt-3">
                        {draft.topics.map((id, idx) => (
                            <li key={id} className="flex gap-2 text-sm text-gray-600">
                                <span className="font-medium text-gray-400">{idx + 1}.</span>
                                <span>{topicById(id).snippet}</span>
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </div>
    )
}

export const CommunityVoicesCard = () => {
    const [drafts, setDrafts] = useState(INITIAL_DRAFTS)

    const handleAdd = (draftId, topicId) => {
        setDrafts(prev => prev.map(d => {
            if (d.id !== draftId || d.topics.includes(topicId)) {
                return d
            }
            return {...d, topics: [...d.topics, topicId]}
        }))
    }

    const handleRemove = (draftId, topicId) => {
        setDrafts(prev => prev.map(d => d.id === draftId ? {...d, topics: d.topics.filter(t => t !== topicId)} : d))
    }

    const used = new Set(drafts.flatMap(d => d.topics))

    return (
        <div className="col-span-1 md:col-span-4 flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Community Voices</h3>
                    <p className="text-sm text-gray-500">Topics from what people are saying, worked into the content we generate</p>
                </div>
                <span className="text-xs text-gray-400">{TOPICS.length} topics · {used.size} in use</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                        <Bars3Icon className="h-3.5 w-3.5" /> Voices · drag a category into content
                    </p>
                    <div className="space-y-3">
                        {CHANNELS.map(channel => (
                            <div key={channel.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                                            style={{backgroundColor: channel.color}}>
                                            {channel.initials}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">{channel.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-semibold text-gray-900">{channel.videos}</span>
                                        <span className="ml-1 text-xs text-gray-500">videos · last 30 days</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    <span className="font-semibold text-gray-900">{channel.comments.toLocaleString()}</span> comments scraped
                                </p>
                                <div className="mt-1.5 flex h-2 overflow-hidden rounded-full">
                                    {channel.moods.map(mood => (
                                        <div key={mood.name} title={`${mood.name} ${mood.pct}%`} style={{width: `${mood.pct}%`, backgroundColor: mood.color}} />
                                    ))}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                    {channel.moods.map(mood => (
                                        <span key={mood.name} className="inline-flex items-center gap-1 text-xs text-gray-600">
                                            <span className="h-2 w-2 rounded-full" style={{backgroundColor: mood.color}} />
                                            {mood.name} <span className="text-gray-400">{mood.pct}%</span>
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {channel.categories.map(cat => (
                                        <TopicChip key={cat.topic} topic={topicById(cat.topic)} count={cat.count} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-400">The number is how many times the category came up in that channel.</p>
                </div>

                <div className="space-y-3 lg:col-span-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Content being built</p>
                    {drafts.map(draft => (
                        <DraftCard key={draft.id} draft={draft} onAdd={handleAdd} onRemove={handleRemove} />
                    ))}
                </div>
            </div>
        </div>
    )
}
