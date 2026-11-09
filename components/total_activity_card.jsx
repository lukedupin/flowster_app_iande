import React, {useState} from 'react'
import {Sunburst} from "./sunburst.jsx"

const FUNNELS = [
    {key: 'term', label: 'Term Life', hue: 215},
    {key: 'estate', label: 'Estate Planning', hue: 265},
    {key: 'final', label: 'Final Expense', hue: 155},
]

const RANGES = [
    {key: '7', label: '7 days', scale: 0.25},
    {key: '30', label: '30 days', scale: 1},
    {key: '90', label: '90 days', scale: 3},
    {key: '365', label: '1 year', scale: 11},
]

// Base (30 day) static data per interaction type; arrays are in FUNNELS order
const CHANNELS = [
    {name: 'Email', sent: [420, 310, 280], responses: [38, 41, 22]},
    {name: 'Phone', sent: [90, 140, 60], responses: [31, 52, 14]},
    {name: 'Text', sent: [260, 80, 190], responses: [47, 12, 33]},
    {name: 'Comments', sent: [180, 95, 240], responses: [29, 14, 51]},
    {name: 'Direct Msg', sent: [120, 150, 70], responses: [18, 36, 9]},
    {name: 'Drip', sent: [500, 380, 330], responses: [30, 26, 21]},
]

const MAX_RATE = 40

// Outer ring: same hue as the funnel, darker = better response rate
const leafColor = (hue, rate) => {
    const t = Math.min(rate / MAX_RATE, 1)
    const lightness = 62 - t * 22
    return `hsl(${hue} 65% ${lightness}%)`
}

const buildTree = scale => {
    return FUNNELS.map((f, fi) => ({
        name: f.label,
        color: `hsl(${f.hue} 60% 38%)`,
        children: CHANNELS.map(c => {
            const sent = Math.max(Math.round(c.sent[fi] * scale), 1)
            const responses = Math.round(c.responses[fi] * scale)
            const rate = (responses / sent) * 100
            return {
                name: c.name,
                color: leafColor(f.hue, rate),
                value: sent,
                sent,
                responses,
                rate,
            }
        }),
    }))
}

const flattenLeaves = tree => {
    const out = []
    for (const f of tree) {
        for (const leaf of f.children) {
            out.push({funnel: f.name, ...leaf})
        }
    }
    return out
}

export const TotalActivityCard = () => {
    const [range, setRange] = useState('30')
    const [hovered, setHovered] = useState(null)
    const scale = RANGES.find(r => r.key === range).scale

    const tree = buildTree(scale)
    const leaves = flattenLeaves(tree)
    const total = leaves.reduce((t, l) => t + l.sent, 0)
    const top = [...leaves].sort((a, b) => b.rate - a.rate).slice(0, 4)
    const node = hovered?.node

    return (
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Total Activity</h3>
                    <p className="text-sm text-gray-500">Funnel › interaction type</p>
                </div>

                <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                    {RANGES.map(r => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${range === r.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-2 min-h-[2.5rem] text-right">
                {node && !node.children && node.sent !== undefined ? (
                    <>
                        <p className="text-sm font-medium text-gray-900">{hovered.path.join(' › ')}</p>
                        <p className="text-xs text-gray-500">{node.sent.toLocaleString()} sent · {node.responses.toLocaleString()} responses · {node.rate.toFixed(1)}% response rate</p>
                    </>
                ) : hovered ? (
                    <>
                        <p className="text-sm font-medium text-gray-900">{hovered.path.join(' › ')}</p>
                        <p className="text-xs text-gray-500">{Math.round(hovered.value).toLocaleString()} interactions · {((hovered.value / total) * 100).toFixed(1)}%</p>
                    </>
                ) : (
                    <>
                        <p className="text-sm font-medium text-gray-900">{total.toLocaleString()} interactions</p>
                        <p className="text-xs text-gray-500">Darker segments get more responses</p>
                    </>
                )}
            </div>

            <div className="flex-1 flex items-center py-2">
                <Sunburst tree={tree} hovered={hovered} onHover={setHovered} labelLeaves />
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pb-3">
                {FUNNELS.map(f => (
                    <span key={f.key} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: `hsl(${f.hue} 60% 38%)`}} />
                        {f.label}
                    </span>
                ))}
            </div>

            <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Top responding</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {top.map(l => (
                        <li key={`${l.funnel}-${l.name}`} className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate text-gray-700">{l.funnel} · {l.name}</span>
                            <span className="font-semibold text-emerald-600">{l.rate.toFixed(1)}%</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
