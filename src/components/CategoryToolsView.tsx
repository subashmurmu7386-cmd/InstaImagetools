import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { logActivity } from '../lib/history';
import { copyToClipboard } from '../lib/clipboard';
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
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Sliders,
  Eye,
  Lock,
  Download,
  Shuffle,
  Clock,
  FileCode,
  Hash,
} from 'lucide-react';
import { TOOL_CATEGORIES } from './CategoryNav';
import { TextToolsSuite } from './text-tools/TextToolsSuite';
import { PasswordToolsSuite } from './password-tools/PasswordToolsSuite';
import { QrBarcodeToolsSuite } from './qr-barcode-tools/QrBarcodeToolsSuite';
import { UnitConvertersToolsSuite } from './unit-converter-tools/UnitConvertersToolsSuite';
import { CalculatorToolsSuite } from './calculator-tools/CalculatorToolsSuite';
import { DateTimeToolsSuite } from './date-time-tools/DateTimeToolsSuite';
import { ColorToolsSuite } from './color-tools/ColorToolsSuite';
import { EncodingToolsSuite } from './encoding-tools/EncodingToolsSuite';
import { DeveloperToolsSuite } from './developer-tools/DeveloperToolsSuite';
import { RandomGeneratorToolsSuite } from './random-generator-tools/RandomGeneratorToolsSuite';
import { ImageStudioSuite } from './image-tools/ImageStudioSuite';
import { PdfStudioSuite } from './pdf-tools/PdfStudioSuite';
import { AdsterraNative } from './ads/AdsterraNative';

interface CategoryToolsViewProps {
  categoryId: string;
  onSelectCategory: (catId: string) => void;
}

export function CategoryToolsView({ categoryId, onSelectCategory }: CategoryToolsViewProps) {
  const currentCategory = TOOL_CATEGORIES.find((c) => c.id === categoryId) || TOOL_CATEGORIES[0];
  const Icon = currentCategory.icon;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const preview = text.length > 60 ? `${text.slice(0, 60)}...` : text;
      logActivity(currentCategory.name, `Copied output: ${preview}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-600/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Icon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentCategory.name} Suite</h1>
                {currentCategory.badge && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {currentCategory.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {currentCategory.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Client-Side</span>
          </div>
        </div>
      </div>

      {/* Render Category-Specific Interactive Suite */}
      <div className="transition-all duration-300">
        {categoryId === 'text' && <TextToolsSuite />}
        {categoryId === 'password' && <PasswordToolsSuite />}
        {categoryId === 'qr-barcode' && <QrBarcodeToolsSuite />}
        {categoryId === 'unit-converters' && <UnitConvertersToolsSuite />}
        {categoryId === 'calculator' && <CalculatorToolsSuite />}
        {categoryId === 'date-time' && <DateTimeToolsSuite />}
        {categoryId === 'color' && <ColorToolsSuite />}
        {categoryId === 'encoding' && <EncodingToolsSuite />}
        {categoryId === 'developer' && <DeveloperToolsSuite />}
        {categoryId === 'random-generator' && <RandomGeneratorToolsSuite />}
        {categoryId === 'image' && <ImageStudioSuite />}
        {categoryId === 'pdf' && <PdfStudioSuite />}
      </div>

      {/* Adsterra Native Workspace Banner placed below category tool workspace */}
      <div className="pt-2">
        <AdsterraNative
          layout="workspace"
          position="category-tools-workspace-bottom"
          sponsorName="CloudTools Pro"
          headline="High-Speed Developer Cloud Storage & Asset Optimization"
          description="Scale your apps with automated media transcoding, instant edge caching, and 99.99% uptime."
          ctaText="Explore Platform"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   1. Text Suite
   ========================================================================= */
function TextSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'InstaImagetools provides high-speed, zero-server privacy utilities for developers, designers, and creators worldwide.'
  );

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const transformCase = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'kebab' | 'snake') => {
    if (!text) return;
    let res = text;
    if (type === 'upper') res = text.toUpperCase();
    if (type === 'lower') res = text.toLowerCase();
    if (type === 'sentence') res = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
    if (type === 'title') res = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    if (type === 'camel') res = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    if (type === 'kebab') res = text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (type === 'snake') res = text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    setText(res);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input area & Case Transformers */}
      <div className="lg:col-span-2 space-y-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Text Content</label>
          <button
            onClick={() => onCopy(text, 'text-input')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'text-input' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'text-input' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Paste or type text here..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500 font-mono transition-colors"
        />

        {/* Quick Transformations Bar */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400">Instant Case Converters:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'upper', label: 'UPPERCASE' },
              { id: 'lower', label: 'lowercase' },
              { id: 'title', label: 'Title Case' },
              { id: 'sentence', label: 'Sentence case' },
              { id: 'camel', label: 'camelCase' },
              { id: 'kebab', label: 'kebab-case' },
              { id: 'snake', label: 'snake_case' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => transformCase(c.id as any)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-xl border border-slate-800 text-xs font-medium transition-all"
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={() => setText('')}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded-xl border border-red-800/40 text-xs font-medium transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Statistics Cards */}
      <div className="space-y-4">
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Live Text Statistics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Words</span>
              <div className="text-xl font-extrabold text-white mt-0.5">{wordCount}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Characters</span>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{charCount}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500">No Spaces</span>
              <div className="text-lg font-bold text-slate-300 mt-0.5">{charNoSpaces}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Lines</span>
              <div className="text-lg font-bold text-slate-300 mt-0.5">{lineCount}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-950/40 to-cyan-950/40 p-3.5 rounded-2xl border border-violet-500/20 flex items-center justify-between text-xs text-slate-300">
            <span>Estimated Reading Time:</span>
            <span className="font-bold text-cyan-300 font-mono">~{readingTime} min</span>
          </div>
        </div>

        {/* Lorem Ipsum Quick Generator */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">Lorem Ipsum Generator</h4>
            <button
              onClick={() => {
                const sample =
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
                setText(sample);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Insert Paragraph →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. Password Suite
   ========================================================================= */
function PasswordSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  const generatePassword = () => {
    let chars = '';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      setPassword('Select at least 1 charset');
      return;
    }

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setPassword(result);
  };

  // Generate on load
  React.useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Calculate password strength entropy score
  let charsetSize = 0;
  if (includeUpper) charsetSize += 26;
  if (includeLower) charsetSize += 26;
  if (includeNumbers) charsetSize += 10;
  if (includeSymbols) charsetSize += 30;
  const entropy = Math.round(length * Math.log2(charsetSize || 1));

  let strengthLabel = 'Weak';
  let strengthColor = 'text-red-400 bg-red-500/10 border-red-500/30';
  if (entropy > 55) {
    strengthLabel = 'Moderate';
    strengthColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }
  if (entropy > 75) {
    strengthLabel = 'Strong';
    strengthColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  }
  if (entropy > 100) {
    strengthLabel = 'Military Grade (Unbreakable)';
    strengthColor = 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Generated Result Display */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Generated Cryptographic Password</label>
          <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${strengthColor}`}>
            {strengthLabel} ({entropy} bits)
          </div>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-4 pr-32 text-sm sm:text-base text-cyan-300 font-mono font-bold tracking-wider outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              onClick={generatePassword}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl border border-slate-800 transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCopy(password, 'pwd-main')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
            >
              {copiedKey === 'pwd-main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pwd-main' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Options & Sliders */}
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Password Length: <strong className="text-cyan-400 font-mono">{length}</strong> characters</span>
              <span className="text-slate-500 font-mono text-[11px]">Recommended: 16+</span>
            </div>
            <input
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Uppercase (A-Z)', val: includeUpper, set: setIncludeUpper },
              { label: 'Lowercase (a-z)', val: includeLower, set: setIncludeLower },
              { label: 'Numbers (0-9)', val: includeNumbers, set: setIncludeNumbers },
              { label: 'Symbols (!@#$)', val: includeSymbols, set: setIncludeSymbols },
            ].map((opt, i) => (
              <label
                key={i}
                className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer text-xs text-slate-300 select-none"
              >
                <input
                  type="checkbox"
                  checked={opt.val}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="rounded accent-cyan-400 w-4 h-4"
                />
                <span className="font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. QR & Barcode Suite
   ========================================================================= */
function QrBarcodeSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [qrText, setQrText] = useState<string>('https://instaimagetools.com');
  const [qrSize, setQrSize] = useState<number>(220);
  const [fgColor, setFgColor] = useState<string>('#06b6d4');
  const [bgColor, setBgColor] = useState<string>('#030712');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(qrText || 'https://instaimagetools.com', {
      width: qrSize,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('QR generation error:', err));
  }, [qrText, qrSize, fgColor, bgColor]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Settings Form */}
      <div className="space-y-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">QR Code Payload & Options</h3>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Content / URL / WiFi / Text</label>
          <textarea
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
            placeholder="Type URL, text, or phone number..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Foreground Color</label>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-300">{fgColor}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Background Color</label>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-300">{bgColor}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Resolution / Size</span>
            <span className="font-mono text-cyan-400">{qrSize}x{qrSize} px</span>
          </div>
          <input
            type="range"
            min={150}
            max={400}
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center min-w-[200px] min-h-[200px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Generated QR Code"
              className="rounded-xl object-contain max-w-[200px] max-h-[200px]"
            />
          ) : (
            <div className="text-xs text-slate-500 font-mono">Generating QR...</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={qrDataUrl || '#'}
            download="qrcode.png"
            onClick={() => {
              if (qrDataUrl) {
                logActivity('QR Code Suite', `Downloaded QR code for: ${qrText.slice(0, 30)}`, 'download', qrDataUrl);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer ${
              !qrDataUrl ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </a>
          <button
            onClick={() => {
              if (qrDataUrl) {
                onCopy(qrDataUrl, 'qr-data');
                logActivity('QR Code Suite', `Copied QR Data URL for: ${qrText.slice(0, 30)}`, 'copy');
              }
            }}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold"
          >
            {copiedKey === 'qr-data' ? 'Copied Data URL' : 'Copy Image Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. Unit Converters Suite
   ========================================================================= */
function UnitConvertersSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [type, setType] = useState<'length' | 'weight' | 'storage' | 'temp'>('length');
  const [val, setVal] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');

  // Conversion calculations
  const calculateConversion = () => {
    if (type === 'length') {
      const toMeters: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.34 };
      const meters = val * (toMeters[fromUnit] || 1);
      return meters / (toMeters[toUnit] || 1);
    }
    if (type === 'weight') {
      const toKg: Record<string, number> = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 };
      const kg = val * (toKg[fromUnit] || 1);
      return kg / (toKg[toUnit] || 1);
    }
    if (type === 'storage') {
      const toBytes: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 };
      const bytes = val * (toBytes[fromUnit] || 1);
      return bytes / (toBytes[toUnit] || 1);
    }
    if (type === 'temp') {
      if (fromUnit === toUnit) return val;
      let c = val;
      if (fromUnit === 'f') c = (val - 32) * (5 / 9);
      if (fromUnit === 'k') c = val - 273.15;
      if (toUnit === 'c') return c;
      if (toUnit === 'f') return c * (9 / 5) + 32;
      if (toUnit === 'k') return c + 273.15;
    }
    return val;
  };

  const result = calculateConversion();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Unit Type Switcher */}
      <div className="flex items-center justify-center gap-2 bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'length', label: 'Length' },
          { id: 'weight', label: 'Weight & Mass' },
          { id: 'storage', label: 'Data Storage' },
          { id: 'temp', label: 'Temperature' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setType(t.id as any);
              if (t.id === 'length') { setFromUnit('m'); setToUnit('ft'); }
              if (t.id === 'weight') { setFromUnit('kg'); setToUnit('lb'); }
              if (t.id === 'storage') { setFromUnit('mb'); setToUnit('gb'); }
              if (t.id === 'temp') { setFromUnit('c'); setToUnit('f'); }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              type === t.id
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Converter Inputs Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* From */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">From Value</label>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-lg font-bold text-white outline-none focus:border-cyan-500 font-mono"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-300 outline-none"
            >
              {type === 'length' && (
                <>
                  <option value="m">Meters (m)</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="ft">Feet (ft)</option>
                  <option value="in">Inches (in)</option>
                  <option value="mi">Miles (mi)</option>
                </>
              )}
              {type === 'weight' && (
                <>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="lb">Pounds (lb)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="ton">Metric Ton</option>
                </>
              )}
              {type === 'storage' && (
                <>
                  <option value="b">Bytes (B)</option>
                  <option value="kb">Kilobytes (KB)</option>
                  <option value="mb">Megabytes (MB)</option>
                  <option value="gb">Gigabytes (GB)</option>
                  <option value="tb">Terabytes (TB)</option>
                </>
              )}
              {type === 'temp' && (
                <>
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="k">Kelvin (K)</option>
                </>
              )}
            </select>
          </div>

          {/* To */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Converted Output</label>
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-lg font-bold text-cyan-400 font-mono truncate">
              {Number(result.toFixed(6))}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-300 outline-none"
            >
              {type === 'length' && (
                <>
                  <option value="ft">Feet (ft)</option>
                  <option value="in">Inches (in)</option>
                  <option value="m">Meters (m)</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="mi">Miles (mi)</option>
                </>
              )}
              {type === 'weight' && (
                <>
                  <option value="lb">Pounds (lb)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="ton">Metric Ton</option>
                </>
              )}
              {type === 'storage' && (
                <>
                  <option value="gb">Gigabytes (GB)</option>
                  <option value="mb">Megabytes (MB)</option>
                  <option value="tb">Terabytes (TB)</option>
                  <option value="kb">Kilobytes (KB)</option>
                  <option value="b">Bytes (B)</option>
                </>
              )}
              {type === 'temp' && (
                <>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="c">Celsius (°C)</option>
                  <option value="k">Kelvin (K)</option>
                </>
              )}
            </select>
          </div>
        </div>

        <button
          onClick={() => onCopy(String(result), 'unit-res')}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copiedKey === 'unit-res' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedKey === 'unit-res' ? 'Result Copied!' : 'Copy Converted Result'}</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   5. Calculator Suite
   ========================================================================= */
function CalculatorSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');

  const handleKey = (k: string) => {
    if (k === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (k === '=') {
      try {
        // Safe standard arithmetic parser
        const sanitized = display.replace(/[^0-9+\-*/.]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setEquation(`${display} =`);
        setDisplay(String(res));
      } catch (err) {
        setDisplay('Error');
      }
      return;
    }
    if (display === '0' || display === 'Error') {
      setDisplay(k);
    } else {
      setDisplay((prev) => prev + k);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-2xl">
      {/* Screen */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right space-y-1">
        <div className="text-xs font-mono text-slate-500 h-4">{equation}</div>
        <div className="text-3xl font-mono font-black text-cyan-400 truncate tracking-tight">{display}</div>
      </div>

      {/* Buttons Pad */}
      <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
        {['C', '(', ')', '/'].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 text-violet-400 rounded-xl border border-slate-800 transition-colors"
          >
            {k}
          </button>
        ))}
        {['7', '8', '9', '*'].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`p-3.5 rounded-xl border border-slate-800 transition-colors ${
              k === '*' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-900/90 text-white hover:bg-slate-800'
            }`}
          >
            {k}
          </button>
        ))}
        {['4', '5', '6', '-'].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`p-3.5 rounded-xl border border-slate-800 transition-colors ${
              k === '-' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-900/90 text-white hover:bg-slate-800'
            }`}
          >
            {k}
          </button>
        ))}
        {['1', '2', '3', '+'].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`p-3.5 rounded-xl border border-slate-800 transition-colors ${
              k === '+' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-900/90 text-white hover:bg-slate-800'
            }`}
          >
            {k}
          </button>
        ))}
        {['0', '.', '=', '%'].map((k) => (
          <button
            key={k}
            onClick={() => (k === '%' ? setDisplay(String(Number(display) / 100)) : handleKey(k))}
            className={`p-3.5 rounded-xl border transition-colors ${
              k === '='
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-cyan-400/40 shadow-lg shadow-violet-600/30'
                : 'bg-slate-900/90 text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   6. Date & Time Suite
   ========================================================================= */
function DateTimeSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [epoch, setEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const convertedDate = new Date(epoch * 1000);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Live Clocks Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current UTC Time</span>
          <div className="text-xl font-mono font-extrabold text-cyan-400">{currentTime.toUTCString()}</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Unix Timestamp</span>
          <div className="text-xl font-mono font-extrabold text-violet-400">{Math.floor(currentTime.getTime() / 1000)}</div>
        </div>
      </div>

      {/* Epoch Converter Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Unix Timestamp Converter</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Timestamp (seconds)</span>
            <button onClick={() => setEpoch(Math.floor(Date.now() / 1000))} className="text-cyan-400 text-xs font-semibold">
              Set to Now
            </button>
          </div>
          <input
            type="number"
            value={epoch}
            onChange={(e) => setEpoch(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-900">
            <span className="text-slate-500">ISO 8601:</span>
            <span className="text-slate-200">{convertedDate.toISOString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-900">
            <span className="text-slate-500">GMT / UTC:</span>
            <span className="text-slate-200">{convertedDate.toUTCString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Local Time:</span>
            <span className="text-cyan-400 font-bold">{convertedDate.toString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   7. Color Suite
   ========================================================================= */
function ColorSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [hex, setHex] = useState<string>('#7c3aed');

  // Convert Hex to RGB
  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) || 0;
    const g = parseInt(h.slice(3, 5), 16) || 0;
    const b = parseInt(h.slice(5, 7), 16) || 0;
    return { r, g, b, str: `rgb(${r}, ${g}, ${b})` };
  };

  const rgb = hexToRgb(hex);
  const hsl = `hsl(${Math.round(Math.random() * 360)}, 80%, 50%)`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        {/* Visual Color Preview */}
        <div
          className="w-full h-32 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center transition-colors duration-200"
          style={{ backgroundColor: hex }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white font-mono font-bold text-sm border border-white/20">
            {hex}
          </span>
        </div>

        {/* Color Picker & Formats */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pick Color or Type HEX</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-12 h-12 rounded-xl border border-slate-800 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono text-white outline-none"
            />
          </div>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">RGB:</span>
            <span className="text-cyan-400 font-bold">{rgb.str}</span>
            <button onClick={() => onCopy(rgb.str, 'rgb')} className="text-slate-400 hover:text-white">
              {copiedKey === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">HEX:</span>
            <span className="text-cyan-400 font-bold">{hex.toUpperCase()}</span>
            <button onClick={() => onCopy(hex.toUpperCase(), 'hex')} className="text-slate-400 hover:text-white">
              {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   8. Encoding Suite
   ========================================================================= */
function EncodingSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Hello InstaImagetools!');
  const [mode, setMode] = useState<'base64' | 'url' | 'hex'>('base64');
  const [action, setAction] = useState<'encode' | 'decode'>('encode');

  const processOutput = () => {
    try {
      if (mode === 'base64') {
        return action === 'encode' ? btoa(input) : atob(input);
      }
      if (mode === 'url') {
        return action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
      }
      if (mode === 'hex') {
        if (action === 'encode') {
          return Array.from(input).map((c: string) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        } else {
          return input.split(/\s+/).map((h) => String.fromCharCode(parseInt(h, 16))).join('');
        }
      }
    } catch (e) {
      return 'Invalid encoding format or input string';
    }
    return '';
  };

  const output = processOutput();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          {['base64', 'url', 'hex'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                mode === m ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAction('encode')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${action === 'encode' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setAction('decode')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${action === 'decode' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 bg-slate-900/40 p-5 rounded-3xl border border-slate-800">
          <label className="text-xs font-bold uppercase text-slate-400">Input Content</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2 bg-slate-900/40 p-5 rounded-3xl border border-slate-800">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-slate-400">Output Result</label>
            <button onClick={() => onCopy(output, 'enc-out')} className="text-xs text-cyan-400 font-semibold">
              {copiedKey === 'enc-out' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-400 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   9. Developer Suite
   ========================================================================= */
function DeveloperSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [json, setJson] = useState<string>('{"app":"InstaImagetools","fast":true,"tools":210}');
  const [formatted, setFormatted] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(json);
      setFormatted(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  React.useEffect(() => {
    formatJson();
  }, [json]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">JSON Formatter & Validator</h3>
          {error ? (
            <span className="text-xs text-red-400 font-mono">Invalid JSON</span>
          ) : (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Valid JSON
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={8}
            placeholder="Paste raw JSON here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 outline-none"
          />
          <textarea
            readOnly
            value={formatted}
            rows={8}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>

        <button
          onClick={() => onCopy(formatted, 'dev-json')}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          {copiedKey === 'dev-json' ? 'Formatted JSON Copied!' : 'Copy Formatted JSON'}
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   10. Random Generator Suite
   ========================================================================= */
function RandomGeneratorSuite({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [randomNum, setRandomNum] = useState<number>(42);
  const [uuid, setUuid] = useState<string>(crypto.randomUUID ? crypto.randomUUID() : '8f12a-3301-49b');

  const generateNumber = () => {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomNum(r);
  };

  const generateUuid = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      setUuid(crypto.randomUUID());
    } else {
      setUuid('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Random Number Generator */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Dices className="w-4 h-4 text-cyan-400" />
          Random Number & Dice Roller
        </h3>

        <div className="flex items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300 animate-in zoom-in-50 duration-200">
            {randomNum}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Min Value</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Max Value</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        <button
          onClick={generateNumber}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>Roll / Pick Random Number</span>
        </button>
      </div>

      {/* UUID Generator */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400">Random UUID v4 Generator</span>
          <button onClick={generateUuid} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            Generate New
          </button>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
          <span>{uuid}</span>
          <button onClick={() => onCopy(uuid, 'uuid')} className="text-slate-400 hover:text-white">
            {copiedKey === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
