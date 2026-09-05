import React from 'react';
import { Search, History, Layers, FileText, Image, Terminal } from 'lucide-react';
import { TOTAL_TOOLS_COUNT } from './CategoryNav';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

export function Header({ activeTab, setActiveTab, onOpenCommandPalette }: HeaderProps) {
  const navTabs = [
    { id: 'grid', label: `All ${TOTAL_TOOLS_COUNT} Tools`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'image', label: 'Image Studio', icon: <Image className="w-3.5 h-3.5" /> },
    { id: 'pdf', label: 'PDF Suite', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Text & Dev', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/90 sticky top-0 z-30 shadow-2xl">
      {/* Top micro-gradient indicator bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Brand Logo & Title */}
          <div
            onClick={() => setActiveTab('grid')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {/* Official Brand Logo */}
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
              <img
                src="https://res.cloudinary.com/dtz0urit6/image/upload/q_auto:best,f_png/cloudinary-tools-uploads/zp7k1fzjhpxtd4hyyaar"
                alt="InstaImagetools Logo"
                className="w-8 h-8 object-contain rounded-lg"
                loading="eager"
                decoding="async"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <span id="brand-title" className="text-base sm:text-lg font-black text-white tracking-tight font-sans">
                  InstaImage<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">tools</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 -mt-0.5 tracking-wider hidden sm:block">
                CLIENT-SIDE ENGINE
              </span>
            </div>
          </div>

          {/* Center Search / CMD+K trigger */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs text-slate-400 transition-all duration-200 shadow-inner group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                <span>Search {TOTAL_TOOLS_COUNT}+ tools...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Nav Tabs & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search button on mobile */}
            <button
              onClick={onOpenCommandPalette}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Search tools (CMD+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                  : 'text-slate-400 bg-slate-900/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
