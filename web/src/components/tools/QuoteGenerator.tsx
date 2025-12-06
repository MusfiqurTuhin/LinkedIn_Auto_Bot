"use client"

import React, { useState } from 'react'
import { GlassCard } from '@/components/visuals/GlassCard'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Sparkles } from 'lucide-react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { useTheme } from '@/context/ThemeContext'

export function QuoteGenerator() {
    const { theme, backgroundStyle, font } = useTheme()
    const [quote, setQuote] = useState("Design is intelligence made visible.")
    const [author, setAuthor] = useState("Alina Wheeler")
    const ref = React.useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (ref.current) {
            const dataUrl = await toPng(ref.current)
            download(dataUrl, 'quote-graphic.png')
        }
    }

    return (
        <div className="flex h-full bg-[#0F172A] text-slate-100 p-8 gap-8 overflow-hidden">
            {/* Controls */}
            <div className="w-[400px] flex flex-col gap-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-purple-400" /> Quote Studio
                </h1>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Quote Text</label>
                    <Textarea
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="h-32 bg-slate-900 border-slate-700 text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Author</label>
                    <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="bg-slate-900 border-slate-700"
                    />
                </div>

                <Button onClick={handleDownload} className="mt-auto bg-white text-black hover:bg-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Download Quote
                </Button>
            </div>

            {/* Preview */}
            <div className="flex-1 flex items-center justify-center bg-[#020617] rounded-3xl relative overflow-hidden">
                {/* Background Mesh (Global) */}
                <div className="absolute inset-0 opacity-50" style={{ background: backgroundStyle }} />

                <div ref={ref} className="relative z-10 aspect-square w-[600px] flex items-center justify-center p-12">
                    <GlassCard variant="dark" className="w-full h-full flex flex-col justify-center items-center text-center p-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <span className="text-6xl text-purple-400 opacity-50 font-serif mb-6">"</span>
                        <p className="text-4xl font-bold leading-tight tracking-tight mb-8" style={{ fontFamily: font }}>
                            {quote}
                        </p>
                        <div className="w-12 h-1 bg-purple-500 rounded-full mb-6" />
                        <p className="text-xl uppercase tracking-widest opacity-80 font-medium">
                            {author}
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
