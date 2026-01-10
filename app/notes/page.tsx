'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, X, BookOpen, GraduationCap, 
  Brain, Zap, Smile, Loader2, Sparkles, 
  MessageSquare, Plus, Menu, FileText, Command as CmdIcon
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import Editor from "@/components/Editor"; 
import CommandMenu from "@/components/CommandMenu"; 
import ChatInterface from "@/components/ChatInterface"; // <--- 1. NEW IMPORT

export default function NotesPage() {
  // --- STATE ---
  const [notesList, setNotesList] = useState<any[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState(""); 
  
  const [activePanel, setActivePanel] = useState<'none' | 'summary' | 'quiz' | 'list'>('none'); 
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => { fetchNotesList(); }, []);

  const fetchNotesList = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotesList(data);
      if (data.length > 0 && !currentNoteId) loadNote(data[0]._id);
    } catch (e) { console.error(e); }
  };

  const loadNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`);
      const note = await res.json();
      setCurrentNoteId(note._id);
      setTitle(note.title || "Untitled Note");
      setContent(note.content || ""); 
      setSaveStatus('saved');
    } catch (e) { console.error(e); }
  };

  const createNewNote = async () => {
    const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "Untitled Note", content: "" })
    });
    const newNote = await res.json();
    setNotesList([newNote, ...notesList]);
    setCurrentNoteId(newNote._id);
    setTitle(newNote.title || "Untitled Note");
    setContent("");
    setActivePanel('none'); 
  };

  // --- AUTO-SAVE LOGIC ---
  const handleContentChange = (newContent: string, newTitle: string = title) => {
    setContent(newContent);
    setTitle(newTitle);
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      
      const payload = { title: newTitle, content: newContent };

      if (currentNoteId) {
          await fetch('/api/notes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentNoteId, ...payload }),
          });
      } else {
          const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const newNote = await res.json();
          setCurrentNoteId(newNote._id);
          setNotesList([newNote, ...notesList]);
      }
      setSaveStatus('saved');
      fetchNotesList(); 
    }, 1500);
  };

  // --- AI FUNCTION (Right Sidebar) ---
  async function generateAI(mode: string, subMode: string = '') {
    if (!content) return;
    setIsAiLoading(true);
    setAiOutput(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, mode, subMode }),
      });
      const data = await response.json();
      if (data.result) setAiOutput(data.result);
    } catch (error) { alert("AI Failed."); } 
    finally { setIsAiLoading(false); }
  }

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans overflow-hidden">
      
      {/* 2. CHAT INTERFACE ADDED HERE */}
      <ChatInterface />

      {/* COMMAND MENU */}
      <CommandMenu 
        notes={notesList} 
        onSelectNote={loadNote} 
        onCreateNote={createNewNote}
        onToggleAi={() => setActivePanel(activePanel === 'summary' ? 'none' : 'summary')}
      />

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => setActivePanel(activePanel === 'list' ? 'none' : 'list')} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                <Menu size={20} />
            </button>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-zinc-600 text-xs font-mono bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                <CmdIcon size={12} /> <span className="tracking-widest">CMD + K</span>
             </div>

            {saveStatus === 'saving' && <span className="text-xs text-zinc-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin text-yellow-500"/> Saving</span>}
            {saveStatus === 'saved' && <span className="text-xs text-green-500/50">Cloud Synced</span>}
        </div>

        <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
           {isAiLoading ? <Loader2 className="animate-spin" size={12}/> : <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>}
        </div>
      </header>

      {/* --- MAIN EDITOR AREA --- */}
      <main className="relative z-10 w-full h-screen pt-24 pb-40 px-6 md:px-32 flex flex-col transition-all duration-500 overflow-y-auto custom-scrollbar"
            style={{ 
                paddingLeft: activePanel === 'list' ? '22rem' : undefined,
                paddingRight: (activePanel === 'summary' || activePanel === 'quiz') ? '26rem' : undefined 
            }}>
        
        <input 
            type="text" 
            value={title || ""} 
            onChange={(e) => handleContentChange(content, e.target.value)}
            placeholder="Untitled Note" 
            className="bg-transparent text-4xl md:text-5xl font-bold text-white placeholder:text-zinc-700 focus:outline-none mb-8 w-full border-none px-0" 
        />

        <div className="min-h-[60vh]">
            <Editor 
                content={content} 
                onChange={(html) => handleContentChange(html, title)} 
            />
        </div>

      </main>

      {/* --- LEFT SIDEBAR (NOTES LIST) --- */}
      <AnimatePresence>
        {activePanel === 'list' && (
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-screen w-80 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 z-30 pt-20 px-4 flex flex-col"
          >
             <div className="flex justify-between items-center mb-6 px-2">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">My Notes</h2>
                 <button onClick={createNewNote} className="p-2 bg-white text-black rounded-lg hover:scale-105 transition-transform"><Plus size={16}/></button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-1">
                 {notesList.map(note => (
                     <div key={note._id} onClick={() => loadNote(note._id)} 
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${currentNoteId === note._id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}`}
                     >
                         <div className="flex items-center gap-3 overflow-hidden">
                             <FileText size={16} />
                             <div className="truncate text-sm font-medium">{note.title || "Untitled"}</div>
                         </div>
                     </div>
                 ))}
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- RIGHT SIDEBAR (AI ANALYSIS) --- */}
      <AnimatePresence>
        {(activePanel === 'summary' || activePanel === 'quiz') && (
          <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 z-30 pt-20 px-6 flex flex-col shadow-2xl"
          >
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2"><Sparkles size={14} /> AI Analysis</h2>
               <button onClick={() => { setActivePanel('none'); setAiOutput(null); }} className="p-2 hover:bg-zinc-800 rounded-full"><X size={18} className="text-zinc-500" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-6">
                {!isAiLoading && !aiOutput && (
                    <div className="grid grid-cols-2 gap-3">
                        <SummaryCard label="Summarize" icon={Zap} color="text-yellow-400" onClick={() => generateAI('summary', '1-Min Revision')} />
                        <SummaryCard label="Quiz Me" icon={GraduationCap} color="text-red-400" onClick={() => generateAI('quiz', 'MCQ')} />
                        <SummaryCard label="Explain Like I'm 5" icon={Smile} color="text-green-400" onClick={() => generateAI('summary', 'ELI5 Mode')} />
                        <SummaryCard label="Interview Prep" icon={MessageSquare} color="text-blue-400" onClick={() => generateAI('summary', 'Interview Prep')} />
                    </div>
                )}
                
                {isAiLoading && <div className="flex flex-col items-center justify-center h-40"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /><p className="text-xs text-zinc-500 mt-2">Reading your notes...</p></div>}
                
                {!isAiLoading && aiOutput && (
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-purple-500/20 text-sm text-zinc-300 leading-relaxed">
                        <ReactMarkdown>{aiOutput}</ReactMarkdown>
                        <button onClick={() => setAiOutput(null)} className="mt-4 text-xs text-zinc-500 underline hover:text-white">Clear</button>
                    </div>
                )}
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- BOTTOM DOCK --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
         <DockButton active={activePanel === 'summary'} onClick={() => setActivePanel('summary')} icon={BookOpen} />
         <DockButton active={activePanel === 'quiz'} onClick={() => setActivePanel('quiz')} icon={GraduationCap} />
         <DockButton active={false} onClick={() => generateAI('canvas')} icon={Brain} />
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
function DockButton({ icon: Icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}><Icon size={20} /></button>
  )
}
function SummaryCard({ label, icon: Icon, color, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-4 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-800 active:scale-95 group">
       <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
       <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 text-center leading-tight">{label}</span>
    </button>
  )
}