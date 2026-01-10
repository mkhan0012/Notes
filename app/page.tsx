'use client';

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Sparkles, LayoutTemplate, Zap, CheckCircle2, MousePointer2, ChevronRight } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useRef } from "react";

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ clientX, clientY }: MouseEvent) {
    mouseX.set(clientX);
    mouseY.set(clientY);
  }

  return (
    <div 
      className="min-h-screen bg-black text-zinc-50 selection:bg-purple-500/30 selection:text-purple-200 font-sans overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      
      {/* 1. Global Mouse Follower Blob */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(120, 119, 198, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* 2. Animated Moving Grid Background */}
      <div className="fixed inset-0 -z-10 h-full w-full opacity-20">
        <div className="absolute h-[200%] w-[200%] -top-[50%] -left-[50%] animate-[moveGrid_20s_linear_infinite] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Navbar />

      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-32 perspective-1000">
          
          {/* LINK 1: TOP BADGE */}
          <AnimatedBadge />
          
          <div className="max-w-5xl">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="block text-zinc-500 mb-2 text-2xl md:text-4xl font-medium tracking-normal">
                Don't just write.
              </span>
              <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-2xl">
                Let your notes <br/>
                <TypewriterText text="think for themselves." />
              </span>
            </h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            MindScribe AI is the missing layer between your brain and your notebook. 
            It actively structures, highlights, and expands your ideas as you type.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            
            {/* LINK 2: START BUTTON */}
            <MagneticButton>
              <Link 
                href="/notes" // <--- CONNECTED TO NOTES PAGE
                className="h-14 px-8 rounded-full bg-white text-black font-semibold text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                Start Writing <ArrowRight className="w-5 h-5" />
              </Link>
            </MagneticButton>
            
            <MagneticButton>
              <button className="h-14 px-8 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800 text-white font-medium transition-all flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                 </div>
                 Watch Demo
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* 3. 3D Tilt Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <TiltCard className="md:col-span-2">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-50 transition-opacity">
               <Zap className="w-32 h-32 text-yellow-500 -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
                <Zap className="w-7 h-7 text-yellow-500" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Pre-Writing Intelligence</h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
                The moment you type "Photosynthesis", MindScribe prepares the structure. 
                It predicts definitions, diagrams, and key points before you even finish the sentence.
              </p>
            </div>
          </TiltCard>

          <TiltCard className="md:row-span-2 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                <LayoutTemplate className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Textbook Mode</h3>
              <p className="text-zinc-400 mb-8">
                Convert messy bullet points into structured, exam-ready notes.
              </p>
              
              {/* Simulated UI inside card */}
              <div className="mt-auto rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden group-hover:border-zinc-700 transition-colors">
                <div className="flex gap-2 mb-4">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   <div className="w-2 h-2 rounded-full bg-yellow-500" />
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                   <motion.div 
                     animate={{ width: ["40%", "70%", "40%"] }} 
                     transition={{ duration: 4, repeat: Infinity }} 
                     className="h-2 bg-zinc-700 rounded-full" 
                   />
                   <div className="h-2 w-full bg-zinc-800 rounded-full" />
                   <div className="h-2 w-5/6 bg-zinc-800 rounded-full" />
                </div>
                {/* Scanning laser effect */}
                <motion.div 
                  animate={{ top: ["-20%", "120%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500/50 blur-md box-content border-t border-blue-400"
                />
              </div>
          </TiltCard>

          <TiltCard>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Live Analyzer</h3>
            <p className="text-sm text-zinc-400">
              It watches you write and flags weak explanations in real-time.
            </p>
          </TiltCard>

          <TiltCard>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20 flex items-center justify-center mb-4">
              <MousePointer2 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Smart Highlights</h3>
            <p className="text-sm text-zinc-400">
              Automatically colors definitions and formulas for quick revision.
            </p>
          </TiltCard>

        </div>

      </main>

      <style jsx global>{`
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(24px, 24px); }
        }
      `}</style>
    </div>
  );
}

// --- Interactive Components ---

function AnimatedBadge() {
  return (
    <Link href="/notes"> {/* <--- NOW CLICKABLE: CONNECTED TO NOTES PAGE */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md mb-8 group cursor-pointer hover:border-zinc-700 hover:bg-zinc-800 transition-all"
      >
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        <span className="text-sm font-medium text-zinc-300">
          v1.0 Public Beta 
          <span className="mx-2 text-zinc-700">|</span> 
          <span className="text-zinc-500 group-hover:text-white transition-colors">Join 2,000+ students</span>
        </span>
        <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" />
      </motion.div>
    </Link>
  )
}

function TypewriterText({ text }: { text: string }) {
  const characters = text.split("");
  return (
    <span className="inline-block">
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.05, delay: i * 0.05 + 0.5 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function TiltCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm transition-colors hover:bg-zinc-900/60 hover:border-zinc-700 group ${className}`}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

function MagneticButton({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        x.set((e.clientX - centerX) * 0.3); // Strength of magnet
        y.set((e.clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring }}
        >
            {children}
        </motion.div>
    );
}