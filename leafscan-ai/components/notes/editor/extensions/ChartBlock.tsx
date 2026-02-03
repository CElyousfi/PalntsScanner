'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Chart Block Component
const ChartBlockComponent = ({ node, updateAttributes }: any) => {
  const chartData = node.attrs.data ? JSON.parse(node.attrs.data) : null

  if (!chartData) {
    return (
      <NodeViewWrapper className="chart-block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 my-4 bg-gray-50">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium mb-2">Chart Block</p>
            <p className="text-sm text-gray-500 mb-6">Add data visualization to your farm report</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  const sampleData = JSON.stringify({
                    type: 'line',
                    title: 'Weekly Growth Trend',
                    data: [
                      { day: 'Mon', height: 12, health: 82 },
                      { day: 'Tue', height: 14, health: 84 },
                      { day: 'Wed', height: 16, health: 85 },
                      { day: 'Thu', height: 18, health: 86 },
                      { day: 'Fri', height: 20, health: 88 },
                      { day: 'Sat', height: 22, health: 89 },
                      { day: 'Sun', height: 24, health: 90 }
                    ]
                  })
                  updateAttributes({ data: sampleData })
                }}
                className="px-4 py-2 bg-apeel-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Growth Chart
              </button>
              <button
                onClick={() => {
                  const sampleData = JSON.stringify({
                    type: 'bar',
                    title: 'Weekly Health Score',
                    data: [
                      { day: 'Mon', score: 82 },
                      { day: 'Tue', score: 84 },
                      { day: 'Wed', score: 85 },
                      { day: 'Thu', score: 86 },
                      { day: 'Fri', score: 88 },
                      { day: 'Sat', score: 89 },
                      { day: 'Sun', score: 90 }
                    ]
                  })
                  updateAttributes({ data: sampleData })
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Health Chart
              </button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  const renderChart = () => {
    const { type, data } = chartData

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="height" stroke="#6BBF59" strokeWidth={2} name="Height (cm)" />
              <Line type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={2} name="Health %" />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="score" fill="#6BBF59" name="Health Score" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="height" stroke="#6BBF59" fill="#6BBF59" fillOpacity={0.3} name="Height (cm)" />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      default:
        return (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Unsupported chart type: {type}</p>
          </div>
        )
    }
  }

  return (
    <NodeViewWrapper className="chart-block">
      <div className="border border-gray-200 rounded-lg p-6 my-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{chartData.title || 'Chart'}</h3>
          <button
            onClick={() => updateAttributes({ data: null })}
            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Remove
          </button>
        </div>
        {renderChart()}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {chartData.type.charAt(0).toUpperCase() + chartData.type.slice(1)} Chart
          </span>
          <span>{chartData.data?.length || 0} data points</span>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// TipTap Extension
export const ChartBlock = Node.create({
  name: 'chartBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chart-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chart-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockComponent)
  },

  addCommands() {
    return {
      insertChart:
        () =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              data: null,
            },
          })
        },
    }
  },
})
