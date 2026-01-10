'use client';

import Link from "next/link";
import { Brain } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ManifestoPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  return (
    <div className="min-h-screen bg-black text-zinc-50 font-serif selection:bg-white selection:text-black">
      <Navbar />

      {/* Dramatic Header */}
      <section className="h-[80vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
         <motion.div style={{ opacity, scale }} className="z-10">
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8">
              The Canvas <br/> is Broken.
            </h1>
            <p className="text-xl text-zinc-500 font-sans max-w-lg mx-auto">
              Why we are building a second brain, not just a notepad.
            </p>
         </motion.div>
         
         <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 text-zinc-600 font-sans text-sm"
         >
            Read the Philosophy &darr;
         </motion.div>
      </section>

      {/* The Letter */}
      <article className="max-w-3xl mx-auto px-6 pb-40 text-lg md:text-xl leading-relaxed space-y-12 text-zinc-300">
        <Paragraph>
          We have been taking notes the same way for centuries. We listen, we filter, and we scribble. But the tool we use—the blank page—has never evolved. It is passive. It waits for you to do the work.
        </Paragraph>
        
        <Paragraph highlighted>
          Notion is a blank canvas. Google Docs is a typewriter. MindScribe is a partner.
        </Paragraph>

        <Paragraph>
          We believe that students don't struggle because they lack intelligence. They struggle because they lack structure. The cognitive load of <em>organizing</em> information prevents them from <em>understanding</em> it.
        </Paragraph>

        <Paragraph>
          <strong>Our Mission:</strong> To eliminate the busy work of studying. To let you focus on the concept, while the AI handles the format.
        </Paragraph>

        <div className="pt-12 border-t border-zinc-800">
           <div className="font-handwriting text-4xl text-white mb-4 italic">The MindScribe Team</div>
           <Link href="/notes" className="inline-block px-8 py-3 bg-white text-black font-sans font-bold rounded-full hover:bg-zinc-200 transition-colors">
              Join the Movement
           </Link>
        </div>
      </article>

    </div>
  );
}

function Paragraph({ children, highlighted = false }: { children: React.ReactNode, highlighted?: boolean }) {
  return (
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.8 }}
      className={highlighted ? "text-2xl md:text-4xl font-bold text-white leading-tight py-8" : ""}
    >
      {children}
    </motion.p>
  )
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 mix-blend-difference text-white">
       <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
         <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Brain className="w-6 h-6" /> MindScribe
         </Link>
         <div className="flex gap-6 text-sm font-medium font-sans">
             <Link href="/features" className="hover:opacity-70">Features</Link>
             <Link href="/manifesto" className="underline underline-offset-4">Manifesto</Link>
             <Link href="/pricing" className="hover:opacity-70">Pricing</Link>
         </div>
       </div>
    </nav>
  );
}