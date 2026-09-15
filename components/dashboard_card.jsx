import React, {useEffect, useMemo, useState} from 'react'
import {
    ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, BarChart,
} from 'recharts'
import * as Util from "../../src/helpers/util.js"

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

const monthKey = (year, month) => `${year}-${month}`
const monthLabel = (year, month) => new Date(year, month - 1, 1).toLocaleString('en-US', {month: 'long', year: 'numeric'})

const buildContextMarkdown = (year, month, chatsPerDay, scriptStates, topBlogs) => {
    const totalChats = chatsPerDay.reduce((sum, d) => sum + d.chats, 0)
    const avgQa = chatsPerDay.length
        ? chatsPerDay.reduce((sum, d) => sum + d.avg_qa, 0) / chatsPerDay.length
        : 0

    const lines = [
        `# Dashboard for ${monthLabel(year, month)}`,
        '',
        `**Total chats (last 30 days):** ${totalChats}`,
        `**Average Q/A per chat:** ${avgQa.toFixed(1)}`,
        '',
        '## Script States Touched',
        ...scriptStates.map(s => `- ${s.name}: ${s.value}`),
        '',
        '## Top Blogs by Chat Interactions',
        ...topBlogs.map(b => `- ${b.url}: ${b.count}`),
    ]

    return lines.join('\n')
}

export const DashboardCard = props => {
    const {showToast} = props
    const onContextChange = props.onContextChange || (() => {})

    const [months, setMonths] = useState([])
    const [selectedKey, setSelectedKey] = useState(null)

    useEffect(() => {
        Util.fetch_js('/api/iande/dashboard_stats', null, js => {
            setMonths(js.months)
            if (js.months.length > 0) {
                const latest = js.months[js.months.length - 1]
                setSelectedKey(monthKey(latest.year, latest.month))
            }
        }, showToast)
    }, [])

    const orderedMonths = useMemo(() => [...months].reverse(), [months])
    const selected = months.find(m => monthKey(m.year, m.month) === selectedKey) || null

    useEffect(() => {
        if (!selected) {
            return
        }

        onContextChange(buildContextMarkdown(
            selected.year, selected.month, selected.chats_per_day, selected.script_states, selected.top_blogs
        ))
    }, [selected])

    const handleMonthChange = e => {
        setSelectedKey(e.target.value)
    }

    if (!selected) {
        return (
            <div className="flex group justify-start sm:pr-12">
                <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 px-4 py-4 shadow-sm">
                    <p className="text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const chatsPerDay = selected.chats_per_day
    const scriptStates = selected.script_states
    const topBlogs = selected.top_blogs

    return (
        <div className="flex group justify-start sm:pr-12">
            <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 px-4 py-4 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

                    <select
                        value={selectedKey}
                        onChange={handleMonthChange}
                        className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {orderedMonths.map(m => (
                            <option key={monthKey(m.year, m.month)} value={monthKey(m.year, m.month)}>
                                {monthLabel(m.year, m.month)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Chats per Day (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={chatsPerDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" interval={2} tick={{fontSize: 10}} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="chats" name="Chats" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="avg_qa" name="Avg Q/A" stroke="#f59e0b" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Script States Touched (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Tooltip />
                                <Legend
                                    position="right"
                                    formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                                />
                                <Pie data={scriptStates} dataKey="value" nameKey="name" outerRadius={80}>
                                    {scriptStates.map((entry, idx) => (
                                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Top 5 Blogs by Chat Interactions</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topBlogs} layout="vertical" margin={{left: 24}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="url" width={160} tick={{fontSize: 11}} />
                                <Tooltip />
                                <Bar dataKey="count" name="Interactions" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
