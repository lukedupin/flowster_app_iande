import React, {useEffect, useState} from 'react'
import {ChatBubbleLeftRightIcon, ClockIcon, CalendarDaysIcon, XMarkIcon, SparklesIcon} from "@heroicons/react/24/outline"
import {ChatPanel} from "../components/chat_panel.jsx"
import {LeadCommandModal} from "../components/lead_command_modal.jsx"

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// When the page opened. The "last interaction" times below are offsets before this, so the
// timers keep counting up from there.
const OPENED = Date.now()
const ago = ms => OPENED - ms

// Typical statuses for a managed lead, left to right
const COLUMNS = [
    {id: 'onboarding', name: 'Onboarding', dot: '#60a5fa'},
    {id: 'active', name: 'Active', dot: '#34d399'},
    {id: 'follow_up', name: 'Follow-up Due', dot: '#f59e0b'},
    {id: 'review', name: 'Review Scheduled', dot: '#a78bfa'},
    {id: 'renewal', name: 'Renewal', dot: '#22d3ee'},
    {id: 'at_risk', name: 'At Risk', dot: '#ef4444'},
]

// Drip campaigns and their tag colors: text, background
const CAMPAIGN_STYLE = {
    'Term Life Drip': 'bg-blue-50 text-blue-700',
    'Estate Checklist': 'bg-violet-50 text-violet-700',
    'Final Expense Drip': 'bg-emerald-50 text-emerald-700',
    'Founders Series': 'bg-orange-50 text-orange-700',
    'Annual Review': 'bg-cyan-50 text-cyan-700',
    'Renewal Outreach': 'bg-teal-50 text-teal-700',
    'Beneficiary Update': 'bg-pink-50 text-pink-700',
    'Win-back': 'bg-red-50 text-red-700',
}
const CAMPAIGNS = Object.keys(CAMPAIGN_STYLE)

// Static placeholder data. `age` and `job` are only known for some leads. Follow-up Due and Review
// Scheduled leads have a `due` date and `due_label` instead of counting from the last interaction.
const INITIAL_LEADS = [
    {id: 1, name: 'David Okafor', age: 38, job: 'Startup founder', product: 'Term Life + key-person', column: 'onboarding', interactions: 9, last: ago(3 * HOUR + 12 * MINUTE), campaigns: ['Founders Series', 'Term Life Drip']},
    {id: 2, name: 'Tom Hendricks', product: 'Final Expense', column: 'onboarding', interactions: 14, last: ago(1 * DAY + 4 * HOUR + 40 * MINUTE), campaigns: ['Final Expense Drip']},
    {id: 3, name: 'Hannah Brooks', age: 29, job: 'Designer', product: 'Term Life', column: 'onboarding', interactions: 6, last: ago(26 * MINUTE), campaigns: ['Term Life Drip']},

    {id: 4, name: 'Marcus Reed', age: 34, job: 'Software engineer', product: 'Term Life', column: 'active', interactions: 22, last: ago(5 * HOUR + 3 * MINUTE), campaigns: ['Term Life Drip', 'Beneficiary Update']},
    {id: 5, name: 'Linda Cho', age: 52, job: 'Attorney', product: 'Estate Planning', column: 'active', interactions: 31, last: ago(11 * HOUR + 50 * MINUTE), campaigns: ['Estate Checklist']},
    {id: 6, name: 'Omar Haddad', product: 'Final Expense', column: 'active', interactions: 18, last: ago(2 * DAY + 2 * HOUR), campaigns: ['Final Expense Drip', 'Annual Review']},
    {id: 7, name: 'Rachel Meyer', product: 'Term Life', column: 'active', interactions: 12, last: ago(9 * HOUR), campaigns: ['Term Life Drip']},

    {id: 8, name: 'Elena Park', age: 45, job: 'Teacher', product: 'Estate Planning', column: 'follow_up', interactions: 17, due: '2026-11-07', due_label: 'Follow up', campaigns: ['Estate Checklist', 'Beneficiary Update']},
    {id: 9, name: 'Sofia Alvarez', product: 'Supplemental', column: 'follow_up', interactions: 8, due: '2026-11-08', due_label: 'Follow up', campaigns: ['Win-back']},
    {id: 10, name: 'Greg Nolan', product: 'Term Life', column: 'follow_up', interactions: 11, due: '2026-11-09', due_label: 'Follow up', campaigns: ['Term Life Drip']},

    {id: 11, name: 'Priya Natarajan', age: 41, job: 'Nurse', product: 'Term Life', column: 'review', interactions: 25, due: '2026-11-12', due_label: 'Review', campaigns: ['Annual Review']},
    {id: 12, name: 'James Whitfield', product: 'Estate Planning', column: 'review', interactions: 15, due: '2026-11-16', due_label: 'Review', campaigns: ['Estate Checklist', 'Annual Review']},

    {id: 13, name: 'Aiko Tanaka', age: 63, job: 'Retired', product: 'Final Expense', column: 'renewal', interactions: 28, last: ago(2 * DAY + 13 * HOUR), campaigns: ['Renewal Outreach']},
    {id: 14, name: 'Walter Lindqvist', age: 58, job: 'Contractor', product: 'Term Life', column: 'renewal', interactions: 36, last: ago(6 * DAY + 3 * HOUR), campaigns: ['Renewal Outreach', 'Beneficiary Update']},

    {id: 15, name: 'Carla Mendes', product: 'Term Life', column: 'at_risk', interactions: 7, last: ago(9 * DAY + 14 * HOUR + 30 * MINUTE), campaigns: ['Win-back']},
    {id: 16, name: 'Brian Foster', age: 49, job: 'Accountant', product: 'Estate Planning', column: 'at_risk', interactions: 5, last: ago(13 * DAY + 2 * HOUR), campaigns: ['Win-back', 'Estate Checklist']},
]

const LeadCard = props => {
    const {lead, now, onRemoveCampaign, onOpen} = props

    // Time since the last interaction
    const elapsed = Math.max(now - (lead.last ?? now), 0)
    const days = Math.floor(elapsed / DAY)
    const hours = Math.floor((elapsed % DAY) / HOUR)
    const minutes = Math.floor((elapsed % HOUR) / MINUTE)
    const seconds = Math.floor((elapsed % MINUTE) / SECOND)

    const pad = n => String(n).padStart(2, '0')
    let clock = `${pad(minutes)}m ${pad(seconds)}s`
    if (elapsed >= HOUR) {
        clock = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    }
    if (elapsed >= DAY) {
        clock = `${days}d ${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    }

    // The longer it has been, the more it should nag
    let timeStyle = 'text-emerald-600'
    let edge = 'border-l-emerald-400'
    let pulse = false
    if (elapsed >= 6 * HOUR) {
        timeStyle = 'text-gray-700'
        edge = 'border-l-gray-300'
    }
    if (elapsed >= 1 * DAY) {
        timeStyle = 'text-amber-600'
        edge = 'border-l-amber-400'
    }
    if (elapsed >= 3 * DAY) {
        timeStyle = 'text-red-600'
        edge = 'border-l-red-500'
        pulse = true
    }

    // Leads with a scheduled date show the date instead, red once it has passed and amber on the day
    let dueText = ''
    if (lead.due) {
        const today = new Date(now)
        const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
        dueText = new Date(`${lead.due}T00:00:00`).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})

        timeStyle = 'text-gray-700'
        edge = 'border-l-gray-300'
        if (lead.due === todayIso) {
            timeStyle = 'text-amber-600'
            edge = 'border-l-amber-400'
            dueText = `${dueText} · today`
        }
        if (lead.due < todayIso) {
            timeStyle = 'text-red-600'
            edge = 'border-l-red-500'
            dueText = `${dueText} · overdue`
        }
    }

    return (
        <div
            onClick={() => onOpen(lead.id)}
            className={`cursor-pointer rounded-lg border border-l-4 border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${edge}`}>
            <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-900">{lead.name}</p>
                {lead.age && (
                    <span className="shrink-0 text-xs text-gray-400">{lead.age} · {lead.job}</span>
                )}
            </div>
            <p className="truncate text-xs text-gray-400">{lead.product}</p>

            <div className="mt-2 flex flex-wrap gap-1">
                {lead.campaigns.map(campaign => (
                    <span key={campaign} className={`inline-flex items-center gap-0.5 rounded-full py-0.5 pl-2 pr-1 text-[10px] font-medium ${CAMPAIGN_STYLE[campaign]}`}>
                        {campaign}
                        <button
                            onClick={e => {
                                e.stopPropagation()
                                onRemoveCampaign(lead.id, campaign)
                            }}
                            title={`Take ${lead.name} off ${campaign}`}
                            className="rounded-full p-0.5 opacity-60 hover:bg-black/10 hover:opacity-100">
                            <XMarkIcon className="h-2.5 w-2.5" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500" title="Interactions">
                    <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                    {lead.interactions}
                </span>
                {lead.due ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${timeStyle}`} title={`${lead.due_label} date`}>
                        <CalendarDaysIcon className="h-3.5 w-3.5" />
                        {lead.due_label} {dueText}
                    </span>
                ) : (
                    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums ${timeStyle}`} title="Time since last interaction">
                        {pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
                        <ClockIcon className="h-3.5 w-3.5" />
                        {clock}
                    </span>
                )}
            </div>
        </div>
    )
}

export const ManagedOutreachPage = props => {
    const {showToast} = props
    const [now, setNow] = useState(Date.now())
    const [leads, setLeads] = useState(INITIAL_LEADS)
    const [selectedId, setSelectedId] = useState(null)
    const selected = leads.find(l => l.id === selectedId)

    // One shared tick for every card
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), SECOND)
        return () => clearInterval(timer)
    }, [])

    // Changes made in the lead modal (mock only, kept in this page's state)
    const handleUpdateLead = (leadId, patch) => {
        setLeads(prev => prev.map(l => l.id === leadId ? {...l, ...patch} : l))
    }

    const handleRemoveCampaign =(leadId, campaign) => {
        setLeads(prev => prev.map(l => l.id === leadId ? {...l, campaigns: l.campaigns.filter(c => c !== campaign)} : l))
    }

    return (
        <div className="space-y-4 pb-72">
            <div className="flex items-end justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Managed Outreach</h2>
                <span className="text-xs text-gray-400">{leads.length} managed leads</span>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-6 sm:px-6 lg:flex-row">
                {/* Every drip campaign and how many people are on it right now */}
                <div className="w-full shrink-0 lg:w-56">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Drip campaigns</p>
                    <div className="space-y-1.5">
                        {CAMPAIGNS.map(campaign => {
                            const people = leads.filter(l => l.campaigns.includes(campaign)).length
                            return (
                                <div key={campaign} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                    <span className={`truncate rounded-full px-2 py-0.5 text-xs font-medium ${CAMPAIGN_STYLE[campaign]}`}>{campaign}</span>
                                    <span className="shrink-0 text-sm font-semibold text-gray-900" title="People on this campaign">{people}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto">
                    {COLUMNS.map(column => {
                        const inColumn = leads.filter(l => l.column === column.id)
                        return (
                            <div key={column.id} className="w-72 shrink-0 self-start rounded-xl bg-gray-100 p-3">
                                <div className="mb-3 flex items-center justify-between px-1">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: column.dot}} />
                                        {column.name}
                                    </span>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">{inColumn.length}</span>
                                </div>

                                <div className="space-y-2">
                                    {inColumn.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} now={now} onRemoveCampaign={handleRemoveCampaign} onOpen={setSelectedId} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <LeadCommandModal
                lead={selected}
                column={COLUMNS.find(c => c.id === selected?.column)}
                campaigns={CAMPAIGNS}
                campaignStyle={CAMPAIGN_STYLE}
                onUpdateLead={handleUpdateLead}
                onClose={() => setSelectedId(null)}
                showToast={showToast}
            />

            {/* AI chat pinned to the bottom of the screen, beside the sidebar, always ready */}
            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white shadow-lg lg:left-52">
                <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-gray-500 sm:px-6">
                    <SparklesIcon className="h-3.5 w-3.5 text-blue-500" />
                    Ask AI about your managed leads
                </div>
                <div className="max-h-[40vh] overflow-y-auto">
                    <ChatPanel showToast={showToast} apiUrl="/api/iande/chat_json" />
                </div>
            </div>
        </div>
    )
}
