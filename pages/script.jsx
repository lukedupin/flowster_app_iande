import React, {useEffect, useRef, useState} from 'react'
import {Conversation} from "../../src/components/conversation.jsx"
import {ScriptCard} from "../components/script_card.jsx"
import * as Util from "../../src/helpers/util.js"

export const ScriptPage = props => {
    const {showToast} = props
    const conversationRef = useRef(null)
    const [session, setSession] = useState(null)

    useEffect(() => {
        Util.fetch_js('/api/iande/script', {}, js => {
            conversationRef.current?.setMessages(
                js.sections.map(section => ({
                    sender: 'script',
                    content: section,
                    timestamp: new Date().toISOString(),
                }))
            )
        }, showToast)
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
