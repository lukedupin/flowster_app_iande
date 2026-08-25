import React, {useEffect, useRef, useState} from 'react'
import {Conversation} from "../../src/components/conversation.jsx"
import {ScriptCard} from "../components/script_card.jsx"

const DUMMY_SECTIONS = [
    {
        name: 'generic',
        title: 'Generic',
        description: 'Thanks for taking time. The prospect can ask a question about the article, get in touch with an agent, discuss infinite banking, or learn about life insurance.',
        variables: ['global.prospect_name'],
        next_states: ['intention'],
    },
    {
        name: 'intention',
        title: 'Intention',
        description: "Ask what the prospect wants to get out of today's conversation and route them toward the right topic.",
        variables: ['global.intentions'],
        next_states: ['article_state'],
    },
    {
        name: 'get_name',
        title: 'Get Name',
        description: "Introduce yourself, establish a human connection, and ask for the prospect's name before any business talk.",
        variables: ['global.prospect_name'],
        next_states: ['intention'],
    },
    {
        name: 'upfront_contract',
        title: 'Upfront Contract',
        description: 'Propose a clear agenda for the conversation and get agreement, giving the prospect explicit permission to opt out at the end.',
        variables: ['agenda_accepted', 'time_agreed', 'prospect_objective'],
        next_states: ['pain'],
    },
    {
        name: 'pain',
        title: 'Pain',
        description: 'Surface the problem, its emotional and business impact, and rate how urgent solving it really is.',
        variables: ['surface_pain', 'emotional_impact', 'cost_of_inaction', 'priority_score'],
        next_states: ['budget', 'exit'],
    },
    {
        name: 'budget',
        title: 'Budget',
        description: 'Introduce the topic of investment, anchor on a plausible range, and address financial objections without defending price.',
        variables: ['budget_allocated', 'budget_range', 'financial_objections'],
        next_states: ['pain', 'exit'],
    },
]

export const ScriptPage = props => {
    const {showToast} = props
    const conversationRef = useRef(null)
    const [session, setSession] = useState(null)

    useEffect(() => {
        conversationRef.current?.setMessages(
            DUMMY_SECTIONS.map(section => ({
                sender: 'script',
                content: section,
                timestamp: new Date().toISOString(),
            }))
        )
    }, [])

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Script</h2>

            <div className="px-4 sm:px-6">
                <Conversation
                    ref={conversationRef}
                    session={session}
                    onSessionChange={setSession}
                    showToast={showToast}
                >
                    <ScriptCard sender="script" />
                </Conversation>
            </div>
        </div>
    )
}
