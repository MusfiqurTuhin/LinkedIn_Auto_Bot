"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ThemeType = 'modern' | 'bold' | 'minimal' | 'glass-light' | 'glass-dark' | 'neon' | 'luxury' | 'sunset'
export type FontType = 'Inter' | 'Roboto' | 'Playfair Display' | 'Outfit' | 'Space Grotesk'

interface ThemeState {
    theme: ThemeType
    primaryColor: string
    // Replaces simple backgroundColor with a full CSS background string (gradient)
    backgroundStyle: string
    font: FontType
    logoUrl?: string
    setTheme: (t: ThemeType) => void
    setPrimaryColor: (c: string) => void
    setBackgroundStyle: (c: string) => void
    setFont: (f: FontType) => void
    setLogoUrl: (l: string) => void
    // Helpers to apply presets
    applyPreset: (presetName: ThemeType) => void
}

const PRESETS: Record<ThemeType, { bg: string, primary: string, font: FontType }> = {
    'modern': { bg: '#FFFFFF', primary: '#2563EB', font: 'Inter' },
    'bold': { bg: '#0F172A', primary: '#F43F5E', font: 'Inter' },
    'minimal': { bg: '#F8FAFC', primary: '#1E293B', font: 'Roboto' },
    'glass-light': {
        bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        primary: '#FFFFFF',
        font: 'Outfit'
    },
    'glass-dark': {
        bg: 'radial-gradient(circle at 50% -20%, #2b0042 0%, #000000 100%)',
        primary: '#9D4EDD',
        font: 'Space Grotesk'
    },
    'neon': {
        bg: 'linear-gradient(to right, #000000, #130f40)',
        primary: '#00d2ff',
        font: 'Space Grotesk'
    },
    'luxury': {
        bg: 'linear-gradient(to top, #09203f 0%, #537895 100%)',
        primary: '#D4AF37',
        font: 'Playfair Display'
    },
    'sunset': {
        bg: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #ea580c 100%)',
        primary: '#FACC15', // Golden Orange
        font: 'Outfit'
    }
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('modern')
    const [primaryColor, setPrimaryColor] = useState<string>('#9D4EDD') // Default Purple
    const [backgroundColor, setBackgroundColor] = useState<string>('radial-gradient(circle at 50% -20%, #2b0042 0%, #000000 100%)')
    const [font, setFont] = useState<FontType>('Space Grotesk')
    const [logoUrl, setLogoUrl] = useState<string>('')

    const applyPreset = (presetName: ThemeType) => {
        const p = PRESETS[presetName]
        if (p) {
            setTheme(presetName)
            setPrimaryColor(p.primary)
            setBackgroundColor(p.bg)
            setFont(p.font)
        }
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            primaryColor,
            backgroundStyle: backgroundColor,
            font,
            logoUrl,
            setTheme,
            setPrimaryColor,
            setBackgroundStyle: setBackgroundColor,
            setFont,
            setLogoUrl,
            applyPreset
        }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
