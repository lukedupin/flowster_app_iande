import React, {useMemo, useState} from 'react'
import {
    ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, BarChart,
} from 'recharts'

const DAYS_IN_RANGE = 30

const SCRIPT_STATE_NAMES = ['intro', 'qualify', 'objection', 'close', 'wrap_up']
const BLOG_URLS = [
    '/blog/estate-planning-basics',
    '/blog/life-insurance-101',
    '/blog/trust-vs-will',
    '/blog/probate-process',
    '/blog/tax-benefits',
]

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

const monthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
        options.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
    }
    return options
}

const monthKey = d => `${d.getFullYear()}-${d.getMonth()}`
const monthLabel = d => d.toLocaleString('en-US', {month: 'long', year: 'numeric'})

// Deterministic pseudo-random generator so a given month always renders the same dummy data
const seededRandom = seed => {
    let s = seed % 2147483647
    if (s <= 0) {
        s += 2147483646
    }
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

const hashSeed = str => {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) | 0
    }
    return Math.abs(h) || 1
}

const buildDummyData = (month) => {
    const rand = seededRandom(hashSeed(monthKey(month)))

    const changesPerDay = []
    for (let day = 1; day <= DAYS_IN_RANGE; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        changesPerDay.push({
            date: date.toLocaleString('en-US', {month: 'short', day: 'numeric'}),
            changes: Math.round(8 + rand() * 20),
            avg_qa: Math.round((2 + rand() * 4) * 10) / 10,
        })
    }

    const scriptStates = SCRIPT_STATE_NAMES.map(name => ({
        name,
        value: Math.round(6 + rand() * 30),
    }))

    const topBlogs = BLOG_URLS.map(url => ({
        url,
        count: Math.round(5 + rand() * 25),
    })).sort((a, b) => b.count - a.count)

    return {changesPerDay, scriptStates, topBlogs}
}

export const DashboardCard = props => {
    const {showToast} = props
    const [selectedMonth, setSelectedMonth] = useState(monthOptions()[0])

    const months = useMemo(monthOptions, [])
    const {changesPerDay, scriptStates, topBlogs} = useMemo(
        () => buildDummyData(selectedMonth),
        [monthKey(selectedMonth)]
    )

    const handleMonthChange = e => {
        const month = months.find(m => monthKey(m) === e.target.value)
        if (month) {
            setSelectedMonth(month)
        }
    }

    return (
        <div className="flex group justify-start sm:pr-12">
            <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 px-4 py-4 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

                    <select
                        value={monthKey(selectedMonth)}
                        onChange={handleMonthChange}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {months.map(m => (
                            <option key={monthKey(m)} value={monthKey(m)}>{monthLabel(m)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Changes per Day (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={changesPerDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" interval={2} tick={{fontSize: 10}} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="changes" name="Changes" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                                <Legend />
                                <Pie data={scriptStates} dataKey="value" nameKey="name" outerRadius={80} label>
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
