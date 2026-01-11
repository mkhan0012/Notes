'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Mic, ChevronLeft, Brain, Loader2, Square, EyeOff, Copy, Check, Command, Activity } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

// --- COMPONENT: Neon Audio Visualizer ---
const AudioVisualizer = ({ active }: { active: boolean }) => {
  return (
    <div className="flex items-center gap-1.5 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: active ? [8, Math.random() * 48 + 8, 8] : 4,
            opacity: active ? 1 : 0.2,
            backgroundColor: active ? "#ec4899" : "#3f3f46", // Pink-500 vs Zinc-700
            boxShadow: active ? "0 0 15px 2px rgba(236, 72, 153, 0.5)" : "none"
          }}
          transition={{
            repeat: Infinity,
            duration: 0.4,
            ease: "easeInOut",
            delay: i * 0.05
          }}
          className="w-1 rounded-full"
        />
      ))}
    </div>
  );
};

// --- COMPONENT: Cyber Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    idle: { 
        color: "bg-zinc-900 text-zinc-500 border-zinc-800", 
        label: "SYSTEM STANDBY", 
        icon: <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" /> 
    },
    listening: { 
        color: "bg-pink-950/30 text-pink-500 border-pink-500/50 shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)]", 
        label: "LISTENING...", 
        icon: <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span></span>
    },
    thinking: { 
        color: "bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/50", 
        label: "PROCESSING DATA", 
        icon: <Loader2 size={10} className="animate-spin" /> 
    },
    ignored: { 
        color: "bg-zinc-900 text-zinc-600 border-zinc-800", 
        label: "NO INPUT DETECTED", 
        icon: <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" /> 
    },
  };

  const current = configs[status as keyof typeof configs] || configs.idle;

  return (
    <div className={`flex items-center gap-3 px-5 py-2 rounded-full border ${current.color} backdrop-blur-xl transition-all duration-300`}>
      {current.icon}
      <span className="text-[10px] font-mono font-bold tracking-[0.2em]">{current.label}</span>
    </div>
  );
};

// --- HOOK: Typewriter ---
const useTypewriter = (text: string, speed = 10) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
};

// --- MAIN LOGIC ---
function InterviewLogic() {
  const [notesContext, setNotesContext] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'ignored'>('idle');
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayedAnswer = useTypewriter(aiAnswer, 15);
  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id'); 

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        let context = "";
        const targetUrl = noteId ? `/api/notes?id=${noteId}` : '/api/notes';
        const res = await fetch(targetUrl);
        const data = await res.json();

        if (Array.isArray(data)) {
           if (data.length > 0) {
               const latest = await fetch(`/api/notes?id=${data[0]._id}`).then(r => r.json());
               context = `CONTEXT: ${latest.title}\n${latest.content}`;
           }
        } else {
           context = `CONTEXT: ${data.title}\n${data.content}`;
        }
        setNotesContext(context || "No context found.");
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setLoadingNotes(false);
      }
    }
    loadData();
    return () => stopSession();
  }, [noteId]);

  // Speech Logic
  const startSession = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported (Use Chrome).");

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
            if (text.trim().length > 5) handleAskAI(text);
        }, 1500); 
    };

    recognition.onend = () => {
        if (sessionActive) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [sessionActive, notesContext]);

  const stopSession = () => {
    setSessionActive(false);
    setAiState('idle');
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleAskAI = async (text: string) => {
    setAiState('thinking');
    try {
        const res = await fetch('/api/ai', {
            method: 'POST',
            body: JSON.stringify({ 
                text: `CONTEXT:\n${notesContext}\n\nTRANSCRIPT:\n"${text}"\n\nINSTRUCTIONS: If this is NOT a question, return "SILENCE". If it is, provide a concise answer (under 50 words).`,
                mode: 'interview-assist' 
            })
        });
        const data = await res.json();
        
        if (data.result === "SILENCE") {
            setAiState('ignored');
            setTimeout(() => setAiState('listening'), 2000);
        } else {
            setAiAnswer(data.result);
            setAiState('listening');
            setTranscript(""); 
        }
    } catch (e) {
        setAiState('listening');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
     const handleKeys = (e: KeyboardEvent) => {
        if (e.key === 'Escape') window.location.href = '/notes';
        if (e.key.toLowerCase() === 'b') setIsBlurred(p => !p);
     };
     window.addEventListener('keydown', handleKeys);
     return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  return (
    <div className={`relative min-h-screen w-full bg-black text-white overflow-hidden font-sans transition-all duration-700 ${isBlurred ? 'blur-2xl opacity-40' : ''}`}>
        
        {/* --- DEEP VOID BACKGROUND WITH PINK GLOW --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Dynamic Glow Spot */}
             <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[180px] transition-all duration-1000 opacity-40 ${
                 aiState === 'thinking' ? 'bg-fuchsia-600' : 
                 aiState === 'listening' ? 'bg-pink-600' : 
                 'bg-pink-900/20'
             }`} />
             
             {/* Cyber Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1]"></div>
        </div>

        {/* --- HEADER --- */}
        <header className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
            <Link href="/notes" className="pointer-events-auto group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                 <div className="bg-black/50 backdrop-blur-md border border-zinc-800 p-2.5 rounded-xl group-hover:border-pink-500/50 group-hover:shadow-[0_0_15px_-5px_rgba(236,72,153,0.5)] transition-all">
                    <ChevronLeft size={16} />
                 </div>
                 <span className="text-[10px] font-mono font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity -ml-1 text-pink-500">ABORT</span>
            </Link>
            <button onClick={() => setIsBlurred(!isBlurred)} className="pointer-events-auto group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors">
                 <span className="text-[10px] font-mono font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mr-1 text-pink-500">STEALTH MODE</span>
                 <div className="bg-black/50 backdrop-blur-md border border-zinc-800 p-2.5 rounded-xl group-hover:border-pink-500/50 group-hover:shadow-[0_0_15px_-5px_rgba(236,72,153,0.5)] transition-all">
                    <EyeOff size={16} />
                 </div>
            </button>
        </header>

        {/* --- MAIN STAGE --- */}
        <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-6">
            <AnimatePresence mode="wait">
                
                {/* 1. START SCREEN */}
                {!sessionActive && (
                    <motion.div 
                        key="start"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                        className="text-center max-w-lg relative"
                    >
                         <div className="w-24 h-24 bg-black rounded-3xl border border-zinc-800 mx-auto flex items-center justify-center mb-10 shadow-[0_0_50px_-10px_rgba(236,72,153,0.2)] group hover:border-pink-500/50 hover:shadow-[0_0_60px_-10px_rgba(236,72,153,0.4)] transition-all duration-500">
                             <Brain size={40} className="text-zinc-400 group-hover:text-pink-400 transition-colors" />
                         </div>
                         
                         <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-6">
                            NEURAL<br/><span className="text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">LINK</span>
                         </h1>
                         <p className="text-zinc-500 text-sm font-mono tracking-wide mb-12 uppercase">
                             {loadingNotes ? "INITIALIZING KNOWLEDGE BASE..." : "SYSTEM ONLINE. AWAITING INPUT."}
                         </p>
                         
                         <button 
                            onClick={startSession} 
                            disabled={loadingNotes}
                            className="group relative px-12 py-5 bg-pink-600 text-white font-bold rounded-full transition-all hover:bg-pink-500 hover:shadow-[0_0_40px_-5px_rgba(236,72,153,0.6)] active:scale-95 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:pointer-events-none disabled:grayscale"
                        >
                            {loadingNotes ? <Loader2 className="animate-spin" /> : <Activity size={20} />}
                            <span className="tracking-wider">{loadingNotes ? "LOADING..." : "ACTIVATE"}</span>
                        </button>
                    </motion.div>
                )}

                {/* 2. ACTIVE HUD */}
                {sessionActive && (
                    <motion.div 
                        key="hud"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-5xl h-[85vh] flex flex-col relative"
                    >
                        {/* TOP: Status */}
                        <div className="h-24 flex justify-center items-center shrink-0">
                             <StatusBadge status={aiState} />
                        </div>

                        {/* CENTER: The Answer */}
                        <div className="flex-1 flex flex-col justify-center items-center relative my-4 perspective-1000">
                             
                             {/* WAITING STATE */}
                             {!aiAnswer && aiState !== 'thinking' && (
                                 <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-8"
                                >
                                     <AudioVisualizer active={aiState === 'listening'} />
                                     <p className="text-pink-500/50 font-mono tracking-[0.3em] text-[10px] animate-pulse">MICROPHONE ACTIVE</p>
                                 </motion.div>
                             )}

                             {/* LOADING STATE */}
                             {aiState === 'thinking' && !aiAnswer && (
                                 <div className="flex flex-col items-center gap-6">
                                     <div className="relative">
                                        <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse"></div>
                                        <Loader2 size={56} className="text-pink-500 animate-spin relative z-10" />
                                     </div>
                                     <p className="text-pink-400/50 font-mono text-[10px] tracking-[0.3em] animate-pulse">GENERATING OPTIMAL RESPONSE...</p>
                                 </div>
                             )}

                             {/* THE ANSWER CARD */}
                             {aiAnswer && aiState !== 'thinking' && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="w-full bg-black/40 border border-pink-500/20 rounded-[2rem] p-10 md:p-16 backdrop-blur-2xl shadow-[0_0_50px_-20px_rgba(236,72,153,0.15)] relative group cursor-pointer overflow-hidden transition-all duration-300 hover:border-pink-500/40 hover:shadow-[0_0_70px_-20px_rgba(236,72,153,0.25)] hover:bg-black/60"
                                    onClick={copyToClipboard}
                                 >
                                     {/* Cyber Corner Accents */}
                                     <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent pointer-events-none" />
                                     <div className="absolute top-6 left-6 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                                     
                                     {/* Copy Badge */}
                                     <div className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                         {copied ? <Check size={14} className="text-pink-500" /> : <Copy size={14} />}
                                         {copied ? "COPIED TO CLIPBOARD" : "COPY OUTPUT"}
                                     </div>

                                     {/* Text Content */}
                                     <div className="relative z-10">
                                         <p className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight text-zinc-100 tracking-tight">
                                             {displayedAnswer}
                                             {/* Blinking Cursor */}
                                             <span className="inline-block w-3 h-8 md:h-12 bg-pink-500 ml-2 align-middle animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
                                         </p>
                                     </div>
                                 </motion.div>
                             )}
                        </div>

                        {/* BOTTOM: Transcript & Controls */}
                        <div className="h-24 shrink-0 flex flex-col items-center justify-end gap-6">
                             {/* Transcript Pill */}
                             <div className="h-8 w-full flex justify-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {transcript && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="px-4 py-1.5 bg-zinc-900/80 rounded-full border border-pink-500/20 shadow-lg"
                                        >
                                            <p className="text-pink-200/70 font-mono text-[10px] tracking-wide max-w-lg truncate flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                                                {transcript.toUpperCase()}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                             </div>

                             {/* Stop Button */}
                             <button 
                                onClick={stopSession}
                                className="group w-16 h-16 flex items-center justify-center bg-black border border-zinc-800 rounded-full hover:border-pink-500 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)] transition-all duration-300"
                            >
                                <Square size={20} fill="#ec4899" className="text-pink-500 group-hover:scale-90 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </main>
    </div>
  );
}

// --- SUSPENSE WRAPPER ---
export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <InterviewLogic />
    </Suspense>
  );
}