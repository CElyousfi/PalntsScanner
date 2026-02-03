'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartCellProps {
  content: string
  mode: 'edit' | 'view'
  onChange: (content: string) => void
  onRun: () => void
}

const COLORS = ['#6BBF59', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ChartCell({ content, mode, onChange, onRun }: ChartCellProps) {
  const [chartConfig, setChartConfig] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'view' && content) {
      try {
        const config = JSON.parse(content)
        setChartConfig(config)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON')
        setChartConfig(null)
      }
    }
  }, [content, mode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      onRun()
    }
  }

  if (mode === 'edit') {
    return (
      <div className="chart-cell-edit">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[200px] p-4 border-0 focus:outline-none focus:ring-0 font-mono text-sm resize-y"
          placeholder={`{
  "type": "line",
  "title": "Growth Trend",
  "data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "datasets": [{
      "label": "Health %",
      "data": [75, 80, 85, 88],
      "borderColor": "#6BBF59"
    }]
  }
}

Press Shift+Enter to render`}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-semibold mb-2">Failed to render chart</p>
          <p className="text-xs text-red-500 font-mono">{error}</p>
        </div>
      </div>
    )
  }

  if (!chartConfig) {
    return (
      <div className="p-4">
        <p className="text-gray-400 italic">Empty chart - click edit to add configuration</p>
      </div>
    )
  }

  const { type, title, data: chartData } = chartConfig
  const datasets = chartData.datasets || []
  const labels = chartData.labels || []

  // Transform data for recharts
  const transformedData = labels.map((label: string, index: number) => {
    const point: any = { name: label }
    datasets.forEach((dataset: any, datasetIndex: number) => {
      point[dataset.label || `Series ${datasetIndex + 1}`] = dataset.data[index]
    })
    return point
  })

  return (
    <div className="chart-cell-view p-4">
      {title && <h4 className="text-lg font-semibold mb-4 text-gray-800">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' && (
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            {datasets.map((dataset: any, index: number) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dataset.label || `Series ${index + 1}`}
                stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: dataset.borderColor || COLORS[index % COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}

        {type === 'area' && (
          <AreaChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            {datasets.map((dataset: any, index: number) => (
              <Area
                key={index}
                type="monotone"
                dataKey={dataset.label || `Series ${index + 1}`}
                stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                fill={dataset.backgroundColor || COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        )}

        {type === 'bar' && (
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            {datasets.map((dataset: any, index: number) => (
              <Bar
                key={index}
                dataKey={dataset.label || `Series ${index + 1}`}
                fill={dataset.backgroundColor || COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        )}

        {type === 'donut' && (
          <PieChart>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey={datasets[0]?.label || 'value'}
              label
            >
              {transformedData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
