'use client'

import { useAuth } from '@/context/AuthContext'
import { Sprout, History, Map, BookOpen, Compass } from 'lucide-react'
import Link from 'next/link'

export default function DashboardHome() {
  const { user } = useAuth()

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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-600">
            Choose a tool to manage your crops and diagnose plant health
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1"
              >
                <div className={`${link.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {link.description}
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Scans</div>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active Monitoring</div>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Health Score</div>
            <div className="text-3xl font-bold text-green-600">-</div>
          </div>
        </div>
      </div>
    </div>
  )
}
