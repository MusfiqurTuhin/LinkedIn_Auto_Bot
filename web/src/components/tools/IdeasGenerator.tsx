"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, Loader2, ArrowRight } from 'lucide-react'

export function IdeasGenerator() {
    const [topic, setTopic] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [ideas, setIdeas] = useState<any[]>([])

    const handleGenerate = async () => {
        if (!topic) return
        setIsLoading(true)
        try {
            const res = await fetch('http://localhost:8000/generate-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            })
            const data = await res.json()
            if (data.data) setIdeas(data.data)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full bg-[#0F172A] text-slate-100 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Lightbulb className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Viral Content Brainstormer</h1>
                    <p className="text-slate-400 text-lg max-w-xl">
                        Never run out of ideas again. Enter a niche, and our AI will generate high-engagement hooks for you.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Input
                        placeholder="Enter your niche (e.g. SaaS Marketing, Personal Finance, AI Tools)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-14 text-lg bg-slate-900 border-slate-700"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="h-14 px-8 text-lg bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Brainstorm'}
                    </Button>
                </div>

                <div className="grid gap-4">
                    {ideas.map((idea) => (
                        <Card key={idea.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400 shrink-0">
                                    {idea.id}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {idea.type}
                                        </span>
                                        <span className="text-xs text-slate-500">Virality Score: {idea.virality_score}%</span>
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-2">"{idea.hook}"</h3>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                    <ArrowRight />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
