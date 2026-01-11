'use client';

import { useState, useEffect } from "react";
import { 
  Brain, GraduationCap, Zap, MessageSquare, 
  ChevronLeft, Send, Sparkles, Loader2, 
  CheckCircle2, XCircle, ArrowRight, BookOpen, Briefcase
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import NeuralBackground from "@/components/NeuralBackground";
import { useSearchParams } from "next/navigation"; // 燥 IMPORT

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'quiz' | 'eli5' | 'interview'>('hub');
  const [notesContext, setNotesContext] = useState("");
  const [loading, setLoading] = useState(true);

  // --- STATES ---
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
  const noteId = searchParams.get('id'); // 燥 GET ID

  // 🛠️ HELPER: Safe JSON Parser (Fixes the crash)
  const safeJSONParse = (input: string) => {
    try {
      // 1. Remove Markdown code blocks (```json ... ```)
      let clean = input.replace(/```json/g, '').replace(/```/g, '');
      
      // 2. Find the first '{' and last '}' to strip conversational text
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

  useEffect(() => {
    async function loadNotes() {
      try {
        let context = "";

        if (noteId) {
             // 燥 CASE 1: Fetch SPECIFIC Note (with content)
             const res = await fetch(`/api/notes?id=${noteId}`);
             const note = await res.json();
             context = `TITLE: ${note.title}\n${note.content}`;
        } else {
             // 燥 CASE 2: No ID? Fetch Latest Note (with content)
             // Step A: Get list
             const resList = await fetch('/api/notes');
             const data = await resList.json();
             
             if (data.length > 0) {
                 // Step B: Get content of the FIRST note in list
                 const resNote = await fetch(`/api/notes?id=${data[0]._id}`);
                 const note = await resNote.json();
                 context = `TITLE: ${note.title}\n${note.content}`;
             } else {
                 context = "No notes found.";
             }
        }
        
        setNotesContext(context);
        setLoading(false);
      } catch (e) { console.error(e); }
    }
    loadNotes();
  }, [noteId]);

  // --- LOGIC ---

  // 1. QUIZ
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

  // 2. INTERVIEW
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

  // 3. ELI5
  const handleEli5 = async () => {
    setEli5Loading(true);
    try {
        const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ text: eli5Input, mode: 'eli5' }) });
        const data = await res.json();
        setEli5Res(data.result);
    } finally { setEli5Loading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex overflow-hidden selection:bg-purple-500/30">
        <NeuralBackground />

        {/* --- LEFT SIDEBAR NAVIGATION --- */}
        <motion.aside 
            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-20 lg:w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl flex flex-col justify-between z-20"
        >
            <div>
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                    <Link href="/notes" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors"><ChevronLeft size={18} /></div>
                        <span className="hidden lg:block font-bold text-sm">Back to Notes</span>
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
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20">
                    <div className="text-xs font-bold text-purple-400 mb-1">BRAIN STATUS</div>
                    <div className="text-xs text-zinc-400">{loading ? "Syncing..." : "Online & Ready"}</div>
                </div>
            </div>
        </motion.aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar p-6 lg:p-12">
            
            <AnimatePresence mode="wait">
                
                {/* 1. HUB (BENTO GRID) */}
                {activeTab === 'hub' && (
                    <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
                        <header className="mb-12">
                            <h1 className="text-4xl font-bold text-white mb-2">Study Laboratory</h1>
                            <p className="text-zinc-500 text-lg">Select a specialized AI agent to begin your session.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <BentoCard 
                                title="Active Recall Quiz" 
                                desc="The AI generates hard questions based on your notes to test your memory."
                                icon={GraduationCap} color="text-purple-400" bg="from-purple-500/10"
                                onClick={() => setActiveTab('quiz')}
                            />
                            <BentoCard 
                                title="Interview Simulator" 
                                desc="A harsh hiring manager that grades your answers on a 0-100 scale."
                                icon={Briefcase} color="text-blue-400" bg="from-blue-500/10"
                                onClick={() => setActiveTab('interview')}
                            />
                            <BentoCard 
                                title="ELI5 Explainer" 
                                desc="Break down complex topics into simple analogies (LEGOs, Pizza)."
                                icon={Zap} color="text-yellow-400" bg="from-yellow-500/10"
                                onClick={() => setActiveTab('eli5')}
                            />
                        </div>
                    </motion.div>
                )}

                {/* 2. QUIZ MODE */}
                {activeTab === 'quiz' && (
                    <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto">
                        <Header title="Active Recall Quiz" desc="Challenge your knowledge retention." icon={GraduationCap} color="text-purple-400" />
                        
                        {!quizQ ? (
                            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/50 border border-white/5 rounded-3xl">
                                <button onClick={generateQuiz} disabled={quizLoading} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                    {quizLoading ? <Loader2 className="animate-spin"/> : <Brain />} Generate Question
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"/>
                                    <h3 className="text-xl font-medium text-white leading-relaxed">{quizQ}</h3>
                                </div>

                                {!quizRes && (
                                    <>
                                        <textarea value={quizAns} onChange={(e) => setQuizAns(e.target.value)} placeholder="Type your answer..." className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg focus:border-purple-500/50 outline-none resize-none transition-colors" />
                                        <div className="flex justify-end">
                                            <button onClick={submitQuiz} disabled={!quizAns || quizLoading} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                                                {quizLoading ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Submit
                                            </button>
                                        </div>
                                    </>
                                )}

                                {quizRes && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <div className="flex items-center gap-4 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                                            <div className={`text-4xl font-bold ${quizRes.score > 70 ? 'text-green-400' : 'text-red-400'}`}>{quizRes.score}</div>
                                            <div className="h-10 w-px bg-white/10"/>
                                            <div className="text-sm text-zinc-400">{quizRes.feedback}</div>
                                        </div>
                                        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Model Answer</div>
                                            <p className="text-zinc-300">{quizRes.correct_answer}</p>
                                        </div>
                                        <button onClick={generateQuiz} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">Next Question</button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 3. INTERVIEW MODE */}
                {activeTab === 'interview' && (
                    <motion.div key="interview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto">
                        <Header title="Interview Simulator" desc="Technical & Behavioral Prep." icon={Briefcase} color="text-blue-400" />
                        
                        {!intQ ? (
                            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/50 border border-white/5 rounded-3xl">
                                <button onClick={generateInterview} disabled={intLoading} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                    {intLoading ? <Loader2 className="animate-spin"/> : <Briefcase />} Start Mock Interview
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"/>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">Hiring Manager asks:</span>
                                    <h3 className="text-xl font-medium text-white leading-relaxed">"{intQ}"</h3>
                                </div>

                                {!intRes && (
                                    <>
                                        <textarea value={intAns} onChange={(e) => setIntAns(e.target.value)} placeholder="Draft your response here..." className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg focus:border-blue-500/50 outline-none resize-none transition-colors" />
                                        <div className="flex justify-end">
                                            <button onClick={submitInterview} disabled={!intAns || intLoading} className="px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                                                {intLoading ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Submit for Review
                                            </button>
                                        </div>
                                    </>
                                )}

                                {intRes && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <div className={`p-6 rounded-2xl border ${intRes.rating?.includes('Strong') ? 'bg-green-900/20 border-green-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                                            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Verdict</div>
                                            <div className="text-3xl font-bold mt-1">{intRes.rating}</div>
                                            <div className="mt-4 text-zinc-300">{intRes.feedback}</div>
                                        </div>
                                        
                                        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Better Answer</div>
                                            <p className="text-zinc-300">{intRes.better_answer}</p>
                                        </div>
                                        
                                        <button onClick={generateInterview} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">Next Question</button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 4. ELI5 MODE */}
                {activeTab === 'eli5' && (
                    <motion.div key="eli5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto">
                        <Header title="ELI5 Explainer" desc="Simplify complex topics instantly." icon={Zap} color="text-yellow-400" />
                        
                        <div className="flex gap-3 mb-8">
                            <input value={eli5Input} onChange={(e) => setEli5Input(e.target.value)} placeholder="Enter a confusing topic..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-lg focus:border-yellow-500 outline-none" />
                            <button onClick={handleEli5} disabled={eli5Loading || !eli5Input} className="px-8 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-bold disabled:opacity-50 transition-colors">
                                {eli5Loading ? <Loader2 className="animate-spin"/> : "Explain"}
                            </button>
                        </div>

                        {eli5Res && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-zinc-900/80 border border-yellow-500/20 rounded-3xl shadow-2xl">
                                <Sparkles className="text-yellow-500 mb-4 h-8 w-8" />
                                <p className="text-xl leading-relaxed font-hand text-zinc-100">{eli5Res}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function NavBtn({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium ${
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
        <button onClick={onClick} className="group relative p-8 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-3xl text-left transition-all hover:scale-[1.02] shadow-xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-black border border-white/10 ${color}`}>
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="text-zinc-400" />
            </div>
        </button>
    )
}

function Header({ title, desc, icon: Icon, color }: any) {
    return (
        <header className="flex items-center gap-4 mb-10">
            <div className={`p-3 rounded-2xl bg-zinc-900 border border-white/10 ${color}`}>
                <Icon size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-zinc-500">{desc}</p>
            </div>
        </header>
    )
}