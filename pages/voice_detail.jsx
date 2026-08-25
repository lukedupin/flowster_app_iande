import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon} from "@heroicons/react/24/outline"

export const VoiceDetail = props => {
    const {voices, showToast} = props
    const onUpdate = props.onUpdate || (() => {})
    const navigate = useNavigate()
    const {id} = useParams()

    const voice = voices.find(v => v.id === Number(id))
    const fileInputRef = useRef(null)

    const [name, setName] = useState(voice?.name || '')
    const [voiceClone, setVoiceClone] = useState(voice?.voice_clone || '')
    const [exaggeration, setExaggeration] = useState(voice?.exaggeration ?? 0)
    const [cfgWeight, setCfgWeight] = useState(voice?.cfg_weight ?? 0)

    useEffect(() => {
        setName(voice?.name || '')
        setVoiceClone(voice?.voice_clone || '')
        setExaggeration(voice?.exaggeration ?? 0)
        setCfgWeight(voice?.cfg_weight ?? 0)
    }, [voice?.id])

    if (!voice) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">Voice not found.</p>
            </div>
        )
    }

    const dirty = name !== voice.name
        || voiceClone !== voice.voice_clone
        || Number(exaggeration) !== voice.exaggeration
        || Number(cfgWeight) !== voice.cfg_weight

    const handleSave = () => {
        onUpdate(voice.id, {
            name,
            voice_clone: voiceClone,
            exaggeration: Number(exaggeration),
            cfg_weight: Number(cfgWeight),
        })
        showToast?.('Saved', 'success')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
                <button
                    onClick={() => navigate('/i_e/voices')}
                    className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <button
                    onClick={handleSave}
                    disabled={!dirty}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    Save
                </button>
            </div>

            <div className="mx-4 sm:mx-6 rounded-lg border border-gray-200 bg-white px-4 py-4 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Voice Clone File</label>
                    <input
                        type="text"
                        value={voiceClone}
                        readOnly
                        onClick={() => fileInputRef.current?.click()}
                        placeholder="voice_clone.wav"
                        className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-mono text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                        type="file"
                        accept="audio/*"
                        ref={fileInputRef}
                        onChange={() => {}}
                        className="hidden"
                    />
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
