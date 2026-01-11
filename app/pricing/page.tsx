'use client';

import Link from "next/link";
import Navbar from "@/components/Navbar";
// 👇 ADDED 'useTransform' to the imports here
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Brain, Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { useState, useRef } from "react";
import { Playfair_Display, Inter, Caveat } from 'next/font/google';

// --- FONTS ---
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const handwriting = Caveat({ subsets: ['latin'], variable: '--font-handwriting' });

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className={`min-h-screen bg-black text-zinc-50 font-sans ${serif.variable} ${sans.variable} ${handwriting.variable} selection:bg-purple-500/30 overflow-hidden relative`}>
      <Navbar />

      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6">
        
        {/* --- HERO HEADER --- */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
          >
              <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                Invest in your <br/>
                <span className="italic text-white relative">
                   Future
                   <motion.span 
                      initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5, duration: 1 }}
                      className="absolute -bottom-2 left-0 h-4 bg-purple-500/30 -skew-x-12 -z-10" 
                   />
                </span>.
              </h1>
          </motion.div>

          <motion.p 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
             className="text-zinc-400 text-xl mb-12 font-light"
          >
             Notes that write themselves pay for themselves in <span className="text-purple-400 font-handwriting text-3xl ml-1">saved time</span>.
          </motion.p>
          
          {/* --- CREATIVE TOGGLE --- */}
          <div className="flex items-center justify-center gap-6">
            <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${!isYearly ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
            
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-20 h-10 rounded-full bg-zinc-900 border border-zinc-700 p-1 relative cursor-pointer shadow-inner group"
            >
              <motion.div 
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-8 h-8 rounded-full shadow-lg relative z-10 ${isYearly ? 'bg-gradient-to-br from-green-400 to-emerald-600 ml-auto' : 'bg-gradient-to-br from-white to-zinc-300'}`}
              >
                  {isYearly && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center"><Sparkles size={14} className="text-black/50" /></motion.div>}
              </motion.div>
            </button>
            
            <span className={`text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2 ${isYearly ? 'text-white' : 'text-zinc-600'}`}>
                Yearly 
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-md border border-green-500/30 font-mono">-20%</span>
            </span>
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 px-4">
           
           {/* FREE PLAN */}
           <TiltCard>
               <PriceCard 
                  title="Scholar" 
                  price="0" 
                  desc="Perfect for trying out the AI engine."
                  features={["5 AI Notes per day", "Basic Formatting", "Export to PDF", "Community Support"]}
                  icon={Brain}
               />
           </TiltCard>

           {/* PRO PLAN */}
           <TiltCard>
               <PriceCard 
                  title="Summa Cum Laude" 
                  price={isYearly ? "8" : "12"} 
                  desc="For serious students aiming for the top 1%."
                  highlighted
                  isYearly={isYearly}
                  features={[
                      "Unlimited AI Notes", 
                      "Deep Exam Mode", 
                      "Professor Persona Analysis", 
                      "Unlimited Storage",
                      "Priority 24/7 Support"
                  ]}
                  icon={Crown}
               />
           </TiltCard>

        </div>

        {/* --- SOCIAL PROOF FOOTER --- */}
        <motion.div 
           initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ margin: "-50px" }}
           className="mt-32 text-center"
        >
            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-6 font-mono">Trusted by students at</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
               {['Stanford', 'MIT', 'Harvard', 'Oxford'].map(name => (
                   <span key={name} className="text-2xl font-serif font-bold text-white">{name}</span>
               ))}
            </div>
        </motion.div>

      </main>
    </div>
  );
}

// --- 3D TILT WRAPPER ---
function TiltCard({ children }: { children: React.ReactNode }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["15deg", "-15deg"]));
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-15deg", "15deg"]));
  
    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    }
  
    function handleMouseLeave() {
      x.set(0);
      y.set(0);
    }
  
    return (
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {children}
      </motion.div>
    );
  }

function PriceCard({ title, price, desc, features, highlighted = false, isYearly, icon: Icon }: any) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
  
    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }
  
    return (
      <div 
        onMouseMove={handleMouseMove}
        className={`group relative h-full p-8 md:p-12 rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col justify-between
          ${highlighted 
            ? 'bg-zinc-900/40 border-purple-500/50 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)]' 
            : 'bg-zinc-900/20 border-white/10 hover:border-white/20'}`}
      >
         
         {/* Spotlight Effect */}
         <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  650px circle at ${mouseX}px ${mouseY}px,
                  rgba(255,255,255,0.1),
                  transparent 80%
                )
              `,
            }}
          />

         <div>
             <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${highlighted ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon size={32} />
                </div>
                {highlighted && (
                    <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg animate-shimmer bg-[length:200%_100%]">
                        Most Popular
                    </div>
                )}
             </div>
             
             <h3 className="font-serif text-3xl font-bold mb-2 text-white">{title}</h3>
             <p className="text-zinc-400 text-sm leading-relaxed mb-8 h-10">{desc}</p>
             
             <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold tracking-tight">${price}</span>
                <span className="text-zinc-500 font-medium">/month</span>
             </div>

             <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8" />

             <div className="space-y-4 mb-12">
                {features.map((f: string, i: number) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 text-sm font-medium text-zinc-300"
                    >
                       <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${highlighted ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Check className="w-3 h-3" />
                       </div>
                       {f}
                    </motion.div>
                ))}
             </div>
         </div>

         <Link href="/notes" className="relative z-10">
           <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 group-hover:shadow-xl
             ${highlighted 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white'}`}>
             {highlighted ? 'Start Free Trial' : 'Get Started'}
           </button>
         </Link>

      </div>
    )
}