import React, {useState} from 'react'
import {LeadsModal} from "../components/leads_modal.jsx"
import {OutreachFlowCard} from "../components/outreach_flow_card.jsx"
import {TotalActivityCard} from "../components/total_activity_card.jsx"
import {AdsCard} from "../components/ads_card.jsx"
import {CommunityVoicesCard} from "../components/community_voices_card.jsx"

export const ActiveOutreachPage = () => {
    const [leadsOpen, setLeadsOpen] = useState(false)

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Active Outreach</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 pb-6 sm:px-6">
                <OutreachFlowCard onSelect={() => setLeadsOpen(true)} />

                <TotalActivityCard />

                <AdsCard />

                <CommunityVoicesCard />
            </div>

            <LeadsModal open={leadsOpen} onClose={() => setLeadsOpen(false)} />
        </div>
    )
}
