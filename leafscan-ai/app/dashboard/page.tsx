'use client'

import { useAuth } from '@/context/AuthContext'
import { useAutonomy } from '@/hooks/useAutonomy'
import { Sprout, History, Map, BookOpen, Compass, TrendingUp, AlertTriangle, CheckCircle2, CloudSun } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import WeatherWidget from '@/components/dashboard/WeatherWidget'
import CoachingWidget from '@/components/dashboard/CoachingWidget'
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget'

export default function DashboardHome() {
  const { user } = useAuth()
  const { system } = useAutonomy()

  // Calculate real stats from history
  const stats = useMemo(() => {
    const history = system?.history || []
    const totalScans = history.length

    // Count high-risk scans (active monitoring)
    const activeMonitoring = history.filter(h =>
      h.diagnosis?.severity === 'high' || h.diagnosis?.severity === 'medium'
    ).length

    // Calculate health score based on recent scans
    const recentScans = history.slice(0, 10)
    const healthScore = recentScans.length > 0
      ? Math.round(recentScans.reduce((acc, scan) => {
        if (scan.diagnosis?.severity === 'low') return acc + 90
        if (scan.diagnosis?.severity === 'medium') return acc + 60
        if (scan.diagnosis?.severity === 'high') return acc + 30
        return acc + 75
      }, 0) / recentScans.length)
      : 0

    return { totalScans, activeMonitoring, healthScore }
  }, [system?.history])

  const dashboardLinks = [
    {
      href: '/dashboard/scan',
      icon: Sprout,
      title: 'New Scan',
      description: 'Analyze leaves and produce quality',
      color: 'bg-green-500'
    },
    {
      href: '/dashboard/history',
      icon: History,
      title: 'History',
      description: 'View past diagnoses',
      color: 'bg-blue-500'
    },
    {
      href: '/dashboard/notes',
      icon: BookOpen,
      title: 'Notes',
      description: 'Farm management notes & knowledge',
      color: 'bg-amber-500'
    },
    {
      href: '/dashboard/threat-map',
      icon: Map,
      title: 'Threat Map',
      description: 'Disease outbreak locations',
      color: 'bg-red-500'
    },
    {
      href: '/dashboard/explore',
      icon: Compass,
      title: 'Explore',
      description: 'Discover insights and resources',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-gray-600">
              Here is your daily farm briefing and performance overview.
            </p>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-white/50 px-4 py-2 rounded-full border border-gray-100">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>



        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-blue-100 rounded-xl">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Scans</div>
              <div className="text-4xl font-bold text-gray-900">{stats.totalScans}</div>
              <div className="text-xs text-gray-500 mt-2">All time</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-gray-600 mb-1">Active Monitoring</div>
              <div className="text-4xl font-bold text-gray-900">{stats.activeMonitoring}</div>
              <div className="text-xs text-gray-500 mt-2">High/medium risk scans</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stats.healthScore >= 70 ? 'bg-green-100' : stats.healthScore >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                <CheckCircle2 className={`w-6 h-6 ${stats.healthScore >= 70 ? 'text-green-600' : stats.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
              </div>
              <TrendingUp className={`w-5 h-5 ${stats.healthScore >= 70 ? 'text-green-600' : stats.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-gray-600 mb-1">Health Score</div>
              <div className={`text-4xl font-bold ${stats.healthScore >= 70 ? 'text-green-600' : stats.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {stats.healthScore > 0 ? stats.healthScore : '-'}
              </div>
              <div className="text-xs text-gray-500 mt-2">Based on recent scans</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Navigation + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Navigation (2/3 width on large) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-apeel-green" /> Tools & Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1 flex items-center gap-4"
                  >
                    <div className={`${link.color} w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-green-700 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {link.description}
                      </p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Column: Recent Activity (1/3 width on large) */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-apeel-green" /> Latest Insights
            </h2>
            <div className="h-[calc(100%-2rem)]">
              <RecentActivityWidget />
            </div>
          </div>
        </div>

        {/* Dynamic Insights Section (Moved to Bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 lg:col-span-8 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Weather Widget */}
              <div className="h-full min-h-[220px]">
                <WeatherWidget />
              </div>
              {/* AI Coach Widget */}
              <div className="h-full min-h-[220px]">
                <CoachingWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
