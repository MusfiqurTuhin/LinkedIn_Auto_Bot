"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ThemeType = 'modern' | 'bold' | 'minimal' | 'glass-light' | 'glass-dark' | 'neon' | 'luxury' | 'sunset' | 'pure-white' | 'pure-black'
export type FontType = 'Inter' | 'Roboto' | 'Playfair Display' | 'Outfit' | 'Space Grotesk' | 'Poppins' | 'Montserrat' | 'Lato' | 'Open Sans' | 'Merriweather' | 'Caveat' | 'Tiro Bangla' | 'Noto Serif Bengali' | 'Hind Siliguri' | 'Noto Sans Bengali'
export type TextAlignType = 'left' | 'center' | 'right'

interface ThemeState {
    theme: ThemeType
    primaryColor: string
    textColor: string
    backgroundStyle: string
    font: FontType
    fontSize: number
    textAlign: TextAlignType
    textShadow: boolean
    cornerRadius: number
    logoUrl?: string
    footerColor: string
    footerTextColor: string
    footerGradient: boolean
    backgroundImageUrl: string
    backgroundOpacity: number
    setTheme: (t: ThemeType) => void
    setPrimaryColor: (c: string) => void
    setTextColor: (c: string) => void
    setBackgroundStyle: (c: string) => void
    setFont: (f: FontType) => void
    setFontSize: (s: number) => void
    setTextAlign: (a: TextAlignType) => void
    setTextShadow: (s: boolean) => void
    setCornerRadius: (r: number) => void
    setLogoUrl: (l: string) => void
    setFooterColor: (c: string) => void
    setFooterTextColor: (c: string) => void
    setFooterGradient: (g: boolean) => void
    setBackgroundImageUrl: (url: string) => void
    setBackgroundOpacity: (o: number) => void
    applyPreset: (presetName: ThemeType) => void
}

const PRESETS: Record<ThemeType, { bg: string, primary: string, text: string, font: FontType }> = {
    'modern': { bg: '#FFFFFF', primary: '#2563EB', text: '#000000', font: 'Inter' },
    'bold': { bg: '#0F172A', primary: '#F43F5E', text: '#ffffff', font: 'Inter' },
    'minimal': { bg: '#F8FAFC', primary: '#1E293B', text: '#000000', font: 'Roboto' },
    'glass-light': {
        bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        primary: '#FFFFFF',
        text: '#000000',
        font: 'Outfit'
    },
    'glass-dark': {
        bg: 'radial-gradient(circle at 50% -20%, #2b0042 0%, #000000 100%)',
        primary: '#9D4EDD',
        text: '#ffffff',
        font: 'Space Grotesk'
    },
    'neon': {
        bg: 'linear-gradient(to right, #000000, #130f40)',
        primary: '#00d2ff',
        text: '#ffffff',
        font: 'Space Grotesk'
    },
    'luxury': {
        bg: 'linear-gradient(to top, #09203f 0%, #537895 100%)',
        primary: '#D4AF37',
        text: '#ffffff',
        font: 'Playfair Display'
    },
    'sunset': {
        bg: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #ea580c 100%)',
        primary: '#FACC15',
        text: '#ffffff',
        font: 'Outfit'
    },
    'pure-white': {
        bg: '#FFFFFF',
        primary: '#000000',
        text: '#000000',
        font: 'Inter'
    },
    'pure-black': {
        bg: '#000000',
        primary: '#FFFFFF',
        text: '#ffffff',
        font: 'Inter'
    }
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('glass-dark')
    const [primaryColor, setPrimaryColor] = useState<string>('#9D4EDD')
    const [textColor, setTextColor] = useState<string>('#ffffff')
    const [backgroundColor, setBackgroundColor] = useState<string>('radial-gradient(circle at 50% -20%, #2b0042 0%, #000000 100%)')
    const [font, setFont] = useState<FontType>('Space Grotesk')
    const [fontSize, setFontSize] = useState<number>(24)
    const [textAlign, setTextAlign] = useState<TextAlignType>('left')
    const [textShadow, setTextShadow] = useState<boolean>(true)
    const [cornerRadius, setCornerRadius] = useState<number>(16)
    const [logoUrl, setLogoUrl] = useState<string>('')
    const [footerColor, setFooterColor] = useState<string>('#1a1a2e')
    const [footerTextColor, setFooterTextColor] = useState<string>('#ffffff')
    const [footerGradient, setFooterGradient] = useState<boolean>(false)
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('')
    const [backgroundOpacity, setBackgroundOpacity] = useState<number>(20)

    const applyPreset = (presetName: ThemeType) => {
        const p = PRESETS[presetName]
        if (p) {
            setTheme(presetName)
            setPrimaryColor(p.primary)
            setTextColor(p.text)
            setBackgroundColor(p.bg)
            setFont(p.font)
        }
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            primaryColor,
            textColor,
            backgroundStyle: backgroundColor,
            font,
            fontSize,
            textAlign,
            textShadow,
            cornerRadius,
            logoUrl,
            footerColor,
            footerTextColor,
            footerGradient,
            backgroundImageUrl,
            backgroundOpacity,
            setTheme,
            setPrimaryColor,
            setTextColor,
            setBackgroundStyle: setBackgroundColor,
            setFont,
            setFontSize,
            setTextAlign,
            setTextShadow,
            setCornerRadius,
            setLogoUrl,
            setFooterColor,
            setFooterTextColor,
            setFooterGradient,
            setBackgroundImageUrl,
            setBackgroundOpacity,
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

