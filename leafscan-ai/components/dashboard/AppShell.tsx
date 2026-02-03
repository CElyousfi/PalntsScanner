'use client'

import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, Compass, Sprout, History, Globe, LogOut, Search, Eye, EyeOff, Menu, X, Leaf, FileText, Apple } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState, useMemo, memo, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { usePublicAccess } from '@/context/PublicAccessContext'
import AIChat from '../AIChat'

const AppShell = memo(function AppShell({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth()
    const { isPublicMode, togglePublicMode } = usePublicAccess()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const handleLogout = React.useCallback(() => {
        logout()
        router.push('/')
    }, [logout, router])

    const handleTogglePublicMode = React.useCallback(() => {
        togglePublicMode()
    }, [togglePublicMode])

    const handleCloseSidebar = React.useCallback(() => {
        setSidebarOpen(false)
    }, [])

    const handleOpenSidebar = React.useCallback(() => {
        setSidebarOpen(true)
    }, [])

    const menuItems = useMemo(() => [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Search, label: 'Scan', href: '/dashboard/scan' },
        { icon: FileText, label: 'Notes', href: '/dashboard/notes' },
        { icon: Apple, label: 'Vitals', href: '/dashboard/vitals' },
        { icon: Globe, label: 'Map', href: '/dashboard/threat-map' },
        { icon: Compass, label: 'Explore', href: '/dashboard/explore' },
        { icon: History, label: 'History', href: '/dashboard/history' },
    ], [])

    // Aggressive prefetching on mount - load all dashboard pages immediately
    useEffect(() => {
        menuItems.forEach(item => {
            router.prefetch(item.href)
        })
    }, [menuItems, router])

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="flex h-screen">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 items-center justify-between py-8 z-20">
                    {/* Brand Icon */}
                    <div className="w-12 h-12 bg-apeel-green rounded-xl flex items-center justify-center shadow-md">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>

                    {/* Navigation Icons */}
                    <nav className="flex flex-col gap-6 items-center w-full">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    className={`relative group p-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-apeel-green text-white shadow-md'
                                            : 'text-gray-400 hover:bg-gray-100 hover:text-apeel-green'
                                        }`}
                                >
                                    <item.icon className="w-6 h-6" />

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {item.label}
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="flex flex-col gap-4 items-center">
                        <button
                            onClick={handleTogglePublicMode}
                            className={`p-3 rounded-xl transition-all ${isPublicMode ? 'bg-apeel-green text-white' : 'text-gray-400 hover:bg-gray-100'
                                }`}
                        >
                            {isPublicMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in" onClick={handleCloseSidebar}>
                        <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-in-left" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-apeel-green rounded-lg flex items-center justify-center">
                                        <Leaf className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-xl text-apeel-black">LeafScan</span>
                                </div>
                                <button onClick={handleCloseSidebar}>
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <nav className="p-4 space-y-2">
                                {menuItems.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        prefetch={true}
                                        onClick={handleCloseSidebar}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href
                                                ? 'bg-apeel-green text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Container */}
                <main className="flex-1 flex flex-col h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {/* Mobile Header */}
                    <header className="md:hidden h-16 flex items-center justify-between px-4 z-20 bg-white border-b border-gray-200">
                        <button onClick={handleOpenSidebar}>
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-apeel-green rounded-lg flex items-center justify-center">
                                <Leaf className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg text-apeel-black">LeafScan</span>
                        </div>
                        <div className="w-8 h-8" />
                    </header>

                    {/* Loading Indicator */}
                    {isPending && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-apeel-green/20 z-50">
                            <div className="h-full bg-apeel-green animate-[loading_1s_ease-in-out_infinite]" style={{ width: '30%' }} />
                        </div>
                    )}

                    <div className={`flex-1 h-full overflow-y-auto transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                        {children}
                    </div>
                </main>

                {/* Hide global AIChat on notes page since it has its own AI assistant */}
                {pathname !== '/dashboard/notes' && <AIChat />}
            </div>
        </div>
    )
})

export default AppShell

