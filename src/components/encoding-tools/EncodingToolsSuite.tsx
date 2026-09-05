import React, { useState, useMemo, useCallback, useRef } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Binary,
  FileCode,
  Link,
  Code2,
  Globe,
  Hash,
  Layers,
  Radio,
  Shuffle,
  Key,
  Boxes,
  Copy,
  Check,
  Search,
  RefreshCw,
  ArrowRightLeft,
  Play,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Sliders,
} from 'lucide-react';

export type EncodingToolId =
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'html-encode'
  | 'html-decode'
  | 'unicode-convert'
  | 'ascii-convert'
  | 'binary-convert'
  | 'decimal-convert'
  | 'hex-convert'
  | 'morse-code'
  | 'rot13'
  | 'caesar-cipher'
  | 'all-in-one-toolkit';

export interface EncodingToolMeta {
  id: EncodingToolId;
  name: string;
  category: 'base64-url' | 'web-entities' | 'data-formats' | 'ciphers';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ENCODING_TOOLS_META: EncodingToolMeta[] = [
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    category: 'base64-url',
    categoryLabel: 'Base64 & URL',
    description: 'Convert UTF-8 text and strings into RFC 4648 standard Base64 representation.',
    icon: FileCode,
    badge: 'RFC 4648',
  },
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    category: 'base64-url',
    categoryLabel: 'Base64 & URL',
    description: 'Decode Base64 strings back to human-readable UTF-8 text with error detection.',
    icon: FileCode,
  },
  {
    id: 'url-encode',
    name: 'URL Percent Encode',
    category: 'base64-url',
    categoryLabel: 'Base64 & URL',
    description: 'Percent-encode spaces, query params, and special characters for safe URL transmission.',
    icon: Link,
  },
  {
    id: 'url-decode',
    name: 'URL Percent Decode',
    category: 'base64-url',
    categoryLabel: 'Base64 & URL',
    description: 'Convert percent-encoded (%20, %3F, %26) URLs back to clean human-readable text.',
    icon: Link,
  },
  {
    id: 'html-encode',
    name: 'HTML Entities Encode',
    category: 'web-entities',
    categoryLabel: 'Web Entities',
    description: 'Escape sensitive characters (<, >, &, ", \') into valid HTML entities (&lt;, &gt;).',
    icon: Code2,
  },
  {
    id: 'html-decode',
    name: 'HTML Entities Decode',
    category: 'web-entities',
    categoryLabel: 'Web Entities',
    description: 'Convert named and numeric HTML entities back into standard characters.',
    icon: Code2,
  },
  {
    id: 'unicode-convert',
    name: 'Unicode Escape Converter',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Convert text characters to \\uXXXX and U+XXXX Unicode escape codes and vice versa.',
    icon: Globe,
  },
  {
    id: 'ascii-convert',
    name: 'ASCII Code Converter',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Convert characters to ASCII decimal/hex byte tables and reconstruct text from codes.',
    icon: Hash,
  },
  {
    id: 'binary-convert',
    name: 'Binary (8-bit) Converter',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Convert text to 8-bit spaced binary 0s and 1s and decode binary back to plain text.',
    icon: Binary,
    badge: '8-Bit',
  },
  {
    id: 'decimal-convert',
    name: 'Decimal Character Codes',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Convert strings to decimal ASCII/Unicode point arrays and decode back to text.',
    icon: Layers,
  },
  {
    id: 'hex-convert',
    name: 'Hexadecimal (Hex) Converter',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Convert text to raw Hex bytes (e.g. 48 65 6c 6c 6f) and decode hex streams to text.',
    icon: Binary,
  },
  {
    id: 'morse-code',
    name: 'Morse Code Audio & Text',
    category: 'ciphers',
    categoryLabel: 'Ciphers',
    description: 'Bi-directional text to Morse dots/dashes with synthesized Web Audio beep playback.',
    icon: Radio,
    badge: 'Audio Beep',
  },
  {
    id: 'rot13',
    name: 'ROT13 Obfuscator',
    category: 'ciphers',
    categoryLabel: 'Ciphers',
    description: 'Classic 13-character rotation cipher for symmetric text obfuscation and de-obfuscation.',
    icon: Shuffle,
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Substitution Cipher',
    category: 'ciphers',
    categoryLabel: 'Ciphers',
    description: 'Customizable letter substitution cipher with interactive shift keys from 1 to 25.',
    icon: Key,
    badge: 'Shift Key',
  },
  {
    id: 'all-in-one-toolkit',
    name: 'Multi-Format Encoder Matrix',
    category: 'data-formats',
    categoryLabel: 'Data Formats',
    description: 'Simultaneously convert any string into Base64, Hex, Binary, URL, HTML, and ROT13.',
    icon: Boxes,
    badge: 'All-In-One',
  },
];

/* =========================================================================
   UTF-8 SAFE CLIENT-SIDE ENCODING UTILITIES
   ========================================================================= */

// Safe UTF-8 Base64 Encode
export function safeUtf8ToBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch {
    return 'Encoding Error';
  }
}

// Safe UTF-8 Base64 Decode
export function safeBase64ToUtf8(base64: string): string {
  try {
    const binary = atob(base64.trim());
    const bytes = Array.from(binary, (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('');
    return decodeURIComponent(bytes);
  } catch {
    return 'Invalid Base64 string';
  }
}

// Morse code map
const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }),
  {}
);

// Play Morse Beeps via Web Audio API
export function playMorseAudio(morse: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const dotDuration = 0.08; // 80ms for dot
    let time = ctx.currentTime + 0.05;

    for (const symbol of morse) {
      if (symbol === '.') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(700, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.setValueAtTime(0, time + dotDuration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dotDuration);
        time += dotDuration + 0.05;
      } else if (symbol === '-') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(700, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.setValueAtTime(0, time + dotDuration * 3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dotDuration * 3);
        time += dotDuration * 3 + 0.05;
      } else if (symbol === ' ') {
        time += dotDuration * 2;
      } else if (symbol === '/') {
        time += dotDuration * 5;
      }
    }
  } catch {
    // Audio context unavailable
  }
}

export function EncodingToolsSuite() {
  const [activeTool, setActiveTool] = useState<EncodingToolId>('base64-encode');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = ENCODING_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Encoding Suite';
      const preview = text.length > 50 ? `${text.slice(0, 50)}...` : text;
      logActivity(toolName, `Encoded/decoded & copied: ${preview}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return ENCODING_TOOLS_META.filter((tool) => {
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
    ENCODING_TOOLS_META.find((t) => t.id === activeTool) || ENCODING_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="encoding-tools-suite-root">
      {/* 15 Tools Selector Dashboard */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400" />
                Encoding & Decoding Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                15 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              RFC 4648 Base64, URL percent-encoding, HTML entities, Hex, Binary, Morse audio, and Ciphers.
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
                placeholder="Search 15 encoding tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500 font-sans"
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
                { id: 'base64-url', label: 'Base64 & URL' },
                { id: 'web-entities', label: 'HTML & Entities' },
                { id: 'data-formats', label: 'Data Formats' },
                { id: 'ciphers', label: 'Ciphers & Morse' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
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
                  document.getElementById('active-encoding-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600/30 to-orange-500/20 border-amber-400/50 shadow-md shadow-amber-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-amber-400 group-hover:text-amber-300'
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
      <div id="active-encoding-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-[1.5px] shadow-lg shadow-amber-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side UTF-8</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'base64-encode' && <Base64EncodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'base64-decode' && <Base64DecodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'url-encode' && <UrlEncodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'url-decode' && <UrlDecodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'html-encode' && <HtmlEncodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'html-decode' && <HtmlDecodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'unicode-convert' && <UnicodeConvertTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'ascii-convert' && <AsciiConvertTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'binary-convert' && <BinaryConvertTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'decimal-convert' && <DecimalConvertTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'hex-convert' && <HexConvertTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'morse-code' && <MorseCodeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'rot13' && <Rot13Tool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'caesar-cipher' && <CaesarCipherTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'all-in-one-toolkit' && <AllInOneToolkitTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1 & 2: Base64 Encode & Decode
   ========================================================================= */
function Base64EncodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Hello World! 🚀 Secure UTF-8');
  const output = useMemo(() => safeUtf8ToBase64(input), [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Plain Text / String" outputLabel="Base64 Output (RFC 4648)" copyKey="b64-enc" />;
}

function Base64DecodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('SGVsbG8gV29ybGQhIPCfmYAgU2VjdXJlIFVURi04');
  const output = useMemo(() => safeBase64ToUtf8(input), [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Base64 Input" outputLabel="Decoded UTF-8 Text" copyKey="b64-dec" />;
}

/* =========================================================================
   TOOL 3 & 4: URL Percent Encode & Decode
   ========================================================================= */
function UrlEncodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('https://example.com/search?query=hello world & category=tools#top');
  const [mode, setMode] = useState<'component' | 'uri'>('component');

  const output = useMemo(() => {
    try {
      return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
    } catch {
      return 'Encoding Error';
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('component')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            mode === 'component' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          encodeURIComponent (All Special Chars)
        </button>
        <button
          onClick={() => setMode('uri')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            mode === 'uri' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          encodeURI (Preserve Protocol & Path)
        </button>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Raw URL or Query String" outputLabel="Percent-Encoded Result" copyKey="url-enc" />
    </div>
  );
}

function UrlDecodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('https%3A%2F%2Fexample.com%2Fsearch%3Fquery%3Dhello%20world');
  const output = useMemo(() => {
    try {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch {
      return 'Malformed URL encoded string';
    }
  }, [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Encoded URL String" outputLabel="Decoded URL / Plain Text" copyKey="url-dec" />;
}

/* =========================================================================
   TOOL 5 & 6: HTML Entities Encode & Decode
   ========================================================================= */
function HtmlEncodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('<div class="alert font-bold" id="app">Hello & Welcome!</div>');

  const output = useMemo(() => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Raw HTML / Text" outputLabel="Escaped HTML Entities" copyKey="html-enc" />;
}

function HtmlDecodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('&lt;div class=&quot;alert&quot;&gt;Hello &amp; Welcome!&lt;/div&gt;');

  const output = useMemo(() => {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent || '';
  }, [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="HTML Entities Input" outputLabel="Decoded Plain Text" copyKey="html-dec" />;
}

/* =========================================================================
   TOOL 7: Unicode Escape Converter
   ========================================================================= */
function UnicodeConvertTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [direction, setDirection] = useState<'text-to-uni' | 'uni-to-text'>('text-to-uni');
  const [input, setInput] = useState<string>('Hello World! 🚀');

  const output = useMemo(() => {
    if (direction === 'text-to-uni') {
      return input
        .split('')
        .map((char: string) => {
          const code = char.codePointAt(0);
          return code ? `\\u${code.toString(16).padStart(4, '0')}` : '';
        })
        .join('');
    } else {
      try {
        return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      } catch {
        return 'Invalid Unicode string';
      }
    }
  }, [input, direction]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setDirection('text-to-uni');
            setInput('Hello World! 🚀');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'text-to-uni' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Text → Unicode (\uXXXX)
        </button>
        <button
          onClick={() => {
            setDirection('uni-to-text');
            setInput('\\u0048\\u0065\\u006c\\u006c\\u006f');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'uni-to-text' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Unicode (\uXXXX) → Text
        </button>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input" outputLabel="Converted Output" copyKey="uni-out" />
    </div>
  );
}

/* =========================================================================
   TOOL 8: ASCII Code Converter
   ========================================================================= */
function AsciiConvertTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('ASCII Text 123');

  const { decimal, hex, binary } = useMemo(() => {
    const decArr: number[] = [];
    const hexArr: string[] = [];
    const binArr: string[] = [];

    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      decArr.push(code);
      hexArr.push(code.toString(16).toUpperCase().padStart(2, '0'));
      binArr.push(code.toString(2).padStart(8, '0'));
    }

    return {
      decimal: decArr.join(' '),
      hex: hexArr.join(' '),
      binary: binArr.join(' '),
    };
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase">Input Text</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs font-mono">
          <div>
            <span className="text-slate-500 block">ASCII Decimal:</span>
            <span className="text-amber-300 font-bold text-sm select-all">{decimal}</span>
          </div>
          <button onClick={() => onCopy(decimal, 'asc-dec')} className="text-slate-400 hover:text-white">
            {copiedKey === 'asc-dec' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs font-mono">
          <div>
            <span className="text-slate-500 block">ASCII Hex:</span>
            <span className="text-cyan-300 font-bold text-sm select-all">{hex}</span>
          </div>
          <button onClick={() => onCopy(hex, 'asc-hex')} className="text-slate-400 hover:text-white">
            {copiedKey === 'asc-hex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9 & 10 & 11: Binary, Decimal, Hex Converter
   ========================================================================= */
function BinaryConvertTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [direction, setDirection] = useState<'text-to-bin' | 'bin-to-text'>('text-to-bin');
  const [input, setInput] = useState<string>('Hello');

  const output = useMemo(() => {
    if (direction === 'text-to-bin') {
      return input
        .split('')
        .map((char: string) => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    } else {
      try {
        const bytes = input.trim().split(/[\s,]+/);
        return bytes.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
      } catch {
        return 'Invalid binary stream';
      }
    }
  }, [input, direction]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setDirection('text-to-bin');
            setInput('Hello');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'text-to-bin' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Text → 8-Bit Binary
        </button>
        <button
          onClick={() => {
            setDirection('bin-to-text');
            setInput('01001000 01100101 01101100 01101100 01101111');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'bin-to-text' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Binary → Text
        </button>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input" outputLabel="Output" copyKey="bin-out" />
    </div>
  );
}

function DecimalConvertTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [direction, setDirection] = useState<'text-to-dec' | 'dec-to-text'>('text-to-dec');
  const [input, setInput] = useState<string>('Hello');

  const output = useMemo(() => {
    if (direction === 'text-to-dec') {
      return input
        .split('')
        .map((char: string) => char.charCodeAt(0))
        .join(' ');
    } else {
      try {
        const nums = input.trim().split(/[\s,]+/);
        return nums.map((n) => String.fromCharCode(parseInt(n, 10))).join('');
      } catch {
        return 'Invalid decimal numbers';
      }
    }
  }, [input, direction]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setDirection('text-to-dec');
            setInput('Hello');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'text-to-dec' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Text → Decimal Codes
        </button>
        <button
          onClick={() => {
            setDirection('dec-to-text');
            setInput('72 101 108 108 111');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'dec-to-text' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Decimal Codes → Text
        </button>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input" outputLabel="Output" copyKey="dec-out" />
    </div>
  );
}

function HexConvertTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [direction, setDirection] = useState<'text-to-hex' | 'hex-to-text'>('text-to-hex');
  const [input, setInput] = useState<string>('Hello World');

  const output = useMemo(() => {
    if (direction === 'text-to-hex') {
      return input
        .split('')
        .map((char: string) => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    } else {
      try {
        const hexes = input.trim().split(/[\s,]+/);
        return hexes.map((h) => String.fromCharCode(parseInt(h, 16))).join('');
      } catch {
        return 'Invalid hex stream';
      }
    }
  }, [input, direction]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setDirection('text-to-hex');
            setInput('Hello World');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'text-to-hex' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Text → Hex Bytes
        </button>
        <button
          onClick={() => {
            setDirection('hex-to-text');
            setInput('48 65 6c 6c 6f 20 57 6f 72 6c 64');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            direction === 'hex-to-text' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          Hex Bytes → Text
        </button>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input" outputLabel="Output" copyKey="hex-out" />
    </div>
  );
}

/* =========================================================================
   TOOL 12: Morse Code with Web Audio Playback
   ========================================================================= */
function MorseCodeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [direction, setDirection] = useState<'text-to-morse' | 'morse-to-text'>('text-to-morse');
  const [input, setInput] = useState<string>('SOS HELP');

  const output = useMemo(() => {
    if (direction === 'text-to-morse') {
      return input
        .toUpperCase()
        .split('')
        .map((char) => MORSE_MAP[char] || char)
        .join(' ');
    } else {
      return input
        .trim()
        .split(' ')
        .map((m) => REVERSE_MORSE[m] || m)
        .join('');
    }
  }, [input, direction]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setDirection('text-to-morse');
              setInput('SOS HELP');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              direction === 'text-to-morse' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Text → Morse Code
          </button>
          <button
            onClick={() => {
              setDirection('morse-to-text');
              setInput('... --- ... / .... . .-.. .--.');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              direction === 'morse-to-text' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Morse Code → Text
          </button>
        </div>

        {direction === 'text-to-morse' && (
          <button
            onClick={() => playMorseAudio(output)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-400 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Play Audio Beeps</span>
          </button>
        )}
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input" outputLabel="Morse Code Output" copyKey="morse-out" />
    </div>
  );
}

/* =========================================================================
   TOOL 13: ROT13 Cipher
   ========================================================================= */
function Rot13Tool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Why did the chicken cross the road?');

  const output = useMemo(() => {
    return input.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  }, [input]);

  return <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input Text" outputLabel="ROT13 Result" copyKey="rot13-out" />;
}

/* =========================================================================
   TOOL 14: Caesar Cipher (Custom Shift 1-25)
   ========================================================================= */
function CaesarCipherTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('ATTACK AT DAWN');
  const [shift, setShift] = useState<number>(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const output = useMemo(() => {
    const s = mode === 'encrypt' ? shift : (26 - (shift % 26)) % 26;
    return input.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + s) % 26) + base);
    });
  }, [input, shift, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('encrypt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${mode === 'encrypt' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'}`}
          >
            Encrypt (+Shift)
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${mode === 'decrypt' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'}`}
          >
            Decrypt (-Shift)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Shift Key:</span>
          <input
            type="number"
            min="1"
            max="25"
            value={shift}
            onChange={(e) => setShift(Math.min(25, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-amber-300 font-bold text-sm"
          />
        </div>
      </div>

      <SideBySidePanel input={input} setInput={setInput} output={output} onCopy={onCopy} copiedKey={copiedKey} inputLabel="Input Text" outputLabel="Caesar Cipher Result" copyKey="caesar-out" />
    </div>
  );
}

/* =========================================================================
   TOOL 15: All-In-One Multi-Format Encoder Matrix
   ========================================================================= */
function AllInOneToolkitTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Hello AI Studio!');

  const matrix = useMemo(() => {
    return [
      { label: 'Base64', val: safeUtf8ToBase64(input), id: 'm-b64' },
      { label: 'URL Percent Encoded', val: encodeURIComponent(input), id: 'm-url' },
      {
        label: 'Hex Bytes',
        val: input.split('').map((c: string) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
        id: 'm-hex',
      },
      {
        label: 'Binary (8-bit)',
        val: input.split('').map((c: string) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
        id: 'm-bin',
      },
      {
        label: 'ROT13',
        val: input.replace(/[a-zA-Z]/g, (c) => {
          const code = c.charCodeAt(0);
          const base = code >= 97 ? 97 : 65;
          return String.fromCharCode(((code - base + 13) % 26) + base);
        }),
        id: 'm-rot',
      },
      {
        label: 'HTML Entities',
        val: input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        id: 'm-html',
      },
    ];
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase">Master Input String</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matrix.map((item) => (
          <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>{item.label}</span>
              <button onClick={() => onCopy(item.val, item.id)} className="text-slate-400 hover:text-white flex items-center gap-1">
                {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl text-xs font-mono text-amber-300 break-all select-all">
              {item.val || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   REUSABLE SIDE-BY-SIDE PANEL COMPONENT
   ========================================================================= */
interface SideBySidePanelProps {
  input: string;
  setInput: (val: string) => void;
  output: string;
  inputLabel: string;
  outputLabel: string;
  copyKey: string;
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}

function SideBySidePanel({
  input,
  setInput,
  output,
  inputLabel,
  outputLabel,
  copyKey,
  onCopy,
  copiedKey,
}: SideBySidePanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>{inputLabel}</span>
          <span className="text-[10px] text-slate-500 font-mono">{input.length} chars</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Enter text to convert..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-amber-500 resize-y"
        />
      </div>

      {/* Output Panel */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>{outputLabel}</span>
          <button
            onClick={() => onCopy(output, copyKey)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
          >
            {copiedKey === copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Output</span>
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          rows={7}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-amber-300 outline-none select-all resize-y"
        />
      </div>
    </div>
  );
}
