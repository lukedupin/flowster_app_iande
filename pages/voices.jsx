import React, {useState} from 'react'
import {useNavigate} from "react-router-dom"
import {PlusIcon, MicrophoneIcon, PlayIcon} from "@heroicons/react/24/outline"
import {VoiceCreateModal} from "../components/voice_create_modal.jsx"

const AVATAR_COLORS = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
]

export const VoicesPage = props => {
    const {voices, showToast} = props
    const onCreate = props.onCreate || (() => {})
    const navigate = useNavigate()
    const [createOpen, setCreateOpen] = useState(false)
    const [testVoiceId, setTestVoiceId] = useState(voices[0]?.id ?? null)
    const [testText, setTestText] = useState('')

    const handleCreate = name => {
        onCreate(name)
        setCreateOpen(false)
    }

    const handlePlay = (e, voice) => {
        e.stopPropagation()
        showToast?.(`Playing ${voice.voice_clone}`, 'success')
    }

    const handleTestPlay = () => {
        const voice = voices.find(v => v.id === testVoiceId)
        showToast?.(`${voice?.name} says: "${testText}"`, 'success')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Voices</h2>

                <button
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="h-4 w-4" />
                    Create
                </button>
            </div>

            <ul role="list" className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden mx-4 sm:mx-6">
                {voices.map((voice, idx) => (
                    <li key={voice.id}
                        className="flex items-center gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/i_e/voices/${voice.id}`)}>
                        <div
                            className={`group/play flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                            onClick={e => handlePlay(e, voice)}>
                            <MicrophoneIcon className="h-5 w-5 group-hover/play:hidden" />
                            <PlayIcon className="h-5 w-5 hidden group-hover/play:block" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{voice.name}</p>
                            <p className="text-xs text-gray-400 font-mono truncate">{voice.voice_clone}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <select
                        value={testVoiceId ?? ''}
                        onChange={e => setTestVoiceId(Number(e.target.value))}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {voices.map(voice => (
                            <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleTestPlay}
                        disabled={!testVoiceId || !testText.trim()}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlayIcon className="h-4 w-4" />
                        Play
                    </button>
                </div>

                <textarea
                    value={testText}
                    onChange={e => setTestText(e.target.value)}
                    rows={4}
                    placeholder="Type something for the voice to say..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <VoiceCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    )
}
