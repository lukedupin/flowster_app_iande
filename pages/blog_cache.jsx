import React, {useState} from 'react'
import {TrashIcon} from "@heroicons/react/24/outline"
import {formatLength} from "../components/format_size.js"

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
const makeContent = repeat => LOREM.repeat(repeat)

const INITIAL_BLOG_CACHE = [
    {id: 1, url: 'https://www.insuranceandestates.com/blog/term-vs-whole-life', content: makeContent(15), next_update_hours: 6},
    {id: 2, url: 'https://www.insuranceandestates.com/blog/estate-planning-101', content: makeContent(60), next_update_hours: 24},
    {id: 3, url: 'https://www.insuranceandestates.com/blog/probate-timeline', content: makeContent(3), next_update_hours: 2},
    {id: 4, url: 'https://www.insuranceandestates.com/blog/final-expense-guide', content: makeContent(120), next_update_hours: 12},
]

export const BlogCachePage = props => {
    const {showToast} = props
    const [blogs, setBlogs] = useState(INITIAL_BLOG_CACHE)

    const handleDelete = (e, id) => {
        e.stopPropagation()
        setBlogs(prev => prev.filter(b => b.id !== id))
        showToast?.('Deleted', 'success')
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Blog Cache</h2>

            <ul role="list" className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden mx-4 sm:mx-6">
                {blogs.map(blog => (
                    <li key={blog.id} className="group flex items-center justify-between gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{blog.url}</p>
                            <p className="text-xs text-gray-400 mt-1">Next update in {blog.next_update_hours}h</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-gray-400">{formatLength(blog.content.length)}</span>
                            <button
                                onClick={e => handleDelete(e, blog.id)}
                                className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
