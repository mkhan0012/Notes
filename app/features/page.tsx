'use client';

import Navbar from "@/components/Navbar";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
// 🛠️ FIX: All imports merged at the top
import { 
  ArrowRight, Brain, Sparkles, Shield, Terminal, GitGraph, X, 
  ChevronDown, Cpu, Activity, Database, Lock, Zap, FileText 
} from "lucide-react";

// --- FEATURE DATA ---
const features = [
  {
    id: 0,
    title: "Neural Core",
    tagline: "Your Second Brain",
    desc: "I don't just store notes. I think with you. I predict your next sentence before you even type it.",
    color: "#a855f7", // Purple
    bg: "from-purple-500/20 via-purple-900/5 to-black",
    specs: [
        { label: "Latency", value: "< 12ms", icon: Activity },
        { label: "Context Window", value: "128k Tokens", icon: Database },
        { label: "Architecture", value: "Transformer v4", icon: Cpu }
    ]
  },
  {
    id: 1,
    title: "Logic Graph",
    tagline: "Connecting the Dots",
    desc: "I actively read your past notes and draw lines between related ideas that you missed.",
    color: "#3b82f6", // Blue
    bg: "from-blue-500/20 via-blue-900/5 to-black",
    specs: [
        { label: "Algorithm", value: "Force-Directed", icon: Activity },
        { label: "Node Limit", value: "Unlimited", icon: Database },
        { label: "Export", value: "JSON / PDF", icon: FileText }
    ]
  },
  {
    id: 2,
    title: "Syntax Sweeper",
    tagline: "Messy to Masterpiece",
    desc: "Throw your messy bullet points at me. I'll scrub them into a structured, Harvard-style essay instantly.",
    color: "#10b981", // Emerald
    bg: "from-emerald-500/20 via-emerald-900/5 to-black",
    specs: [
        { label: "Formats", value: "APA / MLA / IEEE", icon: FileText },
        { label: "Languages", value: "30+ Supported", icon: Database },
        { label: "Style", value: "Academic Pro", icon: Sparkles }
    ]
  },
  {
    id: 3,
    title: "Vault Guard",
    tagline: "Top Secret Security",
    desc: "I lock your data in a local vault. Not even the developers can see what you write.",
    color: "#f59e0b", // Amber
    bg: "from-amber-500/20 via-amber-900/5 to-black",
    specs: [
        { label: "Encryption", value: "AES-256", icon: Lock },
        { label: "Storage", value: "Local / Offline", icon: Database },
        { label: "Keys", value: "User-Managed", icon: Shield }
    ]
  },
  {
    id: 4,
    title: "Dev Mode",
    tagline: "Hacker Friendly",
    desc: "Open up my brain. Use the API to build your own tools or connect me to your codebase.",
    color: "#ec4899", // Pink
    bg: "from-pink-500/20 via-pink-900/5 to-black",
    specs: [
        { label: "API Access", value: "GraphQL / REST", icon: Terminal },
        { label: "Rate Limit", value: "10k req/hr", icon: Activity },
        { label: "Webhooks", value: "Real-time", icon: Zap }
    ]
  }
];

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="bg-black font-sans text-white min-h-screen overflow-x-hidden selection:bg-white/20">
      <Navbar />

      <div className="fixed inset-0 z-0 transition-colors duration-1000">
         <div className={`absolute inset-0 bg-gradient-to-b ${features[activeFeature].bg} opacity-60`} />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-32 pb-40">
        
        <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none z-0">
            <div className="relative w-[500px] h-[500px] md:w-[600px] md:h-[600px] flex items-center justify-center">
                <div className="absolute bottom-10 w-[300px] h-[40px] bg-white/5 blur-2xl rounded-[100%]" 
                     style={{ backgroundColor: features[activeFeature].color }} 
                />
                <ScribeBot activeIndex={activeFeature} color={features[activeFeature].color} />
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
            {features.map((feature, index) => (
                <ScrollSection 
                    key={feature.id} 
                    feature={feature} 
                    index={index} 
                    setActive={setActiveFeature} 
                    isActive={activeFeature === index}
                />
            ))}
        </div>

      </main>
    </div>
  );
}

function ScrollSection({ feature, index, setActive, isActive }: { feature: any, index: number, setActive: (i: number) => void, isActive: boolean }) {
    const ref = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end center"]
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (latest > 0 && latest < 1) {
            setActive(index);
        }
    });

    return (
        <motion.div 
            ref={ref}
            className={`min-h-screen flex items-center justify-center md:justify-start ${index % 2 === 1 ? 'md:justify-end' : ''}`}
        >
            <motion.div 
                layout 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0 }}
                className={`max-w-md p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden relative
                    ${isActive ? 'bg-zinc-900/80 scale-100 ring-1 ring-white/20' : 'bg-zinc-900/20 scale-95 opacity-50 grayscale'}
                `}
            >
                <motion.div layout="position" className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-white/80 border border-white/5">
                        Module 0{index + 1}
                    </span>
                    <span className="text-sm font-hand text-zinc-400" style={{ color: feature.color }}>
                        {feature.tagline}
                    </span>
                </motion.div>

                <motion.h2 layout="position" className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {feature.title}
                </motion.h2>
                
                <motion.p layout="position" className="text-lg text-zinc-300 leading-relaxed mb-8">
                    {feature.desc}
                </motion.p>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 border-t border-white/10 mt-2 mb-8 grid grid-cols-1 gap-4">
                                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">System Diagnostics</div>
                                {feature.specs.map((spec: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <spec.icon size={16} style={{ color: feature.color }} />
                                            <span className="text-sm text-zinc-400">{spec.label}</span>
                                        </div>
                                        <span className="text-sm font-bold font-mono text-white">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button 
                    layout="position"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group flex items-center gap-2 text-sm font-bold transition-all hover:gap-4 p-2 -ml-2 rounded-lg hover:bg-white/5 w-full" 
                    style={{ color: feature.color }}
                >
                    {isExpanded ? (
                        <>Close Specs <X size={16} /></>
                    ) : (
                        <>See it in action <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/></>
                    )}
                </motion.button>

            </motion.div>
        </motion.div>
    )
}

function ScribeBot({ activeIndex, color }: { activeIndex: number, color: string }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                {activeIndex === 0 && (
                    <motion.div key="bot-brain" className="relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl"
                            style={{ backgroundColor: color }}
                        />
                        <BotBase color={color} expression="happy">
                            <motion.div 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-16 left-8 bg-white text-black px-4 py-2 rounded-xl rounded-bl-none text-xs font-bold font-mono shadow-lg"
                            >
                                IDEA!
                            </motion.div>
                            <Brain size={40} className="text-white absolute top-[28%] left-[28%] opacity-80" />
                        </BotBase>
                    </motion.div>
                )}

                {activeIndex === 1 && (
                    <motion.div key="bot-graph" className="relative" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}>
                        <BotBase color={color} expression="focused">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                <motion.line x1="-20" y1="50" x2="120" y2="50" stroke={color} strokeWidth="3" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, 20] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                <motion.line x1="50" y1="-20" x2="50" y2="120" stroke={color} strokeWidth="3" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                <circle cx="-20" cy="50" r="6" fill={color} />
                                <circle cx="120" cy="50" r="6" fill={color} />
                                <circle cx="50" cy="-20" r="6" fill={color} />
                            </svg>
                            <GitGraph size={40} className="text-white absolute top-[28%] left-[28%] opacity-80" />
                        </BotBase>
                    </motion.div>
                )}

                {activeIndex === 2 && (
                    <motion.div key="bot-clean" className="relative" initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 10, opacity: 0 }}>
                        <motion.div 
                            animate={{ rotate: [-10, 10, -10], x: [-20, 20, -20] }} 
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -right-16 top-10 w-24 h-2 bg-white rounded-full origin-left rotate-45 z-20"
                        >
                            <div className="absolute right-0 -top-4 w-8 h-10 bg-emerald-400 rounded-sm" />
                        </motion.div>
                        <BotBase color={color} expression="wink">
                            <Sparkles size={40} className="text-white absolute top-[28%] left-[28%] opacity-80" />
                        </BotBase>
                        {[1,2,3].map(i => (
                            <motion.div 
                                key={i}
                                className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full"
                                animate={{ y: -50, opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </motion.div>
                )}

                {activeIndex === 3 && (
                    <motion.div key="bot-vault" className="relative" initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                        <motion.div 
                            initial={{ y: -50 }} animate={{ y: 0 }} 
                            className="absolute top-[28%] left-[15%] w-[70%] h-8 bg-black rounded-full z-20 flex items-center justify-center border border-white/20"
                        >
                            <div className="w-full h-[1px] bg-white/20" />
                        </motion.div>
                        <BotBase color={color} expression="neutral">
                            <Shield size={40} className="text-white absolute top-[35%] left-[28%] opacity-80" />
                        </BotBase>
                        <motion.div 
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -right-4 -bottom-4 bg-amber-500 p-3 rounded-xl shadow-lg text-black font-bold z-30"
                        >
                            <Shield size={24} />
                        </motion.div>
                    </motion.div>
                )}

                {activeIndex === 4 && (
                    <motion.div key="bot-dev" className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-pink-500 font-mono text-xs whitespace-nowrap">
                            {`<ScribeBot type="legend" />`}
                        </div>
                        <BotBase color={color} expression="coding">
                            <Terminal size={40} className="text-white absolute top-[28%] left-[28%] opacity-80" />
                        </BotBase>
                        <div className="absolute inset-0 -z-10 overflow-hidden opacity-50">
                            {[...Array(5)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    className="absolute text-pink-500 text-[10px] font-mono"
                                    style={{ left: i * 20 + 20 }}
                                    animate={{ y: [0, 100], opacity: [1, 0] }}
                                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                >
                                    10101
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function BotBase({ color, expression, children }: { color: string, expression: string, children?: React.ReactNode }) {
    return (
        <div className="relative w-48 h-48">
            <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
            >
                <div className="absolute inset-0 bg-zinc-900 border-4 border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }} />
                    <div className="absolute top-8 left-6 right-6 h-24 bg-black/50 rounded-2xl flex items-center justify-center gap-6 border border-white/5">
                        <motion.div className="w-4 h-8 bg-white rounded-full" animate={expression === 'wink' ? { height: 4, y: 4 } : { height: 32, y: 0 }} />
                        <motion.div className="w-4 h-8 bg-white rounded-full" animate={expression === 'focused' ? { height: 20 } : { height: 32 }} />
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        {children}
                    </div>
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-6 bg-zinc-700" />
                <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_0_15px]"
                    style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }}
                />
                <motion.div className="absolute top-20 -left-6 w-8 h-20 bg-zinc-800 rounded-l-2xl border-l border-t border-b border-zinc-700" animate={{ rotate: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
                <motion.div className="absolute top-20 -right-6 w-8 h-20 bg-zinc-800 rounded-r-2xl border-r border-t border-b border-zinc-700" animate={{ rotate: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
            </motion.div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/50 blur-xl rounded-full" />
        </div>
    )
}