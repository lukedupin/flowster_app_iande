import React from 'react'

const PLATFORM_COLOR = {
    YouTube: '#ef4444',
    LinkedIn: '#0a66c2',
    Instagram: '#d946ef',
}

const STATUS_STYLE = {
    Running: 'bg-emerald-100 text-emerald-700',
    Paused: 'bg-gray-100 text-gray-600',
    Ended: 'bg-slate-100 text-slate-500',
}

// Static placeholder data
const ADS = [
    {id: 1, name: 'Term vs Whole Life: 30s Pre-roll', platform: 'YouTube', funnel: 'Term Life', status: 'Running', spend: 1840, impressions: 214000, clicks: 3920, leads: 142, managed: 9},
    {id: 2, name: 'Estate Planning Checklist', platform: 'LinkedIn', funnel: 'Estate Planning', status: 'Running', spend: 2650, impressions: 61000, clicks: 1310, leads: 96, managed: 14},
    {id: 3, name: 'Final Expense: Family Story', platform: 'YouTube', funnel: 'Final Expense', status: 'Running', spend: 1220, impressions: 188000, clicks: 2410, leads: 118, managed: 7},
    {id: 4, name: '3 Myths Reel', platform: 'Instagram', funnel: 'Term Life', status: 'Paused', spend: 640, impressions: 97000, clicks: 880, leads: 31, managed: 1},
    {id: 5, name: 'Key-Person Coverage for Founders', platform: 'LinkedIn', funnel: 'Term Life', status: 'Running', spend: 1980, impressions: 48000, clicks: 960, leads: 58, managed: 11},
    {id: 6, name: 'Beneficiary Update Carousel', platform: 'Instagram', funnel: 'Estate Planning', status: 'Ended', spend: 410, impressions: 72000, clicks: 640, leads: 22, managed: 2},
]

const money = n => `$${n.toLocaleString()}`
const pct = n => `${n.toFixed(1)}%`

const COLUMNS = [
    {label: 'Ad', align: 'text-left'},
    {label: 'Spend', align: 'text-right'},
    {label: 'Impr.', align: 'text-right'},
    {label: 'CTR', align: 'text-right'},
    {label: 'Leads', align: 'text-right'},
    {label: 'Cost / Lead', align: 'text-right'},
    {label: 'To Managed', align: 'text-right'},
]

export const AdsCard = () => {
    const rows = ADS.map(ad => ({
        ...ad,
        ctr: (ad.clicks / ad.impressions) * 100,
        cpl: ad.spend / ad.leads,
        managed_rate: (ad.managed / ad.leads) * 100,
    }))

    const totalSpend = rows.reduce((t, r) => t + r.spend, 0)
    const totalLeads = rows.reduce((t, r) => t + r.leads, 0)
    const bestCpl = Math.min(...rows.map(r => r.cpl))

    return (
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Ads</h3>
                    <p className="text-sm text-gray-500">Spend and response by ad</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{money(totalSpend)} spent</p>
                    <p className="text-xs text-gray-500">{totalLeads} leads · {money(Math.round(totalSpend / totalLeads))} avg / lead</p>
                </div>
            </div>

            <div className="mt-4 flex-1 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            {COLUMNS.map(c => (
                                <th key={c.label} className={`whitespace-nowrap px-2 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 ${c.align}`}>{c.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map(ad => (
                            <tr key={ad.id} className="hover:bg-gray-50">
                                <td className="px-2 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: PLATFORM_COLOR[ad.platform]}} title={ad.platform} />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-gray-900">{ad.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {ad.platform} · {ad.funnel}
                                                <span className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLE[ad.status]}`}>{ad.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-2 py-3 text-right text-gray-900">{money(ad.spend)}</td>
                                <td className="whitespace-nowrap px-2 py-3 text-right text-gray-600">{ad.impressions.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-2 py-3 text-right text-gray-600">{pct(ad.ctr)}</td>
                                <td className="whitespace-nowrap px-2 py-3 text-right text-gray-600">{ad.leads}</td>
                                <td className={`whitespace-nowrap px-2 py-3 text-right font-medium ${ad.cpl === bestCpl ? 'text-emerald-600' : 'text-gray-900'}`}>{money(Math.round(ad.cpl))}</td>
                                <td className="whitespace-nowrap px-2 py-3 text-right text-gray-600">{pct(ad.managed_rate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
