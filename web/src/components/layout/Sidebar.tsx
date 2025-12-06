import { Layers, Lightbulb, MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    activeTool: string
    setActiveTool: (tool: string) => void
}

export function Sidebar({ activeTool, setActiveTool }: SidebarProps) {
    const tools = [
        { id: 'carousel', icon: Layers, label: 'Carousels' },
        { id: 'quotes', icon: MessageSquareQuote, label: 'Quotes' },
        { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
    ]

    return (
        <div className="w-[60px] border-r border-slate-800 bg-[#020617] flex flex-col items-center py-6 gap-6 z-50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 mb-4" />

            {tools.map((tool) => (
                <Button
                    key={tool.id}
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTool(tool.id)}
                    className={`rounded-xl transition-all duration-300 ${activeTool === tool.id
                            ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    title={tool.label}
                >
                    <tool.icon className="h-5 w-5" />
                </Button>
            ))}
        </div>
    )
}
