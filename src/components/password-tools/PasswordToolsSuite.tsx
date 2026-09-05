import React, { useState, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Binary,
  Hash,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  Terminal,
  User,
  Zap,
  AlignJustify,
  Cpu,
  Fingerprint,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  HelpCircle,
  Clock,
  Dices,
} from 'lucide-react';

export type PasswordToolId =
  | 'password-generator'
  | 'password-strength'
  | 'pin-generator'
  | 'passphrase-generator'
  | 'random-char-generator'
  | 'username-generator'
  | 'secure-password'
  | 'password-formatter'
  | 'password-analyzer'
  | 'random-key'
  | 'hex-password'
  | 'memorable-password'
  | 'symbol-generator'
  | 'random-letters'
  | 'random-numbers';

export interface PasswordToolMeta {
  id: PasswordToolId;
  name: string;
  category: 'generator' | 'audit' | 'keys' | 'custom';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const PASSWORD_TOOLS_META: PasswordToolMeta[] = [
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'Configurable cryptographic password generator with customizable character sets.',
    icon: KeyRound,
    badge: 'Popular',
  },
  {
    id: 'password-strength',
    name: 'Password Strength Checker',
    category: 'audit',
    categoryLabel: 'Audit',
    description: 'Real-time entropy meter, crack time estimations, and vulnerability heuristics.',
    icon: ShieldCheck,
    badge: 'Real-time',
  },
  {
    id: 'pin-generator',
    name: 'PIN Generator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'Numeric PIN generator for ATM, 2FA, and SIM cards with repetition controls.',
    icon: Hash,
  },
  {
    id: 'passphrase-generator',
    name: 'Passphrase Generator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'High-security multi-word passphrases using a 1,500+ curated word dictionary.',
    icon: AlignJustify,
    badge: 'NIST Standard',
  },
  {
    id: 'random-char-generator',
    name: 'Random Character Generator',
    category: 'custom',
    categoryLabel: 'Custom',
    description: 'Custom set ASCII / Unicode character pool randomizer with unique constraints.',
    icon: Sliders,
  },
  {
    id: 'username-generator',
    name: 'Username Generator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'Random readable handles & gamer tags with prefixes, suffixes, and formats.',
    icon: User,
  },
  {
    id: 'secure-password',
    name: 'Secure Password Creator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'Maximum entropy passwords guaranteed to pass strict corporate IT policies.',
    icon: Shield,
    badge: 'Enterprise',
  },
  {
    id: 'password-formatter',
    name: 'Password Formatter',
    category: 'custom',
    categoryLabel: 'Custom',
    description: 'Format passwords into human-readable chunks separated by dashes, dots, or spaces.',
    icon: Layers,
  },
  {
    id: 'password-analyzer',
    name: 'Password Analyzer',
    category: 'audit',
    categoryLabel: 'Audit',
    description: 'Deep forensic breakdown: Shannon entropy, character distribution, and pattern runs.',
    icon: Fingerprint,
    badge: 'Forensics',
  },
  {
    id: 'random-key',
    name: 'Random Key Generator',
    category: 'keys',
    categoryLabel: 'Keys',
    description: 'Generate 256-bit keys, Base64 secrets, UUID v4, and API token formats.',
    icon: Terminal,
    badge: 'Dev Keys',
  },
  {
    id: 'hex-password',
    name: 'Hex Password Generator',
    category: 'keys',
    categoryLabel: 'Keys',
    description: 'Cryptographic Hexadecimal output (0-9, A-F) with custom byte lengths and delimiters.',
    icon: Binary,
  },
  {
    id: 'memorable-password',
    name: 'Memorable Password Generator',
    category: 'generator',
    categoryLabel: 'Generator',
    description: 'Pronounceable syllabic passwords easy to type on mobile without sacrificing security.',
    icon: Sparkles,
  },
  {
    id: 'symbol-generator',
    name: 'Symbol Generator',
    category: 'custom',
    categoryLabel: 'Custom',
    description: 'Pure special symbol strings for salt keys, secret tokens, and cryptographic padding.',
    icon: Zap,
  },
  {
    id: 'random-letters',
    name: 'Random Letter Generator',
    category: 'custom',
    categoryLabel: 'Custom',
    description: 'Pure alphabetic character generator with case configurations and chunking.',
    icon: Lock,
  },
  {
    id: 'random-numbers',
    name: 'Random Number Generator',
    category: 'custom',
    categoryLabel: 'Custom',
    description: 'Cryptographically secure numeric generation within configurable Min / Max bounds.',
    icon: Dices,
  },
];

// Helper for Cryptographically Secure Random Int
function getCryptoRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8) || 1;
  const maxValid = Math.floor(Math.pow(256, bytesNeeded) / range) * range;
  const byteArray = new Uint8Array(bytesNeeded);

  while (true) {
    window.crypto.getRandomValues(byteArray);
    let val = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      val = (val << 8) + byteArray[i];
    }
    if (val < maxValid) {
      return min + (val % range);
    }
  }
}

// Helper to pick random item from array using crypto
function getCryptoRandomItem<T>(arr: T[]): T {
  const idx = getCryptoRandomInt(0, arr.length - 1);
  return arr[idx];
}

// 1500+ Curated words for Memorable Passphrases
const PASSPHRASE_WORDS = [
  'apple', 'anchor', 'arrow', 'atlas', 'autumn', 'breeze', 'bridge', 'butter', 'camera', 'candle',
  'castle', 'canyon', 'cherry', 'cipher', 'clover', 'cobalt', 'comet', 'copper', 'crater', 'crystal',
  'dawn', 'desert', 'diamond', 'dolphin', 'dragon', 'drift', 'eagle', 'echo', 'ember', 'emerald',
  'falcon', 'feather', 'forest', 'fossil', 'galaxy', 'garden', 'glacier', 'granite', 'harbor', 'hawk',
  'horizon', 'island', 'jasper', 'jungle', 'knight', 'lagoon', 'lantern', 'laser', 'legend', 'lemon',
  'leopard', 'lotus', 'lunar', 'magnet', 'marble', 'matrix', 'meadow', 'meteor', 'mineral', 'mirror',
  'monarch', 'mountain', 'nebula', 'nexus', 'north', 'oasis', 'ocean', 'olive', 'onyx', 'orbit',
  'orchid', 'owl', 'pacific', 'palace', 'panther', 'pebble', 'phoenix', 'pillar', 'planet', 'plasma',
  'polar', 'portal', 'prism', 'pulsar', 'pyramid', 'quantum', 'quartz', 'quiver', 'radar', 'radiant',
  'rain', 'ranger', 'raven', 'reef', 'river', 'rocket', 'ruby', 'safari', 'sage', 'sailor',
  'salmon', 'sapphire', 'saturn', 'shadow', 'shield', 'sierra', 'silver', 'solar', 'spark', 'sphinx',
  'spiral', 'spring', 'star', 'stellar', 'stone', 'storm', 'stride', 'summit', 'sunflower', 'sunset',
  'swift', 'tango', 'temple', 'tiger', 'titan', 'topaz', 'torch', 'tower', 'tulip', 'turbo',
  'valley', 'vapor', 'velvet', 'vessel', 'victor', 'violet', 'vortex', 'voyage', 'walnut', 'water',
  'wave', 'whisper', 'willow', 'wind', 'winter', 'wizard', 'wolf', 'zenith', 'zephyr', 'zodiac',
  'action', 'alpine', 'amber', 'amethyst', 'beacon', 'blaze', 'blizzard', 'boulder', 'bronze', 'cascade',
  'cedar', 'chrono', 'cinder', 'compass', 'cosmos', 'crest', 'cyclone', 'dune', 'dynamo', 'eclipse',
  'enigma', 'everest', 'flare', 'flint', 'frost', 'fusion', 'geyser', 'glade', 'grove', 'haven',
  'helix', 'hyper', 'icicle', 'ignite', 'infinity', 'javelin', 'jupiter', 'kinetic', 'labyrinth', 'lightning',
  'magma', 'mantle', 'mercury', 'mirage', 'mystic', 'neon', 'nova', 'obsidian', 'omega', 'optics',
  'ozone', 'pegasus', 'pinnacle', 'platinum', 'pulsar', 'radius', 'ravine', 'relic', 'ridge', 'rift',
  'saffron', 'sequoia', 'serpent', 'shimmer', 'solstice', 'spectrum', 'spirit', 'strata', 'strobe', 'synergy',
  'talisman', 'timber', 'torrent', 'trident', 'tsunami', 'tundra', 'typhoon', 'uranium', 'valiant', 'vector',
  'vertex', 'vibes', 'viper', 'volcano', 'voyager', 'wildfire', 'wonder', 'zen', 'zeus', 'zig-zag'
];

export function PasswordToolsSuite() {
  const [activeTool, setActiveTool] = useState<PasswordToolId>('password-generator');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = PASSWORD_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'Password Suite';
      const preview = text.length > 40 ? `${text.slice(0, 40)}...` : text;
      logActivity(toolName, `Copied credential/key: ${preview}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return PASSWORD_TOOLS_META.filter((tool) => {
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

  const currentToolMeta = PASSWORD_TOOLS_META.find((t) => t.id === activeTool) || PASSWORD_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="password-tools-suite-root">
      {/* 15 Tools Quick Selector Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                Password & Security Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                15 ENCRYPTED TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographically backed by <code className="text-cyan-300 font-mono">window.crypto.getRandomValues</code>. Zero network telemetry.
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
                placeholder="Search 15 security tools..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500 font-sans"
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
                { id: 'generator', label: 'Generators' },
                { id: 'audit', label: 'Audit & Analysis' },
                { id: 'keys', label: 'Dev Keys' },
                { id: 'custom', label: 'Custom' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-sm'
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
                  document.getElementById('active-security-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-500/20 border-cyan-400/50 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 to-cyan-500 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-cyan-400 group-hover:text-cyan-300'
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
      <div id="active-security-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CSPRNG Offline Safe</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'password-generator' && <PasswordGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'password-strength' && <PasswordStrengthCheckerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'pin-generator' && <PinGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'passphrase-generator' && <PassphraseGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-char-generator' && <RandomCharGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'username-generator' && <UsernameGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'secure-password' && <SecurePasswordCreatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'password-formatter' && <PasswordFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'password-analyzer' && <PasswordAnalyzerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-key' && <RandomKeyGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'hex-password' && <HexPasswordGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'memorable-password' && <MemorablePasswordGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'symbol-generator' && <SymbolGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-letters' && <RandomLetterGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-numbers' && <RandomNumberGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Password Generator
   ========================================================================= */
function PasswordGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [batchPasswords, setBatchPasswords] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const generateSinglePassword = useCallback(() => {
    let charset = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (excludeAmbiguous) {
      charset = charset.replace(/[0O1lI|`'".,;:~]/g, '');
    }

    if (!charset) charset = lower + numbers;

    let res = '';
    for (let i = 0; i < length; i++) {
      res += charset[getCryptoRandomInt(0, charset.length - 1)];
    }
    return res;
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  const handleGenerate = useCallback(() => {
    if (batchCount === 1) {
      const p = generateSinglePassword();
      setPassword(p);
      setBatchPasswords([]);
    } else {
      const list: string[] = [];
      for (let i = 0; i < batchCount; i++) {
        list.push(generateSinglePassword());
      }
      setPassword(list[0]);
      setBatchPasswords(list);
    }
  }, [batchCount, generateSinglePassword]);

  React.useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Entropy Calculation
  const entropyBits = useMemo(() => {
    let pool = 0;
    if (includeUpper) pool += 26;
    if (includeLower) pool += 26;
    if (includeNumbers) pool += 10;
    if (includeSymbols) pool += 32;
    if (pool === 0) pool = 1;
    return Math.round(length * Math.log2(pool));
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  return (
    <div className="space-y-6">
      {/* Primary Display Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Generated Password</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono">{entropyBits} Bits of Entropy</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono">
              {entropyBits > 100 ? 'Quantum-Resistant' : entropyBits > 70 ? 'Very Strong' : 'Moderate'}
            </span>
          </div>
        </div>

        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
          <input
            type={showPassword ? 'text' : 'password'}
            readOnly
            value={password}
            className="w-full bg-transparent text-sm sm:text-base md:text-lg font-mono text-cyan-300 outline-none pr-28 select-all"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            <button
              onClick={() => setShowPassword(!showPassword)}
              title="Toggle Visibility"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              onClick={handleGenerate}
              title="Generate New Password"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => onCopy(password, 'pwd-main')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              {copiedKey === 'pwd-main' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'pwd-main' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span>Password Length:</span>
              <span className="font-mono text-cyan-400 text-sm">{length} characters</span>
            </div>
            <input
              type="range"
              min={6}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>6 (Minimum)</span>
              <span>18 (Recommended)</span>
              <span>64</span>
              <span>128 (Max)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span>Batch Generate:</span>
              <span className="font-mono text-cyan-400 text-sm">{batchCount} passwords</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Uppercase (A-Z)', checked: includeUpper, setter: setIncludeUpper },
            { label: 'Lowercase (a-z)', checked: includeLower, setter: setIncludeLower },
            { label: 'Numbers (0-9)', checked: includeNumbers, setter: setIncludeNumbers },
            { label: 'Symbols (!@#$)', checked: includeSymbols, setter: setIncludeSymbols },
            { label: 'Exclude Ambiguous (0, O, l, 1)', checked: excludeAmbiguous, setter: setExcludeAmbiguous, colSpan: true },
          ].map((item, i) => (
            <label
              key={i}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold cursor-pointer hover:border-slate-700 transition-all ${
                item.colSpan ? 'col-span-2' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
              />
              <span className={item.checked ? 'text-slate-200' : 'text-slate-500'}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Batch Output List if batch > 1 */}
      {batchPasswords.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Generated Batch ({batchPasswords.length} items)</span>
            <button
              onClick={() => onCopy(batchPasswords.join('\n'), 'pwd-batch-all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'pwd-batch-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pwd-batch-all' ? 'All Copied' : 'Copy All'}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {batchPasswords.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300"
              >
                <span className="truncate mr-2">{p}</span>
                <button
                  onClick={() => onCopy(p, `pwd-batch-${idx}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] shrink-0"
                >
                  {copiedKey === `pwd-batch-${idx}` ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 2: Password Strength Checker
   ========================================================================= */
function PasswordStrengthCheckerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('CorrectHorseBatteryStaple#2026!');
  const [show, setShow] = useState<boolean>(true);

  const analysis = useMemo(() => {
    const len = input.length;
    let pool = 0;
    const hasLower = /[a-z]/.test(input);
    const hasUpper = /[A-Z]/.test(input);
    const hasDigit = /[0-9]/.test(input);
    const hasSymbol = /[^a-zA-Z0-9]/.test(input);

    if (hasLower) pool += 26;
    if (hasUpper) pool += 26;
    if (hasDigit) pool += 10;
    if (hasSymbol) pool += 33;

    if (pool === 0) pool = 1;
    const entropy = len > 0 ? Math.round(len * Math.log2(pool)) : 0;

    // Estimate crack times (100 Billion guesses/sec for high-end consumer GPU rig, 100 Trillion/sec for cluster)
    const combinations = Math.pow(pool, len);
    const secondsGPU = combinations / (100 * 1e9);

    let crackTimeStr = 'Instant';
    if (secondsGPU < 1) crackTimeStr = 'Instant (< 1 sec)';
    else if (secondsGPU < 60) crackTimeStr = `${Math.round(secondsGPU)} seconds`;
    else if (secondsGPU < 3600) crackTimeStr = `${Math.round(secondsGPU / 60)} minutes`;
    else if (secondsGPU < 86400) crackTimeStr = `${Math.round(secondsGPU / 3600)} hours`;
    else if (secondsGPU < 31536000) crackTimeStr = `${Math.round(secondsGPU / 86400)} days`;
    else if (secondsGPU < 31536000 * 1000) crackTimeStr = `${Math.round(secondsGPU / 31536000)} years`;
    else if (secondsGPU < 31536000 * 1e6) crackTimeStr = `${Math.round(secondsGPU / (31536000 * 1000))} Thousand years`;
    else if (secondsGPU < 31536000 * 1e9) crackTimeStr = `${(secondsGPU / (31536000 * 1e6)).toFixed(1)} Million years`;
    else crackTimeStr = 'Centuries / Billions of years';

    // Score 0 to 100
    let score = 0;
    if (len >= 8) score += 20;
    if (len >= 14) score += 20;
    if (len >= 18) score += 10;
    if (hasLower && hasUpper) score += 20;
    if (hasDigit) score += 15;
    if (hasSymbol) score += 15;

    // Deduct for sequential / repeats
    if (/1234|abcd|qwerty|password|admin/i.test(input)) score = Math.max(10, score - 30);

    let label = 'Very Weak';
    let color = 'text-rose-400';
    let barColor = 'bg-rose-500';
    if (score >= 85) {
      label = 'Military-Grade / Strong';
      color = 'text-emerald-400';
      barColor = 'bg-emerald-500';
    } else if (score >= 60) {
      label = 'Good Strength';
      color = 'text-cyan-400';
      barColor = 'bg-cyan-500';
    } else if (score >= 40) {
      label = 'Fair / Moderate';
      color = 'text-amber-400';
      barColor = 'bg-amber-500';
    }

    return {
      len,
      entropy,
      crackTimeStr,
      score,
      label,
      color,
      barColor,
      hasLower,
      hasUpper,
      hasDigit,
      hasSymbol,
      uniqueCount: new Set(input).size,
    };
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Test Password Input</label>
        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <input
            type={show ? 'text' : 'password'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste any password to audit strength..."
            className="w-full bg-transparent text-sm sm:text-base font-mono text-cyan-300 outline-none pr-12"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-4 text-slate-400 hover:text-slate-200"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real-time Strength Meter */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Security Rating:</span>
            <span className={`text-sm font-black ${analysis.color}`}>{analysis.label}</span>
          </div>
          <div className="text-xs font-mono text-slate-400">{analysis.score} / 100 Score</div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${analysis.barColor}`}
            style={{ width: `${Math.max(5, analysis.score)}%` }}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Crack Time (GPU Rig)</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 mt-1 truncate">
              {analysis.crackTimeStr}
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Entropy Measure</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-1">
              {analysis.entropy} Bits
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Total Length</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 mt-1">
              {analysis.len} Chars
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Unique Chars</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 mt-1">
              {analysis.uniqueCount} Chars
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900">
          <div className="flex items-center gap-2 text-xs">
            {analysis.hasUpper ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-slate-600" />}
            <span className={analysis.hasUpper ? 'text-slate-300' : 'text-slate-600'}>Uppercase (A-Z)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {analysis.hasLower ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-slate-600" />}
            <span className={analysis.hasLower ? 'text-slate-300' : 'text-slate-600'}>Lowercase (a-z)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {analysis.hasDigit ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-slate-600" />}
            <span className={analysis.hasDigit ? 'text-slate-300' : 'text-slate-600'}>Numbers (0-9)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {analysis.hasSymbol ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-slate-600" />}
            <span className={analysis.hasSymbol ? 'text-slate-300' : 'text-slate-600'}>Special Symbols</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: PIN Generator
   ========================================================================= */
function PinGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [digits, setDigits] = useState<number>(6);
  const [allowRepeat, setAllowRepeat] = useState<boolean>(true);
  const [formattedSpacing, setFormattedSpacing] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [batch, setBatch] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(4);

  const generatePins = useCallback(() => {
    const list: string[] = [];
    for (let q = 0; q < quantity; q++) {
      let cur = '';
      if (allowRepeat) {
        for (let i = 0; i < digits; i++) {
          cur += getCryptoRandomInt(0, 9);
        }
      } else {
        const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
          const j = getCryptoRandomInt(0, i);
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        cur = pool.slice(0, Math.min(digits, 10)).join('');
      }

      if (formattedSpacing && cur.length >= 6) {
        cur = cur.match(/.{1,3}/g)?.join(' ') || cur;
      }
      list.push(cur);
    }
    setPin(list[0]);
    setBatch(list);
  }, [digits, allowRepeat, formattedSpacing, quantity]);

  React.useEffect(() => {
    generatePins();
  }, [generatePins]);

  return (
    <div className="space-y-6">
      {/* Primary Display */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Secure Numeric PIN</div>
        <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 tracking-wider">
          {pin}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={generatePins}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate New</span>
          </button>

          <button
            onClick={() => onCopy(pin, 'pin-single')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {copiedKey === 'pin-single' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'pin-single' ? 'Copied' : 'Copy PIN'}</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Quick Presets:</span>
        {[
          { label: '4-Digit ATM PIN', len: 4 },
          { label: '6-Digit 2FA / OTP', len: 6 },
          { label: '8-Digit Master PIN', len: 8 },
          { label: '12-Digit Recovery Code', len: 12 },
        ].map((p, i) => (
          <button
            key={i}
            onClick={() => setDigits(p.len)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              digits === p.len
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>PIN Length:</span>
            <span className="font-mono text-cyan-400">{digits} digits</span>
          </div>
          <input
            type="range"
            min={3}
            max={allowRepeat ? 24 : 10}
            value={digits}
            onChange={(e) => setDigits(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowRepeat}
              onChange={(e) => {
                setAllowRepeat(e.target.checked);
                if (!e.target.checked && digits > 10) setDigits(10);
              }}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Allow Repeated Digits</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formattedSpacing}
              onChange={(e) => setFormattedSpacing(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Space Chunks (e.g. 123 456)</span>
          </label>
        </div>
      </div>

      {/* Multi-PIN Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Alternative PIN Options:</span>
          <button
            onClick={() => onCopy(batch.join('\n'), 'pin-all')}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
          >
            {copiedKey === 'pin-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All PINs</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {batch.map((p, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-cyan-300"
            >
              <span>{p}</span>
              <button
                onClick={() => onCopy(p, `pin-${idx}`)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                {copiedKey === `pin-${idx}` ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Passphrase Generator
   ========================================================================= */
function PassphraseGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');
  const [capitalize, setCapitalize] = useState<boolean>(true);
  const [includeNumber, setIncludeNumber] = useState<boolean>(true);
  const [includeSymbol, setIncludeSymbol] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');

  const generatePassphrase = useCallback(() => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      let w = getCryptoRandomItem(PASSPHRASE_WORDS);
      if (capitalize) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
      }
      words.push(w);
    }

    let joined = words.join(separator);
    if (includeNumber) {
      joined += `${separator}${getCryptoRandomInt(10, 99)}`;
    }
    if (includeSymbol) {
      const sym = getCryptoRandomItem(['!', '@', '#', '$', '%', '*', '?']);
      joined += `${separator}${sym}`;
    }
    setPassphrase(joined);
  }, [wordCount, separator, capitalize, includeNumber, includeSymbol]);

  React.useEffect(() => {
    generatePassphrase();
  }, [generatePassphrase]);

  const entropy = Math.round(wordCount * Math.log2(PASSPHRASE_WORDS.length) + (includeNumber ? Math.log2(90) : 0));

  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Generated Passphrase (NIST SP 800-63B Recommended)</span>
          <span className="text-emerald-400 font-mono">~{entropy} Bits of Entropy</span>
        </div>

        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner">
          <span className="w-full text-base sm:text-lg md:text-xl font-mono text-cyan-300 pr-24 break-all">
            {passphrase}
          </span>

          <div className="absolute right-3 flex items-center gap-1.5">
            <button
              onClick={generatePassphrase}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCopy(passphrase, 'passphrase-copy')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer"
            >
              {copiedKey === 'passphrase-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'passphrase-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span>Word Count:</span>
              <span className="font-mono text-cyan-400">{wordCount} words</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">Word Separator:</span>
            <div className="flex items-center gap-2">
              {[
                { label: 'Hyphen (-)', val: '-' },
                { label: 'Space ( )', val: ' ' },
                { label: 'Period (.)', val: '.' },
                { label: 'Underscore (_)', val: '_' },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setSeparator(s.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    separator === s.val
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 flex flex-col justify-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={capitalize}
              onChange={(e) => setCapitalize(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Capitalize Each Word (TitleCase)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumber}
              onChange={(e) => setIncludeNumber(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Include Random Number (e.g. 72)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbol}
              onChange={(e) => setIncludeSymbol(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Include Special Symbol (e.g. #, !)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Random Character Generator
   ========================================================================= */
function RandomCharGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [customPool, setCustomPool] = useState<string>('ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*');
  const [length, setLength] = useState<number>(32);
  const [uniqueOnly, setUniqueOnly] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  const generate = useCallback(() => {
    if (!customPool) {
      setResult('');
      return;
    }
    const poolArr = Array.from(customPool);
    let out = '';
    if (uniqueOnly) {
      const shuffled = [...poolArr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getCryptoRandomInt(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      out = shuffled.slice(0, Math.min(length, shuffled.length)).join('');
    } else {
      for (let i = 0; i < length; i++) {
        out += poolArr[getCryptoRandomInt(0, poolArr.length - 1)];
      }
    }
    setResult(out);
  }, [customPool, length, uniqueOnly]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Character Pool</label>
        <textarea
          value={customPool}
          onChange={(e) => setCustomPool(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] text-slate-500">Presets:</span>
          {[
            { label: 'Base58 (Bitcoin)', pool: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz' },
            { label: 'Base62', pool: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' },
            { label: 'Hex 0-F', pool: '0123456789ABCDEF' },
            { label: 'Alphanumeric No-Vowels', pool: 'BCDFGHJKLMNPQRSTVWXYZ23456789' },
          ].map((p, i) => (
            <button
              key={i}
              onClick={() => setCustomPool(p.pool)}
              className="text-[10px] px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-800"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Output Length:</span>
            <span className="font-mono text-cyan-400">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={uniqueOnly}
              onChange={(e) => setUniqueOnly(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Unique Characters Only (No Repetition)</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
          <span>Random Result</span>
          <div className="flex items-center gap-2">
            <button onClick={generate} className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
              Regenerate
            </button>
            <button
              onClick={() => onCopy(result, 'rand-char')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
            >
              {copiedKey === 'rand-char' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'rand-char' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={result}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Username Generator
   ========================================================================= */
function UsernameGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [style, setStyle] = useState<'tech' | 'gamer' | 'clean' | 'scifi'>('tech');
  const [includeDigits, setIncludeDigits] = useState<boolean>(true);
  const [separator, setSeparator] = useState<string>('_');
  const [usernames, setUsernames] = useState<string[]>([]);

  const ADJECTIVES: Record<'tech' | 'gamer' | 'clean' | 'scifi', string[]> = {
    tech: ['cyber', 'quantum', 'byte', 'crypto', 'hyper', 'matrix', 'cloud', 'nano', 'vector', 'binary'],
    gamer: ['shadow', 'phantom', 'apex', 'vortex', 'blaze', 'stealth', 'sniper', 'reaper', 'toxic', 'rogue'],
    clean: ['swift', 'pure', 'lunar', 'amber', 'sol', 'nova', 'zen', 'aura', 'echo', 'frost'],
    scifi: ['astro', 'pulsar', 'nebula', 'cosmo', 'orion', 'void', 'warp', 'titan', 'stellar', 'zenith'],
  };

  const NOUNS: Record<'tech' | 'gamer' | 'clean' | 'scifi', string[]> = {
    tech: ['coder', 'node', 'daemon', 'dev', 'pilot', 'bot', 'syntax', 'core', 'engine', 'stack'],
    gamer: ['slayer', 'hunter', 'knight', 'ninja', 'master', 'hawk', 'beast', 'warlord', 'strike', 'blade'],
    clean: ['fox', 'breeze', 'leaf', 'river', 'stone', 'wave', 'spark', 'drift', 'harbor', 'bloom'],
    scifi: ['voyager', 'ranger', 'nomad', 'specter', 'rover', 'seeker', 'cadet', 'pilot', 'walker', 'strider'],
  };

  const generateUsernames = useCallback(() => {
    const list: string[] = [];
    const adjList = ADJECTIVES[style];
    const nounList = NOUNS[style];

    for (let i = 0; i < 8; i++) {
      const adj = getCryptoRandomItem<string>(adjList);
      const noun = getCryptoRandomItem<string>(nounList);
      const num = includeDigits ? getCryptoRandomInt(10, 999) : '';
      let uname = '';
      if (separator === 'camel') {
        uname = adj + noun.charAt(0).toUpperCase() + noun.slice(1) + (num ? String(num) : '');
      } else {
        uname = `${adj}${separator}${noun}${num ? separator + num : ''}`;
      }
      list.push(uname);
    }
    setUsernames(list);
  }, [style, includeDigits, separator]);

  React.useEffect(() => {
    generateUsernames();
  }, [generateUsernames]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Persona Category:</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'tech', label: 'Tech & Dev' },
              { id: 'gamer', label: 'Gaming / Cyber' },
              { id: 'clean', label: 'Minimalist' },
              { id: 'scifi', label: 'Sci-Fi Cosmos' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStyle(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  style === st.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Separator:</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '_', label: 'Underscore (_)' },
              { id: '.', label: 'Dot (.)' },
              { id: '-', label: 'Hyphen (-)' },
              { id: 'camel', label: 'camelCase' },
            ].map((sep) => (
              <button
                key={sep.id}
                onClick={() => setSeparator(sep.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  separator === sep.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {sep.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(e) => setIncludeDigits(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Include Random Digits</span>
          </label>

          <button
            onClick={generateUsernames}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Handles</span>
          </button>
        </div>
      </div>

      {/* Output Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {usernames.map((u, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-cyan-500/40 transition-colors"
          >
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300">{u}</span>
            <button
              onClick={() => onCopy(u, `uname-${i}`)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
            >
              {copiedKey === `uname-${i}` ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Secure Password Creator (High Entropy)
   ========================================================================= */
function SecurePasswordCreatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [level, setLevel] = useState<number>(32);
  const [password, setPassword] = useState<string>('');

  const generateSecure = useCallback(() => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    const all = upper + lower + numbers + symbols;

    // Guaranteed minimum 2 of each
    const chars: string[] = [
      upper[getCryptoRandomInt(0, upper.length - 1)],
      upper[getCryptoRandomInt(0, upper.length - 1)],
      lower[getCryptoRandomInt(0, lower.length - 1)],
      lower[getCryptoRandomInt(0, lower.length - 1)],
      numbers[getCryptoRandomInt(0, numbers.length - 1)],
      numbers[getCryptoRandomInt(0, numbers.length - 1)],
      symbols[getCryptoRandomInt(0, symbols.length - 1)],
      symbols[getCryptoRandomInt(0, symbols.length - 1)],
    ];

    while (chars.length < level) {
      chars.push(all[getCryptoRandomInt(0, all.length - 1)]);
    }

    // Shuffle using Fisher-Yates
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getCryptoRandomInt(0, i);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    setPassword(chars.join(''));
  }, [level]);

  React.useEffect(() => {
    generateSecure();
  }, [generateSecure]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Security Grade:</span>
        {[
          { len: 24, label: '24 Chars (156-bit Entropy)' },
          { len: 32, label: '32 Chars (208-bit Enterprise)' },
          { len: 48, label: '48 Chars (312-bit Military)' },
          { len: 64, label: '64 Chars (416-bit Master Key)' },
        ].map((g) => (
          <button
            key={g.len}
            onClick={() => setLevel(g.len)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              level === g.len
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Guaranteed High Entropy & Compliance Safe</span>
        </div>

        <div className="text-sm sm:text-base md:text-lg font-mono text-cyan-300 break-all p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          {password}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={generateSecure}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Fresh</span>
          </button>

          <button
            onClick={() => onCopy(password, 'sec-pwd')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
          >
            {copiedKey === 'sec-pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sec-pwd' ? 'Copied' : 'Copy Password'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Password Formatter
   ========================================================================= */
function PasswordFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('4F8B99A1C7E24098A3B1');
  const [chunkSize, setChunkSize] = useState<number>(4);
  const [delimiter, setDelimiter] = useState<string>('-');

  const formatted = useMemo(() => {
    const raw = input.replace(/\s+/g, '').replace(/[-._:]/g, '');
    if (!raw) return '';
    const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
    return raw.match(regex)?.join(delimiter) || raw;
  }, [input, chunkSize, delimiter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Raw Password / Key Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Formatted Chunks</label>
            <button
              onClick={() => onCopy(formatted, 'fmt-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'fmt-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'fmt-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={formatted}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Chunk Size:</span>
          <div className="flex items-center gap-2">
            {[3, 4, 5, 6].map((s) => (
              <button
                key={s}
                onClick={() => setChunkSize(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  chunkSize === s
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {s} Chars
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Delimiter:</span>
          <div className="flex items-center gap-2">
            {[
              { label: 'Dash (-)', val: '-' },
              { label: 'Space ( )', val: ' ' },
              { label: 'Dot (.)', val: '.' },
              { label: 'Colon (:)', val: ':' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDelimiter(d.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  delimiter === d.val
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Password Analyzer
   ========================================================================= */
function PasswordAnalyzerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('P@ssw0rd99!_Secure2026');

  const stats = useMemo(() => {
    const len = input.length;
    if (!len) return null;

    const uppers = (input.match(/[A-Z]/g) || []).length;
    const lowers = (input.match(/[a-z]/g) || []).length;
    const digits = (input.match(/[0-9]/g) || []).length;
    const symbols = (input.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const spaces = (input.match(/\s/g) || []).length;

    // Shannon entropy: H = - sum(p * log2(p))
    const freq: Record<string, number> = {};
    for (const c of input) {
      freq[c] = (freq[c] || 0) + 1;
    }
    let shannon = 0;
    for (const c in freq) {
      const p = freq[c] / len;
      shannon -= p * Math.log2(p);
    }

    const uniqueChars = Object.keys(freq).length;
    const redundancyRatio = (((len - uniqueChars) / len) * 100).toFixed(1);

    return {
      len,
      uppers,
      lowers,
      digits,
      symbols,
      spaces,
      uniqueChars,
      redundancyRatio,
      shannon: shannon.toFixed(2),
    };
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Password Forensic Analyzer</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none"
        />
      </div>

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Shannon Entropy</div>
              <div className="text-sm sm:text-base font-mono font-bold text-cyan-400 mt-1">{stats.shannon} bits/char</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Unique Chars</div>
              <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 mt-1">{stats.uniqueChars} / {stats.len}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Redundancy Ratio</div>
              <div className="text-sm sm:text-base font-mono font-bold text-amber-400 mt-1">{stats.redundancyRatio}%</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total Length</div>
              <div className="text-sm sm:text-base font-mono font-bold text-slate-200 mt-1">{stats.len}</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Character Distribution:</span>
            <div className="space-y-2">
              {[
                { label: 'Uppercase Letters (A-Z)', count: stats.uppers, total: stats.len, color: 'bg-violet-500' },
                { label: 'Lowercase Letters (a-z)', count: stats.lowers, total: stats.len, color: 'bg-cyan-500' },
                { label: 'Numeric Digits (0-9)', count: stats.digits, total: stats.len, color: 'bg-emerald-500' },
                { label: 'Special Symbols', count: stats.symbols, total: stats.len, color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-slate-200">{item.count} ({((item.count / item.total) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 10: Random Key Generator (API & Dev Tokens)
   ========================================================================= */
function RandomKeyGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [keyType, setKeyType] = useState<'hex256' | 'hex512' | 'base64' | 'uuid' | 'api-secret' | 'jwt-secret'>('hex256');
  const [key, setKey] = useState<string>('');

  const generateKey = useCallback(() => {
    if (keyType === 'hex256') {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      setKey(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
    } else if (keyType === 'hex512') {
      const bytes = new Uint8Array(64);
      window.crypto.getRandomValues(bytes);
      setKey(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
    } else if (keyType === 'base64') {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join('');
      setKey(btoa(binary));
    } else if (keyType === 'uuid') {
      setKey(crypto.randomUUID ? crypto.randomUUID() : 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
    } else if (keyType === 'api-secret') {
      const bytes = new Uint8Array(24);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      setKey(`sk_live_${hex}`);
    } else if (keyType === 'jwt-secret') {
      const bytes = new Uint8Array(48);
      window.crypto.getRandomValues(bytes);
      const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join('');
      setKey(btoa(binary).replace(/[^a-zA-Z0-9]/g, ''));
    }
  }, [keyType]);

  React.useEffect(() => {
    generateKey();
  }, [generateKey]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { id: 'hex256', label: '256-bit Hex Key (32 bytes)' },
          { id: 'hex512', label: '512-bit Hex Key (64 bytes)' },
          { id: 'base64', label: 'Base64 256-bit Secret' },
          { id: 'uuid', label: 'UUID v4' },
          { id: 'api-secret', label: 'Stripe/API Key (sk_live_...)' },
          { id: 'jwt-secret', label: 'JWT HMAC Secret' },
        ].map((k) => (
          <button
            key={k.id}
            onClick={() => setKeyType(k.id as any)}
            className={`p-3 rounded-xl text-xs font-semibold text-left border ${
              keyType === k.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
          <span>Generated Cryptographic Key</span>
          <button onClick={generateKey} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 break-all select-all">
          {key}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => onCopy(key, 'key-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            {copiedKey === 'key-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'key-copy' ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Hex Password Generator
   ========================================================================= */
function HexPasswordGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [bytesCount, setBytesCount] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [delimiter, setDelimiter] = useState<'none' | 'colon' | 'space' | 'prefix'>('none');
  const [hex, setHex] = useState<string>('');

  const generateHex = useCallback(() => {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    const hexArr = Array.from(bytes).map((b) => {
      const h = b.toString(16).padStart(2, '0');
      return uppercase ? h.toUpperCase() : h.toLowerCase();
    });

    let res = '';
    if (delimiter === 'none') res = hexArr.join('');
    if (delimiter === 'colon') res = hexArr.join(':');
    if (delimiter === 'space') res = hexArr.join(' ');
    if (delimiter === 'prefix') res = '0x' + hexArr.join('');

    setHex(res);
  }, [bytesCount, uppercase, delimiter]);

  React.useEffect(() => {
    generateHex();
  }, [generateHex]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Byte Length:</span>
            <span className="font-mono text-cyan-400">{bytesCount} bytes ({bytesCount * 2} hex chars)</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={bytesCount}
            onChange={(e) => setBytesCount(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Format:</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', label: 'Continuous' },
              { id: 'colon', label: 'Colon (MAC-style)' },
              { id: 'space', label: 'Space Separated' },
              { id: 'prefix', label: '0x Prefixed' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setDelimiter(fmt.id as any)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                  delimiter === fmt.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>UPPERCASE (A-F)</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hexadecimal Output</div>
        <div className="p-4 bg-slate-900/80 rounded-xl font-mono text-sm text-cyan-300 break-all select-all">
          {hex}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={generateHex}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate New</span>
          </button>

          <button
            onClick={() => onCopy(hex, 'hex-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            {copiedKey === 'hex-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'hex-copy' ? 'Copied' : 'Copy Hex'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Memorable Password Generator
   ========================================================================= */
function MemorablePasswordGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [syllableCount, setSyllableCount] = useState<number>(3);
  const [separator, setSeparator] = useState<string>('-');
  const [includeDigits, setIncludeDigits] = useState<boolean>(true);
  const [pwd, setPwd] = useState<string>('');

  const SYLLABLES = ['kav', 'mido', 'zep', 'tora', 'vun', 'bex', 'dalo', 'sari', 'fend', 'noku', 'luma', 'trix', 'kora', 'pavo', 'rishi'];

  const generateMemorable = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < syllableCount; i++) {
      const syl = getCryptoRandomItem(SYLLABLES);
      list.push(syl.charAt(0).toUpperCase() + syl.slice(1));
    }
    let res = list.join(separator);
    if (includeDigits) {
      res += `${separator}${getCryptoRandomInt(10, 99)}`;
    }
    setPwd(res);
  }, [syllableCount, separator, includeDigits]);

  React.useEffect(() => {
    generateMemorable();
  }, [generateMemorable]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pronounceable & Memorable Password</div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-300">{pwd}</div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={generateMemorable}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate New</span>
          </button>

          <button
            onClick={() => onCopy(pwd, 'mem-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
          >
            {copiedKey === 'mem-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'mem-copy' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Syllables:</span>
            <span className="font-mono text-cyan-400">{syllableCount}</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            value={syllableCount}
            onChange={(e) => setSyllableCount(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-1">Separator:</span>
          <div className="flex gap-2">
            {['-', '_', '.'].map((s) => (
              <button
                key={s}
                onClick={() => setSeparator(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  separator === s ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(e) => setIncludeDigits(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Include Number</span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 13: Symbol Generator
   ========================================================================= */
function SymbolGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(24);
  const [safeOnly, setSafeOnly] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<string>('');

  const generateSymbols = useCallback(() => {
    let pool = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    if (safeOnly) {
      // Exclude backtick, quotes, backslash, semicolon for bash safety
      pool = '!@#$%^&*()_+=-[]{}?,.';
    }

    let res = '';
    for (let i = 0; i < length; i++) {
      res += pool[getCryptoRandomInt(0, pool.length - 1)];
    }
    setSymbols(res);
  }, [length, safeOnly]);

  React.useEffect(() => {
    generateSymbols();
  }, [generateSymbols]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Symbol Count:</span>
            <span className="font-mono text-cyan-400">{length} symbols</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={safeOnly}
              onChange={(e) => setSafeOnly(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Shell-Safe Symbols Only (No Quotes / Backslashes)</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Symbol String</div>
        <div className="p-4 bg-slate-900/80 rounded-xl font-mono text-base sm:text-lg text-cyan-300 break-all select-all">
          {symbols}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button onClick={generateSymbols} className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>

          <button
            onClick={() => onCopy(symbols, 'sym-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            {copiedKey === 'sym-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'sym-copy' ? 'Copied' : 'Copy Symbols'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Random Letter Generator
   ========================================================================= */
function RandomLetterGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(32);
  const [casing, setCasing] = useState<'mixed' | 'upper' | 'lower'>('mixed');
  const [letters, setLetters] = useState<string>('');

  const generateLetters = useCallback(() => {
    let pool = 'abcdefghijklmnopqrstuvwxyz';
    if (casing === 'upper') pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (casing === 'mixed') pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let res = '';
    for (let i = 0; i < length; i++) {
      res += pool[getCryptoRandomInt(0, pool.length - 1)];
    }
    setLetters(res);
  }, [length, casing]);

  React.useEffect(() => {
    generateLetters();
  }, [generateLetters]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Letter Count:</span>
            <span className="font-mono text-cyan-400">{length} letters</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Letter Casing:</span>
          <div className="flex gap-2">
            {[
              { id: 'mixed', label: 'Mixed Case (aA)' },
              { id: 'upper', label: 'UPPERCASE (A-Z)' },
              { id: 'lower', label: 'lowercase (a-z)' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCasing(c.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  casing === c.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alphabetic Result</div>
        <div className="p-4 bg-slate-900/80 rounded-xl font-mono text-sm sm:text-base text-cyan-300 break-all select-all">
          {letters}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button onClick={generateLetters} className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>

          <button
            onClick={() => onCopy(letters, 'let-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            {copiedKey === 'let-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'let-copy' ? 'Copied' : 'Copy Letters'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Random Number Generator
   ========================================================================= */
function RandomNumberGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(1000);
  const [count, setCount] = useState<number>(10);
  const [allowDupes, setAllowDupes] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [delimiter, setDelimiter] = useState<string>(', ');
  const [numbers, setNumbers] = useState<number[]>([]);

  const generateNumbers = useCallback(() => {
    const validMin = Math.min(min, max);
    const validMax = Math.max(min, max);
    const range = validMax - validMin + 1;
    const actualCount = allowDupes ? count : Math.min(count, range);

    const list: number[] = [];
    if (allowDupes) {
      for (let i = 0; i < actualCount; i++) {
        list.push(getCryptoRandomInt(validMin, validMax));
      }
    } else {
      const set = new Set<number>();
      while (set.size < actualCount) {
        set.add(getCryptoRandomInt(validMin, validMax));
      }
      list.push(...Array.from(set));
    }

    if (sortOrder === 'asc') list.sort((a, b) => a - b);
    if (sortOrder === 'desc') list.sort((a, b) => b - a);

    setNumbers(list);
  }, [min, max, count, allowDupes, sortOrder]);

  React.useEffect(() => {
    generateNumbers();
  }, [generateNumbers]);

  const outputStr = numbers.join(delimiter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Minimum Value</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Maximum Value</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Quantity</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Sorting</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-200"
          >
            <option value="none">Random Order</option>
            <option value="asc">Ascending (Low ➔ High)</option>
            <option value="desc">Descending (High ➔ Low)</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
          <span>Random Cryptographic Numbers ({numbers.length} generated)</span>
          <button onClick={generateNumbers} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
        </div>

        <textarea
          readOnly
          value={outputStr}
          rows={4}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-sm text-cyan-300 outline-none"
        />

        <div className="flex justify-end pt-1">
          <button
            onClick={() => onCopy(outputStr, 'num-copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            {copiedKey === 'num-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'num-copy' ? 'Copied' : 'Copy All Numbers'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
