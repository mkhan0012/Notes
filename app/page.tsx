'use client';

import React, { useRef, useState, useEffect } from 'react';
// 1. IMPORT THE NAVBAR HERE
import Navbar from '@/components/Navbar'; 
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Brain, Zap, Layers, Command, Sparkles, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* =====================================================
   COMPONENT: Spotlight Card
===================================================== */

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-zinc-900/50 overflow-hidden rounded-xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(168, 85, 247, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* =====================================================
   MAIN HOMEPAGE
===================================================== */
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* 2. USE THE IMPORTED NAVBAR */}
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
          >
            <Sparkles className="h-3 w-3" />
            <span>v2.0 is now live</span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="block text-zinc-400"
            >
              Organize chaos.
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              Unleash genius.
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 max-w-xl text-lg text-zinc-500"
          >
            The minimal, AI-powered workspace designed for your flow state. 
            No distractions, just pure thought execution.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="group relative flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-black transition-all hover:bg-zinc-200">
              <span className="font-bold">Start Writing</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 px-8 text-zinc-400 transition-all hover:bg-white/5 hover:text-white">
              <Command className="h-4 w-4" />
              <span>Read Manifest</span>
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1, duration: 1 }}
           className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
        >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="h-10 w-[1px] bg-gradient-to-b from-zinc-600 to-transparent" />
        </motion.div>
      </section>

      {/* --- BENTO GRID SECTION --- */}
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Engineered for speed</h2>
                <p className="mt-4 text-zinc-400">Every pixel crafted to keep you in the zone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
                
                {/* Large Card */}
                <SpotlightCard className="md:col-span-2 relative p-8 flex flex-col justify-between overflow-hidden group">
                    <div className="z-10 relative">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                            <Brain className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold">Neural Linking</h3>
                        <p className="mt-2 text-zinc-400 max-w-md">Our AI doesn't just store notes. It understands them, linking related concepts automatically as you type.</p>
                    </div>
                    {/* Abstract UI Mockup */}
                    <div className="absolute right-0 bottom-0 w-1/2 h-3/4 border-t border-l border-zinc-800 bg-zinc-900/50 rounded-tl-2xl p-6 transition-transform duration-500 group-hover:-translate-y-4 group-hover:-translate-x-4">
                        <div className="space-y-3">
                            <div className="h-2 w-1/2 bg-zinc-700 rounded-full" />
                            <div className="h-2 w-3/4 bg-zinc-800 rounded-full" />
                            <div className="h-2 w-full bg-zinc-800 rounded-full" />
                            <div className="flex gap-2 mt-4">
                                <div className="h-6 w-16 bg-purple-500/20 border border-purple-500/50 rounded-full" />
                                <div className="h-6 w-16 bg-blue-500/20 border border-blue-500/50 rounded-full" />
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                {/* Tall Card */}
                <SpotlightCard className="md:row-span-2 relative p-8 group">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                        <Zap className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold">Instant Capture</h3>
                    <p className="mt-2 text-zinc-400">Zero latency input. Capture ideas before they flee.</p>
                    
                    {/* Animated List */}
                    <div className="mt-8 space-y-4">
                        {[1,2,3,4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 transition-all hover:bg-zinc-800">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <div className="h-2 w-24 bg-zinc-600 rounded-full" />
                            </div>
                        ))}
                    </div>
                </SpotlightCard>

                {/* Small Card 1 */}
                <SpotlightCard className="p-8 flex flex-col justify-center items-center text-center group">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Layers className="h-12 w-12 text-blue-400 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold">Infinite History</h3>
                    <p className="mt-2 text-sm text-zinc-500">Never lose a version.</p>
                </SpotlightCard>

                {/* Small Card 2 */}
                <SpotlightCard className="p-8 flex flex-col justify-center items-center text-center group">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Command className="h-12 w-12 text-pink-400 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold">Keyboard First</h3>
                    <p className="mt-2 text-sm text-zinc-500">Mouse optional.</p>
                </SpotlightCard>

            </div>
        </div>
      </section>

      {/* --- PRICING TEASER / FOOTER --- */}
      <section className="border-t border-white/10 bg-zinc-950 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to upgrade your mind?</h2>
        <button className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition-transform">
            Get Access Now
        </button>
        <div className="mt-12 flex justify-center gap-8 text-zinc-600 text-sm">
            <span>© 2026 MindScribe Inc.</span>
            <a href="#" className="hover:text-zinc-400">Twitter</a>
            <a href="#" className="hover:text-zinc-400">GitHub</a>
        </div>
      </section>
    </div>
  );
}