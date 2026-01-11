'use client';

import { useState, useEffect, Suspense } from "react";
import { 
  Brain, GraduationCap, Zap, 
  ChevronLeft, Send, Sparkles, Loader2, 
  ArrowRight, BookOpen, Briefcase
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

// --- 1. UTILITIES ---

// Robust JSON Parser that strips Markdown and text
const safeJSONParse = (input: string) => {
  try {
    if (!input) return null;
    // Remove Markdown code blocks if present
    let clean = input.replace(/```json/g, '').replace(/```/g, '');
    // Find valid JSON bounds
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Failed:", e);
    return null;
  }
};

// --- 2. SUB-COMPONENTS (UI) ---

function NavBtn({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${
                active 
                ? 'bg-white text-black shadow-lg shadow-white/10' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
        >
            <Icon size={18} />
            <span className="hidden lg:block">{label}</span>
        </button>
    )
}

function BentoCard({ title, desc, icon: Icon, color, bg, onClick }: any) {
    return (
        <button onClick={onClick} className="group relative w-full p-8 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-3xl text-left transition-all hover:scale-[1.02] shadow-xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-black border border-white/10 ${color} z-10`}>
                <Icon size={24} />
            </div>
            <h3 className="relative text-xl font-bold text-white mb-2 z-10">{title}</h3>
            <p className="relative text-sm text-zinc-500 leading-relaxed z-10">{desc}</p>
            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 z-10">
                <ArrowRight className="text-zinc-400" />
            </div>
        </button>
    )
}

function Header({ title, desc, icon: Icon, color }: any) {
    return (
        <header className="flex items-center gap-5 mb-10">
            <div className={`p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-lg ${color}`}>
                <Icon size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                <p className="text-zinc-500 mt-1">{desc}</p>
            </div>
        </header>
    )
}

// --- 3. MAIN LOGIC COMPONENT ---

function StudyLogic() {
  const [activeTab, setActiveTab] = useState<'hub' | 'quiz' | 'eli5' | 'interview'>('hub');
  const [notesContext, setNotesContext] = useState("");
  const [loading, setLoading] = useState(true);

  // States
  const [quizQ, setQuizQ] = useState("");
  const [quizAns, setQuizAns] = useState("");
  const [quizRes, setQuizRes] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const [eli5Input, setEli5Input] = useState("");
  const [eli5Res, setEli5Res] = useState("");
  const [eli5Loading, setEli5Loading] = useState(false);

  const [intQ, setIntQ] = useState("");
  const [intAns, setIntAns] = useState("");
  const [intRes, setIntRes] = useState<any>(null);
  const [intLoading, setIntLoading] = useState(false);

  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');

  // Load Data
  useEffect(() => {
    async function loadNotes() {
      try {
        let context = "";
        const endpoint = noteId ? `/api/notes?id=${noteId}` : '/api/notes';
        const res = await fetch(endpoint);
        const data = await res.json();

        if (Array.isArray(data)) {
           // List returned (no ID) -> Get latest
           if (data.length > 0) {
              const latest = await fetch(`/api/notes?id=${data[0]._id}`).then(r => r.json());
              context = `TITLE: ${latest.title}\n${latest.content}`;
           }
        } else {
           // Specific note returned
           context = `TITLE: ${data.title}\n${data.content}`;
        }
        
        setNotesContext(context || "No notes found.");
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, [noteId]);

  // Actions
  const generateQuiz = async () => {
    setQuizLoading(true); setQuizRes(null); setQuizAns("");
    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ text: notesContext, mode: 'quiz-generate' }) });
      const data = await res.json();
      setQuizQ(data.result);
    } finally { setQuizLoading(false); }
  };

  const submitQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await fetch('/api/ai', { 
        method: 'POST', 
        body: JSON.stringify({ text: notesContext, mode: 'quiz-grade', question: quizQ, userAnswer: quizAns }) 
      });
      const data = await res.json();
      const parsed = safeJSONParse(data.result);
      if (parsed) setQuizRes(parsed);
      else alert("AI format error. Please try again.");
    } finally { setQuizLoading(false); }
  };

  const generateInterview = async () => {
    setIntLoading(true); setIntRes(null); setIntAns("");
    try {
        const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ text: notesContext, mode: 'interview-q' }) });
        const data = await res.json();
        setIntQ(data.result);
    } finally { setIntLoading(false); }
  };

  const submitInterview = async () => {
    setIntLoading(true);
    try {
        const res = await fetch('/api/ai', { 
            method: 'POST', 
            body: JSON.stringify({ text: notesContext, mode: 'interview-feedback', question: intQ, userAnswer: intAns }) 
        });
        const data = await res.json();
        const parsed = safeJSONParse(data.result);
        if (parsed) setIntRes(parsed);
        else alert("AI format error. Please try again.");
    } finally { setIntLoading(false); }
  };

  const handleEli5 = async () => {
    setEli5Loading(true);
    try {
        const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ text: eli5Input, mode: 'eli5' }) });
        const data = await res.json();
        setEli5Res(data.result);
    } finally { setEli5Loading(false); }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans overflow-hidden">
        
        {/* SIDEBAR */}
        <motion.aside 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-20 lg:w-64 border-r border-white/5 bg-zinc-950 flex flex-col justify-between z-20 shrink-0"
        >
            <div>
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                    <Link href="/notes" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group">
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 border border-zinc-800 transition-colors"><ChevronLeft size={18} /></div>
                        <span className="hidden lg:block font-bold text-sm tracking-wide">Back to Notes</span>
                    </Link>
                </div>

                <div className="p-4 space-y-2">
                    <NavBtn active={activeTab === 'hub'} onClick={() => setActiveTab('hub')} icon={BookOpen} label="Study Hub" />
                    <div className="h-px bg-white/5 my-2 mx-2" />
                    <NavBtn active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={GraduationCap} label="Active Quiz" />
                    <NavBtn active={activeTab === 'interview'} onClick={() => setActiveTab('interview')} icon={Briefcase} label="Interview Prep" />
                    <NavBtn active={activeTab === 'eli5'} onClick={() => setActiveTab('eli5')} icon={Zap} label="ELI5 Explainer" />
                </div>
            </div>

            <div className="p-4 hidden lg:block">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <div className="text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-wider">System Status</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                         {loading ? "Syncing Context..." : "Online & Ready"}
                    </div>
                </div>
            </div>
        </motion.aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-black">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            <div className="relative z-10 p-6 lg:p-12 min-h-full">
                <AnimatePresence mode="wait">
                    
                    {/* 1. HUB */}
                    {activeTab === 'hub' && (
                        <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto">
                            <header className="mb-16">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Study Laboratory</h1>
                                <p className="text-zinc-500 text-lg max-w-2xl">Select a specialized AI agent to process your notes. Each tool is designed to target specific learning pathways.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <BentoCard 
                                    title="Active Recall Quiz" 
                                    desc="The AI generates challenging questions based on your notes to test your memory retention."
                                    icon={GraduationCap} color="text-purple-400" bg="from-purple-500/20"
                                    onClick={() => setActiveTab('quiz')}
                                />
                                <BentoCard 
                                    title="Interview Simulator" 
                                    desc="A strict hiring manager that asks technical questions and grades your answers on a 0-100 scale."
                                    icon={Briefcase} color="text-blue-400" bg="from-blue-500/20"
                                    onClick={() => setActiveTab('interview')}
                                />
                                <BentoCard 
                                    title="ELI5 Explainer" 
                                    desc="Break down complex topics into simple analogies like LEGOs, Pizza, or Traffic."
                                    icon={Zap} color="text-yellow-400" bg="from-yellow-500/20"
                                    onClick={() => setActiveTab('eli5')}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* 2. QUIZ MODE */}
                    {activeTab === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto py-10">
                            <Header title="Active Recall Quiz" desc="Challenge your knowledge retention." icon={GraduationCap} color="text-purple-400" />
                            
                            {!quizQ ? (
                                <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 border border-white/5 rounded-3xl backdrop-blur-sm">
                                    <button onClick={generateQuiz} disabled={quizLoading} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]">
                                        {quizLoading ? <Loader2 className="animate-spin"/> : <Brain />} Generate Question
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"/>
                                        <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Question</div>
                                        <h3 className="text-xl md:text-2xl font-medium text-white leading-relaxed">{quizQ}</h3>
                                    </div>

                                    {!quizRes && (
                                        <div className="space-y-4">
                                            <textarea value={quizAns} onChange={(e) => setQuizAns(e.target.value)} placeholder="Type your answer here..." className="w-full h-48 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg focus:border-purple-500/50 outline-none resize-none transition-colors" />
                                            <div className="flex justify-end">
                                                <button onClick={submitQuiz} disabled={!quizAns || quizLoading} className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/20">
                                                    {quizLoading ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Submit Answer
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {quizRes && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div className="flex flex-col md:flex-row gap-6 p-8 bg-zinc-900 rounded-3xl border border-white/5">
                                                <div className="flex flex-col items-center justify-center min-w-[120px]">
                                                     <div className={`text-6xl font-black tracking-tighter ${quizRes.score > 70 ? 'text-green-400' : 'text-red-400'}`}>{quizRes.score}</div>
                                                     <div className="text-xs font-bold uppercase text-zinc-500 mt-2">Score</div>
                                                </div>
                                                <div className="w-px bg-white/10 hidden md:block"/>
                                                <div className="flex-1">
                                                     <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Feedback</div>
                                                     <div className="text-zinc-300 leading-relaxed">{quizRes.feedback}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-8 bg-green-900/10 rounded-3xl border border-green-500/20">
                                                <div className="text-xs font-bold text-green-500 uppercase mb-3">Model Answer</div>
                                                <p className="text-green-100/80 leading-relaxed">{quizRes.correct_answer}</p>
                                            </div>
                                            
                                            <button onClick={generateQuiz} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/5 hover:border-white/10">
                                                Next Question
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 3. INTERVIEW MODE */}
                    {activeTab === 'interview' && (
                        <motion.div key="interview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto py-10">
                            <Header title="Interview Simulator" desc="Technical & Behavioral Prep." icon={Briefcase} color="text-blue-400" />
                            
                            {!intQ ? (
                                <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 border border-white/5 rounded-3xl backdrop-blur-sm">
                                    <button onClick={generateInterview} disabled={intLoading} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
                                        {intLoading ? <Loader2 className="animate-spin"/> : <Briefcase />} Start Mock Interview
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"/>
                                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Hiring Manager asks</div>
                                        <h3 className="text-xl md:text-2xl font-medium text-white leading-relaxed">"{intQ}"</h3>
                                    </div>

                                    {!intRes && (
                                        <div className="space-y-4">
                                            <textarea value={intAns} onChange={(e) => setIntAns(e.target.value)} placeholder="Draft your professional response..." className="w-full h-48 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg focus:border-blue-500/50 outline-none resize-none transition-colors" />
                                            <div className="flex justify-end">
                                                <button onClick={submitInterview} disabled={!intAns || intLoading} className="px-10 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                                                    {intLoading ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Submit for Review
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {intRes && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div className={`p-8 rounded-3xl border flex flex-col md:flex-row gap-6 ${intRes.rating?.includes('Strong') ? 'bg-green-900/20 border-green-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                                                <div className="min-w-[150px]">
                                                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Verdict</div>
                                                    <div className="text-3xl font-bold">{intRes.rating}</div>
                                                </div>
                                                <div className="w-px bg-white/10 hidden md:block"/>
                                                <div className="text-zinc-300 leading-relaxed flex-1">{intRes.feedback}</div>
                                            </div>
                                            
                                            <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5">
                                                <div className="text-xs font-bold text-blue-400 uppercase mb-3">Suggested Better Answer</div>
                                                <p className="text-zinc-300 leading-relaxed">{intRes.better_answer}</p>
                                            </div>
                                            
                                            <button onClick={generateInterview} className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-bold transition-colors">Next Question</button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 4. ELI5 MODE */}
                    {activeTab === 'eli5' && (
                        <motion.div key="eli5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto py-10">
                            <Header title="ELI5 Explainer" desc="Simplify complex topics instantly." icon={Zap} color="text-yellow-400" />
                            
                            <div className="flex gap-4 mb-10">
                                <input value={eli5Input} onChange={(e) => setEli5Input(e.target.value)} placeholder="e.g., Quantum Computing, Recursion..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-lg focus:border-yellow-500 outline-none transition-colors" />
                                <button onClick={handleEli5} disabled={eli5Loading || !eli5Input} className="px-8 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-bold disabled:opacity-50 transition-colors shadow-lg shadow-yellow-900/20">
                                    {eli5Loading ? <Loader2 className="animate-spin"/> : "Explain"}
                                </button>
                            </div>

                            {eli5Res && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 bg-zinc-900/80 border border-yellow-500/20 rounded-[2rem] shadow-2xl">
                                    <Sparkles className="text-yellow-500 mb-6 h-8 w-8" />
                                    <p className="text-xl leading-relaxed text-zinc-100 font-medium">{eli5Res}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </main>
    </div>
  );
}

// --- 4. EXPORT WRAPPED IN SUSPENSE ---

export default function StudyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-600">
        <Loader2 className="animate-spin mr-2" /> Loading Laboratory...
      </div>
    }>
      <StudyLogic />
    </Suspense>
  );
}