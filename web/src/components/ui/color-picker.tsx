"use client"

import React from 'react'

interface ColorPickerProps {
    label: string
    value: string
    onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-transparent p-0"
                />
                <span className="text-xs text-slate-500 font-mono">{value}</span>
            </div>
        </div>
    )
}
