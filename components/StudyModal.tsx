'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

export default function StudyModal({ isOpen, onClose, cards }: { isOpen: boolean, onClose: () => void, cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const currentCard = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        if (index < cards.length - 1) setIndex(index + 1);
        else setIndex(0); // Loop back
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        if (index > 0) setIndex(index - 1);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        
        {/* CLOSE BTN */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
        </button>

        <div className="w-full max-w-xl flex flex-col gap-6">
            
            {/* PROGRESS BAR */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-widest">
                <span>Card {index + 1} / {cards.length}</span>
                <span>Study Mode</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-purple-500" 
                />
            </div>

            {/* THE CARD (FLIP ANIMATION) */}
            <div className="relative h-80 w-full perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-700 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Question</span>
                        <h3 className="text-3xl font-hand text-white leading-relaxed">{currentCard.front}</h3>
                        <p className="absolute bottom-6 text-xs text-zinc-600 font-mono">Tap to Flip</p>
                    </div>

                    {/* BACK */}
                    <div 
                        className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-900 to-blue-900 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Answer</span>
                        <h3 className="text-2xl font-hand text-white leading-relaxed">{currentCard.back}</h3>
                        <div className="absolute bottom-6 flex gap-2">
                             <CheckCircle2 size={16} className="text-green-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-center gap-4">
                <button onClick={(e) => { e.stopPropagation(); prevCard(); }} disabled={index === 0} className="p-4 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }} className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <RotateCw size={24} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="p-4 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>

        </div>
    </div>
  );
}