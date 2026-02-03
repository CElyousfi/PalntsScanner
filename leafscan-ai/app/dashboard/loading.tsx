'use client'

export default function DashboardLoading() {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-apeel-green/20 z-50 overflow-hidden">
      <div className="h-full bg-apeel-green animate-[loading_1s_ease-in-out_infinite]" style={{ width: '30%' }} />
    </div>
  )
}
