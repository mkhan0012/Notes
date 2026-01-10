'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, Plus, GraduationCap, 
  Briefcase, ArrowRight, Command 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 👇 FIX: Defined the interface exactly as used in page.tsx
interface CommandMenuProps {
  notes: any[];
  onCreateNote: () => void;
}

export default function CommandMenu({ notes, onCreateNote }: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // 1. Keyboard Listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // 2. Actions Config
  const actions = [
    { id: 'new', label: 'Create New Note', icon: Plus, action: () => { onCreateNote(); setIsOpen(false); } },
    { id: 'study', label: 'Go to Study Lab', icon: GraduationCap, action: () => { router.push('/study'); setIsOpen(false); } },
    { id: 'interview', label: 'Start Interview', icon: Briefcase, action: () => { router.push('/interview'); setIsOpen(false); } },
  ];

  // 3. Filtering
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* MODAL */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }} 
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            
            {/* SEARCH BAR */}
            <div className="flex items-center px-4 py-4 border-b border-zinc-800">
              <Search className="w-5 h-5 text-zinc-500 mr-3" />
              <input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-lg text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <div className="flex gap-1">
                <span className="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-500 font-mono">ESC</span>
              </div>
            </div>

            {/* RESULTS LIST */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              
              {/* ACTIONS SECTION */}
              {filteredActions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">Commands</div>
                  {filteredActions.map(action => (
                    <button 
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-purple-600 hover:text-white text-zinc-300 transition-colors group text-left"
                    >
                      <action.icon size={18} className="group-hover:text-white text-zinc-500" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* NOTES SECTION */}
              {filteredNotes.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">Jump to Note</div>
                  {filteredNotes.map(note => (
                    <Link 
                      key={note._id} 
                      href={`/notes?id=${note._id}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-zinc-600 group-hover:text-zinc-400" />
                        <span className="font-hand">{note.title}</span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-zinc-500" />
                    </Link>
                  ))}
                </div>
              )}

              {filteredActions.length === 0 && filteredNotes.length === 0 && (
                <div className="py-12 text-center text-zinc-600">
                  No results found.
                </div>
              )}

            </div>

            {/* FOOTER */}
            <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600">
                <div className="flex items-center gap-2">
                    <Command size={10} /> <span>MindScribe OS</span>
                </div>
                <span>Use arrows to navigate</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}