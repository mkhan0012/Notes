'use client';

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
// 👇 Changed to WindSong for a looser, more realistic signature look
import { Playfair_Display, Inter, Caveat, WindSong } from 'next/font/google'; 
import { ArrowRight, Sparkles, Quote } from "lucide-react";

// 1. Load Fonts
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const handwriting = Caveat({ subsets: ['latin'], variable: '--font-handwriting' });

// 2. Load the NEW Signature Font (WindSong)
const signature = WindSong({ 
  weight: ['400', '500'], 
  subsets: ['latin'], 
  variable: '--font-signature' 
});

export default function ManifestoPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    // 3. Inject the signature variable here
    <div className={`min-h-screen bg-black text-zinc-100 ${serif.variable} ${sans.variable} ${handwriting.variable} ${signature.variable} selection:bg-purple-500/30 overflow-x-hidden relative`}>
      <Navbar />

      {/* 1. SCROLL PROGRESS BAR (Top) */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500 origin-left z-50" />

      {/* 2. AMBIENT BACKGROUND (Parallax) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
         {/* Noise Texture for 'Film Grain' feel */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>
         
         {/* Moving Orbs */}
         <motion.div 
            style={{ y: yBackground }}
            className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[120px]" 
         />
         <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/10 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
             animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="relative z-10"
          >
             <h1 className="font-serif text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 mb-6">
                The Canvas <br />
                <span className="italic text-white relative inline-block">
                    is Broken
                    {/* SVG Underline Animation */}
                    <motion.svg 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1.5 }}
                        className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-purple-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 50 15 100 5" fill="transparent" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </motion.svg>
                </span>.
             </h1>
          </motion.div>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="font-sans text-lg md:text-xl text-zinc-400 max-w-lg mt-8 leading-relaxed font-light"
          >
             Note-taking hasn't evolved since the <span className="text-zinc-100 font-semibold border-b border-zinc-700">printing press</span>. <br/>
             We are building a <span className="font-handwriting text-4xl text-purple-400 mx-1">second brain</span> for the modern mind.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 animate-bounce text-zinc-600"
          >
             <span className="text-xs tracking-[0.3em] uppercase">Manifesto 2024</span>
          </motion.div>
        </section>

        {/* --- ARTICLE CONTENT --- */}
        <div className="max-w-4xl mx-auto px-6 pb-40 space-y-40">
           
           {/* Section 1: The Problem */}
           <Section>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  <Quote className="text-zinc-700 shrink-0 transform rotate-180" size={48} />
                  <div>
                      <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">The Static Page</h2>
                      <p className="font-sans text-xl md:text-2xl text-zinc-400 leading-relaxed">
                        We listen, we filter, and we scribble. But the tool we use—the <span className="text-white border-b-2 border-purple-500/50">blank page</span>—is passive. It doesn't help you connect dots. It doesn't remember what you forgot. It just sits there, waiting for you to do all the work.
                      </p>
                  </div>
              </div>
           </Section>

           {/* Section 2: The Comparison (Glass Card) */}
           <Section>
              <div className="relative p-10 md:p-16 border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-md overflow-hidden group hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                  
                  <div className="space-y-8 relative z-10 font-serif text-2xl md:text-4xl leading-tight">
                      <div className="text-zinc-600 line-through decoration-zinc-700 decoration-2">Notion is a filing cabinet.</div>
                      <div className="text-zinc-600 line-through decoration-zinc-700 decoration-2">Google Docs is a typewriter.</div>
                      <div className="text-white font-bold flex flex-wrap items-center gap-3">
                         <Sparkles className="text-purple-400 inline h-8 w-8" /> 
                         MindScribe is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">thinking partner</span>.
                      </div>
                  </div>
              </div>
           </Section>

           {/* Section 3: The Philosophy */}
           <Section>
              <h2 className="font-serif text-4xl md:text-5xl mb-8">Intelligence needs Structure</h2>
              <p className="font-sans text-xl md:text-2xl text-zinc-400 leading-relaxed">
                 We believe students don't struggle because they lack intelligence. <br/>
                 They struggle because they lack <span className="font-handwriting text-5xl text-white ml-2 relative top-2">flow</span>.
                 <br/><br/>
                 We are replacing "files and folders" with <span className="text-white font-bold">questions and answers</span>.
              </p>
           </Section>

           {/* --- CTA & SIGNATURE --- */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ margin: "-100px" }}
             className="pt-20 text-center flex flex-col items-center"
           >
              {/* 4. Use the font-signature class here */}
              <div className="font-signature text-7xl md:text-9xl text-white/90 mb-12 -rotate-6 mix-blend-difference select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                 The MindScribe Team
              </div>
              
              <Link href="/notes">
                 <button className="group relative px-12 py-6 bg-white text-black font-sans font-bold text-xl rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                    <span className="relative z-10 flex items-center gap-3 group-hover:gap-5 transition-all">
                        Join the Movement <ArrowRight size={24} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-white to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 </button>
              </Link>
           </motion.div>

        </div>
      </main>
    </div>
  );
}

// Wrapper for fade-in animations
function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}