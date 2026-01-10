'use client';

import Link from "next/link";
import { Brain } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-zinc-800' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tighter group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <Brain className="w-8 h-8 text-white relative z-10" />
          </div>
          <span className="text-white">MindScribe<span className="text-zinc-500">.ai</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/manifesto">Manifesto</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/notes" className="text-sm font-medium text-white hover:opacity-80 transition-opacity">
            Login
          </Link>
          <Link 
            href="/notes" 
            className="group flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full" />
    </Link>
  );
}