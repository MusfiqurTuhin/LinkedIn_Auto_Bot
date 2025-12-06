"use client"

import { useState } from 'react'
import { CarouselEditor } from "@/components/CarouselEditor";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuoteGenerator } from '@/components/tools/QuoteGenerator';
import { IdeasGenerator } from '@/components/tools/IdeasGenerator';

export default function Home() {
  const [activeTool, setActiveTool] = useState('carousel')

  return (
    <main className="flex h-screen overflow-hidden bg-[#0F172A]">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />

      <div className="flex-1 h-full overflow-hidden">
        {activeTool === 'carousel' && <CarouselEditor />}
        {activeTool === 'quotes' && <QuoteGenerator />}
        {activeTool === 'ideas' && <IdeasGenerator />}
      </div>
    </main>
  );
}
