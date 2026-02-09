'use client'

import { useState, useEffect, useRef } from 'react'
import { ActionRescueResult, DiagnosisResult } from '@/types'
import { useLanguage } from '@/context/LanguageContext'
import { useAutonomy } from '@/hooks/useAutonomy'
import { saveVisualToCache } from '@/lib/store'
import {
  AlertCircle,
  Leaf,
  Bug,
  Droplet,
  Shield,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  MessageCircle,
  Award,
  Activity,
  ArrowRight,
  Eye,
  CloudSun,
  Zap,
  Clock,
  Target,
  Sprout,
  TrendingUp,
  AlertOctagon,
  Microscope,
  Info,
  Loader2,
  X,
  Map,
  ShoppingBag,
  Navigation,
  Package,
  DollarSign,
  AlertCircleIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LeafyGreen,
  MapPin,
  Maximize2,
  Grid3x3,
  FileText,
  Plus,
  Brain,
  Settings,
  Phone,
  Globe,
  Star
} from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { useRouter } from 'next/navigation'
import { Search, Refrigerator, ChefHat, BookOpen } from 'lucide-react'
import IndividualItemCard from './IndividualItemCard'
import ExportMenu from '@/components/ExportMenu'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
      <Map className="w-8 h-8" />
    </div>
  )
})

interface DiagnosisReportProps {
  result: DiagnosisResult
  actionResult?: ActionRescueResult | null
  image: string
  onReset: () => void
  onOpenTreatmentPlanner?: () => void
  onOpenChat?: () => void
  onSymptomClick?: (symptom: string, area: string) => void
  onStartMonitoring?: () => void
  onVisualGenerated?: (prompt: string, imageUrl: string) => void
  onExploreAction?: (context: string) => void
  scanId?: string
  onCreateNote?: (scanId: string) => void
}

export default function DiagnosisReport({ result, actionResult, image, onReset, onOpenTreatmentPlanner, onOpenChat, onSymptomClick, onStartMonitoring, onVisualGenerated, onExploreAction, scanId, onCreateNote }: DiagnosisReportProps) {
  const { t, language } = useLanguage()

  const router = useRouter()

  const handleExploreAction = (query: string) => {
    const encodedQuery = encodeURIComponent(query)
    router.push(`/dashboard/explore?q=${encodedQuery}`)
  }

  const [hoveredDot, setHoveredDot] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null)

  // NEW: Precise Image Dimensions for Pixel-Perfect Overlay
  const [imageMetrics, setImageMetrics] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageMetrics({
      width: img.offsetWidth,
      height: img.offsetHeight
    })
  }

  // Effect to update metrics on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const img = imageRef.current
        setImageMetrics(prev => ({
          ...prev,
          width: img.offsetWidth,
          height: img.offsetHeight
        }))
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDownloadPDF = async () => {
    const element = document.getElementById('diagnosis-report')
    if (!element) return

    const opt = {
      margin: 0.5,
      filename: `leafscan-diagnosis-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    // Dynamically import html2pdf only on client side
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set(opt).from(element).save()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-emerald-700 bg-emerald-100 border-emerald-200'
      case 'medium': return 'text-amber-700 bg-amber-100 border-amber-200'
      case 'high': return 'text-rose-700 bg-rose-100 border-rose-200'
      default: return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  const { system } = useAutonomy()
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [visualData, setVisualData] = useState<{ image: string, prompt: string, error?: string } | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleGenerateVisual = async (prompt: string, type: 'guide' | 'simulation') => {
    setVisualizing(true)
    setVisualData(null)
    setVisualData(null)

    // Check Cache First (Global -> Local)
    if (system?.visualCache?.[prompt]) {
      console.log('[Diagnosis] Cache Hit (Global):', prompt)
      setVisualData({ image: system.visualCache[prompt], prompt })
      setVisualizing(false)
      return
    }
    if (result.visualGuides?.[prompt]) {
      console.log('[Diagnosis] Cache Hit (Local):', prompt)
      setVisualData({ image: result.visualGuides[prompt], prompt })
      setVisualizing(false)
      return
    }

    try {
      const res = await fetch('/api/visualize-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type,
          language,
          diagnosis: result.diseases?.[0]?.name || `${result.cropType} Issue`
        })
      })
      const data = await res.json()
      if (data.success) {
        setVisualData({ image: data.data, prompt })

        // Save to Global Cache
        saveVisualToCache(prompt, data.data)

        if (onVisualGenerated) {
          onVisualGenerated(prompt, data.data)
        }
      } else {
        setVisualData({
          image: '',
          prompt,
          error: data.details || data.error || `Server Error (${res.status})`
        })
      }
    } catch (e) {
      console.error(e)
      setVisualData({ image: '', prompt, error: e instanceof Error ? e.message : 'Network Error' })
    } finally {
      setVisualizing(false)
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <AlertOctagon className="w-4 h-4" />
      case 'high': return <AlertOctagon className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Prepare export data
  const exportData = {
    scanId: scanId || `leaf-${Date.now()}`,
    type: 'Leaf Disease Analysis',
    timestamp: new Date().toISOString(),
    summary: {
      qualityScore: result.diseases?.[0]?.confidence || 0,
      confidence: result.diseases?.[0]?.confidence || 0,
      severity: (result.diseases?.[0] as any)?.severity || 'Unknown',
    },
    cropType: result.cropType,
    diseases: result.diseases?.map((disease: any) => ({
      name: disease.name,
      confidence: disease.confidence,
      severity: disease.severity,
      stage: disease.stage,
      description: disease.description,
      scientificName: disease.scientificName,
    })) || [],
    individual_items: result.individual_items?.map((item: any, idx: number) => ({
      id: `#${idx + 1}`,
      label: item.label,
      description: item.description,
      grade_or_severity: item.grade_or_severity,
      defects: item.defects,
    })) || [],
    treatments: [
      ...(result.interventionPlan?.immediate || []),
      ...(result.interventionPlan?.shortTerm || []),
      ...(result.interventionPlan?.longTerm || []),
    ],
    batch_statistics: result.batch_statistics,
    overall_scene: result.overall_scene,
    batch_summary: result.batch_summary,
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up px-4 sm:px-6 lg:px-8 py-4" id="diagnosis-report">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-8 gap-4 border-b border-apeel-green/10 pb-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-apeel-green tracking-tight mb-2">Analysis Results</h2>
          <p className="text-apeel-green/60 font-medium flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-3">
          {onCreateNote && scanId && (
            <button
              onClick={() => onCreateNote(scanId)}
              className="btn-secondary py-3 px-5 text-sm flex items-center gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              <FileText className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          )}
          {onOpenTreatmentPlanner && (
            <button onClick={onOpenTreatmentPlanner} className="btn-secondary py-3 px-5 text-sm flex items-center gap-2 border-apeel-green/30 text-apeel-green hover:bg-apeel-green hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
              <span>Planner</span>
            </button>
          )}
          {onOpenChat && (
            <button onClick={onOpenChat} className="btn-secondary py-3 px-5 text-sm flex items-center gap-2 border-apeel-green/30 text-apeel-green hover:bg-apeel-green hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
              <span>Assistant</span>
            </button>
          )}
          <ExportMenu data={exportData} elementId="diagnosis-report" reportType="leaf" />
          <button onClick={onReset} className="btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-lg shadow-apeel-green/20">
            <RotateCcw className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* NEW: BATCH / SCENE CONTEXT CARD (Agentic Upgrade) */}
      {(result.overall_scene || result.batch_summary) && (
        <div className="mb-8 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-apeel-green/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-apeel-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="flex flex-col gap-6 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-apeel-green/10 pb-4">
              <div className="p-3 bg-white rounded-full text-apeel-green shadow-sm">
                <Maximize2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-apeel-green leading-none mb-1">Holistic Scene Analysis</h3>
                <p className="text-sm text-apeel-green/60 font-medium">{result.batch_grade_or_health_score || 'Batch Assessment In Progress'}</p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-apeel-green/70 mb-2">Scene Description</h4>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">
                  {result.overall_scene}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-apeel-green/70 mb-2">Batch Summary</h4>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">
                  {result.batch_summary}
                </p>
              </div>
            </div>

            {/* Batch Stats */}
            {result.batch_statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl border border-apeel-green/10">
                  <div className="text-2xl font-bold text-apeel-green">{result.batch_statistics.total_items}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Total Items</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-apeel-green/10">
                  <div className="text-lg font-bold text-gray-800 truncate" title={result.batch_statistics.uniformity}>{result.batch_statistics.uniformity}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Uniformity</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-apeel-green/10 col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {result.batch_statistics.predominant_issues?.map((issue: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{issue}</span>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 mt-2">Predominant Issues</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Items Breakdown */}
      {result.individual_items && result.individual_items.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif font-bold text-apeel-green flex items-center gap-3">
              <Grid3x3 className="w-6 h-6" />
              Individual Item Analysis
              <span className="text-sm font-normal text-gray-400">({result.individual_items.length} item{result.individual_items.length !== 1 ? 's' : ''} detected)</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Target className="w-4 h-4" />
              <span>Click item to highlight on image</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.individual_items.map((item, idx) => (
              <IndividualItemCard
                key={idx}
                item={item}
                index={idx}
                onHighlight={() => {
                  setHighlightedItem(idx)
                  setTimeout(() => setHighlightedItem(null), 3000)
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Visuals (Compact) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Analysis Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-2 shadow-2xl shadow-apeel-green/10 border border-white/40 relative overflow-hidden group">

            <ImageLightbox
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
              imageSrc={image}
              altText="Analysis Overlay"
            >
              {/* Individual Items Overlay - Lightbox */}
              {result.individual_items && result.individual_items.length > 0 && (
                <svg className="absolute inset-0 w-full h-full z-20" style={{ pointerEvents: 'none' }}>
                  {result.individual_items.map((item, idx) => {
                    if (!item.center_point && !item.bbox) return null

                    const center = item.center_point || (item.bbox ? {
                      x: (item.bbox.xmin + item.bbox.xmax) / 2,
                      y: (item.bbox.ymin + item.bbox.ymax) / 2
                    } : null)

                    if (!center) return null

                    const radius = item.radius || 0.05
                    const itemNumber = item.label.replace('#', '').replace(/[^0-9]/g, '') || (idx + 1).toString()

                    const gradeLower = item.grade_or_severity.toLowerCase()
                    let color = '#22c55e'
                    if (gradeLower.includes('severe') || gradeLower.includes('poor')) {
                      color = '#dc2626'
                    } else if (gradeLower.includes('moderate') || gradeLower.includes('fair')) {
                      color = '#f97316'
                    }

                    return (
                      <g key={idx}>
                        <circle
                          cx={`${center.x * 100}%`}
                          cy={`${center.y * 100}%`}
                          r={`${radius * 100}%`}
                          fill={color}
                          fillOpacity="0.3"
                          stroke={color}
                          strokeWidth="3"
                        />
                        <circle
                          cx={`${center.x * 100}%`}
                          cy={`${center.y * 100}%`}
                          r={`${radius * 120}%`}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeOpacity="0.5"
                          className="animate-pulse"
                        />
                        <g transform={`translate(${center.x * 100}%, ${center.y * 100}%)`}>
                          <circle r="18" fill="white" stroke={color} strokeWidth="3" />
                          <text
                            textAnchor="middle"
                            dy="6"
                            className="text-base font-bold"
                            fill={color}
                          >
                            {itemNumber}
                          </text>
                        </g>
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Legacy Highlighted Areas - Lightbox */}
              <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
                {result.highlightedAreas?.map((area, i) => {
                  // Logic duplication for Lightbox - Ensures perfect match
                  let left = 0, top = 0, width = 0, height = 0;
                  if (area.bbox) {
                    if (Array.isArray(area.bbox)) {
                      const [ymin, xmin, ymax, xmax] = area.bbox as unknown as [number, number, number, number];
                      left = (xmin / 1000) * 100;
                      top = (ymin / 1000) * 100;
                      width = ((xmax - xmin) / 1000) * 100;
                      height = ((ymax - ymin) / 1000) * 100;
                    } else {
                      const b = area.bbox as { x: number, y: number, width: number, height: number };
                      left = b.x * 100;
                      top = b.y * 100;
                      width = b.width * 100;
                      height = b.height * 100;
                    }
                  }
                  const severityStyles = {
                    'mild': { stroke: '#facc15', fill: '#facc15' },
                    'moderate': { stroke: '#f97316', fill: '#f97316' },
                    'severe': { stroke: '#dc2626', fill: '#dc2626' }
                  };
                  const style = severityStyles[area.severity as keyof typeof severityStyles] || severityStyles.moderate;

                  return (
                    <g key={i}>
                      {area.center ? (
                        <>
                          {/* Lightbox - individual spot highlight */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100, 3)}%`}
                            fill={style.fill}
                            fillOpacity="0.2"
                          />
                          {/* Thick border - Lightbox */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100, 3)}%`}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="3"
                            strokeOpacity="0.85"
                          />
                          {/* Outer glow - Lightbox */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100 * 1.2, 4)}%`}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="2"
                            strokeOpacity="0.4"
                            className="animate-pulse"
                          />
                          <text x={`${(area.center.x * 100) + 2}%`} y={`${(area.center.y * 100) - 2}%`} className="text-[11px] font-bold fill-white stroke-black stroke-[0.5] drop-shadow-md">#{i + 1}</text>
                        </>
                      ) : area.bbox ? (
                        <>
                          <rect x={`${left}%`} y={`${top}%`} width={`${width}%`} height={`${height}%`} fill={style.fill} fillOpacity="0.25" stroke={style.stroke} strokeWidth="3" rx="4" vectorEffect="non-scaling-stroke" />
                        </>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
            </ImageLightbox>

            {/* Zoom Button */}
            <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                title="Zoom Image"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <div
              className="relative rounded-[1.5rem] overflow-hidden bg-apeel-light cursor-pointer group"
              onClick={() => setIsLightboxOpen(true)}
              style={{ minHeight: '300px' }}
            >
              {/* Image Container that shrinks to fit content if needed, or we calculate rect */}
              <img
                ref={imageRef}
                src={image}
                alt="Analyzed specimen"
                className="max-w-full max-h-[600px] w-auto h-auto mx-auto object-contain"
                onLoad={handleImageLoad}
              />

              {/* Individual Items Overlay (Batch-Aware) - PIXEL PERFECT */}
              {result.individual_items && result.individual_items.length > 0 && imageMetrics.width > 0 && (
                <svg
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{ width: imageMetrics.width, height: imageMetrics.height, left: '50%', transform: 'translateX(-50%)' }}
                >
                  {result.individual_items.map((item, idx) => {
                    if (!item.center_point && !item.bbox) return null

                    const isHighlighted = highlightedItem === idx
                    const center = item.center_point || (item.bbox ? {
                      x: (item.bbox.xmin + item.bbox.xmax) / 2,
                      y: (item.bbox.ymin + item.bbox.ymax) / 2
                    } : null)

                    if (!center) return null

                    // Default to smaller radius for precision
                    // Radius is relative to WIDTH (as per standard CV practice in this app)
                    const relRadius = (item.radius && item.radius < 0.2) ? item.radius : 0.03

                    // Convert to PIXELS
                    const cx = center.x * imageMetrics.width
                    const cy = center.y * imageMetrics.height
                    const r = relRadius * imageMetrics.width // Circular radius based on width

                    const itemNumber = item.label.replace('#', '').replace(/[^0-9]/g, '') || (idx + 1).toString()

                    // Color based on severity
                    const gradeLower = item.grade_or_severity.toLowerCase()
                    let color = '#22c55e' // green
                    if (gradeLower.includes('severe') || gradeLower.includes('high') || gradeLower.includes('critical')) {
                      color = '#dc2626' // red
                    } else if (gradeLower.includes('moderate') || gradeLower.includes('medium')) {
                      color = '#f97316' // orange
                    }

                    return (
                      <g key={idx} className={isHighlighted ? 'animate-pulse' : ''}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={color}
                          fillOpacity={isHighlighted ? '0.4' : '0.2'}
                          stroke={color}
                          strokeWidth={isHighlighted ? '3' : '2'}
                          className="transition-all duration-300"
                        />
                        {/* Outer Ring */}
                        {isHighlighted && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r * 1.3}
                            fill="none"
                            stroke={color}
                            strokeWidth="1"
                            strokeOpacity="0.5"
                          />
                        )}
                        {/* Number Badge */}
                        <g transform={`translate(${cx}, ${cy})`}>
                          <circle
                            r={isHighlighted ? 12 : 9}
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            className="transition-all duration-300 shadow-sm"
                          />
                          <text
                            textAnchor="middle"
                            dy={isHighlighted ? 4 : 3}
                            className={`font-bold fill-current ${isHighlighted ? 'text-[10px]' : 'text-[8px]'}`}
                            style={{ fill: color }}
                          >
                            {itemNumber}
                          </text>
                        </g>
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Highlighted Areas Overlay (Main View - Interactive - Legacy Support) */}
              <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
                {result.highlightedAreas?.map((area, i) => {
                  let left = 0, top = 0, width = 0, height = 0;
                  if (area.bbox) {
                    if (Array.isArray(area.bbox)) {
                      const [ymin, xmin, ymax, xmax] = area.bbox as unknown as [number, number, number, number];
                      left = (xmin / 1000) * 100;
                      top = (ymin / 1000) * 100;
                      width = ((xmax - xmin) / 1000) * 100;
                      height = ((ymax - ymin) / 1000) * 100;
                    } else {
                      const b = area.bbox as { x: number, y: number, width: number, height: number };
                      left = b.x * 100;
                      top = b.y * 100;
                      width = b.width * 100;
                      height = b.height * 100;
                    }
                  }

                  const severityStyles = {
                    'mild': { stroke: '#facc15', fill: '#facc15' },
                    'moderate': { stroke: '#f97316', fill: '#f97316' },
                    'severe': { stroke: '#dc2626', fill: '#dc2626' }
                  };
                  const style = severityStyles[area.severity as keyof typeof severityStyles] || severityStyles.moderate;

                  return (
                    <g key={i}>
                      {area.center ? (
                        <>
                          {/* Highlight for individual disease spot - sized to defect */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100, 3)}%`}
                            fill={style.fill}
                            fillOpacity="0.2"
                            className="transition-opacity duration-300"
                          />
                          {/* Thick border ring for visibility */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100, 3)}%`}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="3"
                            strokeOpacity="0.85"
                          />
                          {/* Outer animated glow */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r={`${Math.max((area.radius || 0.05) * 100 * 1.2, 4)}%`}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="2"
                            strokeOpacity="0.4"
                            className="animate-pulse"
                          />

                          {/* Interactive Dot */}
                          <circle
                            cx={`${area.center.x * 100}%`}
                            cy={`${area.center.y * 100}%`}
                            r="6"
                            fill={style.fill}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer drop-shadow-lg"
                            style={{ pointerEvents: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSymptomClick && area.center) onSymptomClick(`${area.label} (${area.severity})`, `${(area.center.x * 100).toFixed(1)},${(area.center.y * 100).toFixed(1)}`);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredDot(i);
                              setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                            }}
                            onMouseLeave={() => { setHoveredDot(null); setTooltipPos(null); }}
                          />
                          <text x={`${(area.center.x * 100) + 2}%`} y={`${(area.center.y * 100) - 2}%`} className="text-[11px] font-bold pointer-events-none drop-shadow-lg" fill="white" stroke="black" strokeWidth="0.5">#{i + 1}</text>
                        </>
                      ) : area.bbox ? (
                        <>
                          <rect x={`${left}%`} y={`${top}%`} width={`${width}%`} height={`${height}%`} fill={style.fill} fillOpacity="0.25" stroke={style.stroke} strokeWidth="3" rx="4" className="pointer-events-none transition-opacity duration-200" vectorEffect="non-scaling-stroke" />
                          <circle
                            cx={`${left + width / 2}%`}
                            cy={`${top + height / 2}%`}
                            r="4"
                            fill={style.fill}
                            className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                            style={{ pointerEvents: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSymptomClick) onSymptomClick(area.label, `${(left + width / 2).toFixed(1)},${(top + height / 2).toFixed(1)}`);
                            }}
                          />
                          <text x={`${left + 1}%`} y={`${top - 0.5}%`} className="text-[10px] font-bold pointer-events-none" fill={style.stroke} stroke="white" strokeWidth="3" paintOrder="stroke">#{i + 1}</text>
                        </>
                      ) : null}
                    </g>
                  )
                })}
              </svg>

              {/* Tooltip */}
              {hoveredDot !== null && tooltipPos && result.highlightedAreas && result.highlightedAreas[hoveredDot] && (
                <div style={{ position: 'fixed', left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 10}px`, transform: 'translate(-50%, -100%)', zIndex: 10000, pointerEvents: 'none' }} className="bg-white/98 backdrop-blur-md rounded-lg shadow-2xl border-2 p-2.5 text-xs min-w-[140px]">
                  <div className="font-bold text-gray-900 mb-1 leading-tight">{result.highlightedAreas[hoveredDot].label}</div>
                  <div className="text-[10px] font-semibold capitalize" style={{ color: result.highlightedAreas[hoveredDot].severity === 'mild' ? '#facc15' : result.highlightedAreas[hoveredDot].severity === 'moderate' ? '#f97316' : '#dc2626' }}>{result.highlightedAreas[hoveredDot].severity} Severity</div>
                </div>
              )}
            </div>

            {/* Floating Risk Badge */}
            <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-full backdrop-blur-md border shadow-sm flex items-center gap-2 ${getSeverityColor(result.severity)}`}>
              {getSeverityIcon(result.severity)}
              <span className="text-xs font-bold uppercase tracking-widest">{result.severity} Risk</span>
            </div>
          </div>

          {/* Context Metrics (Integrated Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sustainability */}
            <div className="bg-apeel-green/5 p-5 rounded-3xl border border-apeel-green/10">
              <div className="flex justify-between items-start mb-2">
                <Leaf className="w-5 h-5 text-apeel-green" />
                <span className="text-2xl font-serif font-bold text-apeel-green">{result.sustainabilityScore || 0}</span>
              </div>
              <p className="text-xs font-bold text-apeel-green/60 uppercase tracking-wider">Sustainability</p>
            </div>
            {/* Water Vitals */}
            <div className="bg-white p-5 rounded-3xl border border-apeel-green/10 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-xl font-serif font-bold text-gray-800 leading-none">
                  {result.waterMetrics?.currentHumidity || 65}%
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Humidity</p>
              <p className="text-[10px] text-gray-500 leading-tight font-medium">
                {result.waterMetrics?.advice || 'Monitor moisture levels.'}
              </p>
            </div>
            {/* Yield Impact */}
            <div className="bg-white p-5 rounded-3xl border border-apeel-green/10 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="text-xl font-serif font-bold text-gray-800 leading-none">{result.estimatedYieldImpact?.split(' ')[0] || 'N/A'}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Yield Risk</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dense Data */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Main Diagnosis - Minimal Card */}
          {result.diseases?.length > 0 && (
            <div className="bg-transparent border-b border-apeel-green/10 pb-6">
              <div className="flex items-center gap-3 mb-4 text-apeel-green/60">
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Primary Detection
                </span>
                <span className="w-1 h-1 rounded-full bg-apeel-green/30" />
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Microscope className="w-3 h-3" />
                  Target: {result.cropType}
                </span>
                {result.plantIdentity && result.plantIdentity.name !== 'Unknown' && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-apeel-green/30" />
                    <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${result.plantIdentity.name !== result.cropType ? 'text-amber-500' : 'text-apeel-green/60'}`}>
                      <Eye className="w-3 h-3" />
                      Visual ID: {result.plantIdentity.name} ({result.plantIdentity.confidence}%)
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-5xl lg:text-6xl font-serif font-bold text-apeel-green mb-4 leading-none">
                {result.diseases[0].name}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                {result.diseases[0].verifiedByTools?.map((tool, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-apeel-green/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-apeel-green flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {tool.replace(/_/g, ' ')}
                  </span>
                ))}
                <span className="px-3 py-1 bg-apeel-green text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" /> {result.diseases[0].confidence}% Confidence
                </span>
              </div>

              <div className="bg-white/50 p-6 rounded-2xl border border-apeel-green/5">
                <p className="text-lg text-apeel-black/80 leading-relaxed font-serif">
                  {result.diseases[0].description}
                </p>
                {/* Micro Agentic Insight */}
                {result.agenticReasoning && (
                  <div className="mt-4 pt-4 border-t border-apeel-green/10 flex gap-3 items-start">
                    <div className="mt-1"><Zap className="w-4 h-4 text-amber-500" /></div>
                    <p className="text-sm text-apeel-black/60 italic font-medium">
                      &quot;{result.agenticReasoning}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pest Detection Section */}
          {result.pests && result.pests.length > 0 && (
            <div className="bg-white border border-rose-100 p-6 rounded-3xl mb-0 shadow-sm animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-rose-50 rounded-full text-rose-500">
                  <Bug className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Pest Detected: <span className="text-rose-600">{result.pests[0].name}</span></h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed relative z-10">{result.pests[0].description}</p>
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Organic Control</h4>
                <div className="flex flex-wrap gap-2">
                  {result.pests[0].organicControl?.map((ctrl, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-rose-100 text-rose-600 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-shadow cursor-default">
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compact Symptoms & Causes */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-apeel-green uppercase tracking-widest mb-4">
                <AlertCircle className="w-4 h-4" /> Symptoms
              </h3>
              <ul className="space-y-2">
                {(result.symptoms || []).slice(0, 4).map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-medium text-apeel-black/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-apeel-green uppercase tracking-widest mb-4">
                <Activity className="w-4 h-4" /> Root Causes
              </h3>
              <ul className="space-y-2">
                {(result.causes || []).slice(0, 4).map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-medium text-apeel-black/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION RESCUE SECTION (GEMINI 3) */}
      {/* Treatment Protocol (Dark Mode Strip) */}
      <div className="mt-10 bg-apeel-green rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl shadow-apeel-green/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-12 -translate-y-12" />

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-serif font-bold">Treatment Protocol</h2>
            {result.interventionPlan?.weatherOptimized && (
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                <CloudSun className="w-3 h-3" /> Weather Optimized
              </span>
            )}
          </div>
          <button
            onClick={onOpenTreatmentPlanner}
            className="px-6 py-2 bg-white text-apeel-green rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
          >
            <TrendingUp className="w-4 h-4" /> Create Detailed Plan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="space-y-4">
            <span className="text-rose-300 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Immediate
            </span>
            <ul className="space-y-4">
              {(result.interventionPlan?.immediate || (result.organicTreatments || []).slice(0, 2)).map((t, i) => (
                <li key={i} className="group/item">
                  <div className="flex gap-3 items-start text-white/90">
                    <div className="shrink-0 pt-1">
                      <span className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-sm font-bold border border-rose-500/20">{i + 1}</span>
                    </div>
                    <div className="flex flex-col gap-3 w-full min-w-0">
                      <span className="leading-relaxed text-base break-words">{t}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleGenerateVisual(t, 'guide')
                        }}
                        type="button"
                        className="self-start px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-rose-200 hover:text-white transition-colors flex items-center gap-2 shadow-sm border border-white/5"
                        title="Visualize"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Launch Banana Pro Tutorial</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
            <span className="text-amber-300 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Short Term
            </span>
            <ul className="space-y-4">
              {(result.interventionPlan?.shortTerm || (result.preventionTips || []).slice(0, 2)).map((t, i) => (
                <li key={i} className="group/item">
                  <div className="flex gap-3 items-start text-white/90">
                    <div className="shrink-0 pt-1">
                      <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-500/20">{i + 1}</span>
                    </div>
                    <div className="flex flex-col gap-3 w-full min-w-0">
                      <span className="leading-relaxed text-base break-words">{t}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleGenerateVisual(t, 'guide')
                        }}
                        type="button"
                        className="self-start px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-amber-200 hover:text-white transition-colors flex items-center gap-2 shadow-sm border border-white/5"
                        title="Visualize"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Launch Banana Pro Tutorial</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
            <span className="text-emerald-300 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4" /> Long Term
            </span>
            <ul className="space-y-4">
              {(result.interventionPlan?.longTerm || (result.preventionTips || []).slice(2, 4)).map((t, i) => (
                <li key={i} className="group/item">
                  <div className="flex gap-3 items-start text-white/90">
                    <div className="shrink-0 pt-1">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="flex flex-col gap-3 w-full min-w-0">
                      <span className="leading-relaxed text-base break-words">{t}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleGenerateVisual(t, 'guide')
                        }}
                        type="button"
                        className="self-start px-4 py-2 bg-apeel-green/10 hover:bg-apeel-green/20 rounded-lg text-apeel-green transition-colors flex items-center gap-2 border border-apeel-green/20 bg-emerald-900/10 shadow-sm"
                        title="Generate AI Visual Guide"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Launch Banana Pro Tutorial</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FIND NEARBY SUPPLIERS - AI MAP AGENT */}
      <div className="mt-10 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl -translate-x-12 translate-y-12" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-serif font-bold">Find Nearby Suppliers</h2>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3 h-3" /> AI Agent
                </span>
              </div>
              <p className="text-white/90 text-sm ml-14">
                Our AI map agent will locate treatment supplies, equipment, and services near you
              </p>
            </div>
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`${result.diseases?.[0]?.name || 'plant disease'} treatment supplies near me`)}&mode=supplier`}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Navigation className="w-5 h-5" /> Open Smart Map
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fungicide/Pesticide */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`fungicide pesticide for ${result.diseases?.[0]?.name || 'plant disease'} near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Fungicides & Pesticides</h3>
                    <p className="text-xs text-white/70 mt-0.5">Treatment chemicals</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find stores selling fungicides and pesticides for {result.diseases?.[0]?.name || 'treatment'}
              </p>
            </a>

            {/* Organic Supplies */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`organic farming supply ${result.diseases?.[0]?.name || 'plant'} treatment near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Leaf className="w-5 h-5 text-green-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Organic Supplies</h3>
                    <p className="text-xs text-white/70 mt-0.5">Natural treatments</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find organic and natural treatment options nearby
              </p>
            </a>

            {/* Agricultural Equipment */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`agricultural equipment sprayer irrigation near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-orange-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Equipment & Tools</h3>
                    <p className="text-xs text-white/70 mt-0.5">Sprayers, irrigation</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find agricultural equipment dealers nearby
              </p>
            </a>

            {/* Plant Nursery */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`plant nursery ${result.cropType || 'plant'} seedlings near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Sprout className="w-5 h-5 text-pink-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Plant Nurseries</h3>
                    <p className="text-xs text-white/70 mt-0.5">Seeds & seedlings</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find nurseries with {result.cropType || 'plant'} varieties nearby
              </p>
            </a>

            {/* Agricultural Services */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`agricultural consultant crop advisor near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Expert Services</h3>
                    <p className="text-xs text-white/70 mt-0.5">Consultants & advisors</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find agricultural consultants and crop advisors
              </p>
            </a>

            {/* Emergency Services */}
            <a
              href={`/dashboard/threat-map?search=${encodeURIComponent(`emergency agricultural service plant disease treatment 24/7 near me`)}&mode=supplier`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-5 rounded-xl transition-all group cursor-pointer border-red-300/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-red-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      Emergency Help
                      <span className="px-2 py-0.5 bg-red-500/30 text-red-100 text-[10px] font-bold rounded uppercase">24/7</span>
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">Urgent assistance</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-white/80">
                Find emergency agricultural services available now
              </p>
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Info className="w-4 h-4" />
              <span>AI-powered search finds the best options based on your location</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Contact Info
              </span>
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Directions
              </span>
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS - EXPLORE MORE */}
      <div className="mt-10 bg-gradient-to-br from-apeel-green to-green-600 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl shadow-apeel-green/20">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6" />
          <h2 className="text-2xl font-serif font-bold">Learn More About Your Plant</h2>
        </div>
        <p className="text-white/90 mb-6">
          Get expert advice on plant care, disease management, and growing tips for {result.cropType || 'your plant'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExploreAction(`Complete care guide for ${result.cropType || 'this plant'} including watering, fertilizing, and optimal growing conditions`)}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 p-5 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sprout className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-lg">Plant Care Guide</span>
            </div>
            <p className="text-sm text-white/80 mb-2">
              Comprehensive growing instructions and care tips
            </p>
            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => handleExploreAction(`Everything about ${result.diseases?.[0]?.name || 'plant diseases'}: symptoms, causes, treatment, and prevention`)}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 p-5 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Microscope className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-lg">Disease Info</span>
            </div>
            <p className="text-sm text-white/80 mb-2">
              Detailed information about {result.diseases?.[0]?.name || 'detected issues'}
            </p>
            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => handleExploreAction(`Organic and natural remedies for treating ${result.diseases?.[0]?.name || 'plant diseases'} without chemicals`)}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 p-5 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Leaf className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-lg">Organic Solutions</span>
            </div>
            <p className="text-sm text-white/80 mb-2">
              Natural and eco-friendly treatment options
            </p>
            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => handleExploreAction(`How to prevent ${result.diseases?.[0]?.name || 'plant diseases'} and keep ${result.cropType || 'plants'} healthy`)}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 p-5 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-lg">Prevention Tips</span>
            </div>
            <p className="text-sm text-white/80 mb-2">
              Best practices to keep your plants disease-free
            </p>
            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* PRODUCT RECOMMENDATIONS SECTION - MINIMALIST */}
      {result.productRecommendations && result.productRecommendations.length > 0 && (
        <div className="mt-10 bg-white rounded-[2rem] p-8 border border-apeel-green/10 shadow-xl shadow-apeel-green/5 overflow-hidden">

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-apeel-green text-white rounded-xl shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-apeel-black">Recommended Treatments</h2>
          </div>

          <div className="space-y-3">
            {result.productRecommendations
              .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
              })
              .map((product, idx) => {
                const priorityColors = {
                  critical: 'bg-rose-100 text-rose-700 border-rose-200',
                  high: 'bg-orange-100 text-orange-700 border-orange-200',
                  medium: 'bg-amber-100 text-amber-700 border-amber-200',
                  low: 'bg-blue-100 text-blue-700 border-blue-200'
                }

                return (
                  <div key={idx} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-apeel-green/30 hover:bg-apeel-green/5 transition-all">
                    {/* Icon & Priority */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[product.priority as keyof typeof priorityColors]}`}>
                        {product.priority}
                      </span>
                      <span className="text-xl" title={product.type}>{product.type === 'organic' ? '🌿' : product.type === 'chemical' ? '⚗️' : '🦠'}</span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-grow">
                      <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{product.purpose}</p>
                    </div>

                    {/* Key Stats (Dosage/Directions) */}
                    <div className="flex flex-col gap-1 md:items-end min-w-[150px]">
                      {product.dosage && (
                        <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-apeel-green"></span>
                          {product.dosage}
                        </div>
                      )}
                      {product.applicationMethod && (
                        <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                          Via {product.applicationMethod}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-1">
                      <a
                        href={`/dashboard/threat-map?search=${encodeURIComponent(product.name)}&mode=supplier`}
                        className="p-2 text-gray-300 hover:text-apeel-green hover:bg-white rounded-lg transition-colors group/map"
                        title="Find Supplier on Map"
                      >
                        <MapPin className="w-4 h-4 group-hover/map:scale-110 transition-transform" />
                      </a>
                      <button className="p-2 text-gray-300 hover:text-apeel-green hover:bg-white rounded-lg transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Shopping List Summary - Simplified Ticket (No Prices) */}
          <div className="mt-8 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-apeel-green" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recovery Shopping List</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                {result.productRecommendations.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0 hover:bg-white rounded px-2 -mx-2 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shadow-sm ${p.priority === 'critical' ? 'bg-rose-500' : 'bg-apeel-green'}`} />
                      <span className={`font-medium ${p.priority === 'critical' ? 'text-gray-900' : 'text-gray-600'}`}>{p.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.type}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button className="px-5 py-2 bg-apeel-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Download className="w-3 h-3" /> Save Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARATHON MODE COMPACT CTA and Growth Timeline sections have been removed as requested. */}

      {/* Visual Guide Modal */}
      {(visualizing || visualData) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setVisualData(null)
              setVisualizing(false)
            }
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setVisualData(null)
                setVisualizing(false)
              }}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h3 className="text-2xl font-serif font-bold text-apeel-green mb-1 flex items-center gap-2">
              <Eye className="w-6 h-6" /> Gemini 3 Banana Pro Tutorial
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-mono border-b border-gray-100 pb-4">
              {visualData?.prompt || "Generating detailed visual..."}
            </p>

            <div className="w-full bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 min-h-[300px]">
              {visualizing ? (
                <div className="flex flex-col items-center gap-3 text-apeel-green/60 py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-apeel-green" />
                  <span className="text-sm font-bold animate-pulse">Consulting Nano Banana Pro (High Reasoning)...</span>
                </div>
              ) : visualData?.image && visualData.image.includes('<svg') ? (
                <div
                  className="w-full p-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px] [&>svg]:drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: visualData.image }}
                />
              ) : visualData?.image && (visualData.image.startsWith('http') || visualData.image.startsWith('data:')) ? (
                <img src={visualData.image} alt="Visual Guide" className="w-full h-auto object-contain" />
              ) : visualData?.image ? (
                <div className="p-12 h-full flex flex-col justify-center items-center text-center bg-apeel-cream/50">
                  <Info className="w-12 h-12 text-apeel-green mb-4 opacity-50" />
                  <p className="text-apeel-green font-serif text-lg leading-relaxed max-w-md">
                    {visualData.image}
                  </p>
                  <span className="mt-4 text-xs font-bold text-apeel-green/50 uppercase tracking-widest">Text Guide</span>
                </div>
              ) : visualData?.error ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <AlertTriangle className="w-10 h-10 text-rose-500 mb-2 opacity-80" />
                  <p className="text-rose-600 font-bold mb-1">Generation Failed</p>
                  <p className="text-xs text-rose-400 font-mono text-center max-w-[90%] break-words">
                    {visualData.error}
                  </p>
                </div>
              ) : (
                <p className="text-red-400 text-sm">Failed to generate visual.</p>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
              <span>Generated by Gemini 3 Pro Image (Nano Banana Pro)</span>
              <span className="bg-apeel-green/10 text-apeel-green px-2 py-1 rounded font-bold">BETA v2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
