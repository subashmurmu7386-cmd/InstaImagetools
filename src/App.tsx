import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolsGrid } from './components/ToolsGrid';
import { ImageTools } from './components/ImageTools';
import { ImageStudioSuite } from './components/image-tools/ImageStudioSuite';
import { PdfStudioSuite } from './components/pdf-tools/PdfStudioSuite';
import { TextTools } from './components/TextTools';
import { HistoryTools } from './components/HistoryTools';
import { DeveloperTools } from './components/DeveloperTools';
import { CommandPalette } from './components/CommandPalette';
import { CategoryNav, TOOL_CATEGORIES } from './components/CategoryNav';
import { CategoryToolsView } from './components/CategoryToolsView';
import { AdsterraSocialBar } from './components/ads';
import { ToolItem } from './data/tools';
import { ArrowLeft, Sparkles, Layers, Image, FileText, Terminal, History, Grid, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('text');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [activeSubMode, setActiveSubMode] = useState<string | undefined>(undefined);
  const [activeToolName, setActiveToolName] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global CMD+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    const handleClipboardEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      const snippet = customEvent.detail?.text;
      const preview = snippet && snippet.length > 25 ? `${snippet.slice(0, 25)}...` : snippet;
      setToastMessage(preview ? `Copied: "${preview}"` : 'Copied to clipboard!');
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 1800);
      return () => clearTimeout(timer);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('app:clipboard_copied', handleClipboardEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app:clipboard_copied', handleClipboardEvent);
    };
  }, []);

  const handleSelectTool = (tool: ToolItem) => {
    setActiveToolName(tool.name);
    setActiveSubMode(tool.subMode);
    
    if (tool.actionTab === 'dev') {
      setActiveTab('text');
    } else {
      setActiveTab(tool.actionTab);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategoryObj = TOOL_CATEGORIES.find((c) => c.id === selectedCategory) || TOOL_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 pb-20 md:pb-0">
      {/* Global Adsterra Social Bar Ad Integration */}
      <AdsterraSocialBar />

      {/* Global Command Palette (CMD+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
        onOpenHistory={() => setActiveTab('history')}
      />

      {/* Header with Geometric Emblem and PWA Install */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Layout: Desktop Sidebar (>=768px) + Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full py-6 flex-grow flex gap-6">
        {/* Left Sidebar Category Navigation (Desktop/Tablet >=768px) */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb / Status Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab(activeTab === 'grid' ? 'category' : 'grid');
                  setActiveToolName(undefined);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all group cursor-pointer"
              >
                {activeTab === 'grid' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>View {TOOL_CATEGORIES.length} Category Suites</span>
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>View All Tools Grid</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Active View:</span>
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {activeTab === 'category' && `${activeCategoryObj.name} Category`}
                {activeTab === 'grid' && 'All Tools Grid'}
                {activeTab === 'image' && 'Image Studio'}
                {activeTab === 'pdf' && 'PDF Suite'}
                {activeTab === 'text' && 'Text & Developer Suite'}
                {activeTab === 'history' && 'Activity Logs & History'}
              </span>
            </div>
          </div>

          {/* Main View Switcher */}
          <div className="transition-all duration-300">
            {activeTab === 'category' && (
              <CategoryToolsView
                categoryId={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            )}

            {activeTab === 'grid' && (
              <ToolsGrid
                onSelectTool={handleSelectTool}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              />
            )}

            {activeTab === 'image' && <ImageStudioSuite />}
            {activeTab === 'pdf' && <PdfStudioSuite />}
            {activeTab === 'text' && <DeveloperTools initialSubMode={activeSubMode || 'json'} />}
            {activeTab === 'history' && <HistoryTools />}
          </div>
        </main>
      </div>

      {/* Streamlined Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveTab(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Global Subtle Copy Toast Notification */}
      {toastMessage && (
        <div
          id="global-copy-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 text-slate-100 text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md transition-all pointer-events-none"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

