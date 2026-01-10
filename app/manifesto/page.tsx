'use client';

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Inter, Caveat } from 'next/font/google';

// 1. Load Fonts & Create Variables
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const handwriting = Caveat({ subsets: ['latin'], variable: '--font-handwriting' });

export default function ManifestoPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    // 2. Inject Variables into the wrapper
    <div className={`min-h-screen bg-black text-zinc-100 ${serif.variable} ${sans.variable} ${handwriting.variable} selection:bg-purple-500 selection:text-white overflow-x-hidden`}>
      <Navbar />

      {/* BACKGROUND: Clean Radial Gradient (Fixed the noise issue) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.15),rgba(0,0,0,1))]" />
      </div>

      <main className="relative z-10 pt-32">
        
        {/* HERO */}
        <section className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <motion.div style={{ opacity, scale }} className="space-y-8 max-w-4xl mx-auto">
            <h1 className="font-serif text-6xl md:text-9xl font-bold leading-[0.9] tracking-tight">
              The Canvas <br/> 
              <span className="text-zinc-600">is Broken.</span>
            </h1>
            <p className="font-sans text-xl text-zinc-400 max-w-lg mx-auto font-light">
              Why we are building a second brain,<br/> not just a notepad.
            </p>
          </motion.div>
        </section>

        {/* LETTER */}
        <article className="max-w-2xl mx-auto px-6 pb-40 space-y-20">
          <Paragraph>
            We have been taking notes the same way for centuries. We listen, we filter, and we scribble. But the tool we use—the blank page—has never evolved.
          </Paragraph>
          
          <Paragraph highlighted>
            Notion is a blank canvas. <br/>
            Google Docs is a typewriter. <br/>
            <span className="text-purple-400">MindScribe is a partner.</span>
          </Paragraph>

          <Paragraph>
            We believe students don't struggle because they lack intelligence. They struggle because they lack structure.
          </Paragraph>

          {/* SIGNATURE */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-10% 0px -10% 0px" }}
            className="pt-12 border-t border-zinc-900"
          >
             {/* This now works because of the CSS @theme setup */}
             <div className="font-handwriting text-6xl text-white mb-8 -rotate-2">
                The MindScribe Team
             </div>
             
             <div className="flex flex-col items-start gap-4">
                <Link href="/notes">
                    <button className="px-8 py-4 bg-white text-black font-sans font-bold rounded-full hover:bg-zinc-200 transition-transform active:scale-95">
                        Join the Movement
                    </button>
                </Link>
             </div>
          </motion.div>

        </article>
      </main>
    </div>
  );
}

function Paragraph({ children, highlighted = false }: { children: React.ReactNode, highlighted?: boolean }) {
  return (
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
      transition={{ duration: 0.6 }}
      className={`font-serif leading-relaxed ${
        highlighted 
        ? "text-3xl md:text-5xl font-bold text-white leading-tight" 
        : "text-xl md:text-2xl text-zinc-400"
      }`}
    >
      {children}
    </motion.p>
  )
}