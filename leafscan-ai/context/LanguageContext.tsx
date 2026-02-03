
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, fr, ar } from '@/lib/locales';

type Language = 'en' | 'fr' | 'ar';
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    // Persist language
    useEffect(() => {
        const saved = localStorage.getItem('leafscan-lang') as Language;
        if (saved && ['en', 'fr', 'ar'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('leafscan-lang', lang);
        // Update HTML dir for accessibility/layout
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    // Helper to get nested translation keys "hero.title"
    const getTranslation = (obj: any, path: string): string => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path;
    };

    const t = (key: string) => {
        const dict = language === 'fr' ? fr : language === 'ar' ? ar : en;
        return getTranslation(dict, key);
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: changeLanguage,
            t,
            dir: language === 'ar' ? 'rtl' : 'ltr'
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
