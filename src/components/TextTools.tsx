import React, { useState } from 'react';
import { Copy, Type, Hash, AlignLeft, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { AdSpace } from './AdSpace';
import { addHistory } from '../lib/history';

export function TextTools() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Stats
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? (text.match(/[.!?]+[\s]*|[\n]+/g) || []).length + 1 : 0; // Rough estimation
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0;
  const readingTime = Math.ceil(words / 200); // 200 words per minute avg

  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    addHistory({
      toolName: 'Text Content Tool',
      details: `Copied ${words} words (${chars} chars)`,
      actionType: 'copy',
      actionData: text
    });
  };

  const handleClear = () => setText('');

  // Case Conversions
  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(
      text.toLowerCase().replace(/(?:^|\s|-|\/)\w/g, (match) => match.toUpperCase())
    );
  };
  const toSentenceCase = () => {
    setText(
      text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase())
    );
  };

  // Utilities
  const removeDuplicateLines = () => {
    const lines = text.split('\n');
    const uniqueLines = [...new Set(lines)];
    setText(uniqueLines.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatBox icon={<AlignLeft className="w-4 h-4 text-indigo-400" />} label="Words" value={words} />
        <StatBox icon={<Type className="w-4 h-4 text-purple-400" />} label="Chars" value={chars} />
        <StatBox icon={<Hash className="w-4 h-4 text-emerald-400" />} label="Chars (No Space)" value={charsNoSpaces} />
        <StatBox icon={<AlignLeft className="w-4 h-4 text-amber-400" />} label="Sentences" value={text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0} />
        <StatBox icon={<AlignLeft className="w-4 h-4 text-rose-400" />} label="Paragraphs" value={paragraphs} />
        <StatBox icon={<Clock className="w-4 h-4 text-teal-400" />} label="Reading Time" value={`${readingTime} min`} />
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800/50 p-2 flex flex-wrap gap-2">
          <ToolButton onClick={toUpperCase}>UPPERCASE</ToolButton>
          <ToolButton onClick={toLowerCase}>lowercase</ToolButton>
          <ToolButton onClick={toTitleCase}>Title Case</ToolButton>
          <ToolButton onClick={toSentenceCase}>Sentence Case</ToolButton>
          <div className="w-px h-6 bg-slate-700 mx-2 self-center hidden sm:block"></div>
          <ToolButton onClick={removeDuplicateLines}>Remove Duplicate Lines</ToolButton>
        </div>

        <div className="relative">
          <textarea
            className="w-full h-96 p-4 resize-y bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-600 font-mono text-sm leading-relaxed"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
        
        <div className="border-t border-slate-700 bg-slate-800/50 p-4 flex justify-between items-center">
          <button
            onClick={handleClear}
            className="text-slate-500 hover:text-rose-400 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
              copied ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>

      <AdSpace type="native" />
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex flex-col">
      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
        {icon} <span>{label}</span>
      </div>
      <span className="text-2xl font-bold text-slate-100">{value}</span>
    </div>
  );
}

function ToolButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 hover:text-indigo-400 transition-colors"
    >
      {children}
    </button>
  );
}
