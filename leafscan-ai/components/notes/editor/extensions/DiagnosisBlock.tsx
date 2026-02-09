'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Stethoscope, Activity, AlertCircle, Leaf, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diagnosisBlock: {
      insertDiagnosis: () => ReturnType,
    }
  }
}

// Diagnosis Block Component
const DiagnosisBlockComponent = ({ node, updateAttributes }: any) => {
  const diagnosisData = node.attrs.data ? JSON.parse(node.attrs.data) : null

  if (!diagnosisData) {
    return (
      <NodeViewWrapper className="diagnosis-block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 my-4 bg-gray-50">
          <div className="text-center">
            <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium mb-2">Diagnosis Block</p>
            <p className="text-sm text-gray-500 mb-6">Add plant health diagnosis results</p>
            <button
              onClick={() => {
                const sampleData = JSON.stringify({
                  date: new Date().toISOString(),
                  disease: 'Early Blight',
                  confidence: 92,
                  severity: 'Medium',
                  status: 'warning',
                  recommendations: [
                    'Apply fungicide treatment',
                    'Improve air circulation',
                    'Remove affected leaves'
                  ]
                })
                updateAttributes({ data: sampleData })
              }}
              className="px-4 py-2 bg-apeel-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Sample Diagnosis
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Leaf className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <NodeViewWrapper className="diagnosis-block">
      <div className={`border rounded-lg p-6 my-4 ${getStatusColor(diagnosisData.status)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnosisData.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{diagnosisData.disease}</h3>
              <p className="text-sm text-gray-600">
                {new Date(diagnosisData.date).toLocaleDateString()} • Confidence: {diagnosisData.confidence}%
              </p>
            </div>
          </div>
          <button
            onClick={() => updateAttributes({ data: null })}
            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Remove
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${diagnosisData.severity === 'High' ? 'bg-red-100 text-red-800' :
              diagnosisData.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
              {diagnosisData.severity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-apeel-green h-2 rounded-full transition-all"
              style={{ width: `${diagnosisData.confidence}%` }}
            />
          </div>
        </div>

        {diagnosisData.recommendations && diagnosisData.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {diagnosisData.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-apeel-green mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

// TipTap Extension
export const DiagnosisBlock = Node.create({
  name: 'diagnosisBlock',
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
        tag: 'div[data-type="diagnosis-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'diagnosis-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagnosisBlockComponent)
  },

  addCommands() {
    return {
      insertDiagnosis:
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
