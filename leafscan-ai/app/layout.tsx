import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { MissionProvider } from '@/context/MissionContext'
import ErrorSuppressor from '@/components/ErrorSuppressor'
import GlobalStateSync from '@/components/GlobalStateSync'

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LeafScan AI Pro: Crop Rescue Actions with Gemini 3',
  description: 'Gemini 3-powered diagnosis to supplier maps for farmers. From prediction to execution.',
}

// ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${urbanist.variable} font-urbanist`}>
        <ErrorSuppressor />
        <GlobalStateSync />
        <LanguageProvider>
          <AuthProvider>
            <MissionProvider>
              {children}
            </MissionProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
