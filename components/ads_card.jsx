import React, {useState} from 'react'

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

// Chart: x = spend, y = cost per lead (lower is better), bubble size = leads,
// inner dot = share of those leads that reached managed
const WIDTH = 520
const HEIGHT = 300
const LEFT = 48
const RIGHT = 16
const TOP = 16
const BOTTOM = 34
const X_MAX = 3000
const Y_MAX = 40
const X_TICKS = [0, 1000, 2000, 3000]
const Y_TICKS = [0, 10, 20, 30, 40]

const xOf = spend => LEFT + (spend / X_MAX) * (WIDTH - LEFT - RIGHT)
const yOf = cpl => HEIGHT - BOTTOM - (cpl / Y_MAX) * (HEIGHT - TOP - BOTTOM)
const radiusOf = leads => 5 + 1.6 * Math.sqrt(leads)

export const AdsCard = () => {
    const [hoverId, setHoverId] = useState(null)

    const rows = ADS.map(ad => ({
        ...ad,
        ctr: (ad.clicks / ad.impressions) * 100,
        cpl: ad.spend / ad.leads,
        managed_rate: (ad.managed / ad.leads) * 100,
    }))

    const totalSpend = rows.reduce((t, r) => t + r.spend, 0)
    const totalLeads = rows.reduce((t, r) => t + r.leads, 0)

    // Draw the biggest bubbles first so the small ones are not hidden behind them
    const drawOrder = [...rows].sort((a, b) => b.leads - a.leads)
    const hovered = rows.find(r => r.id === hoverId)

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

            <div className="mt-3 min-h-[7.5rem]">
                {hovered ? (
                    <>
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: PLATFORM_COLOR[hovered.platform]}} />
                            <span className="truncate">{hovered.id}. {hovered.name}</span>
                            <span className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLE[hovered.status]}`}>{hovered.status}</span>
                        </p>
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-8 gap-y-0.5 text-xs">
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Platform</dt><dd className="text-gray-900">{hovered.platform}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Funnel</dt><dd className="text-gray-900">{hovered.funnel}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Spend</dt><dd className="text-gray-900">{money(hovered.spend)}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Impressions</dt><dd className="text-gray-900">{hovered.impressions.toLocaleString()}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">CTR</dt><dd className="text-gray-900">{pct(hovered.ctr)}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Leads</dt><dd className="text-gray-900">{hovered.leads}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">Cost / lead</dt><dd className="text-gray-900">{money(Math.round(hovered.cpl))}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-gray-500">To managed</dt><dd className="text-gray-900">{pct(hovered.managed_rate)}</dd></div>
                        </dl>
                    </>
                ) : (
                    <p className="text-xs text-gray-500">Bubble size is leads · the dark inner dot is the share that reached managed</p>
                )}
            </div>

            <div className="flex-1 flex items-center">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full">
                    {Y_TICKS.map(t => (
                        <g key={`y${t}`}>
                            <line x1={LEFT} x2={WIDTH - RIGHT} y1={yOf(t)} y2={yOf(t)} stroke="#f1f5f9" />
                            <text x={LEFT - 8} y={yOf(t) + 4} fontSize="11" fill="#9ca3af" textAnchor="end">{money(t)}</text>
                        </g>
                    ))}
                    {X_TICKS.map(t => (
                        <text key={`x${t}`} x={xOf(t)} y={HEIGHT - BOTTOM + 18} fontSize="11" fill="#9ca3af" textAnchor="middle">{money(t)}</text>
                    ))}
                    <text x={(LEFT + WIDTH - RIGHT) / 2} y={HEIGHT - 4} fontSize="11" fill="#6b7280" textAnchor="middle">Spend</text>
                    <text transform={`translate(12 ${(TOP + HEIGHT - BOTTOM) / 2}) rotate(-90)`} fontSize="11" fill="#6b7280" textAnchor="middle">Cost / lead</text>

                    {drawOrder.map(ad => {
                        const r = radiusOf(ad.leads)
                        const x = xOf(ad.spend)
                        const y = yOf(ad.cpl)
                        const color = PLATFORM_COLOR[ad.platform]
                        const dim = hoverId !== null && hoverId !== ad.id
                        const faded = ad.status !== 'Running'
                        return (
                            <g
                                key={ad.id}
                                className="cursor-pointer"
                                opacity={dim ? 0.25 : 1}
                                onMouseEnter={() => setHoverId(ad.id)}
                                onMouseLeave={() => setHoverId(null)}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={r}
                                    fill={color}
                                    fillOpacity={faded ? 0.25 : 0.5}
                                    stroke={color}
                                    strokeWidth="1.5"
                                    strokeDasharray={faded ? '3 2' : undefined}
                                />
                                <circle cx={x} cy={y} r={r * Math.sqrt(ad.managed / ad.leads)} fill="#0f172a" fillOpacity="0.75" />
                                <text x={x} y={y - r - 4} fontSize="11" fontWeight="600" fill="#374151" textAnchor="middle" pointerEvents="none">{ad.id}</text>
                            </g>
                        )
                    })}
                </svg>
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
                {Object.keys(PLATFORM_COLOR).map(p => (
                    <span key={p} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: PLATFORM_COLOR[p]}} />
                        {p}
                    </span>
                ))}
                <span className="text-xs text-gray-400">Dashed = paused or ended</span>
            </div>
        </div>
    )
}
