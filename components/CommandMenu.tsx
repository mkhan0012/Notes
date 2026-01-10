'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog'; // <--- Import Radix
import { Command } from 'cmdk'; 
import { Search, FileText, Plus, Brain } from 'lucide-react';

interface CommandMenuProps {
  notes: any[];
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onToggleAi: () => void;
}

export default function CommandMenu({ notes, onSelectNote, onCreateNote, onToggleAi }: CommandMenuProps) {
  const [open, setOpen] = useState(false);

  // Toggle on Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        {/* The Backdrop/Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-100 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        
        {/* The Dialog Box */}
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] z-50 outline-none transition-all duration-200 data-[state=closed]:scale-95 data-[state=open]:scale-100">
            
          {/* ✅ ACCESSIBILITY FIX: The Hidden Title */}
          <Dialog.Title className="sr-only">Global Command Menu</Dialog.Title>

          {/* The Command Palette */}
          <Command className="w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 overflow-hidden">
            
            <div className="flex items-center gap-2 px-3 border-b border-zinc-800 pb-2 mb-2">
              <Search size={18} className="text-zinc-500" />
              <Command.Input 
                placeholder="Search notes or type a command..." 
                className="w-full bg-transparent outline-none text-white placeholder:text-zinc-600 font-sans h-8"
              />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto px-1 scrollbar-hide">
              <Command.Empty className="py-6 text-center text-zinc-500 text-sm">No results found.</Command.Empty>

              <Command.Group heading="Actions" className="text-zinc-500 text-xs font-bold uppercase mb-2 px-2">
                <Command.Item onSelect={() => { onCreateNote(); setOpen(false); }} className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-zinc-300 hover:bg-purple-600/20 hover:text-purple-400 cursor-pointer transition-colors mb-1">
                  <Plus size={14} /> <span>Create New Note</span>
                </Command.Item>
                <Command.Item onSelect={() => { onToggleAi(); setOpen(false); }} className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-zinc-300 hover:bg-green-600/20 hover:text-green-400 cursor-pointer transition-colors">
                  <Brain size={14} /> <span>Toggle AI Panel</span>
                </Command.Item>
              </Command.Group>

              <Command.Separator className="h-[1px] bg-zinc-800 my-2" />

              <Command.Group heading="Jump to Note" className="text-zinc-500 text-xs font-bold uppercase mb-2 px-2">
                {notes.map((note) => (
                  <Command.Item
                    key={note._id}
                    onSelect={() => { onSelectNote(note._id); setOpen(false); }}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-colors mb-1"
                  >
                    <FileText size={14} />
                    <span>{note.title || "Untitled"}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>

          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}