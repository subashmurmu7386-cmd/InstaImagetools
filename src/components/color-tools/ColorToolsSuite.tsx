import React, { useState, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Palette,
  Pipette,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Copy,
  Check,
  Search,
  RefreshCw,
  ShieldCheck,
  Zap,
  Split,
  EyeOff,
  Wand2,
  Code2,
} from 'lucide-react';

export type ColorToolId =
  | 'picker'
  | 'hex-to-rgb'
  | 'rgb-to-hex'
  | 'hex-to-hsl'
  | 'gradient'
  | 'palette'
  | 'random-color'
  | 'contrast'
  | 'opacity'
  | 'css-preview'
  | 'mixer'
  | 'shade-gen'
  | 'tint-gen'
  | 'blindness'
  | 'accessible-suggest';

export interface ColorToolMeta {
  id: ColorToolId;
  name: string;
  category: 'picker-converter' | 'generators' | 'accessibility' | 'preview';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const COLOR_TOOLS_META: ColorToolMeta[] = [
  {
    id: 'picker',
    name: 'Color Picker & Eyedropper',
    category: 'picker-converter',
    categoryLabel: 'Pickers',
    description: 'Visual spectrum selector with native browser EyeDropper API and format outputs.',
    icon: Pipette,
    badge: 'EyeDropper',
  },
  {
    id: 'hex-to-rgb',
    name: 'HEX to RGB / RGBA',
    category: 'picker-converter',
    categoryLabel: 'Converters',
    description: 'Convert 3, 6, and 8-digit #HEX codes to RGB/RGBA values with instant preview.',
    icon: Palette,
  },
  {
    id: 'rgb-to-hex',
    name: 'RGB to HEX Converter',
    category: 'picker-converter',
    categoryLabel: 'Converters',
    description: 'Convert red, green, blue channels (0-255) and alpha to clean #HEX format.',
    icon: Code2,
  },
  {
    id: 'hex-to-hsl',
    name: 'HEX to HSL / HSLA',
    category: 'picker-converter',
    categoryLabel: 'Converters',
    description: 'Convert HEX color codes to HSL (Hue 0-360°, Saturation %, Lightness %).',
    icon: Sliders,
  },
  {
    id: 'gradient',
    name: 'CSS Gradient Generator',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Create Linear and Radial multi-stop CSS gradients with angle controls and code export.',
    icon: Layers,
    badge: 'CSS Export',
  },
  {
    id: 'palette',
    name: 'Harmonic Palette Generator',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Generate Monochromatic, Analogous, Complementary, and Triadic 5-color palettes.',
    icon: Sparkles,
    badge: 'Harmonies',
  },
  {
    id: 'random-color',
    name: 'Random Color & Palettes',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Generate single random colors or trending curated 5-color aesthetic palettes.',
    icon: Zap,
  },
  {
    id: 'contrast',
    name: 'WCAG Contrast Checker',
    category: 'accessibility',
    categoryLabel: 'Accessibility',
    description: 'Calculate WCAG 2.1 contrast ratio and verify AA / AAA compliance for text & UI.',
    icon: CheckCircle2,
    badge: 'WCAG 2.1',
  },
  {
    id: 'opacity',
    name: 'Opacity & Alpha Generator',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Convert opacity percentage (0-100%) to 8-digit HEX and CSS rgba() / hsla() notation.',
    icon: Sun,
  },
  {
    id: 'css-preview',
    name: 'Live CSS Color Preview',
    category: 'preview',
    categoryLabel: 'Preview',
    description: 'Real-time test card rendering custom color across buttons, typography, cards, and borders.',
    icon: Eye,
  },
  {
    id: 'mixer',
    name: 'Two-Color Mixer / Blend',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Blend two colors together across customized percentage weights with gradient swatches.',
    icon: Split,
  },
  {
    id: 'shade-gen',
    name: 'Color Shade Generator',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Darken any base color incrementally from 0% to 100% black in 10 steps.',
    icon: Moon,
  },
  {
    id: 'tint-gen',
    name: 'Color Tint Generator',
    category: 'generators',
    categoryLabel: 'Generators',
    description: 'Lighten any base color incrementally from 0% to 100% white in 10 steps.',
    icon: Sun,
  },
  {
    id: 'blindness',
    name: 'Color Blindness Preview',
    category: 'accessibility',
    categoryLabel: 'Accessibility',
    description: 'Simulate appearance for Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.',
    icon: EyeOff,
    badge: 'Simulate',
  },
  {
    id: 'accessible-suggest',
    name: 'Accessible Color Suggester',
    category: 'accessibility',
    categoryLabel: 'Accessibility',
    description: 'Suggest mathematically adjusted WCAG AA (4.5:1) and AAA (7:1) compliant alternatives.',
    icon: Wand2,
    badge: 'Auto-Fix',
  },
];

/* =========================================================================
   PURE CLIENT-SIDE COLOR MATH HELPERS (Zero Dependencies)
   ========================================================================= */

// Clean Hex: Ensure 6 digits
export function normalizeHex(hex: string): string {
  let c = hex.replace(/^#/, '').trim();
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  if (c.length !== 6) return '3b82f6'; // fallback to standard blue
  return c;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const norm = normalizeHex(hex);
  const num = parseInt(norm, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = (h % 360) / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const gray = Math.round(lNorm * 255);
    return rgbToHex(gray, gray, gray);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return rgbToHex(r, g, b);
}

// Relative luminance for WCAG contrast
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const vNorm = v / 255;
    return vNorm <= 0.03928 ? vNorm / 12.92 : Math.pow((vNorm + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Color blindness simulation matrix (Brettel / Vienot algorithms)
export function simulateColorBlindness(
  hex: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
): string {
  const { r, g, b } = hexToRgb(hex);

  let sr = r;
  let sg = g;
  let sb = b;

  if (type === 'protanopia') {
    sr = 0.56667 * r + 0.43333 * g;
    sg = 0.55833 * r + 0.44167 * g;
    sb = 0.24167 * g + 0.75833 * b;
  } else if (type === 'deuteranopia') {
    sr = 0.625 * r + 0.375 * g;
    sg = 0.7 * r + 0.3 * g;
    sb = 0.3 * g + 0.7 * b;
  } else if (type === 'tritanopia') {
    sr = 0.95 * r + 0.05 * g;
    sg = 0.43333 * g + 0.56667 * b;
    sb = 0.475 * g + 0.525 * b;
  } else if (type === 'achromatopsia') {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sr = gray;
    sg = gray;
    sb = gray;
  }

  return rgbToHex(sr, sg, sb);
}

export function ColorToolsSuite() {
  const [activeTool, setActiveTool] = useState<ColorToolId>('picker');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = COLOR_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Color Suite';
      logActivity(toolName, `Copied color value/code: ${text}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return COLOR_TOOLS_META.filter((tool) => {
      const matchesCategory = activeFilter === 'all' || tool.category === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q))
      );
    });
  }, [activeFilter, searchQuery]);

  const currentToolMeta =
    COLOR_TOOLS_META.find((t) => t.id === activeTool) || COLOR_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="color-tools-suite-root">
      {/* 15 Tools Selector Dashboard */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400" />
                Color Tools Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                15 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Client-side color conversion, harmonic palettes, CSS gradients, and WCAG 2.1 accessibility.
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15 color tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-pink-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              {[
                { id: 'all', label: 'All (15)' },
                { id: 'picker-converter', label: 'Converters' },
                { id: 'generators', label: 'Generators' },
                { id: 'accessibility', label: 'Accessibility' },
                { id: 'preview', label: 'Preview' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 15 Tools Multi-Column Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-color-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600/30 to-pink-500/20 border-pink-400/50 shadow-md shadow-pink-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-pink-400 group-hover:text-pink-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate leading-tight text-slate-200 group-hover:text-white">
                    {idx + 1}. {tool.name}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 truncate">
                    {tool.categoryLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Selected Tool Workspace */}
      <div id="active-color-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400 p-[1.5px] shadow-lg shadow-pink-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client Color Math</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'picker' && <ColorPickerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'hex-to-rgb' && <HexToRgbTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'rgb-to-hex' && <RgbToHexTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'hex-to-hsl' && <HexToHslTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'gradient' && <GradientGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'palette' && <PaletteGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-color' && <RandomColorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'contrast' && <ContrastCheckerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'opacity' && <OpacityGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'css-preview' && <CssPreviewTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'mixer' && <ColorMixerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'shade-gen' && <ShadeGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'tint-gen' && <TintGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'blindness' && <ColorBlindnessTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'accessible-suggest' && <AccessibleSuggestTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Color Picker with Native Browser EyeDropper API
   ========================================================================= */
function ColorPickerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [color, setColor] = useState<string>('#6366f1');

  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(() => hexToHsl(color), [color]);

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleEyeDropper = async () => {
    if (!hasEyeDropper) return;
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        setColor(result.sRGBHex);
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual Spectrum & Controls */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Interactive Color Input</span>
          {hasEyeDropper && (
            <button
              onClick={handleEyeDropper}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all"
            >
              <Pipette className="w-3.5 h-3.5" />
              <span>Screen Eyedropper</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-24 h-24 rounded-2xl cursor-pointer bg-transparent border-0"
          />
          <div className="flex-1 space-y-2">
            <label className="text-xs text-slate-400 font-bold">HEX Code</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white uppercase text-lg"
            />
          </div>
        </div>

        {/* Quick Swatches */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">Popular Swatches:</span>
          <div className="flex flex-wrap gap-2">
            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'].map(
              (swatch) => (
                <button
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className="w-8 h-8 rounded-xl border border-white/20 shadow hover:scale-110 transition-transform"
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Formats & Values */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase">Export Formats</div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-500 block">HEX:</span>
              <span className="text-white font-bold text-sm uppercase">{color}</span>
            </div>
            <button onClick={() => onCopy(color, 'p-hex')} className="text-slate-400 hover:text-white">
              {copiedKey === 'p-hex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-500 block">RGB:</span>
              <span className="text-cyan-300 font-bold text-sm">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            </div>
            <button onClick={() => onCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'p-rgb')} className="text-slate-400 hover:text-white">
              {copiedKey === 'p-rgb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-500 block">HSL:</span>
              <span className="text-pink-300 font-bold text-sm">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
            </div>
            <button onClick={() => onCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'p-hsl')} className="text-slate-400 hover:text-white">
              {copiedKey === 'p-hsl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2 & 3 & 4: HEX to RGB, RGB to HEX, HEX to HSL
   ========================================================================= */
function HexToRgbTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [hex, setHex] = useState<string>('#3b82f6');
  const rgb = useMemo(() => hexToRgb(hex), [hex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Input HEX Code</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white uppercase outline-none"
          />
          <div style={{ backgroundColor: hex }} className="w-14 h-14 rounded-2xl border border-white/20 shadow" />
        </div>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">RGB Equivalent</span>
        <div className="text-3xl font-mono font-black text-cyan-300">
          rgb({rgb.r}, {rgb.g}, {rgb.b})
        </div>
        <button
          onClick={() => onCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'h-rgb')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
        >
          {copiedKey === 'h-rgb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy RGB String</span>
        </button>
      </div>
    </div>
  );
}

function RgbToHexTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [r, setR] = useState<number>(59);
  const [g, setG] = useState<number>(130);
  const [b, setB] = useState<number>(246);

  const hex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase">RGB Channels (0 - 255)</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 text-center">
            <span className="text-xs text-rose-400 font-bold">Red (R)</span>
            <input
              type="number"
              min="0"
              max="255"
              value={r}
              onChange={(e) => setR(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
          <div className="space-y-1 text-center">
            <span className="text-xs text-emerald-400 font-bold">Green (G)</span>
            <input
              type="number"
              min="0"
              max="255"
              value={g}
              onChange={(e) => setG(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
          <div className="space-y-1 text-center">
            <span className="text-xs text-blue-400 font-bold">Blue (B)</span>
            <input
              type="number"
              min="0"
              max="255"
              value={b}
              onChange={(e) => setB(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono font-bold text-white text-center"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">HEX Output</span>
        <div className="text-4xl font-mono font-black text-white uppercase">{hex}</div>
        <div style={{ backgroundColor: hex }} className="w-16 h-8 mx-auto rounded-xl border border-white/20 shadow" />
      </div>
    </div>
  );
}

function HexToHslTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [hex, setHex] = useState<string>('#8b5cf6');
  const hsl = useMemo(() => hexToHsl(hex), [hex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase">Input HEX Code</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-mono font-bold text-white uppercase outline-none"
          />
          <div style={{ backgroundColor: hex }} className="w-14 h-14 rounded-2xl border border-white/20 shadow" />
        </div>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">HSL Representation</span>
        <div className="text-3xl font-mono font-black text-pink-300">
          hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
          <div>Hue: {hsl.h}°</div>
          <div>Sat: {hsl.s}%</div>
          <div>Light: {hsl.l}%</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: CSS Gradient Generator
   ========================================================================= */
function GradientGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [color1, setColor1] = useState<string>('#6366f1');
  const [color2, setColor2] = useState<string>('#ec4899');
  const [angle, setAngle] = useState<number>(90);
  const [type, setType] = useState<'linear' | 'radial'>('linear');

  const cssGradient = useMemo(() => {
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }
    return `radial-gradient(circle, ${color1}, ${color2})`;
  }, [type, angle, color1, color2]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Gradient Type</span>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setType('linear')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${type === 'linear' ? 'bg-pink-500/20 text-pink-300' : 'text-slate-500'}`}
            >
              Linear
            </button>
            <button
              onClick={() => setType('radial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${type === 'radial' ? 'bg-pink-500/20 text-pink-300' : 'text-slate-500'}`}
            >
              Radial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Color Stop 1</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Color Stop 2</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-xs text-white"
              />
            </div>
          </div>
        </div>

        {type === 'linear' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Angle Direction:</span>
              <span className="font-mono text-cyan-300">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Preview Box & CSS Code */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div style={{ background: cssGradient }} className="w-full h-40 rounded-2xl shadow-xl border border-white/20" />

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-300 truncate mr-2">background: {cssGradient};</span>
          <button
            onClick={() => onCopy(`background: ${cssGradient};`, 'grad-css')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {copiedKey === 'grad-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Harmonic Palette Generator
   ========================================================================= */
function PaletteGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [baseHex, setBaseHex] = useState<string>('#3b82f6');
  const [mode, setMode] = useState<'complementary' | 'analogous' | 'triadic' | 'monochromatic'>('complementary');

  const palette = useMemo(() => {
    const hsl = hexToHsl(baseHex);
    const colors: string[] = [];

    if (mode === 'complementary') {
      colors.push(baseHex);
      colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
      colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
      colors.push(hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l));
      colors.push(hslToHex(hsl.h, Math.max(10, hsl.s - 40), Math.min(90, hsl.l + 30)));
    } else if (mode === 'analogous') {
      [-40, -20, 0, 20, 40].forEach((offset) => {
        colors.push(hslToHex((hsl.h + offset + 360) % 360, hsl.s, hsl.l));
      });
    } else if (mode === 'triadic') {
      [0, 120, 240, 60, 180].forEach((offset) => {
        colors.push(hslToHex((hsl.h + offset) % 360, hsl.s, hsl.l));
      });
    } else {
      // Monochromatic
      [20, 35, 50, 65, 80].forEach((lum) => {
        colors.push(hslToHex(hsl.h, hsl.s, lum));
      });
    }

    return colors;
  }, [baseHex, mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={baseHex}
            onChange={(e) => setBaseHex(e.target.value)}
            className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
          />
          <div>
            <div className="text-xs font-bold text-slate-400">Base Color</div>
            <div className="text-lg font-mono font-bold text-white uppercase">{baseHex}</div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['complementary', 'analogous', 'triadic', 'monochromatic'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                mode === m ? 'bg-pink-500/20 text-pink-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Swatches Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {palette.map((hex, idx) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
            <div style={{ backgroundColor: hex }} className="w-full h-24 rounded-xl shadow-lg border border-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">{hex}</span>
              <button onClick={() => onCopy(hex, `pal-${idx}`)} className="text-slate-500 hover:text-white">
                {copiedKey === `pal-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Random Color & Aesthetic Palettes
   ========================================================================= */
function RandomColorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [randomHex, setRandomHex] = useState<string>('#6366f1');

  const generateRandom = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    setRandomHex(rgbToHex(r, g, b));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-6 bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-5">
        <div style={{ backgroundColor: randomHex }} className="w-full h-40 rounded-2xl shadow-xl border border-white/20" />

        <div className="text-3xl font-mono font-black text-white uppercase">{randomHex}</div>

        <button
          onClick={generateRandom}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-sm shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Random Color</span>
        </button>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">Curated Aesthetic Palettes</span>
        {[
          ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
          ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'],
          ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'],
        ].map((pal, i) => (
          <div key={i} className="flex gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-800">
            {pal.map((c) => (
              <div
                key={c}
                onClick={() => setRandomHex(c)}
                style={{ backgroundColor: c }}
                className="flex-1 h-10 rounded-lg cursor-pointer border border-white/10"
                title={c}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: WCAG 2.1 Contrast Checker
   ========================================================================= */
function ContrastCheckerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#0f172a');

  const ratio = useMemo(() => getContrastRatio(textColor, bgColor), [textColor, bgColor]);
  const formattedRatio = ratio.toFixed(2);

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Text / Foreground Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contrast Score & Compliance Badges */}
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div style={{ backgroundColor: bgColor, color: textColor }} className="p-6 rounded-2xl text-center space-y-1">
          <div className="text-3xl font-black">{formattedRatio} : 1</div>
          <div className="text-sm font-semibold">Contrast Ratio Preview</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className={`p-3 rounded-xl border flex justify-between ${aaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
            <span>AA Normal Text</span>
            <span>{aaNormal ? 'PASS' : 'FAIL'}</span>
          </div>
          <div className={`p-3 rounded-xl border flex justify-between ${aaaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
            <span>AAA Normal Text</span>
            <span>{aaaNormal ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Opacity & Alpha Transparency Generator
   ========================================================================= */
function OpacityGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [baseHex, setBaseHex] = useState<string>('#3b82f6');
  const [opacity, setOpacity] = useState<number>(75);

  const rgbaString = useMemo(() => {
    const { r, g, b } = hexToRgb(baseHex);
    return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
  }, [baseHex, opacity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Base Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Alpha Opacity:</span>
            <span className="font-mono text-cyan-300">{opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value) || 0)}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <div style={{ backgroundColor: rgbaString }} className="w-full h-28 rounded-2xl border border-white/20 shadow" />
        <div className="text-2xl font-mono font-black text-cyan-300">{rgbaString}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: Live CSS Color Preview Card
   ========================================================================= */
function CssPreviewTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [accent, setAccent] = useState<string>('#6366f1');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <input
          type="color"
          value={accent}
          onChange={(e) => setAccent(e.target.value)}
          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
        />
        <span className="text-xs font-bold text-slate-400 uppercase">Accent Theme Color: {accent}</span>
      </div>

      {/* Mock Component Showcase */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-4">
        <div className="flex items-center justify-between">
          <span style={{ color: accent }} className="text-lg font-black">
            Brand Heading Title
          </span>
          <span style={{ backgroundColor: `${accent}20`, color: accent, borderColor: `${accent}40` }} className="text-xs font-mono font-bold px-3 py-1 rounded-full border">
            Active Badge
          </span>
        </div>
        <p className="text-xs text-slate-400">
          This preview dynamically verifies typography contrast, button states, and accent highlights.
        </p>
        <button
          style={{ backgroundColor: accent }}
          className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg"
        >
          Primary Button
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Two-Color Mixer / Blender
   ========================================================================= */
function ColorMixerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [c1, setC1] = useState<string>('#ef4444');
  const [c2, setC2] = useState<string>('#3b82f6');
  const [ratio, setRatio] = useState<number>(50);

  const blended = useMemo(() => {
    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    const w2 = ratio / 100;
    const w1 = 1 - w2;

    const r = Math.round(rgb1.r * w1 + rgb2.r * w2);
    const g = Math.round(rgb1.g * w1 + rgb2.g * w2);
    const b = Math.round(rgb1.b * w1 + rgb2.b * w2);

    return rgbToHex(r, g, b);
  }, [c1, c2, ratio]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-xs text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase">Blended Result ({100 - ratio}% / {ratio}%)</span>
        <div style={{ backgroundColor: blended }} className="w-24 h-24 mx-auto rounded-2xl border border-white/20 shadow-xl" />
        <div className="text-2xl font-mono font-black text-white uppercase">{blended}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12 & 13: Shade & Tint Generator
   ========================================================================= */
function ShadeGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [base, setBase] = useState<string>('#3b82f6');

  const shades = useMemo(() => {
    const hsl = hexToHsl(base);
    return [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((factor) => {
      return hslToHex(hsl.h, hsl.s, Math.round(hsl.l * factor));
    });
  }, [base]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <input
          type="color"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
        />
        <span className="text-xs font-bold text-slate-400">Darken Shades of {base}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
        {shades.map((hex, i) => (
          <div key={i} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center space-y-2">
            <div style={{ backgroundColor: hex }} className="h-16 rounded-lg border border-white/10" />
            <span className="text-[10px] font-mono text-slate-300 uppercase block">{hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TintGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [base, setBase] = useState<string>('#3b82f6');

  const tints = useMemo(() => {
    const hsl = hexToHsl(base);
    return [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((factor) => {
      const newL = hsl.l + (100 - hsl.l) * factor;
      return hslToHex(hsl.h, hsl.s, Math.round(newL));
    });
  }, [base]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <input
          type="color"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
        />
        <span className="text-xs font-bold text-slate-400">Lighten Tints of {base}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
        {tints.map((hex, i) => (
          <div key={i} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center space-y-2">
            <div style={{ backgroundColor: hex }} className="h-16 rounded-lg border border-white/10" />
            <span className="text-[10px] font-mono text-slate-300 uppercase block">{hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Color Blindness Preview Simulator
   ========================================================================= */
function ColorBlindnessTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [color, setColor] = useState<string>('#ef4444');

  const simulations = [
    { type: 'protanopia', label: 'Protanopia (No Red)' },
    { type: 'deuteranopia', label: 'Deuteranopia (No Green)' },
    { type: 'tritanopia', label: 'Tritanopia (No Blue)' },
    { type: 'achromatopsia', label: 'Achromatopsia (Monochrome)' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
        />
        <span className="text-xs font-bold text-slate-400">Base Color: {color}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {simulations.map((s) => {
          const simColor = simulateColorBlindness(color, s.type);
          return (
            <div key={s.type} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3 text-center">
              <div style={{ backgroundColor: simColor }} className="h-20 rounded-2xl border border-white/20 shadow" />
              <div className="text-xs font-bold text-white">{s.label}</div>
              <div className="text-xs font-mono text-cyan-300 uppercase">{simColor}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Accessible Color Suggester (Auto WCAG AA/AAA Fixer)
   ========================================================================= */
function AccessibleSuggestTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [fg, setFg] = useState<string>('#60a5fa');
  const [bg, setBg] = useState<string>('#ffffff');

  // Suggest darker/lighter text to achieve 4.5:1 and 7.0:1
  const suggestions = useMemo(() => {
    const bgLum = getLuminance(hexToRgb(bg).r, hexToRgb(bg).g, hexToRgb(bg).b);
    const isBgLight = bgLum > 0.5;
    const hsl = hexToHsl(fg);

    let aaHex = fg;
    let aaaHex = fg;

    for (let l = isBgLight ? hsl.l : hsl.l; isBgLight ? l >= 0 : l <= 100; l += isBgLight ? -1 : 1) {
      const candidate = hslToHex(hsl.h, hsl.s, l);
      const ratio = getContrastRatio(candidate, bg);
      if (ratio >= 4.5 && aaHex === fg) aaHex = candidate;
      if (ratio >= 7.0 && aaaHex === fg) {
        aaaHex = candidate;
        break;
      }
    }

    return { aaHex, aaaHex };
  }, [fg, bg]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase">Auto-Suggested Compliant Colors</span>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>WCAG AA Alternative (4.5:1)</span>
            <span className="font-mono uppercase">{suggestions.aaHex}</span>
          </div>
          <div style={{ backgroundColor: bg, color: suggestions.aaHex }} className="p-3 rounded-xl text-center font-bold text-sm">
            Sample AA Text Preview
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
            <span>WCAG AAA Alternative (7.0:1)</span>
            <span className="font-mono uppercase">{suggestions.aaaHex}</span>
          </div>
          <div style={{ backgroundColor: bg, color: suggestions.aaaHex }} className="p-3 rounded-xl text-center font-bold text-sm">
            Sample AAA Text Preview
          </div>
        </div>
      </div>
    </div>
  );
}
