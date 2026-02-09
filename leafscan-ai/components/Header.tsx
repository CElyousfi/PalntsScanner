'use client'

import { useState, useEffect } from 'react'
import { Menu, User } from 'lucide-react'
import MenuOverlay from './MenuOverlay'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { language, setLanguage } = useLanguage()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 py-4 px-6 md:px-12 flex items-center justify-between transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
      >
        <div className="flex-shrink-0 z-50">
          <h1 className={`text-2xl font-bold tracking-tighter ${scrolled || isMenuOpen ? 'text-apeel-green' : 'text-apeel-green'}`}>
            LeafScan
          </h1>
        </div>

        <div className="flex items-center gap-6 z-50">
          {/* Guest Mode Badge */}
          {user?.isGuest && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-apeel-orange/10 border border-apeel-orange/30 rounded-full">
              <User size={14} className="text-apeel-orange" />
              <span className="text-xs font-bold text-apeel-orange tracking-wide">GUEST</span>
            </div>
          )}
          
          {/* Language Switcher (Desktop) */}
          <div className={`hidden md:flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${scrolled || isMenuOpen ? 'text-apeel-green' : 'text-apeel-green'}`}>
            <button onClick={() => setLanguage('en')} className={`transition-colors ${language === 'en' ? 'text-apeel-orange' : 'opacity-50 hover:opacity-100'}`}>EN</button>
            <span className="opacity-20">|</span>
            <button onClick={() => setLanguage('fr')} className={`transition-colors ${language === 'fr' ? 'text-apeel-orange' : 'opacity-50 hover:opacity-100'}`}>FR</button>
            <span className="opacity-20">|</span>
            <button onClick={() => setLanguage('ar')} className={`transition-colors ${language === 'ar' ? 'text-apeel-orange' : 'opacity-50 hover:opacity-100'}`}>AR</button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`group flex items-center gap-3 font-bold text-sm tracking-wide uppercase ${scrolled || isMenuOpen ? 'text-apeel-green' : 'text-apeel-green'
              }`}
          >
            <span className="hidden md:inline-block">Menu</span>
            <div className="p-2 border-2 border-current rounded-full">
              <Menu className="w-5 h-5" />
            </div>
          </button>
        </div>
      </header>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
