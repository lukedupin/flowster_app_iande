import React, {useEffect, useRef, useState} from 'react'
import {useNavigate} from "react-router-dom"
import {PlusIcon, MicrophoneIcon, PlayIcon, ArrowDownTrayIcon} from "@heroicons/react/24/outline"
import {EmptyList} from "../../src/components/empty_list.jsx"
import * as Util from "../../src/helpers/util.js"

const PlayingBars = () => (
    <div className="flex h-4 items-end gap-0.5">
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '60%', animationDelay: '0ms'}} />
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '100%', animationDelay: '150ms'}} />
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '75%', animationDelay: '300ms'}} />
    </div>
)

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
    const {showToast} = props
    const navigate = useNavigate()
    const [voices, setVoices] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [testVoiceId, setTestVoiceId] = useState(null)
    const [testText, setTestText] = useState('')
    const [playingUid, setPlayingUid] = useState(null)
    const audioRef = useRef(null)
    const [testPlaying, setTestPlaying] = useState(false)
    const testAudioRef = useRef(null)
    const testAbortRef = useRef(null)
    const [testDownloading, setTestDownloading] = useState(false)

    useEffect(() => {
        fetch('/api/iande/list_voices')
            .then(resp => resp.json())
            .then(js => {
                if (!js.successful) {
                    showToast?.(js.reason, 'error')
                    return
                }
                setVoices(js.voices)
                setTestVoiceId(prev => prev ?? js.voices[0]?.uid ?? null)
            })
            .catch(() => showToast?.('Failed to load voices', 'error'))
            .finally(() => setLoaded(true))
    }, [])

    const handleCreate = () => navigate('/i_e/voices/new')

    const stopPlaying = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        setPlayingUid(null)
    }

    const handlePlay = async (e, voice) => {
        e.stopPropagation()

        if (playingUid === voice.uid) {
            stopPlaying()
            return
        }

        stopPlaying()

        const resp = await fetch('/api/iande/voice_file', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({uid: voice.uid}),
        })
        const js = await resp.json()

        if (!js.successful) {
            showToast?.(js.reason, 'error')
            return
        }

        const blob = new Blob([Util.base64ToArrayBuffer(js.audio)], {type: `audio/${js.type}`})
        const audio = new Audio(URL.createObjectURL(blob))
        audio.onended = () => stopPlaying()
        audioRef.current = audio
        setPlayingUid(voice.uid)
        audio.play()
    }

    const stopTestPlaying = () => {
        if (testAbortRef.current) {
            testAbortRef.current.abort()
            testAbortRef.current = null
        }
        if (testAudioRef.current) {
            testAudioRef.current.pause()
            testAudioRef.current = null
        }
        setTestPlaying(false)
    }

    const handleTestDownload = () => {
        const voice = voices.find(v => v.uid === testVoiceId)
        if (!voice || !testText.trim()) {
            return
        }

        setTestDownloading(true)

        fetch('/api/iande/voice_gen', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({uid: voice.uid, text: testText, type: 'mp3'}),
        })
            .then(resp => resp.json())
            .then(js => {
                if (!js.successful) {
                    showToast?.(js.reason, 'error')
                    return
                }

                const blob = new Blob([Util.base64ToArrayBuffer(js.audio)], {type: `audio/${js.type}`})
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${voice.name}.${js.type}`
                link.click()
                URL.revokeObjectURL(url)
            })
            .catch(() => showToast?.('Failed to generate speech', 'error'))
            .finally(() => setTestDownloading(false))
    }

    const handleTestPlay = () => {
        if (testPlaying) {
            stopTestPlaying()
            return
        }

        const voice = voices.find(v => v.uid === testVoiceId)
        if (!voice || !testText.trim()) {
            return
        }

        setTestPlaying(true)

        const controller = new AbortController()
        testAbortRef.current = controller

        fetch('/api/iande/voice_gen', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({uid: voice.uid, text: testText, type: 'mp3'}),
            signal: controller.signal,
        })
            .then(resp => resp.json())
            .then(js => {
                testAbortRef.current = null

                if (!js.successful) {
                    showToast?.(js.reason, 'error')
                    setTestPlaying(false)
                    return
                }

                const blob = new Blob([Util.base64ToArrayBuffer(js.audio)], {type: `audio/${js.type}`})
                const audio = new Audio(URL.createObjectURL(blob))
                audio.onended = () => stopTestPlaying()
                testAudioRef.current = audio
                audio.play()
            })
            .catch(err => {
                testAbortRef.current = null
                if (err.name !== 'AbortError') {
                    showToast?.('Failed to generate speech', 'error')
                }
                setTestPlaying(false)
            })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Voices</h2>

                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="h-4 w-4" />
                    Create
                </button>
            </div>

            {loaded && voices.length === 0 &&
                <EmptyList
                    icon={MicrophoneIcon}
                    name="voices"
                    onCreate={handleCreate}
                />
            }

            {voices.length > 0 &&
            <ul role="list" className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden mx-4 sm:mx-6">
                {voices.map((voice, idx) => (
                    <li key={voice.uid}
                        className="flex items-center gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/i_e/voices/${voice.uid}`)}>
                        <div
                            className={`group/play flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                            onClick={e => handlePlay(e, voice)}>
                            {playingUid === voice.uid
                                ? <PlayingBars />
                                : <>
                                    <MicrophoneIcon className="h-5 w-5 group-hover/play:hidden" />
                                    <PlayIcon className="h-5 w-5 hidden group-hover/play:block" />
                                </>
                            }
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{voice.name}</p>
                            <p className="text-xs text-gray-400 font-mono truncate">{voice.voice_model}</p>
                        </div>
                    </li>
                ))}
            </ul>
            }

            {voices.length > 0 &&
            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <select
                        value={testVoiceId ?? ''}
                        onChange={e => setTestVoiceId(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {voices.map(voice => (
                            <option key={voice.uid} value={voice.uid}>{voice.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleTestDownload}
                        disabled={!testVoiceId || !testText.trim() || testDownloading}
                        title="Download mp3"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleTestPlay}
                        disabled={(!testVoiceId || !testText.trim()) && !testPlaying}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {testPlaying
                            ? <>
                                <PlayingBars />
                                Stop
                            </>
                            : <>
                                <PlayIcon className="h-4 w-4" />
                                Play
                            </>
                        }
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
            }
        </div>
    )
}
