import React from 'react'

export const SeparatorCard = props => {
    const {text} = props

    return (
        <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-gray-200" />
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{text}</p>
            <div className="h-px flex-1 bg-gray-200" />
        </div>
    )
}
