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
  Heading2, Highlighter, List, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] selection:bg-purple-500/30 font-serif leading-relaxed px-4 py-8',
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

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (Math.abs(content.length - editor.getHTML().length) > 10) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const handleMagicFix = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText) return;
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode: 'organize' }),
      });
      const data = await response.json();
      if (data.result) {
        editor.chain().focus().insertContentAt({ from, to }, data.result).run();
        setIsSelectionActive(false); 
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
      
      {/* --- THE EDITOR --- */}
      <EditorContent editor={editor} />

      {/* --- MAGIC FLOATING DOCK (Bottom Right) --- */}
      <AnimatePresence>
        {isSelectionActive && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}   // Slide in from right
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl backdrop-blur-md w-48"
          >
            {/* 1. Header with Close Button */}
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Selection</span>
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

            {/* 2. BIG AI BUTTON */}
            <button
                onClick={handleMagicFix}
                disabled={isAiLoading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all shadow-lg mb-2"
            >
                {isAiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />}
                {isAiLoading ? "Organizing..." : "AI Organize"}
            </button>

            <div className="h-[1px] bg-zinc-800 w-full mb-2" />

            {/* 3. FORMATTING GRID */}
            <div className="grid grid-cols-4 gap-2">
                <DockBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} />
                <DockBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} />
                <DockBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={Highlighter} />
                <DockBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} />
                <DockBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper for Dock Buttons
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