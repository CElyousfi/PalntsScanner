'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, X, Mic2, AudioWaveform } from 'lucide-react'
import { useBriefing, DialogueLine } from '@/hooks/useBriefing'
import { useAutonomy } from '@/context/AutonomyContext'

export default function DailyBriefingPlayer() {
    const { activeProfile, system } = useAutonomy()

    // Safety check: ensure hooks are called unconditionally, but handle nulls inside
    const { script } = useBriefing(activeProfile as any, system as any)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    const synth = useRef<SpeechSynthesis | null>(null)

    // Load voices
    useEffect(() => {
        if (typeof window !== 'undefined') {
            synth.current = window.speechSynthesis
            const loadVoices = () => {
                setVoices(window.speechSynthesis.getVoices())
            }
            loadVoices()
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    // Playback Logic
    useEffect(() => {
        if (isPlaying && synth.current && script.length > 0) {
            // Cancel any current speech if just starting (optional, but good for reset)
            if (currentLineIndex === 0) synth.current.cancel()

            const line = script[currentLineIndex]
            if (!line) {
                setIsPlaying(false)
                setCurrentLineIndex(0)
                return
            }

            const utterance = new SpeechSynthesisUtterance(line.text)

            // Assign Voices (Heuristic: Try to find different gendered/sounding voices)
            // This relies on browser availability. 
            // Sarah: Prefer female/soft. Mike: Prefer male/deep.
            const voiceList = voices
            const saraVoice = voiceList.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voiceList[0]
            const mikeVoice = voiceList.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel')) || voiceList[1] || voiceList[0]

            utterance.voice = line.speaker === 'Sarah' ? saraVoice : mikeVoice
            utterance.rate = 1.1 // Slightly faster podcast pace
            utterance.pitch = line.speaker === 'Sarah' ? 1.1 : 0.9

            utterance.onend = () => {
                if (currentLineIndex < script.length - 1) {
                    setCurrentLineIndex(prev => prev + 1)
                } else {
                    setIsPlaying(false)
                    setCurrentLineIndex(0)
                }
            }

            synth.current.speak(utterance)

            // Cleanup if unmounted or paused
            return () => {
                // We don't necessarily want to cancel on every render, strictly controlled by isPlaying
            }
        } else if (!isPlaying && synth.current) {
            synth.current.cancel()
        }
    }, [isPlaying, currentLineIndex, script, voices])


    if (!isVisible || !activeProfile) return null

    return (
        <div className="fixed bottom-6 right-6 z-40 w-80 animate-fade-in-up">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden group hover:border-white/20 transition-all">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Mic2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base tracking-tight">LeafScan Audio</h3>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Deep Dive • Daily</p>
                    </div>
                </div>

                {/* Audio Visualization Area */}
                <div className="flex items-center justify-center h-24 mb-6 relative">
                    {isPlaying ? (
                        <div className="flex items-center gap-1.5 h-full">
                            {/* Simulated Waveform Bars */}
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-white rounded-full animate-music-bar-1"
                                    style={{
                                        height: `${Math.random() * 80 + 20}%`,
                                        animationDuration: `${0.8 + Math.random() * 0.5}s`
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                            >
                                <Play className="w-8 h-8 fill-current ml-1" />
                            </button>
                            <p className="text-xs text-white/50 mt-3 font-medium">Tap to listen</p>
                        </div>
                    )}
                </div>

                {/* Active Speaker Indicator (Minimal) */}
                {isPlaying && (
                    <div className="text-center mb-6 h-6">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest animate-pulse">
                            {script[currentLineIndex]?.speaker} Speaking...
                        </p>
                    </div>
                )}

                {/* Controls Footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                        {/* Play/Pause Minimal */}
                        {isPlaying && (
                            <button onClick={() => setIsPlaying(false)} className="text-white/70 hover:text-white">
                                <Pause className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-xs font-mono text-white/40">
                            {isPlaying ? '04:20' : '00:00'} / 05:00
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white/60">1.0x</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
