"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Plus, Calendar, Download, Palette, Type, User, Sparkles, LayoutTemplate, Rows, ArrowRight, ImagePlus, Ratio, Eye, EyeOff } from 'lucide-react'
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
    custom_image_url?: string
    hide_logo?: boolean
}

type AspectRatio = '4/5' | '1/1' | '16/9'
type LogoStyle = 'original' | 'grayscale' | 'white' | 'black'

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
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4/5')
    const [logoStyle, setLogoStyle] = useState<LogoStyle>('original')
    const [logoSize, setLogoSize] = useState(32)
    const [isLoading, setIsLoading] = useState(false)
    const [slides, setSlides] = useState<Slide[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

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

    const handleSlideChange = (index: number, field: keyof Slide, value: any) => {
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
            const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true })

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

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            handleSlideChange(index, 'custom_image_url', url)
        }
    }

    const getDimensions = () => {
        switch (aspectRatio) {
            case '1/1': return { width: 340, height: 340, aspect: 'aspect-square' }
            case '16/9': return { width: 340, height: 191, aspect: 'aspect-video' }
            default: return { width: 340, height: 425, aspect: 'aspect-[4/5]' } // 4:5
        }
    }

    const handleDownloadPDF = async () => {
        if (slides.length === 0) return

        const { width, height } = getDimensions()

        // Create PDF
        const doc = new jsPDF({
            orientation: aspectRatio === '16/9' ? 'l' : 'p',
            unit: 'px',
            format: [width, height]
        })

        for (let i = 0; i < slides.length; i++) {
            const el = slideRefs.current[i]
            if (el) {
                if (i > 0) doc.addPage([width, height])
                const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true })
                doc.addImage(dataUrl, 'PNG', 0, 0, width, height)
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

                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                <Ratio className="h-4 w-4" /> Canvas Size
                            </h3>
                            <div className="flex bg-slate-900 p-1 rounded-md border border-slate-700">
                                <button
                                    onClick={() => setAspectRatio('4/5')}
                                    className={`flex-1 py-1.5 text-[10px] font-medium rounded ${aspectRatio === '4/5' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Portrait (4:5)
                                </button>
                                <button
                                    onClick={() => setAspectRatio('1/1')}
                                    className={`flex-1 py-1.5 text-[10px] font-medium rounded ${aspectRatio === '1/1' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Square (1:1)
                                </button>
                                <button
                                    onClick={() => setAspectRatio('16/9')}
                                    className={`flex-1 py-1.5 text-[10px] font-medium rounded ${aspectRatio === '16/9' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Landscape
                                </button>
                            </div>
                        </div>

                        {/* Logo Style Selector */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                <Palette className="h-4 w-4" /> Logo Style
                            </h3>
                            <div className="grid grid-cols-4 gap-1">
                                {(['original', 'grayscale', 'white', 'black'] as LogoStyle[]).map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setLogoStyle(style)}
                                        className={`text-[10px] py-1.5 rounded border capitalize transition-colors ${logoStyle === style
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logo Size Control */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                                <span>Logo Size</span>
                                <span className="text-slate-500">{logoSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="80"
                                value={logoSize}
                                onChange={(e) => setLogoSize(Number(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
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
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex justify-between items-center bg-black/20">
                                    <span>Day {slide.day_offset}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSlideChange(idx, 'hide_logo', !slide.hide_logo as any)}
                                            className="text-slate-500 hover:text-purple-400 transition-colors"
                                            title={slide.hide_logo ? "Show Logo" : "Hide Logo"}
                                        >
                                            {slide.hide_logo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        </button>
                                        <label className="cursor-pointer hover:text-purple-400 transition-colors" title="Upload custom image">
                                            <ImagePlus className="h-3 w-3" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(idx, e)}
                                            />
                                        </label>
                                        <span className="text-slate-600">#{idx + 1}</span>
                                    </div>
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
                        <div className="flex flex-col h-full">
                            {/* Scrollable Container */}
                            <div
                                className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex items-center px-10 gap-8 custom-scrollbar scroll-smooth"
                                onScroll={(e) => {
                                    const container = e.currentTarget
                                    const index = Math.round(container.scrollLeft / (340 + 32)) // 340px card + 32px gap
                                    setCurrentSlideIndex(Math.min(Math.max(0, index), slides.length - 1))
                                }}
                            >
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="relative group/preview snap-center shrink-0 my-auto">

                                        {/* === THE GLASS CARD RENDER === */}
                                        <div
                                            // @ts-ignore
                                            ref={el => slideRefs.current[idx] = el}
                                            className={`${getDimensions().aspect} w-[340px] relative overflow-hidden flex flex-col transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:-translate-y-2`}
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
                                                {/* Layout: VISUAL (Full Image Background) */}
                                                {slide.layout === 'visual' && (slide.custom_image_url || slide.image_prompt) && (
                                                    <div className="absolute inset-0 z-0">
                                                        <img
                                                            src={slide.custom_image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=800&nologo=true&seed=${idx}`}
                                                            alt="Background"
                                                            className="w-full h-full object-cover opacity-60"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                                    </div>
                                                )}

                                                {/* Top Bar */}
                                                <div className="p-6 pb-2 flex justify-between items-center opacity-80 z-20 relative">
                                                    <span className="text-[10px] font-bold tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full border border-current backdrop-blur-sm" style={{ color: primaryColor, backgroundColor: slide.layout === 'visual' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.1)' }}>
                                                        {idx === slides.length - 1 ? 'END' : (
                                                            <>
                                                                SWIPE <ArrowRight className="w-3 h-3" />
                                                            </>
                                                        )}
                                                    </span>
                                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                                </div>

                                                {/* Main Content */}
                                                <div className={`flex-1 px-6 py-2 flex flex-col relative z-10 ${slide.layout === 'visual' ? 'justify-end pb-10' : ''}`}>

                                                    {/* Layout: SPLIT (Image Top, Text Bottom) */}
                                                    {slide.layout === 'split' && (slide.custom_image_url || slide.image_prompt) && (
                                                        <div className="h-32 mb-4 rounded-lg overflow-hidden relative shrink-0">
                                                            <img
                                                                src={slide.custom_image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=400&nologo=true&seed=${idx}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    <p className={`font-bold leading-tight tracking-tight drop-shadow-sm whitespace-pre-wrap mb-4 ${slide.layout === 'visual' ? 'text-2xl text-white drop-shadow-md' : 'text-xl md:text-2xl'}`}>
                                                        {slide.content}
                                                    </p>

                                                    {/* Layout: CLASSIC (Bottom Image) */}
                                                    {(!slide.layout || slide.layout === 'classic') && (slide.custom_image_url || slide.image_prompt) && (
                                                        <div className="flex-1 min-h-0 rounded-lg overflow-hidden relative group/image mt-auto">
                                                            <img
                                                                src={slide.custom_image_url || `https://wsrv.nl/?url=${encodeURIComponent(`https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt)}?width=600&height=600&nologo=true&seed=${idx}`)}`}
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
                                                            image_prompt={slide.custom_image_url || slide.image_prompt}
                                                            data_points={slide.data_points}
                                                        />
                                                    )}
                                                </div>

                                                {/* Top Right Logo */}
                                                {logoUrl && !slide.hide_logo && (
                                                    <div className="absolute top-6 right-6 z-30">
                                                        <img
                                                            src={logoUrl}
                                                            alt="Logo"
                                                            className="object-contain drop-shadow-md"
                                                            style={{
                                                                width: `${logoSize}px`,
                                                                height: `${logoSize}px`,
                                                                filter: logoStyle === 'white' ? 'brightness(0) invert(1)'
                                                                    : logoStyle === 'black' ? 'brightness(0)'
                                                                        : logoStyle === 'grayscale' ? 'grayscale(100%)'
                                                                            : 'none'
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Branding Footer */}
                                                {(brandName || brandHandle) && (
                                                    <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center gap-3 z-20 relative">
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

                            {/* Dots Navigation */}
                            <div className="h-16 flex items-center justify-center gap-2 shrink-0 z-20">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const container = document.querySelector('.snap-x')
                                            if (container) {
                                                container.scrollTo({
                                                    left: idx * (340 + 32),
                                                    behavior: 'smooth'
                                                })
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${currentSlideIndex === idx
                                            ? 'w-8 bg-purple-500'
                                            : 'w-2 bg-slate-700 hover:bg-slate-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    )
}
