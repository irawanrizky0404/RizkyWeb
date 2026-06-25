"use client";

import { useState, useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    onChange(newText);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleAiContinue = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      // We will repurpose the journal AI by passing the current text as the topic, asking it to continue
      const res = await fetch("/api/admin/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `Continue writing this article, seamlessly blending from the last sentence:\n\n${value}` }),
      });
      const data = await res.json();
      if (data.content) {
        onChange(value + "\n\n" + data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-rule flex flex-col group focus-within:border-signal transition-colors">
      <div className="flex items-center gap-1 border-b border-rule px-2 py-2 bg-black/50 overflow-x-auto">
        <button 
          type="button" 
          onClick={() => insertText("**", "**")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70"
          style={{ fontSize: "0.6rem" }}
          title="Bold"
        >
          B
        </button>
        <button 
          type="button" 
          onClick={() => insertText("*", "*")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70 italic"
          style={{ fontSize: "0.6rem" }}
          title="Italic"
        >
          I
        </button>
        <div className="w-px h-3 bg-rule mx-1" />
        <button 
          type="button" 
          onClick={() => insertText("## ")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70 font-bold"
          style={{ fontSize: "0.6rem" }}
          title="Heading 2"
        >
          H2
        </button>
        <button 
          type="button" 
          onClick={() => insertText("### ")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70 font-bold"
          style={{ fontSize: "0.6rem" }}
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-3 bg-rule mx-1" />
        <button 
          type="button" 
          onClick={() => insertText("[", "](url)")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70"
          style={{ fontSize: "0.6rem" }}
          title="Link"
        >
          Link
        </button>
        <button 
          type="button" 
          onClick={() => insertText("```\n", "\n```")}
          className="px-2 py-1 hover:bg-white/10 transition-colors lab text-white/70"
          style={{ fontSize: "0.6rem" }}
          title="Code Block"
        >
          Code
        </button>
        
        <div className="flex-1" />
        
        <button 
          type="button" 
          onClick={handleAiContinue}
          disabled={loading || !value.trim()}
          className="px-3 py-1 bg-signal/10 hover:bg-signal/20 text-signal border border-signal/20 transition-colors lab disabled:opacity-50 flex items-center gap-2"
          style={{ fontSize: "0.55rem" }}
          title="AI Continue Writing"
        >
          {loading ? "..." : "✨ AI Continue"}
        </button>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent p-4 text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-0 resize-y min-h-[300px]"
        style={{ 
          fontFamily: "var(--font-mono)", 
          fontSize: "0.75rem",
          lineHeight: "1.6"
        }}
        placeholder={placeholder || "Write in Markdown..."}
      />
    </div>
  );
}
