'use client';

import Navbar from "@/components/Navbar";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Brain, Zap, Layout, Terminal, Shield, GitGraph, ArrowRight } from "lucide-react";
import { useRef } from "react";

// --- DATA ---
const features = [
  {
    id: 1,
    title: "Neural Core",
    desc: "A predictive engine that understands your thought process before you finish typing.",
    icon: Brain,
    color: "#8b5cf6", // Violet
  },
  {
    id: 2,
    title: "Logic Graph",
    desc: "Auto-generates connection maps between your isolated notes.",
    icon: GitGraph,
    color: "#3b82f6", // Blue
  },
  {
    id: 3,
    title: "Syntax Clean",
    desc: "Instantly refactors messy bullet points into structured, academic prose.",
    icon: Layout,
    color: "#10b981", // Emerald
  },
  {
    id: 4,
    title: "Vault Lock",
    desc: "Local-first encryption. Your data never leaves your device unsealed.",
    icon: Shield,
    color: "#f59e0b", // Amber
  },
  {
    id: 5,
    title: "API Gateway",
    desc: "Full programmatic access to build your own tools on our infrastructure.",
    icon: Terminal,
    color: "#ec4899", // Pink
  }
];

export default function FeaturesPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className="bg-black font-sans text-white selection:bg-purple-500/40">
      <Navbar />

      {/* --- SCROLL TUNNEL CONTAINER --- */}
      {/* 500vh height ensures we have enough 'track' to scroll through */}
      <div ref={containerRef} className="h-[500vh] relative">
        
        {/* STICKY VIEWPORT: This stays fixed while we 'move' through the content */}
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center perspective-1000">
          
          {/* AMBIENT BACKGROUND (Moves subtly with scroll) */}
          <BackgroundEffect progress={scrollYProgress} />

          {/* THE CARDS */}
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            {features.map((feature, i) => {
              // Calculate specific range for each card in the total scroll distance
              const rangeStart = i * (1 / features.length);
              const rangeEnd = rangeStart + (1 / features.length);

              return (
                <ZCard 
                  key={feature.id}
                  feature={feature}
                  progress={scrollYProgress}
                  range={[rangeStart, rangeEnd]}
                />
              );
            })}
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="h-[50vh] bg-black flex flex-col items-center justify-center relative z-10 border-t border-zinc-900">
        <h2 className="text-5xl font-bold mb-8">Ready to dive in?</h2>
        <button className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
            Get Early Access
        </button>
      </div>
    </div>
  );
}

// --- 3D CARD COMPONENT ---
function ZCard({ feature, progress, range }: { feature: any, progress: MotionValue<number>, range: [number, number] }) {
  const [start, end] = range;
  
  // ANIMATION LOGIC:
  // 0% -> Card is small, dark, blurry (in the distance)
  // 50% -> Card is front and center (focused)
  // 100% -> Card flies *past* the camera and fades out
  
  // Adjust these specific animation timings to taste
  const entryEnd = start + ((end - start) * 0.4); // Point where it becomes fully visible
  const exitStart = start + ((end - start) * 0.6); // Point where it starts leaving

  const opacity = useTransform(progress, [start, entryEnd, exitStart, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, entryEnd, exitStart, end], [0.4, 1, 1, 1.5]);
  const blur = useTransform(progress, [start, entryEnd, exitStart, end], [10, 0, 0, 20]);
  const y = useTransform(progress, [start, entryEnd, exitStart, end], [100, 0, 0, -100]); // Subtle rise
  
  // Z-Index: Active card must be on top
  const zIndex = useTransform(progress, [start, entryEnd], [0, 10]);

  return (
    <motion.div
      style={{ opacity, scale, filter: `blur(${blur}px)`, y, zIndex }}
      className="absolute inset-0 flex items-center justify-center p-6 will-change-transform"
    >
      <div className="relative w-full max-w-2xl aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl group">
        
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <div className="h-full flex flex-col md:flex-row relative z-10">
          
          {/* Left: Visual Icon Area */}
          <div className="w-full md:w-1/3 bg-zinc-950 flex items-center justify-center relative overflow-hidden border-r border-zinc-800">
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: feature.color, filter: 'blur(60px)' }} />
             <feature.icon size={80} className="relative z-10 text-white drop-shadow-lg" />
          </div>

          {/* Right: Text Content */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-zinc-900/80 backdrop-blur-xl">
             <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Feature 0{feature.id}</div>
             <h3 className="text-4xl font-bold mb-4 text-white leading-tight">{feature.title}</h3>
             <p className="text-zinc-400 text-lg leading-relaxed mb-8">{feature.desc}</p>
             
             <div className="flex items-center gap-2 text-sm font-bold cursor-pointer hover:gap-4 transition-all" style={{ color: feature.color }}>
                <span>Explore Deep Dive</span>
                <ArrowRight size={16} />
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// --- AMBIENT BACKGROUND COMPONENT ---
function BackgroundEffect({ progress }: { progress: MotionValue<number> }) {
  // Move the background stars/grid slowly as we scroll to create parallax speed
  const y = useTransform(progress, [0, 1], ["0%", "-50%"]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       {/* Stars / Particles */}
       <div className="absolute inset-0 opacity-30" 
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
       </div>
       
       {/* Moving Grid */}
       <motion.div 
         style={{ y }}
         className="absolute inset-0 opacity-10"
         initial={{ backgroundPosition: '0 0' }}
       >
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
       </motion.div>

       {/* Central Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]" />
    </div>
  )
}