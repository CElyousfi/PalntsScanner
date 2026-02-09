// Export Utilities for Reports
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'jupyter' | 'html'
  filename?: string
  data: any
  elementId?: string // For PDF generation from HTML
}

// Export to PDF
export async function exportToPDF(elementId: string, filename: string = 'report.pdf') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    // Store original styles
    const originalStyles = {
      overflow: element.style.overflow,
      overflowX: element.style.overflowX,
      overflowY: element.style.overflowY,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      position: element.style.position,
      padding: element.style.padding,
      backgroundColor: element.style.backgroundColor,
      fontSize: element.style.fontSize,
      lineHeight: element.style.lineHeight,
      fontFamily: element.style.fontFamily
    }

    // Temporarily remove scroll constraints to capture full content
    element.style.overflow = 'visible'
    element.style.overflowX = 'visible'
    element.style.overflowY = 'visible'
    element.style.height = 'auto'
    element.style.maxHeight = 'none'
    element.style.position = 'relative'
    
    // Improve PDF readability with better styling
    element.style.padding = '40px'
    element.style.backgroundColor = '#ffffff'
    element.style.fontSize = '15px'
    element.style.lineHeight = '1.7'
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    
    // Find all text elements and improve readability
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading: any) => {
      heading.style.pageBreakAfter = 'avoid'
      heading.style.marginTop = '28px'
      heading.style.marginBottom = '14px'
      heading.style.fontWeight = '700'
      heading.style.color = '#111827'
      heading.style.letterSpacing = '-0.01em'
    })
    
    // Improve h1 specifically
    element.querySelectorAll('h1').forEach((h1: any) => {
      h1.style.fontSize = '32px'
      h1.style.marginBottom = '16px'
    })
    
    // Improve h2 specifically
    element.querySelectorAll('h2').forEach((h2: any) => {
      h2.style.fontSize = '26px'
    })
    
    // Improve h3 specifically
    element.querySelectorAll('h3').forEach((h3: any) => {
      h3.style.fontSize = '22px'
    })
    
    // Improve paragraphs and text
    element.querySelectorAll('p, div, span').forEach((text: any) => {
      text.style.color = '#374151'
    })
    
    // Improve spacing for all sections
    element.querySelectorAll('.bg-white, .rounded-\\[2rem\\]').forEach((section: any) => {
      section.style.marginBottom = '20px'
      section.style.pageBreakInside = 'avoid'
    })

    // Wait a bit for layout to settle
    await new Promise(resolve => setTimeout(resolve, 200))

    // Create canvas from element with full content
    const canvas = await html2canvas(element, {
      scale: 2.5, // Higher quality for better readability
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    // Restore original styles
    element.style.overflow = originalStyles.overflow
    element.style.overflowX = originalStyles.overflowX
    element.style.overflowY = originalStyles.overflowY
    element.style.height = originalStyles.height
    element.style.maxHeight = originalStyles.maxHeight
    element.style.position = originalStyles.position
    element.style.padding = originalStyles.padding
    element.style.backgroundColor = originalStyles.backgroundColor
    element.style.fontSize = originalStyles.fontSize
    element.style.lineHeight = originalStyles.lineHeight
    element.style.fontFamily = originalStyles.fontFamily
    
    // Restore heading styles
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading: any) => {
      heading.style.pageBreakAfter = ''
      heading.style.marginTop = ''
      heading.style.marginBottom = ''
      heading.style.fontWeight = ''
      heading.style.color = ''
      heading.style.letterSpacing = ''
      heading.style.fontSize = ''
    })
    
    // Restore text colors
    element.querySelectorAll('p, div, span').forEach((text: any) => {
      text.style.color = ''
    })
    
    // Restore section styles
    element.querySelectorAll('.bg-white, .rounded-\\[2rem\\]').forEach((section: any) => {
      section.style.marginBottom = ''
      section.style.pageBreakInside = ''
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Add margins for better readability
    const margin = 10 // 10mm margins on all sides
    const imgWidth = 210 - (margin * 2) // A4 width minus margins
    const pageHeight = 297 - (margin * 2) // A4 height minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0

    // Add first page with margins
    pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
    return { success: true, message: 'PDF exported successfully' }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, message: 'Failed to export PDF' }
  }
}

// Export to Excel
export function exportToExcel(data: any, filename: string = 'report.xlsx') {
  try {
    // Convert data to worksheet format
    const worksheets: { [key: string]: XLSX.WorkSheet } = {}
    
    // Summary Sheet
    if (data.summary) {
      const summaryData = [
        ['Report Summary'],
        [''],
        ['Date', new Date().toLocaleDateString()],
        ['Scan ID', data.scanId || 'N/A'],
        ['Type', data.type || 'Unknown'],
        [''],
        ['Overall Quality Score', data.summary.qualityScore || 'N/A'],
        ['Confidence', data.summary.confidence || 'N/A'],
        ['Grade', data.summary.grade || 'N/A'],
      ]
      worksheets['Summary'] = XLSX.utils.aoa_to_sheet(summaryData)
    }

    // Produce Details Sheet
    if (data.produce) {
      const produceData = [
        ['Produce Details'],
        [''],
        ['Variety', data.produce.variety?.name || 'N/A'],
        ['Scientific Name', data.produce.variety?.scientific_name || 'N/A'],
        ['Weight (g)', data.produce.estimates?.weight_g || 'N/A'],
        ['Diameter (mm)', data.produce.estimates?.diameter_mm || 'N/A'],
        ['Shelf Life (days)', data.produce.shelf_life || 'N/A'],
        ['Color Maturity Score', data.produce.grading?.color_maturity_score || 'N/A'],
        ['Firmness', data.produce.grading?.firmness_assessment || 'N/A'],
      ]
      worksheets['Produce'] = XLSX.utils.aoa_to_sheet(produceData)
    }

    // Defects Sheet
    if (data.defects && data.defects.length > 0) {
      const defectData = [
        ['Defect ID', 'Description', 'Severity', 'Type', 'Confidence (%)', 'Size (%)', 'Cause']
      ]
      
      data.defects.forEach((defect: any, index: number) => {
        defectData.push([
          `#${index + 1}`,
          defect.description || '',
          defect.severity || '',
          defect.defect_type || '',
          defect.confidence || '',
          defect.size_percent || '',
          defect.inferred_cause || ''
        ])
      })
      
      worksheets['Defects'] = XLSX.utils.aoa_to_sheet(defectData)
    }

    // Leaf Disease Details
    if (data.diseases && data.diseases.length > 0) {
      const diseaseData = [
        ['Disease', 'Confidence (%)', 'Severity', 'Stage', 'Description']
      ]
      
      data.diseases.forEach((disease: any) => {
        diseaseData.push([
          disease.name || '',
          disease.confidence || '',
          disease.severity || '',
          disease.stage || '',
          disease.description || ''
        ])
      })
      
      worksheets['Diseases'] = XLSX.utils.aoa_to_sheet(diseaseData)
    }

    // Treatment Recommendations
    if (data.treatments && data.treatments.length > 0) {
      const treatmentData = [
        ['Action', 'Priority', 'Description']
      ]
      
      data.treatments.forEach((treatment: any) => {
        treatmentData.push([
          treatment.action || '',
          treatment.priority || '',
          treatment.description || ''
        ])
      })
      
      worksheets['Treatments'] = XLSX.utils.aoa_to_sheet(treatmentData)
    }

    // Create workbook and add all sheets
    const workbook = XLSX.utils.book_new()
    Object.keys(worksheets).forEach(sheetName => {
      XLSX.utils.book_append_sheet(workbook, worksheets[sheetName], sheetName)
    })

    // Write file
    XLSX.writeFile(workbook, filename)
    return { success: true, message: 'Excel file exported successfully' }
  } catch (error) {
    console.error('Excel export error:', error)
    return { success: false, message: 'Failed to export Excel file' }
  }
}

// Export to CSV
export function exportToCSV(data: any, filename: string = 'report.csv') {
  try {
    let csvContent = ''

    // Add summary
    csvContent += 'Report Summary\n'
    csvContent += `Date,${new Date().toLocaleDateString()}\n`
    csvContent += `Scan ID,${data.scanId || 'N/A'}\n`
    csvContent += `Type,${data.type || 'Unknown'}\n`
    csvContent += `Quality Score,${data.summary?.qualityScore || 'N/A'}\n`
    csvContent += `Confidence,${data.summary?.confidence || 'N/A'}\n\n`

    // Add defects if present
    if (data.defects && data.defects.length > 0) {
      csvContent += 'Defects\n'
      csvContent += 'ID,Description,Severity,Type,Confidence,Size,Cause\n'
      
      data.defects.forEach((defect: any, index: number) => {
        csvContent += `#${index + 1},"${defect.description || ''}",${defect.severity || ''},${defect.defect_type || ''},${defect.confidence || ''},${defect.size_percent || ''},"${defect.inferred_cause || ''}"\n`
      })
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'CSV exported successfully' }
  } catch (error) {
    console.error('CSV export error:', error)
    return { success: false, message: 'Failed to export CSV' }
  }
}

// Export to JSON
export function exportToJSON(data: any, filename: string = 'report.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'JSON exported successfully' }
  } catch (error) {
    console.error('JSON export error:', error)
    return { success: false, message: 'Failed to export JSON' }
  }
}

// Export to Jupyter Notebook
export function exportToJupyter(data: any, filename: string = 'report.ipynb') {
  try {
    // Create Jupyter notebook structure
    const notebook = {
      cells: [
        {
          cell_type: 'markdown',
          metadata: {},
          source: [
            '# Scan Analysis Report\n',
            '\n',
            `**Date:** ${new Date().toLocaleDateString()}\n`,
            `**Scan ID:** ${data.scanId || 'N/A'}\n`,
            `**Type:** ${data.type || 'Unknown'}\n`
          ]
        },
        {
          cell_type: 'code',
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            '# Import required libraries\n',
            'import pandas as pd\n',
            'import json\n',
            'import matplotlib.pyplot as plt\n',
            'import seaborn as sns\n',
            '\n',
            '# Set plotting style\n',
            'sns.set_style("whitegrid")\n',
            'plt.rcParams["figure.figsize"] = (12, 6)'
          ]
        },
        {
          cell_type: 'markdown',
          metadata: {},
          source: ['## Summary Statistics']
        },
        {
          cell_type: 'code',
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            `# Report data\n`,
            `report_data = ${JSON.stringify(data, null, 2)}\n`,
            `\n`,
            `print("Quality Score:", report_data.get('summary', {}).get('qualityScore', 'N/A'))\n`,
            `print("Confidence:", report_data.get('summary', {}).get('confidence', 'N/A'))`
          ]
        }
      ],
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          codemirror_mode: {
            name: 'ipython',
            version: 3
          },
          file_extension: '.py',
          mimetype: 'text/x-python',
          name: 'python',
          nbconvert_exporter: 'python',
          pygments_lexer: 'ipython3',
          version: '3.8.0'
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    }

    // Add defects analysis if present
    if (data.defects && data.defects.length > 0) {
      notebook.cells.push(
        {
          cell_type: 'markdown',
          metadata: {},
          source: ['## Defects Analysis']
        },
        {
          cell_type: 'code',
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            `# Create defects dataframe\n`,
            `defects_data = ${JSON.stringify(data.defects, null, 2)}\n`,
            `df_defects = pd.DataFrame(defects_data)\n`,
            `\n`,
            `# Display defects summary\n`,
            `print(f"Total Defects: {len(df_defects)}")\n`,
            `print("\\nDefects by Severity:")\n`,
            `print(df_defects['severity'].value_counts())\n`,
            `\n`,
            `# Plot defects by severity\n`,
            `df_defects['severity'].value_counts().plot(kind='bar', color='coral')\n`,
            `plt.title('Defects by Severity')\n`,
            `plt.xlabel('Severity')\n`,
            `plt.ylabel('Count')\n`,
            `plt.tight_layout()\n`,
            `plt.show()`
          ]
        }
      )
    }

    const notebookString = JSON.stringify(notebook, null, 2)
    const blob = new Blob([notebookString], { type: 'application/x-ipynb+json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'Jupyter notebook exported successfully' }
  } catch (error) {
    console.error('Jupyter export error:', error)
    return { success: false, message: 'Failed to export Jupyter notebook' }
  }
}

// Export to HTML
export function exportToHTML(elementId: string, filename: string = 'report.html') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    // Create full HTML document
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    h1, h2, h3 { color: #111827; }
    .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #22c55e; padding-bottom: 1rem; margin-bottom: 2rem; }
    .metric { display: inline-block; margin: 1rem 2rem 1rem 0; }
    .metric-label { font-size: 0.875rem; color: #6b7280; text-transform: uppercase; font-weight: bold; }
    .metric-value { font-size: 1.5rem; font-weight: bold; color: #22c55e; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: bold; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Scan Analysis Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    ${element.innerHTML}
    <div class="footer">
      <p>Generated by LeafScan AI | © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'HTML exported successfully' }
  } catch (error) {
    console.error('HTML export error:', error)
    return { success: false, message: 'Failed to export HTML' }
  }
}

// Main export function
export async function exportReport(options: ExportOptions) {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `scan-report-${timestamp}`

  switch (options.format) {
    case 'pdf':
      return await exportToPDF(
        options.elementId || 'report-container',
        options.filename || `${defaultFilename}.pdf`
      )
    case 'excel':
      return exportToExcel(
        options.data,
        options.filename || `${defaultFilename}.xlsx`
      )
    case 'csv':
      return exportToCSV(
        options.data,
        options.filename || `${defaultFilename}.csv`
      )
    case 'json':
      return exportToJSON(
        options.data,
        options.filename || `${defaultFilename}.json`
      )
    case 'jupyter':
      return exportToJupyter(
        options.data,
        options.filename || `${defaultFilename}.ipynb`
      )
    case 'html':
      return exportToHTML(
        options.elementId || 'report-container',
        options.filename || `${defaultFilename}.html`
      )
    default:
      return { success: false, message: 'Unsupported format' }
  }
}
