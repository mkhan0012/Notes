'use client';

import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import React from "react";

// --- 1. Define Interface Here (Outside the Component) ---
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Scroll Transparency
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Manifesto", href: "/manifesto" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tighter group z-50">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <Brain className="w-8 h-8 text-white relative z-10" />
            </div>
            <span className="text-white">MindScribe<span className="text-zinc-500">.ai</span></span>
          </Link>
          
          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
               <NavLink key={link.name} href={link.href}>{link.name}</NavLink>
            ))}
          </div>

          {/* BUTTONS & MOBILE TOGGLE */}
          <div className="flex items-center gap-4">
            {/* CTA Button */}
            <Link 
              href="/notes" 
              className="hidden md:flex group items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
            >
              Get Started
            </Link>

            {/* Mobile Hamburger */}
            <button 
              className="md:hidden text-zinc-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-zinc-800 my-4" />
              <Link 
                href="/notes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-white text-black py-4 rounded-full font-bold text-lg"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- 2. Helper Component uses the Interface ---
function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full" />
    </Link>
  );
}