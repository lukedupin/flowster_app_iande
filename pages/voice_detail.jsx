import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon, ArrowUpTrayIcon, PlayIcon} from "@heroicons/react/24/outline"
import * as Network from "../helper/network.jsx"
import * as Util from "../../src/helpers/util.js"

const toSnakeCase = str => str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
})

const PlayingBars = () => (
    <div className="flex h-4 items-end gap-0.5">
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '60%', animationDelay: '0ms'}} />
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '100%', animationDelay: '150ms'}} />
        <span className="w-1 animate-bounce rounded-sm bg-white" style={{height: '75%', animationDelay: '300ms'}} />
    </div>
)

export const VoiceDetail = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const {id} = useParams()
    const isNew = id === 'new'

    const fileInputRef = useRef(null)
    const audioRef = useRef(null)

    const [loading, setLoading] = useState(!isNew)
    const [playingUid, setPlayingUid] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [saving, setSaving] = useState(false)

    const [voice, setVoice] = useState(null)
    const [name, setName] = useState('')
    const [voiceModel, setVoiceModel] = useState('')
    const [syncVoiceModel, setSyncVoiceModel] = useState(false)
    const [exaggeration, setExaggeration] = useState(2.4)
    const [cfgWeight, setCfgWeight] = useState(1.5)
    const [pickedFile, setPickedFile] = useState(null)

    useEffect(() => {
        if (isNew) {
            return
        }

        Network.get('/api/iande/list_voices', null, js => {
            const found = js.voices.find(v => v.uid === id)
            if (!found) {
                setNotFound(true)
            }
            else {
                setVoice(found)
                setName(found.name)
                setVoiceModel(found.voice_model)
                setExaggeration(found.exaggeration)
                setCfgWeight(found.cfg_weight)
            }
            setLoading(false)
        }, reason => {
            showToast?.(reason || 'Failed to load voice', 'error')
            setLoading(false)
        })
    }, [id])

    const dirty = isNew || !voice
        || name !== voice.name
        || voiceModel !== voice.voice_model
        || Number(exaggeration) !== voice.exaggeration
        || Number(cfgWeight) !== voice.cfg_weight
        || pickedFile !== null

    const stopPlaying = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        setPlayingUid(null)
    }

    const handlePlay = () => {
        if (!voice) {
            return
        }

        if (playingUid === voice.uid) {
            stopPlaying()
            return
        }

        stopPlaying()

        Network.post('/api/iande/voice_file', {uid: voice.uid}, js => {
            const blob = new Blob([Util.base64ToArrayBuffer(js.audio)], {type: `audio/${js.type}`})
            const audio = new Audio(URL.createObjectURL(blob))
            audio.onended = () => stopPlaying()
            audioRef.current = audio
            setPlayingUid(voice.uid)
            audio.play()
        }, reason => showToast?.(reason, 'error'))
    }

    const handleFileChange = async e => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }
        const base64 = await fileToBase64(file)
        setPickedFile({name: file.name, base64})
        showToast?.(`Selected ${file.name}`, 'success')
    }

    const handleSave = () => {
        if (!name.trim() || !voiceModel.trim()) {
            showToast?.('Name and voice model are required', 'error')
            return
        }
        if (isNew && !pickedFile) {
            showToast?.('A reference audio clip is required', 'error')
            return
        }

        setSaving(true)

        const body = {
            name: name.trim(),
            voice_model: voiceModel.trim(),
            exaggeration: Number(exaggeration),
            cfg_weight: Number(cfgWeight),
        }
        if (pickedFile) {
            body.file = pickedFile.base64
        }
        if (!isNew) {
            body.uid = id
        }

        Network.post(`/api/iande/${isNew ? 'create_voice' : 'update_voice'}`, body, () => {
            setSaving(false)
            showToast?.('Saved', 'success')
            navigate('/i_e/voices')
        }, reason => {
            setSaving(false)
            showToast?.(reason || 'Failed to save voice', 'error')
        })
    }

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Voice not found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={() => navigate('/i_e/voices')}
                    className="flex items-center gap-3 text-gray-900 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5 text-gray-400" />

                    <h2 className="text-lg font-semibold">
                        {isNew ? 'Create Voice' : 'Update Voice'}
                    </h2>
                </button>

                <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isNew ? 'Create' : 'Save'}
                </button>
            </div>

            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white px-4 py-4 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onFocus={() => setSyncVoiceModel(!voiceModel.trim())}
                        onBlur={() => setSyncVoiceModel(false)}
                        onChange={e => {
                            const value = e.target.value
                            setName(value)
                            if (syncVoiceModel) {
                                setVoiceModel(toSnakeCase(value))
                            }
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Voice Model - ( Ideal 30 seconds of clean audio )</label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <button
                                type="button"
                                onClick={handlePlay}
                                disabled={!voice}
                                title={playingUid === voice?.uid ? 'Stop' : 'Play voice sample'}
                                className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {playingUid === voice?.uid
                                    ? <PlayingBars />
                                    : <PlayIcon className="h-3.5 w-3.5" />
                                }
                            </button>

                            <input
                                type="text"
                                value={voiceModel}
                                onChange={e => setVoiceModel(e.target.value)}
                                placeholder="iande-01"
                                className="w-full rounded-md border border-gray-300 py-1.5 pl-10 pr-3 text-sm font-mono text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload voice clone file"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                            <ArrowUpTrayIcon className="h-4 w-4" />
                        </button>
                        <input
                            type="file"
                            accept="audio/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Exaggeration</label>
                        <input
                            type="number"
                            step="0.1"
                            value={exaggeration}
                            onChange={e => setExaggeration(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">CFG Weight</label>
                        <input
                            type="number"
                            step="0.1"
                            value={cfgWeight}
                            onChange={e => setCfgWeight(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
