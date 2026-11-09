import React, {useEffect, useState} from 'react'
import {XMarkIcon, ChevronRightIcon, ChatBubbleLeftIcon, EnvelopeIcon, QueueListIcon, CursorArrowRaysIcon, PhoneIcon, HeartIcon} from "@heroicons/react/24/outline"

const STATUS_STYLE = {
    New: 'bg-slate-100 text-slate-700',
    Contacted: 'bg-blue-100 text-blue-700',
    Engaged: 'bg-amber-100 text-amber-700',
    Qualified: 'bg-violet-100 text-violet-700',
    Managed: 'bg-emerald-100 text-emerald-700',
}

const INTERACTION_ICON = {
    Like: HeartIcon,
    Comment: ChatBubbleLeftIcon,
    Email: EnvelopeIcon,
    Drip: QueueListIcon,
    Click: CursorArrowRaysIcon,
    Call: PhoneIcon,
}

// type, date, summary line, and the actual text of the interaction (optional)
const i = (type, date, summary, text) => ({type, date, summary, text})

// Static placeholder data
const LEADS = [
    {id: 1, name: 'Marcus Reed', source: 'YouTube', channel: 'Comments', status: 'New', email: 'marcus.reed@example.com', last_contact: '2026-11-08', interactions: [
        i('Comment', '2026-11-08', 'Commented on "Term vs Whole Life"', 'Is term really cheaper long run? I\'m 34 with two kids and can\'t tell which one makes sense.'),
        i('Comment', '2026-11-08', 'We replied on YouTube', 'Great question Marcus! For most families with young kids, term covers the years you need it most at a fraction of the cost. Sent you a breakdown by email.'),
        i('Email', '2026-11-08', 'Sent: "Quick answer to your question"', 'Hi Marcus, thanks for your comment on our term vs whole life video. Here is a quick breakdown of what coverage would look like for a 34-year-old with two dependents...'),
    ]},
    {id: 2, name: 'Elena Park', source: 'YouTube', channel: 'Direct Msg', status: 'Engaged', email: 'elena.park@example.com', last_contact: '2026-11-07', interactions: [
        i('Like', '2026-11-01', 'Liked community post "Estate taxes in 2026"'),
        i('Comment', '2026-11-01', 'Commented on community post "Estate taxes in 2026"', 'Does this apply if the house is already in a trust?'),
        i('Email', '2026-11-03', 'Sent: "Your estate planning checklist"', 'Hi Elena, attached is the checklist we mentioned. Trusts change a few of the items, which I\'ve highlighted in yellow.'),
        i('Click', '2026-11-04', 'Clicked checklist link in email'),
        i('Drip', '2026-11-07', 'Estate Planning drip, step 2 of 5 sent', 'Subject: What most people miss about beneficiaries'),
    ]},
    {id: 3, name: 'David Okafor', source: 'LinkedIn', channel: 'Reach out', status: 'Qualified', email: 'd.okafor@example.com', last_contact: '2026-11-06', interactions: [
        i('Email', '2026-10-28', 'Sent LinkedIn connection message', 'Hi David, I saw your post about starting a business. Many founders overlook key-person coverage, happy to share a short guide if useful.'),
        i('Comment', '2026-10-29', 'Replied on LinkedIn', 'Sure, send it over. We just closed our seed round so this is timely.'),
        i('Drip', '2026-10-30', 'Enrolled in Term Life drip'),
        i('Click', '2026-11-02', 'Clicked quote calculator'),
        i('Call', '2026-11-06', 'Discovery call, 18 min', 'Wants $1.5M 20-year term plus key-person policy for co-founder. Follow-up scheduled Friday.'),
    ]},
    {id: 4, name: 'Priya Natarajan', source: 'Instagram', channel: 'Reach out', status: 'Contacted', email: 'priya.n@example.com', last_contact: '2026-11-06', interactions: [
        i('Like', '2026-11-05', 'Liked our reel "3 myths about life insurance"'),
        i('Email', '2026-11-06', 'Sent Instagram DM', 'Hi Priya! Thanks for the like on our reel. If you ever want the full breakdown of those 3 myths, here is the blog post: insuranceandestates.com/blog/term-vs-whole-life'),
    ]},
    {id: 5, name: 'Tom Hendricks', source: 'YouTube', channel: 'Community', status: 'Managed', email: 'tom.hendricks@example.com', last_contact: '2026-11-04', interactions: [
        i('Comment', '2025-09-12', 'Commented on "Final Expense Guide"', 'My dad just passed and we had no plan at all. Wish I had seen this sooner.'),
        i('Drip', '2025-09-14', 'Completed Final Expense drip (5 of 5)'),
        i('Call', '2025-10-02', 'Onboarding call', 'Policy for Tom and his wife, $25k each, draft on the 1st of the month.'),
        i('Email', '2026-11-04', 'Sent: "Annual policy review"', 'Hi Tom, it has been a year since we set up your coverage. Want to take 15 minutes to review it together?'),
    ]},
    {id: 6, name: 'Sofia Alvarez', source: 'LinkedIn', channel: 'Reach out', status: 'Engaged', email: 'sofia.alvarez@example.com', last_contact: '2026-11-03', interactions: [
        i('Email', '2026-10-29', 'Sent LinkedIn intro message', 'Hi Sofia, noticed you work in HR. We have a short guide on how to talk to employees about supplemental coverage.'),
        i('Like', '2026-11-02', 'Liked our post "Probate timeline"'),
        i('Click', '2026-11-03', 'Clicked "Probate timeline" article'),
    ]},
    {id: 7, name: 'James Whitfield', source: 'YouTube', channel: 'Comments', status: 'Contacted', email: 'j.whitfield@example.com', last_contact: '2026-11-02', interactions: [
        i('Comment', '2026-11-01', 'Commented on "Estate Planning 101"', 'Do I need a lawyer or can I do a will online?'),
        i('Email', '2026-11-02', 'Sent: "Will vs trust: do you need a lawyer?"', 'Hi James, great question. Short answer: an online will can work for simple situations, but here are three cases where it doesn\'t...'),
    ]},
    {id: 8, name: 'Aiko Tanaka', source: 'Instagram', channel: 'Reach out', status: 'New', email: 'aiko.tanaka@example.com', last_contact: '2026-11-01', interactions: [
        i('Like', '2026-11-01', 'Liked our reel "What is a beneficiary?"'),
        i('Comment', '2026-11-01', 'Commented on reel "What is a beneficiary?"', 'So helpful, I never updated mine after getting married 😅'),
    ]},
]

const COLUMNS = ['Name', 'Source', 'Channel', 'Status', 'Email', 'Interactions', 'Last Contact']

const Interactions = props => {
    const {items} = props
    return (
        <ul className="space-y-4">
            {items.map((item, idx) => {
                const Icon = INTERACTION_ICON[item.type] || ChatBubbleLeftIcon
                return (
                    <li key={idx} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">{item.summary}</span>
                                <span className="ml-2 text-xs text-gray-400">{item.date}</span>
                            </p>
                            {item.text && (
                                <p className="mt-1 whitespace-pre-wrap border-l-2 border-gray-300 pl-3 text-sm text-gray-600">{item.text}</p>
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export const LeadsModal = props => {
    const {open, onClose} = props
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        if (!open) {
            return
        }
        const onKey = e => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />

            <div className="relative flex h-[92vh] w-full max-w-[96rem] flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="sticky top-0 bg-gray-50">
                            <tr>
                                <th className="w-8 px-2 py-3" />
                                {COLUMNS.map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {LEADS.map(lead => {
                                const isOpen = expanded === lead.id
                                return (
                                    <React.Fragment key={lead.id}>
                                        <tr
                                            onClick={() => setExpanded(isOpen ? null : lead.id)}
                                            className="cursor-pointer hover:bg-gray-50">
                                            <td className="px-2 py-3 text-gray-400">
                                                <ChevronRightIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{lead.source}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{lead.channel}</td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[lead.status]}`}>{lead.status}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{lead.email}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{lead.interactions.length}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-500">{lead.last_contact}</td>
                                        </tr>
                                        {isOpen && (
                                            <tr className="bg-gray-50">
                                                <td />
                                                <td colSpan={COLUMNS.length} className="px-4 py-4">
                                                    <Interactions items={lead.interactions} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
