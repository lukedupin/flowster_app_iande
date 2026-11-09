import React, {useState} from 'react'

// Buckets (static placeholder data). `col` is the horizontal position; buckets that
// share a column are stacked.
const BUCKETS = [
    {id: 'new', name: 'New', count: 420, col: 0, color: '#94a3b8'},
    {id: 'contacted', name: 'Contacted', count: 330, col: 1, color: '#60a5fa'},
    {id: 'engaged', name: 'Engaged', count: 190, col: 2, color: '#fbbf24'},
    {id: 'qualified', name: 'Qualified', count: 120, col: 3, color: '#a78bfa'},
    {id: 'managed', name: 'Managed', count: 60, col: 4, color: '#34d399'},
    {id: 'dormant', name: 'Dormant', count: 190, col: 4, color: '#f87171'},
]

// Users who moved from one bucket to another in the period
const FLOWS = [
    {from: 'new', to: 'contacted', value: 300},
    {from: 'new', to: 'dormant', value: 60},
    {from: 'contacted', to: 'engaged', value: 170},
    {from: 'contacted', to: 'qualified', value: 20},
    {from: 'contacted', to: 'dormant', value: 70},
    {from: 'engaged', to: 'qualified', value: 95},
    {from: 'engaged', to: 'managed', value: 10},
    {from: 'engaged', to: 'dormant', value: 40},
    {from: 'qualified', to: 'managed', value: 50},
    {from: 'qualified', to: 'dormant', value: 15},
]

const WIDTH = 960
const HEIGHT = 420
const NODE_W = 16
const GAP = 28
const TOP = 28
const SCALE = 0.72
const COLS = 5

const buildLayout = () => {
    const nodes = {}
    const colX = col => 20 + col * ((WIDTH - 40 - NODE_W - 80) / (COLS - 1))

    for (let col = 0; col < COLS; col++) {
        const inCol = BUCKETS.filter(b => b.col === col)
        const total = inCol.reduce((t, b) => t + b.count * SCALE, 0) + GAP * (inCol.length - 1)
        let y = TOP + (HEIGHT - TOP - total) / 2
        for (const b of inCol) {
            nodes[b.id] = {...b, x: colX(col), y, h: b.count * SCALE}
            y += b.count * SCALE + GAP
        }
    }

    // Stack links inside each node, ordered by the other end's vertical position
    const outCursor = {}
    const inCursor = {}
    for (const id of Object.keys(nodes)) {
        outCursor[id] = nodes[id].y
        inCursor[id] = nodes[id].y
    }

    const outSorted = [...FLOWS].sort((a, b) => nodes[a.to].y - nodes[b.to].y)
    const sourceY = {}
    for (const f of outSorted) {
        const w = f.value * SCALE
        sourceY[`${f.from}>${f.to}`] = outCursor[f.from] + w / 2
        outCursor[f.from] += w
    }

    const inSorted = [...FLOWS].sort((a, b) => nodes[a.from].y - nodes[b.from].y)
    const targetY = {}
    for (const f of inSorted) {
        const w = f.value * SCALE
        targetY[`${f.from}>${f.to}`] = inCursor[f.to] + w / 2
        inCursor[f.to] += w
    }

    const links = FLOWS.map(f => {
        const key = `${f.from}>${f.to}`
        const x1 = nodes[f.from].x + NODE_W
        const x2 = nodes[f.to].x
        const mx = (x1 + x2) / 2
        return {
            ...f,
            key,
            width: f.value * SCALE,
            color: nodes[f.from].color,
            d: `M${x1} ${sourceY[key]} C${mx} ${sourceY[key]} ${mx} ${targetY[key]} ${x2} ${targetY[key]}`,
        }
    })

    return {nodes: Object.values(nodes), byId: nodes, links}
}

const LAYOUT = buildLayout()

// ---- Money stats (static placeholders, derived from the bucket counts) ----

const AD_SPEND = 8740
const OUTREACH_COST = 1960
const AVG_INTERACTIONS_PER_LEAD = 5.8

const countOf = id => BUCKETS.find(b => b.id === id).count
const money = n => `$${Math.round(n).toLocaleString()}`

// delta is the change vs the previous period; for cost stats, down is good
const buildStats = () => {
    const totalSpend = AD_SPEND + OUTREACH_COST
    const attrition = (countOf('dormant') / countOf('new')) * 100
    return [
        {label: 'Cost Spent', value: money(totalSpend), sub: `${money(AD_SPEND)} ads · ${money(OUTREACH_COST)} outreach`, delta: 6.2, goodWhen: 'neutral'},
        {label: 'Cost per Lead Transfer to Managed', value: money(totalSpend / countOf('managed')), sub: `${countOf('managed')} leads moved to managed`, delta: -7.5, goodWhen: 'down'},
        {label: 'Avg Interactions per Lead', value: AVG_INTERACTIONS_PER_LEAD.toFixed(1), sub: 'comments, emails, calls, drips', delta: 0.4, goodWhen: 'neutral'},
        {label: 'Attrition Rate', value: `${attrition.toFixed(1)}%`, sub: `${countOf('dormant')} of ${countOf('new')} leads went dormant`, delta: -2.1, goodWhen: 'down'},
    ]
}

const STATS = buildStats()

const deltaColor = stat => {
    if (stat.goodWhen === 'neutral') {
        return 'text-gray-500'
    }
    const good = stat.goodWhen === 'up' ? stat.delta >= 0 : stat.delta <= 0
    return good ? 'text-emerald-600' : 'text-red-600'
}

export const OutreachFlowCard = props => {
    const {onSelect} = props
    const [hover, setHover] = useState(null)

    const totalUsers = BUCKETS.reduce((t, b) => t + b.count, 0)

    // Which links / nodes stay lit while hovering
    const linkLit = l => {
        if (!hover) {
            return true
        }
        if (hover.type === 'link') {
            return hover.key === l.key
        }
        return l.from === hover.id || l.to === hover.id
    }

    let info = <p className="text-xs text-gray-500">Hover a bucket or a flow · click for the leads</p>
    if (hover?.type === 'node') {
        const b = LAYOUT.byId[hover.id]
        info = <p className="text-xs text-gray-500"><span className="font-medium text-gray-900">{b.name}</span> · {b.count} users · {((b.count / totalUsers) * 100).toFixed(1)}% of all</p>
    }
    else if (hover?.type === 'link') {
        const l = LAYOUT.links.find(x => x.key === hover.key)
        const fromName = LAYOUT.byId[l.from].name
        const toName = LAYOUT.byId[l.to].name
        const pct = ((l.value / LAYOUT.byId[l.from].count) * 100).toFixed(0)
        info = <p className="text-xs text-gray-500"><span className="font-medium text-gray-900">{fromName} → {toName}</span> · {l.value} users · {pct}% of {fromName}</p>
    }

    return (
        <div className="col-span-1 md:col-span-4 flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Active Outreach</h3>
                    <p className="text-sm text-gray-500">{totalUsers.toLocaleString()} users across {BUCKETS.length} buckets, and how they move between them</p>
                </div>
                <div className="min-h-[1.5rem] text-right">{info}</div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full min-w-[640px]">
                    {LAYOUT.links.map(l => (
                        <path
                            key={l.key}
                            d={l.d}
                            fill="none"
                            stroke={l.color}
                            strokeWidth={Math.max(l.width, 1.5)}
                            strokeOpacity={linkLit(l) ? (hover ? 0.55 : 0.35) : 0.08}
                            className="cursor-pointer"
                            onClick={() => onSelect?.({type: 'link', from: l.from, to: l.to})}
                            onMouseEnter={() => setHover({type: 'link', key: l.key})}
                            onMouseLeave={() => setHover(null)}
                        />
                    ))}

                    {LAYOUT.nodes.map(n => (
                        <g
                            key={n.id}
                            className="cursor-pointer"
                            onClick={() => onSelect?.({type: 'bucket', id: n.id})}
                            onMouseEnter={() => setHover({type: 'node', id: n.id})}
                            onMouseLeave={() => setHover(null)}>
                            <rect x={n.x} y={n.y} width={NODE_W} height={n.h} rx="3" fill={n.color} />
                            <text
                                x={n.x}
                                y={n.y - 8}
                                fontSize="13"
                                fontWeight="600"
                                fill="#111827"
                                stroke="#fff"
                                strokeWidth="4"
                                paintOrder="stroke"
                                pointerEvents="none">
                                {n.name} · {n.count}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 md:grid-cols-4">
                {STATS.map(stat => (
                    <div key={stat.label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <div className="mt-1 flex items-baseline justify-between gap-2">
                            <span className="text-xl font-semibold text-gray-900">{stat.value}</span>
                            <span className={`text-xs font-medium ${deltaColor(stat)}`}>
                                {stat.delta >= 0 ? '▲' : '▼'} {Math.abs(stat.delta).toFixed(1)}%
                            </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-400">{stat.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
