'use client'

import React, { useState, useEffect } from 'react'
import {
    Search, BookOpen, ArrowLeft, Leaf, Droplets, Sun, Bug, Sprout,
    Sparkles, Loader2, AlertTriangle, Beaker, Save, Check, Bookmark,
    X, ExternalLink, Image as ImageIcon, Lightbulb, TrendingUp, ArrowRight
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAutonomy } from '@/hooks/useAutonomy'
import { useKnowledge, AIGuide } from '@/context/KnowledgeContext'
import PageShell from '@/components/dashboard/PageShell'
import { motion, AnimatePresence } from 'framer-motion'

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
    useEffect(() => {
        if (initialSearch && !aiGuide && !isGenerating) {
            handleSearchEnter()
        }
    }, [])

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
                body: JSON.stringify({
                    query: searchTerm,
                    context: initialSearch ? 'From leaf scan diagnosis' : undefined
                })
            })

            const data = await response.json()

            if (data.success && data.guide) {
                const newGuide: any = {
                    id: 'web-search-' + Date.now(),
                    title: data.guide.title,
                    category: data.guide.category || 'Research-Based',
                    iconType: 'sparkles',
                    readTime: data.guide.readTime || '5 min',
                    description: data.guide.description,
                    tags: data.guide.tags || ['research', 'web-sourced'],
                    createdAt: new Date().toISOString(),
                    fullContent: data.guide.fullContent,
                    image: data.guide.images?.[0]?.url || '/images/wiki/ai-brain.png',
                    images: data.guide.images || [],
                    sources: data.guide.sources || [],
                    recommendations: data.guide.recommendations || [],
                    keyTakeaways: data.guide.keyTakeaways || []
                }
                setAiGuide(newGuide)
            } else {
                // Fallback
                const fallbackGuide: AIGuide = {
                    id: 'fallback-' + Date.now(),
                    title: `Guide: ${searchTerm}`,
                    category: 'General Information',
                    iconType: 'sparkles',
                    readTime: '3 min',
                    description: `Information about "${searchTerm}". For detailed guidance, consult agricultural experts.`,
                    tags: ['general'],
                    createdAt: new Date().toISOString(),
                    fullContent: `# ${searchTerm}\n\nFor comprehensive information about ${searchTerm}, we recommend:\n\n- Consulting local agricultural extension services\n- Visiting USDA or FAO websites\n- Checking university agricultural programs\n\nThese sources provide the most accurate guidance.`
                }
                setAiGuide(fallbackGuide)
            }
        } catch (error) {
            console.error('Search failed:', error)
            const errorGuide: AIGuide = {
                id: 'error-' + Date.now(),
                title: `${searchTerm}`,
                category: 'Information',
                iconType: 'sparkles',
                readTime: '2 min',
                description: 'Unable to fetch web results. Please check your connection.',
                tags: ['offline'],
                createdAt: new Date().toISOString(),
                fullContent: `# ${searchTerm}\n\nWe encountered an issue searching for this information. Please try again later.`
            }
            setAiGuide(errorGuide)
        } finally {
            setIsGenerating(false)
        }
    }

    // Detail View
    const DetailView = () => {
        const guide = selectedGuide as any

        return (
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 pb-20 font-sans"
            >
                {/* Header / Images */}
                {guide?.images && Array.isArray(guide.images) && guide.images.length > 0 ? (
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[16/9] md:aspect-[21/9] group">
                        <img
                            src={guide.images[0].url}
                            alt={guide.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/wiki/ai-brain.png' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20">
                                    {guide.category}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20 flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> {guide.readTime} read
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white shadow-sm leading-tight mb-2">
                                {guide.title}
                            </h1>
                            <p className="text-white/80 text-lg font-medium max-w-2xl line-clamp-2">
                                {guide.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 bg-gradient-to-br from-emerald-900 to-green-800 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay" />
                        <div className="relative z-10 text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
                                <Sparkles className="w-3 h-3 text-emerald-300" />
                                Research Guide
                            </div>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">{guide.title}</h1>
                            <div className="flex items-center justify-center gap-4 text-emerald-100">
                                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {guide.readTime} read</span>
                                <span>•</span>
                                <span>{guide.category}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto">
                    {/* Meta Bar */}
                    <div className="flex items-center justify-between py-6 border-b border-stone-200 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">LS</div>
                            <div>
                                <p className="text-sm font-bold text-stone-900">LeafScan Intelligence</p>
                                <p className="text-xs text-stone-500">AI-Curated Agricultural Research</p>
                            </div>
                        </div>
                        <button
                            onClick={() => selectedGuide && (isGuideSaved(selectedGuide.id) ? deleteGuide(selectedGuide.id) : saveGuide(selectedGuide))}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl ${selectedGuide && isGuideSaved(selectedGuide.id)
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-stone-900 text-white hover:bg-black'
                                }`}
                        >
                            {selectedGuide && isGuideSaved(selectedGuide.id) ? (
                                <><Check className="w-4 h-4" /> Saved to Library</>
                            ) : (
                                <><Bookmark className="w-4 h-4" /> Save Guide</>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg prose-stone prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-loose prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg max-w-none">
                        {guide?.fullContent?.split('\n\n').map((paragraph: string, idx: number) => {
                            if (paragraph.startsWith('# ')) return <h1 key={idx} className="text-4xl mt-12 mb-6">{paragraph.replace(/^# /, '')}</h1>
                            if (paragraph.startsWith('## ')) return <h2 key={idx} className="text-3xl mt-10 mb-5 flex items-center gap-3">{paragraph.replace(/^## /, '')}</h2>
                            if (paragraph.startsWith('### ')) return <h3 key={idx} className="text-2xl mt-8 mb-4">{paragraph.replace(/^### /, '')}</h3>

                            // Lists
                            if (paragraph.startsWith('- ') || paragraph.includes('\n- ')) {
                                const items = paragraph.split('\n').filter(l => l.trim())
                                return (
                                    <ul key={idx} className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 my-6 space-y-2">
                                        {items.map((item, i) => {
                                            const formattedHtml = item.replace(/^- /, '')
                                                .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-stone-900">$1</strong>')
                                                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

                                            return (
                                                <li key={i} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                                                    <span className="text-stone-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )
                            }

                            // Standard Paragraph with simple bold/link parsing
                            if (paragraph.trim()) {
                                return <p key={idx} dangerouslySetInnerHTML={{
                                    __html: paragraph
                                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                                }} />
                            }
                            return null
                        })}
                    </div>

                    {/* Key Takeaways */}
                    {guide?.keyTakeaways && guide.keyTakeaways.length > 0 && (
                        <div className="mt-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm">
                            <h3 className="text-xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-600" />
                                Key Takeaways
                            </h3>
                            <div className="grid gap-4">
                                {guide.keyTakeaways.map((takeaway: string, idx: number) => {
                                    const formattedHtml = takeaway
                                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-emerald-900">$1</strong>')
                                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                                    return (
                                        <div key={idx} className="flex items-start gap-3 bg-white/60 p-4 rounded-xl">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                                            <p className="text-stone-700 font-medium" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sources */}
                    {guide?.sources && guide.sources.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-stone-400" />
                                References & Sources
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {guide.sources.map((source: any, idx: number) => (
                                    <a key={idx} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all group">
                                        <div className="p-2 bg-stone-50 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <BookOpen className="w-5 h-5 text-stone-400 group-hover:text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 line-clamp-1">{source.title}</h4>
                                            <p className="text-xs text-stone-500 mt-1">{source.source}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.article>
        )
    }

    // Main Render
    return (
        <PageShell
            title={selectedGuide ? selectedGuide.title : "Knowledge Base"}
            badge={selectedGuide && (
                <div className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {selectedGuide.category}
                </div>
            )}
            action={selectedGuide ? (
                <button
                    onClick={() => setSelectedGuide(null)}
                    className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            ) : (
                <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
                    {['browse', 'saved'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all capitalize ${viewMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            {mode} {mode === 'saved' && `(${savedGuides.length})`}
                        </button>
                    ))}
                </div>
            )}
        >
            {selectedGuide ? (
                <DetailView />
            ) : (
                <div className="space-y-12 pb-20">
                    {viewMode === 'browse' && (
                        <>
                            {/* Premium Hero */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative bg-emerald-900 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-2xl group"
                            >
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-[20s] ease-linear group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-900/80 to-transparent" />

                                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                                        Grow your knowledge,<br /><span className="text-emerald-300">maximize your harvest.</span>
                                    </h2>

                                    <div className="relative max-w-2xl mx-auto">
                                        <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 rounded-full" />
                                        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-2 shadow-2xl transition-all focus-within:bg-white/20 focus-within:border-white/40">
                                            <Search className="w-6 h-6 text-emerald-100 ml-4 shrink-0" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => { setSearchTerm(e.target.value); setAiGuide(null) }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchEnter()}
                                                placeholder="Search any topic (e.g., 'Tomato early blight treatment')..."
                                                className="w-full bg-transparent border-none py-4 px-4 text-white placeholder:text-emerald-100/50 text-lg font-medium focus:ring-0"
                                            />
                                            <button
                                                onClick={() => handleSearchEnter()}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hidden sm:block"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-emerald-100/80">
                                        <span>Popular:</span>
                                        {['Pest Control', 'Soil Health', 'Hydration', 'Disease ID'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => { setSearchTerm(tag); handleSearchEnter() }}
                                                className="hover:text-white hover:underline decoration-emerald-400"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* AI Loading State */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="py-12 text-center">
                                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6" />
                                        <h3 className="text-xl font-bold text-stone-900 mb-2">Analyzing Agricultural Databases...</h3>
                                        <p className="text-stone-500">Curating the best advice for "{searchTerm}"</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Generated Result */}
                            {aiGuide && !isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedGuide(aiGuide)}
                                    className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl cursor-pointer group hover:border-emerald-500/50 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-md bg-stone-100 relative">
                                            {aiGuide.image ? (
                                                <img src={aiGuide.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-emerald-900/20"><Sparkles className="w-12 h-12" /></div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm uppercase tracking-wide">
                                                Generated Guide
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4 group-hover:text-emerald-700 transition-colors">
                                                {aiGuide.title}
                                            </h3>
                                            <p className="text-stone-600 text-lg leading-relaxed mb-6 line-clamp-3">
                                                {aiGuide.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                                Read Full Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Fallback / Search Prompt */}
                            {!aiGuide && !isGenerating && (
                                <div className="text-center py-20 opacity-40">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                                    <p className="text-stone-400 font-serif italic text-xl">Search above to unlock expert agricultural knowledge.</p>
                                </div>
                            )}
                        </>
                    )}

                    {viewMode === 'saved' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {savedGuides.length === 0 ? (
                                <div className="col-span-3 text-center py-24 bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
                                    <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                                    <h3 className="font-bold text-stone-900 text-lg">Your Library is Empty</h3>
                                    <p className="text-stone-500 text-sm mt-2">Generate guides in the Browse tab and save them here.</p>
                                </div>
                            ) : (
                                savedGuides.map(guide => (
                                    <motion.div
                                        layout
                                        key={guide.id}
                                        onClick={() => setSelectedGuide(guide)}
                                        className="bg-white h-auto rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer p-6 flex flex-col relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-stone-200 to-stone-300 group-hover:from-emerald-400 group-hover:to-teal-500 transition-colors" />

                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                {guide.iconType === 'bug' ? <Bug className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteGuide(guide.id) }}
                                                className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h4 className="font-serif font-bold text-xl text-stone-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-800 transition-colors">{guide.title}</h4>
                                        <p className="text-stone-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">{guide.description}</p>

                                        <div className="flex items-center gap-3 text-xs font-bold text-stone-400 uppercase tracking-widest pt-6 border-t border-stone-100">
                                            <span>{guide.readTime} Read</span>
                                            <span className="w-1 h-1 bg-stone-300 rounded-full" />
                                            <span>{guide.category}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </PageShell>
    )
}
