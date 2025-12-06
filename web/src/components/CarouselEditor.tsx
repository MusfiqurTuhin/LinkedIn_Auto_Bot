"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Plus, Calendar, Download, Palette, Type, User, Sparkles, LayoutTemplate, Rows } from 'lucide-react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import jsPDF from 'jspdf'
import { useTheme, ThemeType } from '@/context/ThemeContext'
import { ColorPicker } from '@/components/ui/color-picker'
import { GlassCard } from '@/components/visuals/GlassCard'
import InfographicCard from '@/components/visuals/InfographicCard'

interface Slide {
    day_offset: number
    content: string
    image_prompt: string
    layout?: 'classic' | 'visual' | 'split' | 'infographic'
    data_points?: { label: string; value: number }[]
}

export function CarouselEditor() {
    const {
        theme, applyPreset,
        primaryColor, setPrimaryColor,
        backgroundStyle, setBackgroundStyle,
        font, setFont,
        logoUrl, setLogoUrl
    } = useTheme()

    const [topic, setTopic] = useState('')
    const [days, setDays] = useState(5)
    const [isLoading, setIsLoading] = useState(false)
    const [slides, setSlides] = useState<Slide[]>([])

    // Brand State
    const [brandName, setBrandName] = useState('')
    const [brandHandle, setBrandHandle] = useState('')
    const [apiKey, setApiKey] = useState('')

    // Refs
    const slideRefs = useRef<(HTMLDivElement | null)[]>([])

    // Load API Key from localStorage
    useEffect(() => {
        const key = localStorage.getItem('gemini_api_key')
        if (key) setApiKey(key)
    }, [])

    // Update API Key
    const handleApiKeyChange = (key: string) => {
        setApiKey(key)
        localStorage.setItem('gemini_api_key', key)
    }

    const handleGenerate = async () => {
        if (!topic) return
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'x-gemini-api-key': apiKey } : {})
                },
                body: JSON.stringify({ topic, days }),
            })
            const data = await res.json()
            if (data.data) {
                setSlides(data.data)
                slideRefs.current = new Array(data.data.length).fill(null)
            }
        } catch (error) {
            console.error("Failed to generate", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSlideChange = (index: number, field: keyof Slide, value: string) => {
        const newSlides = [...slides]
        // @ts-ignore
        newSlides[index] = { ...newSlides[index], [field]: value }
        setSlides(newSlides)
    }

    const toggleLayout = (index: number) => {
        const newSlides = [...slides]
        const layouts: ('classic' | 'visual' | 'split' | 'infographic')[] = ['classic', 'visual', 'split', 'infographic']
        const current = newSlides[index].layout || 'classic'
        const next = layouts[(layouts.indexOf(current) + 1) % layouts.length]
        newSlides[index] = { ...newSlides[index], layout: next }
        setSlides(newSlides)
    }

    const handleDownloadSlide = async (index: number) => {
        const el = slideRefs.current[index]
        if (!el) return
        try {
            console.log("Generating slide image...")
            const dataUrl = await toPng(el)

            // Convert Base64 to Blob for robust download
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            const blobUrl = URL.createObjectURL(blob)

            const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) || 'carousel'
            const filename = `${safeTopic}_slide_${index + 1}.png`

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100)

            console.log(`Downloaded: ${filename}`)
        } catch (error) {
            console.error("Failed to download slide", error)
        }
    }

    const handleDownloadPDF = async () => {
        if (slides.length === 0) return

        // Create PDF (Portrait A4 or custom based on visual size)
        // 1080x1350 is roughly 4:5 ratio. 
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [340, 425] // Matching the CSS width 340px and aspect ratio 4/5 (340 * 1.25 = 425)
        })

        for (let i = 0; i < slides.length; i++) {
            const el = slideRefs.current[i]
            if (el) {
                if (i > 0) doc.addPage()
                const dataUrl = await toPng(el)
                doc.addImage(dataUrl, 'PNG', 0, 0, 340, 425)
            }
        }

        const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) || 'carousel'
        doc.save(`${safeTopic}_carousel.pdf`)
    }

    return (
        <div className="flex h-screen bg-[#0F172A] text-slate-100 font-sans overflow-hidden">

            {/* COLUMN 1: Global Settings & Generate (Dark Mode UI) */}
            <div className="w-[340px] border-r border-slate-800 bg-[#1E293B] flex flex-col h-full shadow-xl z-20">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        AI Carousel <span className="text-purple-400">Pro</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Dribbble-ready designs in seconds.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Generate Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Content Engine</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300">Topic / Context</label>
                            <Textarea
                                placeholder="e.g. 7 Secrets of High-Converting Landing Pages..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="h-28 resize-none bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-medium text-slate-300">Slide Count</label>
                                <span className="text-xs font-bold text-purple-400">{days} Slides</span>
                            </div>
                        </div>

                        {/* API Key Input */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <label className="text-xs font-medium text-slate-300 flex justify-between">
                                API Key (Optional)
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-400 hover:text-purple-300 text-[10px]">Get Key ↗</a>
                            </label>
                            <input
                                type="password"
                                placeholder="Paste your Gemini API Key..."
                                value={apiKey}
                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-600 focus:border-purple-500 outline-none"
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !topic}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-6 shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Magic
                        </Button>
                    </section>

                    {/* Theme Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Palette className="h-4 w-4" /> Professional Themes
                        </h3>

                        <div className="grid grid-cols-2 gap-2">
                            {['glass-dark', 'glass-light', 'neon', 'luxury', 'bold', 'sunset', 'minimal'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => applyPreset(t as ThemeType)}
                                    className={`text-xs px-3 py-2 rounded-md border transition-all ${theme === t ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    {t.replace('-', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2 pt-2">
                            <ColorPicker label="Accent Color" value={primaryColor} onChange={setPrimaryColor} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300">Typography</label>
                            <select
                                value={font}
                                onChange={(e) => setFont(e.target.value as any)}
                                className="w-full h-9 rounded-md border border-slate-700 bg-slate-900 text-white text-sm px-2 focus:border-purple-500 outline-none"
                            >
                                <option value="Inter">Inter (Clean)</option>
                                <option value="Roboto">Roboto (Neutral)</option>
                                <option value="Playfair Display">Playfair (Serif)</option>
                                <option value="Outfit">Outfit (Display)</option>
                                <option value="Space Grotesk">Space Grotesk (Tech)</option>
                            </select>
                        </div>
                    </section>

                    {/* Brand Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <User className="h-4 w-4" /> Personal Branding
                        </h3>

                        {/* Logo Upload */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-slate-500" />
                                )}

                                {/* Hidden Input Layer */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const url = URL.createObjectURL(file)
                                            setLogoUrl(url)
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-slate-300">Brand Logo</p>
                                <p className="text-[10px] text-slate-500">Tap circle to upload</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300">Display Name</label>
                            <input
                                className="w-full h-9 px-3 border border-slate-700 bg-slate-900 text-white rounded-md text-sm focus:border-purple-500 outline-none placeholder:text-slate-600"
                                placeholder="e.g. Musfiqur Tuhin"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300">Handle / Tagline</label>
                            <input
                                className="w-full h-9 px-3 border border-slate-700 bg-slate-900 text-white rounded-md text-sm focus:border-purple-500 outline-none placeholder:text-slate-600"
                                placeholder="e.g. @musfiq.dev"
                                value={brandHandle}
                                onChange={(e) => setBrandHandle(e.target.value)}
                            />
                        </div>
                    </section>
                </div>
            </div >

            {/* COLUMN 2: Content Editor (Slide Inputs) */}
            < div className="w-[380px] border-r border-slate-800 bg-[#0F172A] flex flex-col h-full z-10" >
                <div className="p-4 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur">
                    <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
                        <Type className="h-4 w-4 text-purple-400" /> Storyboard
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {slides.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 text-slate-600">
                            <Type className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Content will appear here.</p>
                        </div>
                    ) : (
                        slides.map((slide, idx) => (
                            <Card key={idx} className="bg-slate-800 border-slate-700 shadow-none hover:border-slate-600 transition-colors">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex justify-between bg-black/20">
                                    Day {slide.day_offset}
                                    <span className="text-slate-600">#{idx + 1}</span>
                                </div>
                                <CardContent className="p-3">
                                    <Textarea
                                        value={slide.content}
                                        onChange={(e) => handleSlideChange(idx, 'content', e.target.value)}
                                        className="min-h-[100px] text-xs bg-transparent border-none text-slate-300 resize-none focus:ring-0 p-0 leading-relaxed scrollbar-hide"
                                    />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div >

            {/* COLUMN 3: Live Preview (Canvas) */}
            < div className="flex-1 bg-[#020617] relative flex flex-col h-full overflow-hidden" >
                {/* Grid Background Effect */}
                < div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }
                    }>
                </div >

                <div className="p-4 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur flex justify-between items-center shadow-lg z-20">
                    <span className="text-sm font-medium text-slate-400">Live Canvas</span>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadPDF} variant="default" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                            <Download className="mr-2 h-3 w-3" /> Export PDF
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                            <Download className="mr-2 h-3 w-3" /> Download ZIP
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
                    {slides.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                            <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                                <Sparkles className="h-10 w-10 text-purple-500 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Create?</h3>
                            <p className="max-w-xs text-center text-sm">Select a topic and generate to see your high-fidelity carousel here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center pb-20">
                            {slides.map((slide, idx) => (
                                <div key={idx} className="relative group/preview">

                                    {/* === THE GLASS CARD RENDER === */}
                                    <div
                                        // @ts-ignore
                                        ref={el => slideRefs.current[idx] = el}
                                        className="aspect-[4/5] w-[340px] relative overflow-hidden flex flex-col transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:-translate-y-2"
                                        style={{
                                            background: backgroundStyle,
                                            fontFamily: font
                                        }}
                                    >
                                        {/* Optional: Noise overlay for texture */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                                        <GlassCard
                                            variant={theme.includes('light') ? 'light' : theme.includes('neon') ? 'neon' : 'dark'}
                                            className="h-full flex flex-col border-none bg-black/10 backdrop-blur-md m-4 rounded-xl overflow-hidden shadow-inner relative"
                                        >
                                            {/* Layout: VISUAL (Full Image Background) */}
                                            {slide.layout === 'visual' && slide.image_prompt && (
                                                <div className="absolute inset-0 z-0">
                                                    <img
                                                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=800&nologo=true&seed=${idx}`}
                                                        alt="Background"
                                                        className="w-full h-full object-cover opacity-60"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                                </div>
                                            )}

                                            {/* Top Bar */}
                                            <div className="p-6 pb-2 flex justify-between items-center opacity-80 z-20 relative">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor, textShadow: slide.layout === 'visual' ? '0 2px 4px black' : 'none' }}>
                                                    Step {idx + 1}
                                                </span>
                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                            </div>

                                            {/* Main Content */}
                                            <div className={`flex-1 px-6 py-2 flex flex-col relative z-10 ${slide.layout === 'visual' ? 'justify-end pb-10' : ''}`}>

                                                {/* Layout: SPLIT (Image Top, Text Bottom) */}
                                                {slide.layout === 'split' && slide.image_prompt && (
                                                    <div className="h-32 mb-4 rounded-lg overflow-hidden relative shrink-0">
                                                        <img
                                                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=400&nologo=true&seed=${idx}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <p className={`font-bold leading-tight tracking-tight drop-shadow-sm whitespace-pre-wrap mb-4 ${slide.layout === 'visual' ? 'text-2xl text-white drop-shadow-md' : 'text-xl md:text-2xl'}`}>
                                                    {slide.content}
                                                </p>

                                                {/* Layout: CLASSIC (Bottom Image) */}
                                                {(!slide.layout || slide.layout === 'classic') && slide.image_prompt && (
                                                    <div className="flex-1 min-h-0 rounded-lg overflow-hidden relative group/image mt-auto">
                                                        <img
                                                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=600&nologo=true&seed=${idx}`}
                                                            alt="AI Generated"
                                                            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                                    </div>
                                                )}

                                                {/* Layout: INFOGRAPHIC */}
                                                {slide.layout === 'infographic' && (
                                                    <InfographicCard
                                                        content={slide.content}
                                                        image_prompt={slide.image_prompt}
                                                        data_points={slide.data_points}
                                                    />
                                                )}
                                            </div>

                                            {/* Branding Footer */}
                                            {(brandName || brandHandle || logoUrl) && (
                                                <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center gap-3 z-20 relative">
                                                    {/* Avatar / Logo */}
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt="Brand" className="h-8 w-8 rounded-full border border-white/10 object-cover shrink-0" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shrink-0" />
                                                    )}

                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold truncate leading-none mb-1">{brandName}</span>
                                                        <span className="text-[9px] opacity-60 truncate leading-none">{brandHandle}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </GlassCard>
                                    </div>
                                    {/* === END CARD === */}

                                    {/* Hover Download Button */}
                                    <div className="absolute -right-4 top-4 opacity-0 group-hover/preview:opacity-100 group-hover/preview:right-4 transition-all duration-300">
                                        <Button size="icon" className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 shadow-lg" onClick={() => handleDownloadSlide(idx)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </div >
    )
}
