"use client";

import React from 'react';
import { GlassCard } from '@/components/visuals/GlassCard';

interface DataPoint {
    label: string;
    value: number;
}

interface InfographicCardProps {
    content: string;
    image_prompt: string;
    data_points?: DataPoint[];
}

export const InfographicCard: React.FC<InfographicCardProps> = ({ content, image_prompt, data_points }) => {
    return (
        <GlassCard className="h-full flex flex-col p-4 bg-black/10 backdrop-blur-md rounded-xl overflow-hidden">
            {/* Background Image */}
            {image_prompt && (
                <div className="absolute inset-0 z-0 opacity-30">
                    <img
                        src={image_prompt.startsWith('blob:') || image_prompt.startsWith('http')
                            ? image_prompt
                            : `https://image.pollinations.ai/prompt/${encodeURIComponent(image_prompt)}?width=600&height=800&nologo=true`}
                        alt="Infographic background"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
                <p className="text-xl font-bold text-white drop-shadow-md mb-4 whitespace-pre-wrap max-w-full line-clamp-2">
                    {content}
                </p>
                {/* Data Points */}
                {data_points && data_points.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                        {data_points.map((dp, idx) => (
                            <div key={idx} className="bg-white/20 backdrop-blur-sm rounded p-2 text-sm text-white">
                                <span className="font-medium">{dp.label}</span>: {dp.value}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default InfographicCard;
