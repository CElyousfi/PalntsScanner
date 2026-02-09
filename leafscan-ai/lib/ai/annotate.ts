// Image annotation utility - renders highlights onto the uploaded image and returns a data URL
// NOTE: Runs in the browser only.

export type LeafSeverity = 'mild' | 'moderate' | 'severe'
export type CropSeverity = 'Critical' | 'Severe' | 'Moderate' | 'Minor'

interface LeafHighlight {
  label?: string
  severity?: LeafSeverity
  center?: { x: number; y: number } // normalized 0..1
  radius?: number // normalized relative to width (0..1)
  bbox?: { x: number; y: number; width: number; height: number } // normalized 0..1
}

interface CropDefect {
  id: number
  defect_type?: string
  severity?: CropSeverity
  center_x: number // normalized 0..1
  center_y: number // normalized 0..1
  radius: number // normalized 0..1 (based on width)
}

export interface AnnotateOptions {
  scanType: 'leaf' | 'crop'
  width?: number // target render width (keeps aspect ratio)
  leaf?: { highlightedAreas?: LeafHighlight[] }
  crop?: { areas?: CropDefect[] }
}

function colorForLeaf(sev?: LeafSeverity): string {
  switch (sev) {
    case 'mild': return '#facc15' // amber-400
    case 'moderate': return '#f97316' // orange-500
    case 'severe': return '#dc2626' // red-600
    default: return '#22c55e' // green-500
  }
}

function colorForCrop(sev?: CropSeverity): string {
  switch (sev) {
    case 'Critical': return '#dc2626'
    case 'Severe': return '#ea580c'
    case 'Moderate': return '#f59e0b'
    case 'Minor': return '#84cc16'
    default: return '#22c55e'
  }
}

export async function generateAnnotatedImage(base64Image: string, options: AnnotateOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.onload = () => {
        const targetW = options.width || Math.min(img.naturalWidth, 1024)
        const scale = targetW / img.naturalWidth
        const targetH = Math.round(img.naturalHeight * scale)

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas 2D context not available'))

        // Draw base image
        ctx.drawImage(img, 0, 0, targetW, targetH)

        // Common styles
        ctx.lineWidth = Math.max(2, Math.round(targetW * 0.003))

        if (options.scanType === 'leaf' && options.leaf?.highlightedAreas) {
          for (const area of options.leaf.highlightedAreas) {
            const stroke = colorForLeaf(area.severity)
            ctx.strokeStyle = stroke
            ctx.fillStyle = stroke + '33' // 20% alpha

            if (area.center && typeof area.radius === 'number') {
              const cx = area.center.x * targetW
              const cy = area.center.y * targetH
              const r = area.radius * targetW
              ctx.beginPath()
              ctx.arc(cx, cy, r, 0, Math.PI * 2)
              ctx.closePath()
              ctx.stroke()
              ctx.fill()
            } else if (area.bbox) {
              const x = area.bbox.x * targetW
              const y = area.bbox.y * targetH
              const w = area.bbox.width * targetW
              const h = area.bbox.height * targetH
              ctx.strokeRect(x, y, w, h)
              ctx.fillRect(x, y, w, h)
            }
          }
        }

        if (options.scanType === 'crop' && options.crop?.areas) {
          for (const d of options.crop.areas) {
            const stroke = colorForCrop(d.severity)
            ctx.strokeStyle = stroke
            ctx.fillStyle = stroke + '33'

            const cx = d.center_x * targetW
            const cy = d.center_y * targetH
            const r = d.radius * targetW
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, Math.PI * 2)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
          }
        }

        // Return PNG data URL
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(base64Image) // Fallback to original
      img.src = base64Image
    } catch (e) {
      resolve(base64Image) // Fallback on any error
    }
  })
}
