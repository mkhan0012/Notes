'use client';

import Link from "next/link";
import { Brain, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6">Invest in your Grades.</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Notes that write themselves pay for themselves in saved time.
          </p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 rounded-full bg-zinc-800 p-1 relative transition-colors hover:bg-zinc-700"
            >
              <motion.div 
                animate={{ x: isYearly ? 32 : 0 }}
                className="w-6 h-6 rounded-full bg-white shadow-lg"
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-zinc-500'}`}>
                Yearly <span className="text-green-400 text-xs ml-1 font-bold">-20%</span>
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Free Plan */}
           <PriceCard 
             title="Scholar" 
             price="0" 
             desc="Perfect for trying out the AI engine."
             features={["5 AI Notes per day", "Basic Formatting", "Export to PDF", "Community Support"]}
           />

           {/* Pro Plan */}
           <PriceCard 
             title="Summa Cum Laude" 
             price={isYearly ? "8" : "12"} 
             desc="For serious students aiming for the top 1%."
             highlighted
             features={[
                 "Unlimited AI Notes", 
                 "Deep Exam Mode", 
                 "Professor Persona Analysis", 
                 "Unlimited Storage",
                 "Priority 24/7 Support"
             ]}
           />

        </div>

      </main>
    </div>
  );
}

function PriceCard({ title, price, desc, features, highlighted = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative p-8 rounded-3xl border ${highlighted ? 'border-purple-500/50 bg-purple-900/10' : 'border-zinc-800 bg-zinc-900/30'} flex flex-col`}
    >
       {highlighted && (
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            Most Popular
         </div>
       )}
       
       <h3 className="text-xl font-bold mb-2">{title}</h3>
       <p className="text-zinc-400 text-sm mb-6">{desc}</p>
       
       <div className="text-4xl font-bold mb-8">
          ${price}<span className="text-lg text-zinc-500 font-normal">/mo</span>
       </div>

       <div className="space-y-4 mb-8 flex-1">
          {features.map((f: string, i: number) => (
             <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                   <Check className="w-3 h-3" />
                </div>
                {f}
             </div>
          ))}
       </div>

       <Link 
         href="/notes"
         className={`w-full py-4 rounded-xl font-bold text-center transition-transform hover:scale-105 ${highlighted ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
       >
         Get Started
       </Link>
    </motion.div>
  )
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-zinc-800">
       <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
         <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" /> MindScribe
         </Link>
         <div className="flex gap-6 text-sm font-medium text-zinc-400">
             <Link href="/features" className="hover:text-white transition-colors">Features</Link>
             <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
             <Link href="/pricing" className="text-white">Pricing</Link>
         </div>
       </div>
    </nav>
  );
}