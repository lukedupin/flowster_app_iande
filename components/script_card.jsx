import React from 'react'
import {MarkdownViewer} from "../../src/components/markdown_viewer.jsx"

const toMarkdown = section => {
    const variables = section.variables.map(v => `- ${v}`).join('\n')
    const next_states = section.next_states.map(s => `- ${s}`).join('\n')

    return `## ${section.title}\n\n${section.description}\n\n**Variables**\n\n${variables}\n\n**Next States**\n\n${next_states}`
}

export const ScriptCard = props => {
    const {message, showToast} = props
    const section = message?.content

    if (!section) {
        return null
    }

    return (
        <div className="flex group justify-start sm:pr-12">
            <div className="w-full bg-white text-gray-900 rounded-2xl rounded-tr-sm border border-gray-200 px-4 py-2 shadow-sm">
                <MarkdownViewer content={toMarkdown(section)} showToast={showToast} />
            </div>
        </div>
    )
}
