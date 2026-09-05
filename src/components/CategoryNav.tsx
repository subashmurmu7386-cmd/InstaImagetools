import React, { useRef, useEffect } from 'react';
import {
  Type,
  KeyRound,
  QrCode,
  ArrowRightLeft,
  Calculator,
  CalendarClock,
  Palette,
  Binary,
  Terminal,
  Dices,
  Image as ImageIcon,
  FileText,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count: number;
  badge?: string;
}

export const TOOL_CATEGORIES: CategoryItem[] = [
  {
    id: 'text',
    name: 'Text',
    shortLabel: 'Text',
    icon: Type,
    description: 'Word & char counters, case converter, slug gen, diff checker, cleaner & stats',
    count: 20,
    badge: '20 Tools',
  },
  {
    id: 'password',
    name: 'Password',
    shortLabel: 'Password',
    icon: KeyRound,
    description: 'Password generator, strength tester, PIN, passphrase, keys, hashes & forensic analyzer',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'qr-barcode',
    name: 'QR & Barcode',
    shortLabel: 'QR & Barcode',
    icon: QrCode,
    description: 'QR generator & camera scanner, 1D barcodes, WiFi/vCard, Event, Color studio & Batch ZIP',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'unit-converters',
    name: 'Unit Converters',
    shortLabel: 'Units',
    icon: ArrowRightLeft,
    description: 'Length, Weight, Area, Volume, Speed, Temp, Pressure, Energy, Power, Time, Storage, Fuel, Angle & Scientific',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    shortLabel: 'Calc',
    icon: Calculator,
    description: 'Standard & Scientific, BMI, Percentages, Loan & EMI, GST/VAT, Interest, GPA & Equation Solver',
    count: 20,
    badge: '20 Tools',
  },
  {
    id: 'date-time',
    name: 'Date & Time',
    shortLabel: 'Date & Time',
    icon: CalendarClock,
    description: 'Calendar, Timer with Sound, Stopwatch, Alarm, World Clocks, Unix Epoch, ISO Weeks & Business Days',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'color',
    name: 'Color',
    shortLabel: 'Color',
    icon: Palette,
    description: 'Eyedropper, HEX/RGB/HSL, CSS Gradients, Harmonies, WCAG Contrast & Color Blindness',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'encoding',
    name: 'Encoding',
    shortLabel: 'Encoding',
    icon: Binary,
    description: 'Base64, URL percent-encoding, HTML entities, Unicode, ASCII, Hex, Binary, Morse Audio & Ciphers',
    count: 15,
    badge: '15 Tools',
  },
  {
    id: 'developer',
    name: 'Developer',
    shortLabel: 'Developer',
    icon: Terminal,
    description: 'JSON/XML/CSS/JS formatters & minifiers, Regex tester, Cron, UUID v4, Crypto hashes & Mock data',
    count: 20,
    badge: '20 Tools',
  },
  {
    id: 'random-generator',
    name: 'Random Generator',
    shortLabel: 'Random',
    icon: Dices,
    description: 'Random names, numbers, letters, emojis, dice roller, coin flip, decision wheel, lucky draw & teams',
    count: 20,
    badge: '20 Tools',
  },
  {
    id: 'image',
    name: 'Image Studio',
    shortLabel: 'Image',
    icon: ImageIcon,
    description: 'Crop, Resize, Rotate, Flip, Compress, WebP converter, Brightness, Blur, Sharpen & Drawing Canvas',
    count: 20,
    badge: '20 Tools',
  },
  {
    id: 'pdf',
    name: 'PDF Suite',
    shortLabel: 'PDF',
    icon: FileText,
    description: 'Merge, Split, Extract, Rotate, Delete/Duplicate, Watermark, Compress, Convert & Annotate',
    count: 20,
    badge: '20 Tools',
  },
];

export const TOTAL_TOOLS_COUNT = TOOL_CATEGORIES.reduce((acc, cat) => acc + cat.count, 0);

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryNav({
  selectedCategory,
  onSelectCategory,
  className = '',
}: CategoryNavProps) {
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  // Smooth scroll active mobile tab into view when selectedCategory changes
  useEffect(() => {
    if (activeTabRef.current && mobileNavRef.current) {
      const container = mobileNavRef.current;
      const tab = activeTabRef.current;
      
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      
      // Center the active tab in the mobile scroll container
      const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }, [selectedCategory]);

  return (
    <>
      {/* =========================================================================
          1. DESKTOP & TABLETS (>= 768px): Clean Fixed/Sticky Left Sidebar Menu
          ========================================================================= */}
      <aside
        id="desktop-category-sidebar"
        className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-3.5 shadow-2xl shadow-violet-950/20 ${className}`}
        aria-label="Category Tools Navigation"
      >
        {/* Sidebar Header */}
        <div className="px-3 py-2.5 mb-2 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Categories
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-cyan-300 border border-slate-800">
            {TOOL_CATEGORIES.length} Suites
          </span>
        </div>

        {/* Vertical List of Categories */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {TOOL_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                id={`sidebar-category-${category.id}`}
                onClick={() => onSelectCategory(category.id)}
                className={`group w-full flex items-center justify-between p-2.5 rounded-2xl text-left text-xs font-medium transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-lg shadow-violet-600/30 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent hover:border-slate-800'
                }`}
              >
                {/* Active Indicator Left Glow Pill */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-300 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                )}

                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-slate-950/80 text-cyan-300 shadow-inner'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate text-xs font-semibold leading-tight">
                      {category.name}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-violet-100' : 'text-slate-500 group-hover:text-slate-400'
                      }`}
                    >
                      {category.count} tools
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {category.badge && (
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-black/40 text-cyan-200 border border-white/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {category.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'text-cyan-200 translate-x-0.5'
                        : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-slate-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Mini-Trust Info */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>100% In-Browser</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">Zero Server</span>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE DEVICES ONLY (< 768px): Fixed Bottom Navigation Bar
             With horizontal sliding/smooth scrolling across all 10 categories
          ========================================================================= */}
      <div
        id="mobile-category-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-safe"
        role="navigation"
        aria-label="Mobile Category Navigation"
      >
        {/* Top Micro Gradient Border Glow */}
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />

        {/* Scrollable Container */}
        <div
          ref={mobileNavRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none px-3 py-2.5 scroll-smooth overscroll-x-contain"
        >
          {TOOL_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                ref={isActive ? activeTabRef : null}
                id={`mobile-category-${category.id}`}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-semibold shrink-0 transition-all duration-200 active:scale-95 cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/30 border border-cyan-400/50 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/90'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-slate-950/80 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{category.name}</span>
                {category.badge && (
                  <span
                    className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-950 text-slate-500'
                    }`}
                  >
                    {category.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
