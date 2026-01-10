'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🎙️ VOICE STATE
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- SPEECH RECOGNITION SETUP ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        
        if (!SpeechRecognition) {
            setSpeechError("Browser not supported (Use Chrome/Edge)");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError(null);
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            // Auto-submit after a short pause for better UX
            setTimeout(() => handleAsk(transcript), 500); 
        };

        recognition.onend = () => setIsListening(false);
        
        recognition.onerror = (event: any) => {
            console.error("Speech API Error:", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setSpeechError("Microphone access blocked.");
            } else if (event.error === 'no-speech') {
                setSpeechError("Didn't hear anything.");
            } else {
                setSpeechError("Voice error. Try again.");
            }
        };

        recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Your browser does not support Voice to Text. Please use Google Chrome.");
        return;
    }

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        try {
            recognitionRef.current.start();
        } catch (err) {
            // Sometimes it throws if already started
            console.warn("Mic already active");
        }
    }
  };

  const handleAsk = async (manualQuery?: string) => {
    const textToSend = manualQuery || query;
    if (!textToSend.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setQuery("");
    setSpeechError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || "I couldn't process that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't reach your brain database." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. TOGGLE BUTTON */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button 
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 left-8 z-50 p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
            >
                <MessageSquare size={24} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold">Ask AI</span>
            </motion.button>
        )}
      </AnimatePresence>

      {/* 2. CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-8 z-50 w-[400px] h-[600px] max-h-[80vh] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg"><Bot size={18} className="text-purple-400" /></div>
                <div>
                    <div className="font-bold text-sm text-white">Interview Assistant</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}/> 
                        {isListening ? "Listening..." : "Online"}
                    </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={18}/></button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-3 opacity-60">
                   <div className={`p-4 rounded-full bg-zinc-900 ${isListening ? 'animate-pulse ring-2 ring-red-500/50' : ''}`}>
                        <Mic size={32} className={isListening ? "text-red-500" : "text-zinc-600"} />
                   </div>
                   <p className="text-sm">Click the Mic.<br/>I will listen and fetch answers from your notes.</p>
                 </div>
               )}
               
               {messages.map((m, i) => (
                 <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700'}`}>
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                 </div>
               ))}
               
               {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-zinc-800 px-4 py-2 rounded-full flex gap-1 items-center border border-zinc-700">
                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                     <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                   </div>
                 </div>
               )}
            </div>
            
            {/* Error Message Display */}
            {speechError && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={12} /> {speechError}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-purple-500/50 transition-colors rounded-xl px-2 py-2">
                
                {/* 🎤 MICROPHONE BUTTON */}
                <button 
                    onClick={toggleListening}
                    className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder={isListening ? "Listening..." : "Ask or speak..."} 
                  className="bg-transparent outline-none text-sm text-white w-full placeholder:text-zinc-600 h-9"
                />
                
                <button 
                    onClick={() => handleAsk()} 
                    disabled={isLoading || !query.trim()} 
                    className={`p-2 transition-colors ${query.trim() ? 'text-purple-400 hover:text-white' : 'text-zinc-700 cursor-not-allowed'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}