'use client'

import React from 'react'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

interface ChartRendererProps {
  config: any
}

export default function ChartRenderer({ config }: ChartRendererProps) {
  const { type, title, data } = config

  if (type === 'line') {
    return <LineChart title={title} data={data} />
  }

  if (type === 'bar') {
    return <BarChartComponent title={title} data={data} />
  }

  if (type === 'pie') {
    return <PieChartComponent title={title} data={data} />
  }

  return <div className="p-4 bg-gray-100 rounded-lg">Chart type not supported</div>
}

function LineChart({ title, data }: { title?: string; data: any }) {
  const labels = data?.labels || []
  const datasets = data?.datasets || []
  const maxValue = Math.max(...datasets.flatMap((d: any) => d.data || []))

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-apeel-green" />
        <h3 className="font-bold text-lg">{title || 'Line Chart'}</h3>
      </div>
      <div className="space-y-4">
        {datasets.map((dataset: any, idx: number) => (
          <div key={idx}>
            <div className="text-sm font-medium text-gray-700 mb-2">{dataset.label}</div>
            <div className="relative h-40 flex items-end gap-2">
              {dataset.data.map((value: number, i: number) => {
                const height = (value / maxValue) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-apeel-green rounded-t transition-all hover:bg-apeel-green/80"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{labels[i]}</div>
                    <div className="text-xs font-bold text-gray-700">{value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChartComponent({ title, data }: { title?: string; data: any }) {
  const labels = data?.labels || []
  const datasets = data?.datasets || []
  const maxValue = Math.max(...datasets.flatMap((d: any) => d.data || []))

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-apeel-green" />
        <h3 className="font-bold text-lg">{title || 'Bar Chart'}</h3>
      </div>
      <div className="space-y-3">
        {labels.map((label: string, i: number) => {
          const value = datasets[0]?.data[i] || 0
          const percentage = (value / maxValue) * 100
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-gray-600">{value}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-apeel-green transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PieChartComponent({ title, data }: { title?: string; data: any }) {
  const labels = data?.labels || []
  const values = data?.datasets?.[0]?.data || []
  const total = values.reduce((sum: number, val: number) => sum + val, 0)

  const colors = ['#6BBF59', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-apeel-green" />
        <h3 className="font-bold text-lg">{title || 'Pie Chart'}</h3>
      </div>
      <div className="space-y-2">
        {labels.map((label: string, i: number) => {
          const value = values[i] || 0
          const percentage = ((value / total) * 100).toFixed(1)
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <div className="flex-1 flex justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm text-gray-600">{percentage}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
