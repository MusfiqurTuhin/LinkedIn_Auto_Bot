"use client"

import React from 'react'
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    variant?: 'light' | 'dark' | 'neon'
}

export function GlassCard({ children, className, variant = 'dark', ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300",
                {
                    "bg-white/30 border-white/40 text-slate-800": variant === 'light',
                    "bg-black/40 border-white/10 text-white": variant === 'dark',
                    "bg-indigo-900/30 border-cyan-500/50 text-cyan-50 shadow-[0_0_15px_rgba(0,210,255,0.3)]": variant === 'neon',
                },
                className
            )}
            {...props}
        >
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

            {children}
        </div>
    )
}
