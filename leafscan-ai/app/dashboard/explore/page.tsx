'use client'

import React, { useState, useMemo } from 'react'
import { Search, BookOpen, ArrowLeft, Leaf, Droplets, Sun, Bug, Sprout, Sparkles, Loader2, AlertTriangle, Beaker, Save, Check, Bookmark, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAutonomy } from '@/hooks/useAutonomy'
import { useKnowledge, AIGuide } from '@/context/KnowledgeContext'
import PageShell from '@/components/dashboard/PageShell'

// Static Guides (Base Knowledge)
const BASE_GUIDES: AIGuide[] = [
    {
        id: '1',
        title: 'Tomato Blight: Early Detection',
        category: 'Disease ID',
        iconType: 'bug',
        readTime: '5 min',
        description: 'Learn to distinguish between Early and Late Blight before it destroys your harvest.',
        tags: ['tomato', 'disease', 'fungal'],
        image: '/images/wiki/tomato-blight.png',
        createdAt: new Date().toISOString(),
        fullContent: '...'
    },
    // ... we can add more base guides here or keep it minimal
]

export default function ExplorePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { activeProfile, system } = useAutonomy()
    const { savedGuides, saveGuide, deleteGuide, isGuideSaved } = useKnowledge()

    const initialSearch = searchParams.get('q') || searchParams.get('search')
    const [searchTerm, setSearchTerm] = useState(initialSearch || '')
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiGuide, setAiGuide] = useState<AIGuide | null>(null)
    const [viewMode, setViewMode] = useState<'browse' | 'saved'>('browse')

    const [selectedGuide, setSelectedGuide] = useState<AIGuide | null>(null)
    
    // Auto-trigger search when query parameter is present
    React.useEffect(() => {
        if (initialSearch && !aiGuide && !isGenerating) {
            handleSearchEnter()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Merged Guides (Base + Saved) for Browse View? 
    // Actually, "Browse" is for search/discovery. "Saved" is for personal library.

    // Search Logic
    const handleSearchEnter = async () => {
        if (!searchTerm) return

        // Check if exists in Saved
        const savedMatch = savedGuides.find(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()))
        if (savedMatch) {
            setSelectedGuide(savedMatch)
            return
        }

        // Trigger real web search
        setIsGenerating(true)
        setAiGuide(null)

        try {
            const response = await fetch('/api/search-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchTerm })
            })

            const data = await response.json()

            if (data.success && data.guide) {
                const newGuide: AIGuide = {
                    id: 'web-search-' + Date.now(),
                    title: data.guide.title,
                    category: 'Research-Based',
                    iconType: 'sparkles',
                    readTime: data.guide.readTime || '5 min',
                    description: data.guide.description,
                    tags: data.guide.tags || ['research', 'web-sourced'],
                    createdAt: new Date().toISOString(),
                    fullContent: data.guide.fullContent,
                    image: '/images/wiki/ai-brain.png'
                }
                setAiGuide(newGuide)
            } else {
                // Fallback if search fails
                const fallbackGuide: AIGuide = {
                    id: 'fallback-' + Date.now(),
                    title: `Guide: ${searchTerm}`,
                    category: 'General Information',
                    iconType: 'sparkles',
                    readTime: '3 min',
                    description: `Information about "${searchTerm}". For detailed guidance, consult agricultural experts or extension services.`,
                    tags: ['general'],
                    createdAt: new Date().toISOString(),
                    fullContent: `# ${searchTerm}\n\nFor comprehensive information about ${searchTerm}, we recommend:\n\n- Consulting local agricultural extension services\n- Visiting USDA or FAO websites\n- Checking university agricultural programs\n- Reading peer-reviewed agricultural journals\n\nThese sources provide the most accurate and region-specific guidance.`
                }
                setAiGuide(fallbackGuide)
            }
        } catch (error) {
            console.error('Search failed:', error)
            // Show error fallback
            const errorGuide: AIGuide = {
                id: 'error-' + Date.now(),
                title: `${searchTerm}`,
                category: 'Information',
                iconType: 'sparkles',
                readTime: '2 min',
                description: 'Unable to fetch web results. Please try again or consult agricultural resources.',
                tags: ['offline'],
                createdAt: new Date().toISOString(),
                fullContent: `# ${searchTerm}\n\nWe encountered an issue searching for this information. Please try again later or consult:\n\n- Local agricultural extension services\n- USDA resources\n- University agricultural programs`
            }
            setAiGuide(errorGuide)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = (guide: AIGuide) => {
        saveGuide(guide)
        // Feedback handled by UI state change
    }

    // Detail View Content
    const DetailView = () => (
        <article className="animate-fade-in space-y-8">
            <div className="h-64 rounded-3xl overflow-hidden relative shadow-lg">
                {/* Fallback image logic */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={selectedGuide?.image || '/images/wiki/ai-brain.png'}
                    alt={selectedGuide?.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-white/10 flex items-center gap-2 w-fit">
                        <BookOpen className="w-3 h-3" /> {selectedGuide?.readTime} read
                    </span>
                </div>
            </div>

            <div className="prose prose-emerald max-w-none prose-lg prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-800">
                <div className="flex items-center justify-between border-b border-stone-200 pb-6 mb-8">
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                            LS
                        </div>
                        <span>Generated by <span className="font-bold text-stone-900">LeafScan AI</span></span>
                    </div>

                    <button
                        onClick={() => selectedGuide && (isGuideSaved(selectedGuide.id) ? deleteGuide(selectedGuide.id) : saveGuide(selectedGuide))}
                        className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${selectedGuide && isGuideSaved(selectedGuide.id)
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600'
                            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg'
                            }`}
                    >
                        {selectedGuide && isGuideSaved(selectedGuide.id) ? (
                            <><Check className="w-4 h-4" /> Saved</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save to Library</>
                        )}
                    </button>
                </div>

                <p className="text-xl font-serif text-stone-700 leading-relaxed mb-8 border-l-4 border-emerald-500 pl-6 italic">
                    {selectedGuide?.description}
                </p>
                <div className="space-y-6">
                    {selectedGuide?.fullContent?.split('\n\n').map((paragraph, idx) => {
                        // Handle headings
                        if (paragraph.startsWith('# ')) {
                            return (
                                <h1 key={idx} className="text-4xl font-serif font-bold text-stone-900 mt-8 mb-4">
                                    {paragraph.replace(/^# /, '')}
                                </h1>
                            )
                        }
                        if (paragraph.startsWith('## ')) {
                            return (
                                <h2 key={idx} className="text-3xl font-serif font-bold text-stone-800 mt-6 mb-3">
                                    {paragraph.replace(/^## /, '')}
                                </h2>
                            )
                        }
                        if (paragraph.startsWith('### ')) {
                            return (
                                <h3 key={idx} className="text-2xl font-serif font-bold text-stone-800 mt-4 mb-2">
                                    {paragraph.replace(/^### /, '')}
                                </h3>
                            )
                        }
                        // Handle lists
                        if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                            const items = paragraph.split('\n').filter(line => line.trim())
                            return (
                                <ul key={idx} className="list-disc list-inside space-y-2 text-stone-700 leading-relaxed">
                                    {items.map((item, i) => (
                                        <li key={i} className="ml-4">
                                            {item.replace(/^- /, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 hover:underline" target="_blank">$1</a>')}
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                        // Handle numbered lists
                        if (/^\d+\./.test(paragraph)) {
                            const items = paragraph.split('\n').filter(line => line.trim())
                            return (
                                <ol key={idx} className="list-decimal list-inside space-y-2 text-stone-700 leading-relaxed">
                                    {items.map((item, i) => (
                                        <li key={i} className="ml-4" dangerouslySetInnerHTML={{
                                            __html: item.replace(/^\d+\.\s*/, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
                                        }} />
                                    ))}
                                </ol>
                            )
                        }
                        // Regular paragraphs with link support
                        if (paragraph.trim()) {
                            return (
                                <p key={idx} className="text-stone-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{
                                    __html: paragraph.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
                                }} />
                            )
                        }
                        return null
                    })}
                </div>
            </div>
        </article>
    )

    // Main Render
    return (
        <PageShell
            title={selectedGuide ? selectedGuide.title : "Knowledge Base"}
            badge={selectedGuide ? (
                <div className="bg-[#EAE8D9] text-stone-800 text-xs px-3 py-1 rounded-full font-sans uppercase tracking-wider font-bold inline-flex items-center gap-1 shadow-sm border border-stone-300/50">
                    <BookOpen className="w-3 h-3" />
                    {selectedGuide.category}
                </div>
            ) : undefined}
            action={selectedGuide ? (
                <button
                    onClick={() => setSelectedGuide(null)}
                    className="w-12 h-12 rounded-full border border-[#EAE8D9] bg-[#Fdfbf7] flex items-center justify-center hover:scale-105 transition-transform text-stone-700 shadow-md group"
                    title="Back to Library"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
            ) : (
                <div className="flex bg-[#Fdfbf7] p-1 rounded-full border border-[#EAE8D9] shadow-sm">
                    <button
                        onClick={() => setViewMode('browse')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'browse' ? 'bg-[#EAE8D9] text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Browse
                    </button>
                    <button
                        onClick={() => setViewMode('saved')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'saved' ? 'bg-[#EAE8D9] text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Saved ({savedGuides.length})
                    </button>
                </div>
            )}
        >
            {selectedGuide ? (
                <DetailView />
            ) : (
                <div className="animate-fade-in pb-12">
                    {viewMode === 'browse' && (
                        <>
                            {/* Search Hero */}
                            <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl mb-12">
                                <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay" />
                                <div className="relative z-10 max-w-2xl">
                                    <h2 className="text-3xl font-serif font-bold mb-6 text-[#EAE8D9]">What do you want to learn today?</h2>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                setAiGuide(null)
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchEnter()}
                                            placeholder={`Search guides for your ${activeProfile?.cropType || 'garden'}...`}
                                            className="w-full h-14 pl-14 pr-6 rounded-full bg-white/10 border border-white/20 text-[#EAE8D9] placeholder:text-white/40 focus:bg-[#EAE8D9] focus:text-emerald-900 focus:outline-none focus:ring-4 focus:ring-[#EAE8D9]/30 transition-all font-medium backdrop-blur-sm"
                                        />
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        {searchTerm && <button onClick={() => { setSearchTerm(''); setAiGuide(null) }} className="absolute right-4 top-1/2 font-bold text-xs text-white/70 hover:text-white -translate-y-1/2">CLEAR</button>}
                                    </div>
                                    <p className="mt-4 text-emerald-200/80 text-sm font-medium tracking-wide">
                                        Pro tip: Type any custom topic and hit Enter to generate a new guide.
                                    </p>
                                </div>
                                <BookOpen className="absolute -bottom-12 -right-12 w-64 h-64 text-emerald-800/30 rotate-12" />
                            </div>

                            {/* Results */}
                            <div className="space-y-4">
                                {isGenerating ? (
                                    <div className="bg-white/50 rounded-3xl p-12 text-center border border-stone-200/50 animate-pulse">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-stone-800">Searching Wikipedia, WHO, FAO...</h3>
                                        <p className="text-stone-500">Gathering research-based information for &quot;{searchTerm}&quot;</p>
                                    </div>
                                ) : aiGuide ? (
                                    <div
                                        onClick={() => setSelectedGuide(aiGuide)}
                                        className="bg-white p-8 rounded-3xl border border-stone-200 shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all mb-8 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-3 bg-emerald-100/50 rounded-bl-2xl text-emerald-800 font-bold text-xs">Research-Based Guide</div>
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Sparkles className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h4 className="font-serif font-bold text-2xl text-stone-900 mb-3">{aiGuide.title}</h4>
                                                <p className="text-stone-600 text-base mb-4 max-w-xl leading-relaxed">{aiGuide.description}</p>
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-colors">Click to Read & Save</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-60">
                                        <p className="text-stone-400 font-serif italic text-lg">Enter a topic above to generate a new guide.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {viewMode === 'saved' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedGuides.length === 0 ? (
                                <div className="col-span-3 text-center py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-stone-300">
                                    <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                                    <h3 className="font-bold text-stone-900 text-lg">Your Library is Empty</h3>
                                    <p className="text-stone-500 text-sm">Generate guides in the Browse tab and save them here.</p>
                                </div>
                            ) : (
                                savedGuides.map(guide => (
                                    <div
                                        key={guide.id}
                                        onClick={() => setSelectedGuide(guide)}
                                        className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer p-6 flex flex-col h-full relative group"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteGuide(guide.id) }}
                                                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="w-12 h-12 bg-[#EAE8D9] rounded-2xl flex items-center justify-center text-stone-700 mb-4">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold font-serif text-lg text-stone-900 mb-2 line-clamp-2">{guide.title}</h4>
                                        <p className="text-stone-500 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">{guide.description}</p>
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                                            {guide.category}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </PageShell>
    )
}
