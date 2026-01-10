'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { 
  ChevronLeft, X, BookOpen, GraduationCap, 
  Brain, Zap, Smile, Loader2, Sparkles, 
  MessageSquare, Plus, Menu, Wand2,
  Mic, MicOff, Grid3X3, Send, Printer, Headphones, Layers 
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import Editor from "@/components/Editor"; 
import CommandPalette from "@/components/CommandMenu"; 
import StudyModal from "@/components/StudyModal"; 
import NeuralBackground from "@/components/NeuralBackground"; 
import * as Dialog from '@radix-ui/react-dialog';

export default function NotesPage() {
  // --- STATE ---
  const [notesList, setNotesList] = useState<any[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState(""); 
  
  const [activePanel, setActivePanel] = useState<'none' | 'list' | 'ai-tools' | 'chat'>('none'); 
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const [texture, setTexture] = useState<'none' | 'grid' | 'dots' | 'lined'>('none');
  const [isListening, setIsListening] = useState(false);
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isCardsLoading, setIsCardsLoading] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null); 

  // --- ANIMATION VARIANTS (FIXED) ---
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, // 👈 FIX: Added 'as const'
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        when: "beforeChildren" as const // 👈 FIX: Added 'as const'
      }
    },
    exit: { x: -300, opacity: 0 }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  useEffect(() => { fetchNotesList(); }, []);

  // --- 1. LECTURE MODE ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return alert("Browser does not support speech recognition.");
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        if (event.results[event.results.length - 1].isFinal) {
             const transcript = event.results[event.results.length - 1][0].transcript;
             const newText = content + " " + transcript;
             handleContentChange(newText, title);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  // --- 2. FLASHCARDS GENERATOR ---
  const generateFlashcards = async () => {
      if (!content) return;
      setIsCardsLoading(true);
      try {
          const res = await fetch('/api/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: content, mode: 'flashcards' })
          });
          const data = await res.json();
          try {
              const jsonStr = data.result.replace(/```json/g, '').replace(/```/g, '');
              const cards = JSON.parse(jsonStr);
              setFlashcards(cards);
              setIsStudyOpen(true);
          } catch (e) {
              alert("AI response format error. Try again.");
          }
      } catch (e) {
          alert("Failed to generate cards");
      } finally {
          setIsCardsLoading(false);
      }
  };

  // --- UTILS ---
  const cycleTexture = () => {
      const textures: any[] = ['none', 'grid', 'dots', 'lined'];
      const nextIndex = (textures.indexOf(texture) + 1) % textures.length;
      setTexture(textures[nextIndex]);
  };

  const handlePrint = () => window.print();

  // --- CHAT & DATA LOGIC ---
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !content) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);
    try {
        const prompt = `Context: ${content}\n\nQuestion: ${userMsg}`;
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: prompt, mode: 'chat-with-note' })
        });
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'ai', text: data.result }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'ai', text: "Error." }]);
    } finally { setIsAiLoading(false); }
  };

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
        setChatHistory([]);
        setAiOutput(null);
      } catch (e) { console.error(e); }
  };

  const createNewNote = async () => { 
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: "Untitled Note", content: "" }) });
      const newNote = await res.json();
      setNotesList([newNote, ...notesList]);
      setCurrentNoteId(newNote._id);
      setTitle(newNote.title); setContent(""); setActivePanel('none');
  };

  const handleContentChange = (newContent: string, newTitle: string = title) => { 
      setContent(newContent); setTitle(newTitle); setSaveStatus('unsaved');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        const payload = { title: newTitle, content: newContent };
        if (currentNoteId) await fetch('/api/notes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentNoteId, ...payload }) });
        else { const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const n = await res.json(); setCurrentNoteId(n._id); setNotesList([n, ...notesList]); }
        setSaveStatus('saved'); fetchNotesList();
      }, 1500);
  };

  const handleAiGenerate = async () => { 
      if (!generatorPrompt.trim()) return; setIsGenerating(true);
      try { const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: generatorPrompt, mode: 'generate' }) }); const data = await res.json(); if (data.result) { handleContentChange(data.result, generatorPrompt.slice(0,30)); setIsGeneratorOpen(false); setGeneratorPrompt(""); } } catch (e) { alert("Failed"); } finally { setIsGenerating(false); }
  };

  async function generateAiTool(mode: string, subMode: string = '') { 
      if (!content) return; setIsAiLoading(true); setAiOutput(null);
      try { 
          const response = await fetch('/api/ai', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ text: content, mode, subMode }) 
          }); 
          const data = await response.json(); 
          if (data.result) setAiOutput(data.result); 
      } catch (error) { alert("AI Failed."); } 
      finally { setIsAiLoading(false); }
  }


  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans overflow-hidden print:bg-white print:text-black selection:bg-purple-500/40">
      
      {/* 1. OMNIBAR (COMMAND PALETTE) */}
      <CommandPalette notes={notesList} onCreateNote={createNewNote} />

      <NeuralBackground />
      <StudyModal isOpen={isStudyOpen} onClose={() => setIsStudyOpen(false)} cards={flashcards} />

      {/* AI GENERATOR MODAL */}
      <Dialog.Root open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-6 focus:outline-none">
                <Dialog.Title className="text-xl font-bold text-white mb-2 flex items-center gap-2 font-hand"><Wand2 className="text-purple-400" /> AI Note Gen</Dialog.Title>
                <textarea value={generatorPrompt} onChange={(e) => setGeneratorPrompt(e.target.value)} placeholder="What should I write about?..." className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white mb-4 font-hand text-lg focus:border-purple-500/50 outline-none transition-colors" />
                <div className="flex justify-end gap-2">
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="px-4 py-2 rounded-lg bg-white text-black font-bold font-hand hover:scale-105 transition-transform">{isGenerating ? "..." : "Generate"}</button>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 print:hidden">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => setActivePanel(activePanel === 'list' ? 'none' : 'list')} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                <Menu size={20} />
            </button>
        </div>

        {/* GLASS TOOLBAR */}
        <div className="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-xl">
             <button onClick={cycleTexture} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" title="Texture"><Grid3X3 size={16} /></button>
             <div className="w-[1px] h-4 bg-white/10" />
             <button onClick={toggleListening} className={`p-2 rounded-full transition-all flex items-center gap-2 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Dictate">
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
             </button>
             <div className="w-[1px] h-4 bg-white/10" />
             <Link href="/interview">
                 <button className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" title="Interview Mode">
                    <Headphones size={16} />
                 </button>
             </Link>
             <div className="w-[1px] h-4 bg-white/10" />
             <button onClick={handlePrint} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" title="Print"><Printer size={16} /></button>
        </div>

        <div className="px-3 py-1 rounded-full bg-zinc-900/50 border border-white/5 text-xs text-zinc-500 font-mono backdrop-blur-sm">
           {saveStatus === 'saving' ? 'Saving...' : 'Synced'}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 w-full h-screen pt-24 pb-40 px-6 md:px-32 flex flex-col transition-all duration-500 overflow-y-auto custom-scrollbar"
            style={{ 
                paddingLeft: activePanel === 'list' ? '22rem' : undefined,
                paddingRight: (activePanel === 'ai-tools' || activePanel === 'chat') ? '26rem' : undefined 
            }}>
        <input type="text" value={title || ""} onChange={(e) => handleContentChange(content, e.target.value)} placeholder="Untitled Note" className="bg-transparent text-5xl md:text-6xl font-bold text-white placeholder:text-zinc-800 focus:outline-none mb-8 w-full border-none px-0 font-hand tracking-tight print:text-black" />
        
        <div className="min-h-[60vh]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNoteId || "empty"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <Editor content={content} onChange={(html) => handleContentChange(html, title)} texture={texture} />
                </motion.div>
            </AnimatePresence>
        </div>
      </main>

      {/* SIDEBAR: NOTES LIST (STAGGERED) */}
      <AnimatePresence>
        {activePanel === 'list' && (
          <motion.aside 
            variants={sidebarVariants}
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            className="fixed top-0 left-0 h-screen w-80 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 z-30 pt-20 px-4 flex flex-col print:hidden"
          >
             <div className="flex justify-between items-center mb-6 px-2">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">My Notes</h2>
                 <button onClick={createNewNote} className="p-2 bg-white text-black rounded-lg"><Plus size={16}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                 {notesList.map(note => (
                     <motion.div 
                        key={note._id} 
                        variants={itemVariants}
                        onClick={() => loadNote(note._id)} 
                        className={`p-3 rounded-lg cursor-pointer font-hand truncate transition-colors ${currentNoteId === note._id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                     >
                        {note.title}
                     </motion.div>
                 ))}
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* SIDEBAR: AI TOOLS */}
      <AnimatePresence>
        {activePanel === 'ai-tools' && (
          <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed top-0 right-0 h-screen w-96 bg-zinc-950/80 backdrop-blur-xl border-l border-white/5 z-30 pt-20 px-6 flex flex-col shadow-2xl print:hidden">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2 font-mono"><Sparkles size={14} /> Study Tools</h2>
               <button onClick={() => { setActivePanel('none'); setAiOutput(null); }} className="p-2 hover:bg-zinc-800 rounded-full"><X size={18} className="text-zinc-500" /></button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-6">
                {!isAiLoading && !aiOutput && (
                    <div className="grid grid-cols-2 gap-3">
                        <SummaryCard label="Summarize" icon={Zap} color="text-yellow-400" onClick={() => generateAiTool('summary', '1-Min Revision')} />
                        <SummaryCard label="Quiz Me" icon={GraduationCap} color="text-red-400" onClick={() => generateAiTool('quiz', 'MCQ')} />
                        <SummaryCard label="ELI5" icon={Smile} color="text-green-400" onClick={() => generateAiTool('summary', 'ELI5 Mode')} />
                        <SummaryCard label="Interview" icon={MessageSquare} color="text-blue-400" onClick={() => generateAiTool('summary', 'Interview Prep')} />
                    </div>
                )}
                {isAiLoading && <div className="flex flex-col items-center justify-center h-40"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /><p className="text-xs text-zinc-500 mt-2 font-mono">Thinking...</p></div>}
                {!isAiLoading && aiOutput && (
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/10 text-lg text-zinc-300 leading-relaxed font-hand">
                        <ReactMarkdown>{aiOutput}</ReactMarkdown>
                        <button onClick={() => setAiOutput(null)} className="mt-4 text-sm text-zinc-500 underline hover:text-white font-sans">Back</button>
                    </div>
                )}
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* SIDEBAR: CHAT */}
      <AnimatePresence>
        {activePanel === 'chat' && (
          <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed top-0 right-0 h-screen w-96 bg-zinc-950/80 backdrop-blur-xl border-l border-white/5 z-30 pt-20 px-6 flex flex-col shadow-2xl print:hidden">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
               <h2 className="text-sm font-bold text-purple-400 flex items-center gap-2 font-mono"><Brain size={16} /> Chat with Note</h2>
               <button onClick={() => setActivePanel('none')}><X size={18} className="text-zinc-500 hover:text-white" /></button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                {chatHistory.length === 0 && <div className="text-center text-zinc-500 mt-10 font-hand text-lg"><p>Ask me anything about <br/>"{title}"</p></div>}
                {chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm font-hand ${msg.role === 'user' ? 'bg-purple-900/30 text-white border border-purple-500/30' : 'bg-zinc-800/50 text-zinc-300'}`}>{msg.text}</div></div>))}
                {isAiLoading && <div className="flex justify-start"><div className="bg-zinc-800 p-3 rounded-2xl"><Loader2 size={16} className="animate-spin text-purple-500"/></div></div>}
             </div>
             <div className="mt-auto mb-6 relative">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()} placeholder="Ask a question..." className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:border-purple-500 outline-none font-hand"/>
                <button onClick={handleChatSubmit} disabled={!chatInput.trim() || isAiLoading} className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"><Send size={14} /></button>
             </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* LIQUID DOCK (BOTTOM MENU) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-1.5 rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl print:hidden flex items-center gap-1">
         
         {/* STUDY LINK BUTTON */}
         <Link href="/study">
             <button className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-colors hover:bg-white/10">
                 <BookOpen size={20} className="text-zinc-400 hover:text-white transition-colors" />
             </button>
         </Link>

         <DockItem 
            isActive={isStudyOpen} 
            onClick={generateFlashcards} 
            icon={Layers} 
            isLoading={isCardsLoading}
         />
         <DockItem 
            isActive={activePanel === 'chat'} 
            onClick={() => setActivePanel(activePanel === 'chat' ? 'none' : 'chat')} 
            icon={MessageSquare} 
         />
         <DockItem 
            isActive={false} 
            onClick={() => setIsGeneratorOpen(true)} 
            icon={Brain} 
         />
      </div>
    </div>
  );
}

// LIQUID DOCK ITEM
function DockItem({ icon: Icon, isActive, onClick, isLoading }: any) {
  return (
    <button 
        onClick={onClick} 
        className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-colors"
    >
        {isActive && (
            <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-zinc-100 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
        
        <div className="relative z-10">
            {isLoading ? (
                <Loader2 size={20} className={`animate-spin ${isActive ? 'text-black' : 'text-zinc-400'}`} />
            ) : (
                <Icon size={20} className={`transition-colors duration-200 ${isActive ? 'text-black' : 'text-zinc-400 hover:text-white'}`} />
            )}
        </div>
    </button>
  );
}

function SummaryCard({ label, icon: Icon, color, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-4 h-24 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all hover:bg-white/5 active:scale-95 group">
       <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
       <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 text-center leading-tight font-mono">{label}</span>
    </button>
  )
}