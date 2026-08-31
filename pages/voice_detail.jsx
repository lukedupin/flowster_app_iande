import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom"
import {ArrowLeftIcon} from "@heroicons/react/24/outline"

const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
})

export const VoiceDetail = props => {
    const {showToast} = props
    const navigate = useNavigate()
    const {id} = useParams()
    const isNew = id === 'new'

    const fileInputRef = useRef(null)

    const [loading, setLoading] = useState(!isNew)
    const [notFound, setNotFound] = useState(false)
    const [saving, setSaving] = useState(false)

    const [voice, setVoice] = useState(null)
    const [name, setName] = useState('')
    const [voiceModel, setVoiceModel] = useState('')
    const [exaggeration, setExaggeration] = useState(2.4)
    const [cfgWeight, setCfgWeight] = useState(1.5)
    const [pickedFile, setPickedFile] = useState(null)

    useEffect(() => {
        if (isNew) {
            return
        }

        fetch('/api/iande/list_voices')
            .then(resp => resp.json())
            .then(js => {
                if (!js.successful) {
                    showToast?.(js.reason, 'error')
                    return
                }

                const found = js.voices.find(v => v.uid === id)
                if (!found) {
                    setNotFound(true)
                    return
                }
                setVoice(found)
                setName(found.name)
                setVoiceModel(found.voice_model)
                setExaggeration(found.exaggeration)
                setCfgWeight(found.cfg_weight)
            })
            .catch(() => showToast?.('Failed to load voice', 'error'))
            .finally(() => setLoading(false))
    }, [id])

    const dirty = isNew || !voice
        || name !== voice.name
        || voiceModel !== voice.voice_model
        || Number(exaggeration) !== voice.exaggeration
        || Number(cfgWeight) !== voice.cfg_weight
        || pickedFile !== null

    const handleFileChange = async e => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }
        const base64 = await fileToBase64(file)
        setPickedFile({name: file.name, base64})
    }

    const handleSave = async () => {
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

        const resp = await fetch(`/api/iande/${isNew ? 'create_voice' : 'update_voice'}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
        const js = await resp.json()

        setSaving(false)

        if (!js.successful) {
            showToast?.(js.reason || 'Failed to save voice', 'error')
            return
        }

        showToast?.('Saved', 'success')
        navigate('/i_e/voices')
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/i_e/voices')}
                        className="text-gray-400 hover:text-gray-600">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>

                    {isNew &&
                        <h2 className="text-lg font-semibold text-gray-900">Create Voice</h2>
                    }
                </div>

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
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Voice Model</label>
                    <input
                        type="text"
                        value={voiceModel}
                        onChange={e => setVoiceModel(e.target.value)}
                        placeholder="iande-01"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-mono text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Voice Clone File</label>
                    <input
                        type="text"
                        value={pickedFile?.name || (voice?.file ? voice.file.split('/').pop() : '')}
                        readOnly
                        onClick={() => fileInputRef.current?.click()}
                        placeholder="Click to upload a reference clip"
                        className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-mono text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                        type="file"
                        accept="audio/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
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
