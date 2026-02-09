'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, AlertOctagon, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RecentActivityWidget() {
    const { system } = useAutonomy()
    const router = useRouter()

    // Get recent history (limit to 5)
    const recentScans = system?.history ? [...system.history].reverse().slice(0, 5) : []

    if (recentScans.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-gray-50 rounded-full mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold">No Recent Activity</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">Your recent diagnostics will appear here.</p>
                <button
                    onClick={() => router.push('/dashboard/scan')}
                    className="px-4 py-2 bg-apeel-green text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                >
                    Start New Scan
                </button>
            </div>
        )
    }

    const getSeverityColor = (severity?: string) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'critical': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: <AlertOctagon className="w-4 h-4 text-red-600" /> }
            case 'medium':
            case 'moderate': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> }
            case 'low': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> }
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', icon: <CheckCircle2 className="w-4 h-4 text-gray-400" /> }
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Recent Activity
                </h3>
                <button
                    onClick={() => router.push('/dashboard/history')}
                    className="text-xs font-bold text-apeel-green hover:text-green-700 flex items-center gap-1"
                >
                    View All <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar flex gap-3">
                {recentScans.map((scan) => {
                    const styles = getSeverityColor(scan.diagnosis?.severity)
                    const date = new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

                    return (
                        <div
                            key={scan.id}
                            onClick={() => router.push(`/dashboard/history?id=${scan.id}`)}
                            className="min-w-[200px] bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group flex flex-col"
                        >
                            {/* Image Thumbnail */}
                            <div className="h-24 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                                {scan.image ? (
                                    <img src={scan.image} alt="Scan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 shadow-sm">
                                    {date}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm truncate mb-1">
                                    {scan.diagnosis?.cropType || 'Unknown Crop'}
                                </h4>
                                <div className={`flex items-center gap-1.5 ${styles.bg} ${styles.text} px-2 py-1 rounded-lg w-fit`}>
                                    {styles.icon}
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        {scan.diagnosis?.severity || 'Healthy'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
