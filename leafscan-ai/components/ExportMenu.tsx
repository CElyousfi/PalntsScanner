'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Code, File, Globe, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react'
import { exportReport } from '@/lib/exportUtils'

interface ExportMenuProps {
  data: any
  elementId?: string
  reportType?: 'produce' | 'leaf'
}

export default function ExportMenu({ data, elementId = 'report-container', reportType = 'produce' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json' | 'jupyter' | 'html') => {
    setExporting(format)
    setExportSuccess(null)

    try {
      const result = await exportReport({
        format,
        data,
        elementId
      })

      if (result.success) {
        setExportSuccess(format)
        setTimeout(() => setExportSuccess(null), 3000)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export report')
    } finally {
      setExporting(null)
    }
  }

  const exportOptions = [
    {
      format: 'pdf' as const,
      label: 'PDF Document',
      description: 'Printable report with images',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      format: 'excel' as const,
      label: 'Excel Spreadsheet',
      description: 'Structured data in multiple sheets',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      format: 'csv' as const,
      label: 'CSV File',
      description: 'Simple data table format',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      format: 'json' as const,
      label: 'JSON Data',
      description: 'Raw structured data',
      icon: Code,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      format: 'jupyter' as const,
      label: 'Jupyter Notebook',
      description: 'Interactive analysis notebook',
      icon: File,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      format: 'html' as const,
      label: 'HTML Report',
      description: 'Standalone web page',
      icon: Globe,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 bg-apeel-green text-white rounded-xl font-bold text-sm tracking-wide hover:bg-green-700 transition-all shadow-[0_8px_16px_-6px_rgba(20,83,45,0.4)] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        <Download className="w-5 h-5" />
        <span>Export Report</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100/50 z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-serif font-bold text-gray-900 text-lg">Export Options</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Choose your preferred format</p>
            </div>

            <div className="p-2 max-h-[500px] overflow-y-auto">
              {exportOptions.map((option) => {
                const Icon = option.icon
                const isExporting = exporting === option.format
                const isSuccess = exportSuccess === option.format

                return (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    disabled={isExporting}
                    className={`w-full p-3 rounded-xl text-left transition-all mb-1 group border border-transparent ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-100'
                      } ${isSuccess ? 'bg-green-50 border-green-200' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-apeel-green'
                        }`}>
                        {isExporting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSuccess ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm mb-0.5 ${isSuccess ? 'text-green-800' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className={`text-xs ${isSuccess ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                💡 Tip: Use Excel for analysis, PDF for sharing
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
