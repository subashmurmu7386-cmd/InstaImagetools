import React, { useState } from 'react';
import { Search, Sparkles, ArrowUpRight, Zap, Shield, Flame, Check, SlidersHorizontal } from 'lucide-react';
import { ToolItem, TOOLS_LIST, CATEGORIES, getToolIcon } from '../data/tools';
import { TOTAL_TOOLS_COUNT } from './CategoryNav';
import { AdsterraBanner } from './ads/AdsterraBanner';
import { AdsterraNative } from './ads/AdsterraNative';

interface ToolsGridProps {
  onSelectTool: (tool: ToolItem) => void;
  onOpenCommandPalette: () => void;
}

export function ToolsGrid({ onSelectTool, onOpenCommandPalette }: ToolsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular'>('all');

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'popular' && tool.popular);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory && matchesFilter;

    const matchesName = tool.name.toLowerCase().includes(q);
    const matchesDesc = tool.description.toLowerCase().includes(q);
    const matchesBadge = tool.badge?.toLowerCase().includes(q);
    const matchesCat = tool.categoryLabel.toLowerCase().includes(q);

    return matchesCategory && matchesFilter && (matchesName || matchesDesc || matchesBadge || matchesCat);
  });

  // Group by category when viewing 'all' and no search query
  const shouldShowGrouped = selectedCategory === 'all' && !searchQuery.trim() && activeFilter === 'all';

  return (
    <div className="space-y-10">
      {/* TOP HERO AD (Banner Component) - Directly below top navigation tabs and above main Hero section */}
      <AdsterraBanner
        format="728x90"
        position="top-hero"
        title="Featured Partner Advertisement"
        className="mb-2"
      />

      {/* Hero Section with Glassmorphic Ambient Backlight */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-slate-800/90 bg-slate-900/40 backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.12)]">
        {/* Ambient radial gradient orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-violet-500/30 text-slate-300 text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">
              Zero-Server • 100% Client-Side Private Processing
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Next-Gen Web Utilities{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300">
              at Warp Speed.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Over {TOTAL_TOOLS_COUNT}+ precision tools for high-fidelity image compression, PDF manipulation, developer transforms, encoding, and offline web utilities — strictly processed in your browser memory.
          </p>

          {/* Interactive Search & CMD+K Trigger Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div
              onClick={onOpenCommandPalette}
              className="group relative flex items-center justify-between p-2 pl-4 bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl cursor-pointer shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
              <div className="flex items-center gap-3 text-slate-400">
                <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-slate-400 font-sans">
                  Search any tool (e.g. compress, merge PDF, JSON, QR)...
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-300 text-xs font-mono shadow-sm">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Trust stats pill indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{TOTAL_TOOLS_COUNT}+ Real-Time Tools</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span>0 KB Uploaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>WebAssembly Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Category Controls Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/25 border border-cyan-400/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Popular filter & instant inline search */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveFilter(activeFilter === 'popular' ? 'all' : 'popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activeFilter === 'popular'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Popular Only</span>
          </button>

          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter grid..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grouped Layout (when viewing all categories) */}
      {shouldShowGrouped ? (
        <div className="space-y-12">
          {[
            { id: 'image', label: 'Image Studio & Processing', desc: 'Client-side compression, format transcoding, aspect cropping & filters' },
            { id: 'pdf', label: 'PDF Suite & Document Tools', desc: 'Visual PDF.js previewer, merging, extraction, and formatting' },
            { id: 'text', label: 'Text Content & Developer Utilities', desc: 'JSON linters, cryptographic hashes, QR codes, and Base64 engines' },
            { id: 'vector', label: 'Canvas & Vector Studio', desc: 'Interactive drawing canvas, CSS gradients, and SVG sanitizers' },
          ].map((section) => {
            const sectionTools = TOOLS_LIST.filter((t) => t.category === section.id);
            return (
              <div key={section.id} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                      {section.label}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{section.desc}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(section.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    View All ({sectionTools.length}) →
                  </button>
                </div>

                {/* Multi-Column Grid with Native Ad inserted */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sectionTools.map((tool, toolIdx) => (
                    <React.Fragment key={tool.id}>
                      <ToolCard tool={tool} onSelect={() => onSelectTool(tool)} />
                      {/* Native Ad inside Tool Selection Grid between tool cards */}
                      {section.id === 'image' && toolIdx === 2 && (
                        <AdsterraNative
                          layout="card"
                          position="grid-image-card"
                          sponsorName="CloudImage Optimizer"
                          headline="Lossless Cloud Media CDN"
                          description="Real-time WebP & AVIF transcoding with lightning fast edge cache delivery."
                          ctaText="Explore CDN"
                        />
                      )}
                      {section.id === 'pdf' && toolIdx === 2 && (
                        <AdsterraNative
                          layout="card"
                          position="grid-pdf-card"
                          sponsorName="DocumentFlow Enterprise"
                          headline="Automated PDF Cloud OCR"
                          description="High-precision OCR table extraction and automated cloud archiving APIs."
                          ctaText="Free API Key"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Native Banner Ad placed directly between Image Studio and PDF Suite sections */}
                {section.id === 'image' && (
                  <div className="pt-6 pb-2">
                    <AdsterraNative
                      layout="workspace"
                      position="between-image-and-pdf-suites"
                      sponsorName="Developer Cloud Edge"
                      headline="Global High-Performance Edge Computing & Storage"
                      description="Deploy client-side web apps, media assets, and serverless compute at the edge with zero cold starts."
                      ctaText="Start Free Trial"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Filtered Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong className="text-slate-200">{filteredTools.length}</strong> matching tools</span>
            {selectedCategory !== 'all' && (
              <button onClick={() => setSelectedCategory('all')} className="text-cyan-400 hover:text-cyan-300">
                Reset Category
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool, idx) => (
              <React.Fragment key={tool.id}>
                <ToolCard tool={tool} onSelect={() => onSelectTool(tool)} />
                {idx === 3 && (
                  <AdsterraNative
                    layout="card"
                    position="filtered-grid-native"
                    sponsorName="UltraTools Cloud"
                    headline="Enterprise Developer Toolkit"
                    description="Automated media transforms, secure cryptography, and developer cloud APIs."
                    ctaText="Learn More"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, onSelect }: { key?: React.Key; tool: ToolItem; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="group relative bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-0.5"
    >
      {/* Top subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top bar: Icon & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-cyan-500 transition-all duration-300 shadow-md">
            {getToolIcon(tool.iconName, 'w-5 h-5')}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.popular && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Popular
              </span>
            )}
            {tool.badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 group-hover:text-cyan-300 border border-slate-800 transition-colors">
                {tool.badge}
              </span>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5 transition-colors">
            {tool.name}
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-300">
          {tool.categoryLabel}
        </span>
        <span className="text-cyan-400/80 group-hover:text-cyan-300 font-semibold group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
          Launch Tool →
        </span>
      </div>
    </div>
  );
}
