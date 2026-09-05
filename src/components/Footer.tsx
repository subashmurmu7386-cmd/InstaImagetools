import React from 'react';
import { Shield, Sparkles, Terminal, CheckCircle2, Lock, Cpu, Globe, Heart } from 'lucide-react';
import { TOTAL_TOOLS_COUNT } from './CategoryNav';
import { AdsterraBanner } from './ads/AdsterraBanner';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onOpenCommandPalette?: () => void;
}

export function Footer({ onSelectCategory, onOpenCommandPalette }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 text-slate-400 font-sans text-xs">
      {/* BOTTOM FOOTER AD (Banner Component) - Placed directly above the footer privacy badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <AdsterraBanner
          format="728x90"
          position="bottom-footer"
          title="Sponsored Partner Showcase"
        />
      </div>

      {/* Top Value / Trust Highlight Banner */}
      <div className="border-b border-slate-900 bg-slate-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">100% In-Browser Privacy</h4>
              <p className="text-slate-500 text-[11px]">Your images, PDFs, and data never leave your browser device.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">WebAssembly Accelerated</h4>
              <p className="text-slate-500 text-[11px]">Sub-second conversion and lossless compression algorithms.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Free & Offline Capable</h4>
              <p className="text-slate-500 text-[11px]">Installable PWA works even with spotty or zero network connectivity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center font-bold text-cyan-400 text-xs">
                  ⚡
                </div>
              </div>
              <span className="font-bold text-slate-100 text-sm">InstaImage<span className="text-cyan-400">tools</span></span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-sm">
              An all-in-one suite of modern, privacy-focused client-side digital utilities for designers, photographers, developers, and students.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All {TOTAL_TOOLS_COUNT} Client Engines Online</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Image Tools</h5>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><button onClick={() => onSelectCategory?.('image')} className="hover:text-cyan-400 transition-colors">Image Compressor</button></li>
              <li><button onClick={() => onSelectCategory?.('image')} className="hover:text-cyan-400 transition-colors">Smart Resizer</button></li>
              <li><button onClick={() => onSelectCategory?.('image')} className="hover:text-cyan-400 transition-colors">Format Converter (WebP)</button></li>
              <li><button onClick={() => onSelectCategory?.('image')} className="hover:text-cyan-400 transition-colors">Bulk Batch Processor</button></li>
              <li><button onClick={() => onSelectCategory?.('image')} className="hover:text-cyan-400 transition-colors">Palette Extractor</button></li>
            </ul>
          </div>

          {/* PDF Suite */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">PDF Suite</h5>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><button onClick={() => onSelectCategory?.('pdf')} className="hover:text-cyan-400 transition-colors">Merge PDF Documents</button></li>
              <li><button onClick={() => onSelectCategory?.('pdf')} className="hover:text-cyan-400 transition-colors">Visual PDF Splitter</button></li>
              <li><button onClick={() => onSelectCategory?.('pdf')} className="hover:text-cyan-400 transition-colors">Images to Multi-Page PDF</button></li>
              <li><button onClick={() => onSelectCategory?.('pdf')} className="hover:text-cyan-400 transition-colors">PDF Text Extractor</button></li>
              <li><button onClick={() => onSelectCategory?.('pdf')} className="hover:text-cyan-400 transition-colors">Visual Page Reorder</button></li>
            </ul>
          </div>

          {/* Developer Tools */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Developer Tools</h5>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><button onClick={() => onSelectCategory?.('text')} className="hover:text-cyan-400 transition-colors">JSON Formatter & Linter</button></li>
              <li><button onClick={() => onSelectCategory?.('text')} className="hover:text-cyan-400 transition-colors">Base64 Converter</button></li>
              <li><button onClick={() => onSelectCategory?.('text')} className="hover:text-cyan-400 transition-colors">Crypto Hash (SHA-256)</button></li>
              <li><button onClick={() => onSelectCategory?.('text')} className="hover:text-cyan-400 transition-colors">QR Code Studio</button></li>
              <li><button onClick={() => onSelectCategory?.('text')} className="hover:text-cyan-400 transition-colors">CSS Gradient Maker</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Keyboard Shortcut & Copyright */}
        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} InstaImagetools • Crafted with 100% Client-Side Privacy.</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenCommandPalette}
              className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <span>Command Palette</span>
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-cyan-400">⌘K</kbd>
            </button>
            <span>•</span>
            <span className="text-slate-500">No Analytics Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
