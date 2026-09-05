import React, { useEffect, useState, useRef } from 'react';
import { Search, X, Command, ArrowRight, CornerDownLeft, Sparkles, Zap, History, ExternalLink } from 'lucide-react';
import { ToolItem, TOOLS_LIST, getToolIcon } from '../data/tools';
import { TOTAL_TOOLS_COUNT } from './CategoryNav';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
  onOpenHistory: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectTool, onOpenHistory }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter tools based on query and category
  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;
    
    const matchesName = tool.name.toLowerCase().includes(q);
    const matchesDesc = tool.description.toLowerCase().includes(q);
    const matchesBadge = tool.badge?.toLowerCase().includes(q);
    const matchesCat = tool.categoryLabel.toLowerCase().includes(q);

    return matchesCategory && (matchesName || matchesDesc || matchesBadge || matchesCat);
  });

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTools.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          onSelectTool(filteredTools[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onSelectTool, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container with Glassmorphism & Gradient Glow Border */}
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.25)] backdrop-blur-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Top ambient accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />

        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TOTAL_TOOLS_COUNT}+ tools by name, action, or format (e.g. compress, merge, json, webp)...`}
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 text-xs font-mono transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Category Quick Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase tracking-wider shrink-0">Filter:</span>
          {[
            { id: 'all', label: `All Tools (${TOTAL_TOOLS_COUNT})` },
            { id: 'image', label: 'Image Studio' },
            { id: 'pdf', label: 'PDF Suite' },
            { id: 'text', label: 'Text & Dev' },
            { id: 'vector', label: 'Canvas & Vectors' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[380px] scrollbar-thin scrollbar-thumb-slate-700">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-400">No tools found matching "{query}"</p>
              <p className="text-xs text-slate-600 mt-1">Try searching for "PDF", "Image", "Base64", "Crop", or "JSON"</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  data-active={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    onSelectTool(tool);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-950/60 to-cyan-950/40 border border-cyan-500/40 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/40 hover:bg-slate-800/40 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/30'
                          : 'bg-slate-800/80 text-cyan-400 border border-slate-700/60'
                      }`}
                    >
                      {getToolIcon(tool.iconName, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700/80 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                        {tool.popular && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                      {tool.categoryLabel}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-opacity ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 opacity-100' : 'opacity-0'
                      }`}
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts & quick actions */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↵</kbd>
              <span>to open</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onOpenHistory();
                onClose();
              }}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <History className="w-3 h-3" /> Recent Activity
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400 font-mono">100% In-Browser Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
