'use client'

import { memo } from 'react'
import AppShell from '@/components/dashboard/AppShell'
import AuthGuard from '@/components/auth/AuthGuard'
import { IncidentProvider } from '@/context/IncidentContext'
import { AutonomyProvider } from '@/context/AutonomyContext'
import { PublicAccessProvider } from '@/context/PublicAccessContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ExchangeProvider } from '@/context/ExchangeContext'
import { KnowledgeProvider } from '@/context/KnowledgeContext'
import { NotesProvider } from '@/context/NotesContext'

const DashboardLayout = memo(function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <AutonomyProvider>
                <PublicAccessProvider>
                    <ThemeProvider>
                        <ExchangeProvider>
                            <KnowledgeProvider>
                                <NotesProvider>
                                    <IncidentProvider>
                                        <AppShell>
                                            {children}
                                        </AppShell>
                                    </IncidentProvider>
                                </NotesProvider>
                            </KnowledgeProvider>
                        </ExchangeProvider>
                    </ThemeProvider>
                </PublicAccessProvider>
            </AutonomyProvider>
        </AuthGuard>
    )
})

export default DashboardLayout
