'use client';

// 1. Core Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';

// 2. Icons & UI
import { useEffect, useState } from 'react';
import { 
  Sparkles, Loader2, Bold, Italic, 
  Heading2, Highlighter, List, X, 
  PenTool, Wand2, Code2, CheckCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 👇 FIX 1: Add 'texture' to the Interface
interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  texture?: 'none' | 'grid' | 'dots' | 'lined'; // <--- ADD THIS
}

// 👇 FIX 2: Receive 'texture' in the component arguments
export default function Editor({ content, onChange, editable = true, texture = 'none' }: EditorProps) {
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing...",
      }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        // 👇 FIX 3: Use the 'texture' variable here
        class: `prose prose-zinc prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] selection:bg-purple-500/30 font-hand text-xl leading-relaxed px-4 py-8 texture-${texture}`,
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      setIsSelectionActive(from !== to);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // --- CRASH FIX ---
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (Math.abs(content.length - editor.getHTML().length) > 10) {
        setTimeout(() => {
           if (!editor.isDestroyed) {
             editor.commands.setContent(content);
           }
        }, 0);
      }
    }
  }, [content, editor]);

  // --- AI HANDLERS ---
  const handleAiAction = async (mode: 'organize' | 'auto-format' | 'grammar') => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText) return;
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode: mode }),
      });
      const data = await response.json();
      if (data.result) {
        editor.chain().focus().insertContentAt({ from, to }, data.result).run();
        setIsSelectionActive(false); 
      }
    } catch (error) {
      console.error(error);
      alert("AI Action Failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleContinueWriting = async () => {
    if (!editor) return;
    setIsAiLoading(true);
    const textContext = editor.getText().slice(-1000);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContext, mode: 'continue' }),
      });
      const data = await response.json();

      if (data.result) {
        editor.chain().focus().insertContent(" " + data.result).scrollIntoView().run();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="relative w-full pb-24">
      <EditorContent editor={editor} />

      <AnimatePresence mode="wait">
        {isSelectionActive ? (
          <motion.div 
            key="edit-dock"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl backdrop-blur-md w-56"
          >
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Actions</span>
                <button 
                    onClick={() => {
                        editor.commands.setTextSelection(editor.state.selection.anchor);
                        setIsSelectionActive(false);
                    }}
                    className="text-zinc-500 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-2 mb-3">
                <button
                    onClick={() => handleAiAction('auto-format')}
                    disabled={isAiLoading}
                    className="flex items-center gap-3 w-full px-3 py-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 hover:from-purple-900 hover:to-blue-900 border border-purple-500/20 rounded-lg text-xs font-bold text-zinc-200 transition-all text-left"
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14} className="text-purple-400"/>}
                    Beautify Note
                </button>
                <button
                    onClick={() => handleAiAction('grammar')}
                    disabled={isAiLoading}
                    className="flex items-center gap-3 w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-all text-left"
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin"/> : <CheckCheck size={14} className="text-green-400"/>}
                    Fix Grammar
                </button>
                 <button
                    onClick={() => handleAiAction('organize')}
                    disabled={isAiLoading}
                    className="flex items-center gap-3 w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-all text-left"
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} className="text-yellow-400"/>}
                    Organize
                </button>
            </div>

            <div className="h-[1px] bg-zinc-800 w-full mb-2" />

            <div className="grid grid-cols-3 gap-2">
                <DockBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} />
                <DockBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} />
                <DockBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={Highlighter} />
                <DockBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} />
                <DockBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} />
                <DockBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={Code2} />
            </div>

          </motion.div>
        ) : (
          <motion.button
            key="ghostwriter"
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleContinueWriting}
            disabled={isAiLoading}
            className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-full shadow-2xl hover:bg-zinc-800 hover:scale-105 transition-all group"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin text-purple-400"/> : <PenTool size={18} className="text-purple-400 group-hover:text-white transition-colors"/>}
            <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                {isAiLoading ? "Writing..." : "Continue"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function DockBtn({ onClick, active, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                active 
                ? 'bg-zinc-700 text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
        >
            <Icon size={16} />
        </button>
    )
}