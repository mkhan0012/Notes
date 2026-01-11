'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, ChevronLeft, Brain, Sparkles, Loader2, StopCircle, EyeOff, Copy, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation"; // Import this

export default function InterviewPage() {
  const [notesContext, setNotesContext] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  // ✨ NEW STATES
  const [isBlurred, setIsBlurred] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const noteId = searchParams.get('id'); // Get ID from URL

  // 1. LOAD SPECIFIC NOTE OR FALLBACK
  useEffect(() => {
    async function loadKnowledgeBase() {
      try {
        let context = "";
        
        if (noteId) {
             // 燥 CASE 1: Load SPECIFIC Note (User came from a specific note)
             const res = await fetch(`/api/notes?id=${noteId}`);
             const note = await res.json();
             context = `TITLE: ${note.title}\n${note.content}`;
        } else {
             // 燥 CASE 2: No ID provided -> Load LATEST note by default
             const resList = await fetch('/api/notes');
             const notesList = await resList.json();
             
             if (notesList.length > 0) {
                 // Fetch full content of the first note in the list (latest)
                 const resNote = await fetch(`/api/notes?id=${notesList[0]._id}`);
                 const note = await resNote.json();
                 context = `TITLE: ${note.title}\n${note.content}`;
             } else {
                 context = "No notes found.";
             }
        }

        setNotesContext(context);
        setLoadingNotes(false);
      } catch (e) { 
          console.error("Failed to load notes"); 
          setLoadingNotes(false);
      }
    }
    loadKnowledgeBase();
    return () => stopSession();
  }, [noteId]);

  // 2. ⌨️ KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ' && sessionActive) { // Spacebar to Toggle Mic
            e.preventDefault(); // Prevent scrolling
            if (aiState === 'listening') stopSession();
            else startSession();
        }
        if (e.key.toLowerCase() === 'b') { // 'B' for Blur/Boss Mode
            setIsBlurred(prev => !prev);
        }
        if (e.key === 'Escape') { // Esc to Exit
            window.location.href = '/notes';
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionActive, aiState]);


  // 3. CORE LOGIC (Same as before)
  const startSession = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setSessionActive(true);
        setAiState('listening');
    };
    
    recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        setAiState('listening');

        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
            if (text.trim().length > 3) askAI(text);
        }, 1500); 
    };

    recognition.onend = () => {
        if (sessionActive) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSession = () => {
    setSessionActive(false);
    setAiState('idle');
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onend = null; 
    }
  };

  const askAI = async (text: string) => {
    setAiState('thinking');
    try {
        const prompt = `KNOWLEDGE BASE:\n${notesContext}\n\nINTERVIEWER SAID:\n"${text}"`;
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: prompt, mode: 'interview-assist' })
        });
        const data = await res.json();
        if (data.result !== "SILENCE") setAiAnswer(data.result);
        setAiState('listening');
        setTranscript(""); 
    } catch (e) { setAiState('listening'); }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(aiAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${isBlurred ? 'blur-3xl scale-110' : ''}`}>
        
        {/* AMBIENT BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black z-0 pointer-events-none" />

        {/* TOP LEFT: EXIT */}
        <div className="absolute top-8 left-8 z-50 flex items-center gap-6">
            <Link href="/notes" className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                <ChevronLeft size={14} /> Exit (Esc)
            </Link>
            <button onClick={() => setIsBlurred(!isBlurred)} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                <EyeOff size={14} /> {isBlurred ? "Unblur (B)" : "Blur (B)"}
            </button>
        </div>

        {/* CENTER STAGE */}
        <main className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center justify-center min-h-[80vh]">
            <AnimatePresence mode="wait">
                
                {/* 1. START SCREEN */}
                {!sessionActive && (
                    <motion.div 
                        key="start"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center flex flex-col items-center"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                            <Brain size={64} className="text-zinc-200 relative z-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Interview Assistant</h1>
                        <p className="text-zinc-500 text-lg mb-10 max-w-md">
                            {loadingNotes ? "Loading Context..." : "Memorized. Listening. Ready."}
                        </p>
                        <button onClick={startSession} disabled={loadingNotes} className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3">
                            {loadingNotes ? <Loader2 className="animate-spin" /> : <Mic />}
                            {loadingNotes ? "Loading Notes..." : "Start Session (Space)"}
                        </button>
                    </motion.div>
                )}

                {/* 2. LIVE SESSION */}
                {sessionActive && (
                    <motion.div 
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex flex-col items-center text-center"
                    >
                        {/* ANSWER CARD */}
                        <div className="min-h-[300px] flex items-center justify-center w-full relative mb-12">
                             
                             {!aiAnswer && aiState !== 'thinking' && (
                                <p className="text-zinc-700 text-2xl font-hand animate-pulse">Listening...</p>
                             )}

                             {aiState === 'thinking' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={48} className="text-purple-500 animate-spin" />
                                </div>
                             )}

                             {aiAnswer && aiState !== 'thinking' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-3xl shadow-2xl cursor-pointer group"
                                    onClick={handleCopy}
                                    title="Click to Copy"
                                >
                                    <div className="absolute -top-3 -left-3 flex gap-2">
                                        <Sparkles className="text-purple-400 fill-purple-400/20" size={32} />
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                                        {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                                    </div>
                                    <p className="text-3xl md:text-5xl font-hand text-white leading-tight">{aiAnswer}</p>
                                </motion.div>
                             )}
                        </div>

                        {/* BOTTOM CONTROLS */}
                        <div className="fixed bottom-12 flex flex-col items-center gap-4">
                            <p className="text-zinc-500 font-mono text-sm max-w-xl h-6 truncate opacity-60">
                                {transcript ? `"${transcript}"` : ""}
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 h-8">
                                     {[...Array(5)].map((_, i) => (
                                         <motion.div key={i} animate={{ height: aiState === 'listening' ? [8, 24 + Math.random() * 20, 8] : 4, backgroundColor: aiState === 'thinking' ? '#a855f7' : '#ef4444' }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1.5 rounded-full" />
                                     ))}
                                </div>
                                <button onClick={stopSession} className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all" title="Stop (Space)">
                                    <StopCircle size={20} />
                                </button>
                            </div>
                        </div>

                    </motion.div>
                )}

            </AnimatePresence>
        </main>
    </div>
  );
}