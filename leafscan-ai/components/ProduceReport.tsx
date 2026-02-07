import { useState, useEffect, useRef } from 'react'
import { Scale, Ruler, Eye, TrendingUp, AlertCircle, CheckCircle2, Apple, Info, BookOpen, Play, Maximize2 } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'

interface ProduceReportProps {
  image: string
  results: any
  onClose?: () => void
}

export default function ProduceReport({ image, results, onClose }: ProduceReportProps) {
  const [selectedDefect, setSelectedDefect] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialData, setTutorialData] = useState<any>(null)
  const [loadingTutorial, setLoadingTutorial] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight
      })
    }
  }, [image])

  const getGradeColor = (grade: string) => {
    if (grade.includes('Extra') || grade.includes('Fancy')) return 'from-emerald-500 to-green-600'
    if (grade === 'Class I' || grade === 'Fancy' || grade === 'No.1') return 'from-green-500 to-emerald-600'
    if (grade === 'Class II' || grade === 'No.2') return 'from-amber-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'Critical') return 'text-red-600 bg-red-50 border-red-200'
    if (severity === 'High') return 'text-red-500 bg-red-50 border-red-100'
    if (severity === 'Medium') return 'text-orange-600 bg-orange-50 border-orange-200'
    if (severity === 'Low') return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (severity === 'Micro') return 'text-cyan-600 bg-cyan-50 border-cyan-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getGradeTextColor = (grade: string) => {
    if (!grade) return 'text-gray-700'
    if (grade.includes('Extra') || grade === 'Class I' || grade === 'Fancy' || grade === 'No.1') return 'text-green-700'
    if (grade === 'Class II' || grade === 'No.2') return 'text-orange-700'
    return 'text-red-700'
  }

  const fetchTutorial = async (topic: string) => {
    setLoadingTutorial(true)
    setShowTutorial(true)
    try {
      const response = await fetch('/api/get-produce-tutorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produceType: results.variety.name,
          topic: topic
        })
      })
      const data = await response.json()
      if (data.success) {
        setTutorialData(data.tutorial)
      }
    } catch (error) {
      console.error('Failed to fetch tutorial:', error)
    } finally {
      setLoadingTutorial(false)
    }
  }

  return (
    <div className="space-y-6">
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={image}
        altText={`Analyzed ${results.variety.name}`}
      >
        {results.areas?.map((area: any) => (
          <div
            key={area.id}
            className={`absolute border-4 rounded-full transition-all ${area.severity === 'Critical'
                ? 'border-red-500 bg-red-500/20'
                : 'border-orange-500 bg-orange-500/20'
              }`}
            style={{
              left: `${(area.center_x - area.radius) * 100}%`,
              top: `${(area.center_y - area.radius) * 100}%`,
              width: `${area.radius * 2 * 100}%`,
              height: `${area.radius * 2 * 100}%` // Assuming image aspect ratio isn't distorted or radius is relative to width and we want circle.
              // Actually radius seems to be relative to width in the pixel calc (r = area.radius * width).
              // If we want a perfect circle in % on a potentially non-square image, % height might distort if aspect ratio != 1.
              // BETTER: Use aspect ratio agnostic positioning if possible, OR just trust the visual overlay.
              // For this strictly controlled lightbox where image fits, we can use standard % positioning.
              // However, 'height' in % is relative to parent height.
              // If area.radius is normalized to WIDTH, then height needs to be adjusted by aspect ratio.
              // But we don't have aspect ratio easy here.
              // Let's rely on standard box model for now.
            }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-sm font-bold border border-gray-200 whitespace-nowrap z-50">
              <span className={area.severity === 'Critical' ? 'text-red-600' : 'text-orange-600'}>
                #{area.id} {area.label}
              </span>
            </div>
          </div>
        ))}
      </ImageLightbox>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image with Defect Highlights */}
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-xl flex items-center gap-2">
              <Apple className="w-6 h-6 text-apeel-green" />
              Surgical Analysis
            </h3>
            {results.demoMode && (
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                Demo Mode
              </span>
            )}
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                title="Zoom Image"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <img
              ref={imageRef}
              src={image}
              alt="Produce"
              className="w-full rounded-2xl"
              onLoad={() => {
                if (imageRef.current) {
                  setImageSize({
                    width: imageRef.current.offsetWidth,
                    height: imageRef.current.offsetHeight
                  })
                }
              }}
            />

            {/* Defect Overlays */}
            {results.areas?.map((area: any) => {
              const cx = area.center_x * imageSize.width
              const cy = area.center_y * imageSize.height
              const r = area.radius * imageSize.width

              return (
                <div
                  key={area.id}
                  className={`absolute border-4 rounded-full cursor-pointer transition-all ${selectedDefect === area.id
                    ? 'border-red-500 bg-red-500/30 scale-110'
                    : area.severity === 'Critical'
                      ? 'border-red-500 bg-red-500/20 hover:bg-red-500/30'
                      : 'border-orange-500 bg-orange-500/20 hover:bg-orange-500/30'
                    }`}
                  style={{
                    left: `${cx - r}px`,
                    top: `${cy - r}px`,
                    width: `${r * 2}px`,
                    height: `${r * 2}px`
                  }}
                  onClick={() => setSelectedDefect(selectedDefect === area.id ? null : area.id)}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold border border-gray-200">
                    #{area.id}
                  </div>
                </div>
              )
            })}

            {/* Grade Badge */}
            <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${getGradeColor(results.grading.grade_eu || results.grading.grade)} px-6 py-3 rounded-2xl text-white shadow-xl pointer-events-none`}>
              <div className="text-xs font-bold uppercase tracking-wider opacity-90">Grade</div>
              <div className="text-2xl font-bold">{results.grading.grade_eu || results.grading.grade}</div>
              {results.grading.grade_usda && (
                <div className="text-sm opacity-90">USDA: {results.grading.grade_usda}</div>
              )}
              <div className="text-xs opacity-90">{results.variety.name}</div>
            </div>
          </div>
        </div>

        {/* Right: Grading Details */}
        <div className="space-y-6">
          {/* Overall Grading */}
          <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-apeel-green" />
              Overall Grading
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Quality Score</div>
                <div className="text-3xl font-bold text-apeel-green">{results.overall_quality_score}/100</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Confidence</div>
                <div className="text-3xl font-bold text-gray-900">{results.grading.grading_confidence}%</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Est. Weight
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.estimates?.weight_g || results.grading.estimated_weight_g}g
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Diameter
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.estimates?.diameter_mm || results.grading.estimated_diameter_mm}mm
                </div>
              </div>
              {results.estimates?.volume_cm3 && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-bold uppercase mb-1">Volume</div>
                  <div className="text-2xl font-bold text-gray-900">{results.estimates.volume_cm3}cm³</div>
                </div>
              )}
              {results.estimates?.size_class && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-bold uppercase mb-1">Size Class</div>
                  <div className="text-2xl font-bold text-gray-900">{results.estimates.size_class}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-blue-900 mb-1">Primary Defect</div>
                    <div className="text-sm text-blue-700">
                      {results.grading.primary_defect} • {results.grading.defect_coverage_percent}% coverage
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-green-900 mb-1">Color Maturity</div>
                    <div className="text-sm text-green-700">
                      Score: {results.grading.color_maturity_score}/100 • Optimal for {results.variety.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripeness Assessment */}
              {results.assessment && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-amber-900 mb-1">Ripeness Assessment</div>
                      <div className="text-sm text-amber-700">
                        {results.assessment.ripeness_stage} • Score: {results.assessment.ripeness_score}/100
                      </div>
                      {results.assessment.texture_analysis && (
                        <div className="text-xs text-amber-600 mt-1 italic">
                          {results.assessment.texture_analysis}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Firmness & Uniformity */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Firmness</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {results.assessment?.firmness_estimate || results.grading.firmness_assessment || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Uniformity</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {results.grading.uniformity_score || 'N/A'}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Standard Grading */}
              {(results.grading.grade_eu || results.grading.grade_usda) && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="font-bold text-purple-900 mb-2">Multi-Standard Grading</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {results.grading.grade_eu && (
                      <div>
                        <span className="text-purple-600 font-medium">EU:</span>
                        <span className="ml-2 font-bold text-purple-900">{results.grading.grade_eu}</span>
                      </div>
                    )}
                    {results.grading.grade_usda && (
                      <div>
                        <span className="text-purple-600 font-medium">USDA:</span>
                        <span className="ml-2 font-bold text-purple-900">{results.grading.grade_usda}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sustainability Impact */}
              {results.sustainability_impact && (
                <div className={`p-4 rounded-2xl border ${results.sustainability_impact.includes('Low') ? 'bg-green-50 border-green-100' :
                  results.sustainability_impact.includes('Medium') ? 'bg-yellow-50 border-yellow-100' :
                    'bg-red-50 border-red-100'
                  }`}>
                  <div className="font-bold text-gray-900 mb-1">Sustainability Impact</div>
                  <div className="text-sm text-gray-700">{results.sustainability_impact}</div>
                </div>
              )}
            </div>
          </div>

          {/* Detected Defects */}
          <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              Detected Defects ({results.areas?.length || 0})
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {results.areas?.map((area: any) => (
                <div
                  key={area.id}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedDefect === area.id
                    ? 'border-apeel-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedDefect(selectedDefect === area.id ? null : area.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">#{area.id}</span>
                      <span className="text-sm text-gray-600">{area.description}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${getSeverityColor(area.severity)}`}>
                      {area.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium">{area.defect_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence:</span>
                      <span className="ml-1 font-medium">{area.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <span className="ml-1 font-medium">{area.size_percent}%</span>
                    </div>
                  </div>
                  {area.inferred_cause && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mb-1">
                      <span className="font-bold">Cause:</span> {area.inferred_cause}
                    </div>
                  )}
                  {(area.depth_inference || area.detection_method) && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {area.depth_inference && (
                        <>
                          <span className="text-gray-500">Depth:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${area.depth_inference === 'Surface only' ? 'bg-green-100 text-green-700' :
                            area.depth_inference === 'Subsurface' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {area.depth_inference}
                          </span>
                        </>
                      )}
                      {area.impact_on_shelf_life && (
                        <>
                          <span className="text-gray-500 ml-2">Impact:</span>
                          <span className="font-medium">{area.impact_on_shelf_life}</span>
                        </>
                      )}
                      {area.detection_method && (
                        <>
                          <span className="text-gray-500 ml-2">Method:</span>
                          <span className="font-medium text-purple-600">{area.detection_method}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Report Panel */}
      <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100">
        <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
          <Info className="w-7 h-7 text-apeel-green" />
          Full Grading Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Detection */}
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Detection</div>
            <div className={`text-lg font-bold ${getGradeTextColor(results.grading.grade_eu || results.grading.grade)}`}>
              {results.grading.primary_defect} + {results.areas?.length - 1 || 0} minor defects
            </div>
          </div>

          {/* Grade */}
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Final Grade</div>
            <div className={`text-lg font-bold ${getGradeTextColor(results.grading.grade_eu || results.grading.grade)}`}>
              {results.grading.grade_eu || results.grading.grade}
            </div>
          </div>

          {/* Market Destination */}
          {results.market_destination && (
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Market Destination</div>
              <div className="text-lg font-semibold text-gray-900">
                {results.market_destination}
              </div>
            </div>
          )}

          {/* Shelf Life */}
          {results.shelf_life_estimate && (
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Shelf Life Estimate</div>
              <div className="text-lg font-semibold text-gray-900">
                {results.shelf_life_estimate} days
              </div>
            </div>
          )}

          {/* Storage Recommendations */}
          {results.storage_recommendations && (
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Storage Recommendations</div>
                <button
                  onClick={() => fetchTutorial('proper storage and handling best practices')}
                  className="flex items-center gap-2 px-4 py-2 bg-apeel-green text-white rounded-xl hover:bg-apeel-green/90 transition-all text-sm font-bold shadow-md"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn Best Practices
                </button>
              </div>
              <div className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                {results.storage_recommendations}
              </div>

              {/* Quick Tutorial Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fetchTutorial('ethylene gas management and fruit separation')}
                  className="px-3 py-1.5 bg-white border-2 border-apeel-green text-apeel-green rounded-lg hover:bg-apeel-green hover:text-white transition-all text-xs font-bold"
                >
                  🍎🍌 Don't Mix These!
                </button>
                <button
                  onClick={() => fetchTutorial('optimal temperature and humidity storage')}
                  className="px-3 py-1.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
                >
                  🌡️ Temperature Guide
                </button>
                <button
                  onClick={() => fetchTutorial('shelf life extension techniques')}
                  className="px-3 py-1.5 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition-all text-xs font-bold"
                >
                  ⏰ Extend Shelf Life
                </button>
                <button
                  onClick={() => fetchTutorial('Casablanca climate storage tips')}
                  className="px-3 py-1.5 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-all text-xs font-bold"
                >
                  ☀️ Humid Climate Tips
                </button>
              </div>
            </div>
          )}

          {/* Root Cause */}
          <div className="md:col-span-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Root Cause Analysis</div>
            <div className="text-gray-700 leading-relaxed">
              {results.root_cause}
            </div>
          </div>

          {/* Recommendations */}
          <div className="md:col-span-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sorting & Handling Recommendations</div>
            <div className="text-gray-700 leading-relaxed">
              {Array.isArray(results.recommendations) ? (
                <ul className="list-disc list-inside space-y-1">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                results.recommendations
              )}
            </div>
          </div>

          {/* Prevention Tips */}
          {results.prevention_tips && (
            <div className="md:col-span-2">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Prevention Tips for Future Crops</div>
              <div className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-xl border border-green-100">
                {results.prevention_tips}
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-apeel-green">{results.variety.confidence}%</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Variety ID</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{results.grading.grading_confidence}%</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Grade Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{results.areas?.length || 0}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Defects Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-apeel-green">{results.overall_quality_score}/100</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Quality Score</div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-apeel-green to-[#1e3a29] text-white p-6 rounded-t-[2rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-serif font-bold">
                      {loadingTutorial ? 'Loading Tutorial...' : tutorialData?.title || 'Storage Best Practices'}
                    </h2>
                    <p className="text-white/80 text-sm">Powered by Gemini 3 Flash Preview</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTutorial(false)
                    setTutorialData(null)
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingTutorial ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-apeel-green border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Generating personalized tutorial...</p>
              </div>
            ) : tutorialData ? (
              <div className="p-8 space-y-6">
                {/* Overview */}
                {tutorialData.overview && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <p className="text-gray-700 leading-relaxed">{tutorialData.overview}</p>
                  </div>
                )}

                {/* Steps */}
                {tutorialData.steps && tutorialData.steps.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="bg-apeel-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                      Step-by-Step Guide
                    </h3>
                    <div className="space-y-3">
                      {tutorialData.steps.map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-apeel-green/10 text-apeel-green rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {tutorialData.tips && tutorialData.tips.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      💡 Expert Tips
                    </h3>
                    <div className="space-y-2">
                      {tutorialData.tips.map((tip: string, idx: number) => (
                        <div key={idx} className="bg-green-50 border border-green-200 p-3 rounded-xl">
                          <p className="text-gray-700 text-sm leading-relaxed">✓ {tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {tutorialData.warnings && tutorialData.warnings.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      ⚠️ Common Mistakes to Avoid
                    </h3>
                    <div className="space-y-2">
                      {tutorialData.warnings.map((warning: string, idx: number) => (
                        <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-xl">
                          <p className="text-gray-700 text-sm leading-relaxed">✗ {warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Climate Notes */}
                {tutorialData.climate_notes && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                    <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                      ☀️ Casablanca Climate Tip
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{tutorialData.climate_notes}</p>
                  </div>
                )}

                {/* YouTube Link */}
                {tutorialData.searchQuery && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tutorialData.searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Watch Video Tutorials on YouTube
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
