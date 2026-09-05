import React, { useState, useMemo } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Type,
  FileText,
  Clock,
  CaseSensitive,
  Sparkles,
  Scissors,
  ArrowUpDown,
  Shuffle,
  Trash2,
  Brush,
  Link,
  Dices,
  BookOpen,
  Replace,
  GitCompare,
  BarChart3,
  Copy,
  Check,
  RotateCcw,
  Download,
  Upload,
  Search,
  CheckCircle2,
  ArrowRight,
  SplitSquareVertical,
  AlignLeft,
  Hash,
} from 'lucide-react';

export type TextToolId =
  | 'word-counter'
  | 'character-counter'
  | 'sentence-counter'
  | 'paragraph-counter'
  | 'reading-time'
  | 'case-converter'
  | 'remove-extra-spaces'
  | 'remove-empty-lines'
  | 'reverse-text'
  | 'flip-text'
  | 'sort-text'
  | 'shuffle-text'
  | 'duplicate-remover'
  | 'text-cleaner'
  | 'slug-generator'
  | 'random-text'
  | 'lorem-ipsum'
  | 'find-and-replace'
  | 'text-diff'
  | 'text-statistics';

export interface TextToolMeta {
  id: TextToolId;
  name: string;
  category: 'analysis' | 'transformation' | 'cleaning' | 'generation' | 'utility';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const TEXT_TOOLS_META: TextToolMeta[] = [
  {
    id: 'word-counter',
    name: 'Word Counter',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Count exact words, words without punctuation, and unique vocabulary.',
    icon: Type,
    badge: 'Popular',
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Live total characters, characters without spaces, bytes, and UTF-16 code units.',
    icon: Hash,
  },
  {
    id: 'sentence-counter',
    name: 'Sentence Counter',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Detect grammatical sentences, average sentence length, and pacing.',
    icon: AlignLeft,
  },
  {
    id: 'paragraph-counter',
    name: 'Paragraph Counter',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Measure structural paragraphs, blank block counts, and document structure.',
    icon: FileText,
  },
  {
    id: 'reading-time',
    name: 'Reading Time Calculator',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Calculate silent reading duration (200-250 WPM) and speaking presentation time (130 WPM).',
    icon: Clock,
    badge: 'Real-time',
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    category: 'transformation',
    categoryLabel: 'Transform',
    description: 'Convert to UPPERCASE, lowercase, Title Case, camelCase, kebab-case, snake_case & more.',
    icon: CaseSensitive,
    badge: 'Essential',
  },
  {
    id: 'remove-extra-spaces',
    name: 'Remove Extra Spaces',
    category: 'cleaning',
    categoryLabel: 'Cleaning',
    description: 'Clean multiple spaces, leading/trailing whitespace, and redundant tabs instantly.',
    icon: Scissors,
  },
  {
    id: 'remove-empty-lines',
    name: 'Remove Empty Lines',
    category: 'cleaning',
    categoryLabel: 'Cleaning',
    description: 'Strip blank lines, excessive line breaks, and whitespace-only lines.',
    icon: Trash2,
  },
  {
    id: 'reverse-text',
    name: 'Reverse Text',
    category: 'transformation',
    categoryLabel: 'Transform',
    description: 'Reverse characters, mirror word order, or reverse entire lines in reverse order.',
    icon: RotateCcw,
  },
  {
    id: 'flip-text',
    name: 'Flip Text (Upside Down)',
    category: 'transformation',
    categoryLabel: 'Transform',
    description: 'Turn Unicode text completely upside down and backwards (ɐʇsuI).',
    icon: Sparkles,
  },
  {
    id: 'sort-text',
    name: 'Sort Text Lines',
    category: 'transformation',
    categoryLabel: 'Transform',
    description: 'Sort lines Alphabetically A-Z, Z-A, by character length, or natural numerical order.',
    icon: ArrowUpDown,
  },
  {
    id: 'shuffle-text',
    name: 'Shuffle Text',
    category: 'transformation',
    categoryLabel: 'Transform',
    description: 'Randomize order of lines, scramble word sequences, or shuffle individual letters.',
    icon: Shuffle,
  },
  {
    id: 'duplicate-remover',
    name: 'Duplicate Line Remover',
    category: 'cleaning',
    categoryLabel: 'Cleaning',
    description: 'Identify and remove identical lines with optional case sensitivity and trim.',
    icon: Scissors,
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    category: 'cleaning',
    categoryLabel: 'Cleaning',
    description: 'Strip HTML/XML tags, emojis, special characters, control glyphs, and accent diacritics.',
    icon: Brush,
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    category: 'utility',
    categoryLabel: 'Utility',
    description: 'Generate clean, URL-safe SEO slugs with custom delimiters and accent stripping.',
    icon: Link,
    badge: 'SEO',
  },
  {
    id: 'random-text',
    name: 'Random Text Generator',
    category: 'generation',
    categoryLabel: 'Generation',
    description: 'Generate randomized alphanumeric strings, tokens, sentences, and secure test phrases.',
    icon: Dices,
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    category: 'generation',
    categoryLabel: 'Generation',
    description: 'Generate customizable mock Latin text by paragraphs, words, or full sentences.',
    icon: BookOpen,
  },
  {
    id: 'find-and-replace',
    name: 'Find and Replace',
    category: 'utility',
    categoryLabel: 'Utility',
    description: 'Batch search & replace with regex support, case-sensitive toggle, and match counter.',
    icon: Replace,
  },
  {
    id: 'text-diff',
    name: 'Text Diff Checker',
    category: 'utility',
    categoryLabel: 'Utility',
    description: 'Compare two text versions side-by-side with inline character/word diff highlights.',
    icon: GitCompare,
    badge: 'Diff',
  },
  {
    id: 'text-statistics',
    name: 'Text Statistics & Readability',
    category: 'analysis',
    categoryLabel: 'Analysis',
    description: 'Full linguistic statistics: Flesch-Kincaid grade, lexical density, syllabification & stats.',
    icon: BarChart3,
    badge: 'Pro Metrics',
  },
];

export function TextToolsSuite() {
  const [activeTool, setActiveTool] = useState<TextToolId>('word-counter');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const preview = text.length > 70 ? `${text.slice(0, 70)}...` : text;
      logActivity('Text Tools', `Copied text output: "${preview.replace(/\n/g, ' ')}"`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  };

  const filteredTools = useMemo(() => {
    return TEXT_TOOLS_META.filter((tool) => {
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

  const currentToolMeta = TEXT_TOOLS_META.find((t) => t.id === activeTool) || TEXT_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="text-tools-suite-root">
      {/* 20 Tools Quick Grid Selector */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                Text Tools Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                20 OFFLINE ENGINES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select a specialized client-side utility below. All processing executes 100% locally in browser memory.
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
                placeholder="Search 20 text tools..."
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
                { id: 'all', label: 'All (20)' },
                { id: 'analysis', label: 'Analysis' },
                { id: 'transformation', label: 'Transform' },
                { id: 'cleaning', label: 'Clean' },
                { id: 'generation', label: 'Generate' },
                { id: 'utility', label: 'Utility' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Column Mini Grid for all 20 Tools */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border-cyan-400/50 shadow-md shadow-violet-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-sm'
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
      <div id="active-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-950 text-cyan-300 border border-violet-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero Network Calls</span>
          </div>
        </div>

        {/* Dynamic Tool Component Render */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'word-counter' && <WordCounterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'character-counter' && <CharacterCounterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'sentence-counter' && <SentenceCounterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'paragraph-counter' && <ParagraphCounterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'reading-time' && <ReadingTimeTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'case-converter' && <CaseConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'remove-extra-spaces' && <RemoveExtraSpacesTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'remove-empty-lines' && <RemoveEmptyLinesTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'reverse-text' && <ReverseTextTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'flip-text' && <FlipTextTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'sort-text' && <SortTextTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'shuffle-text' && <ShuffleTextTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'duplicate-remover' && <DuplicateRemoverTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'text-cleaner' && <TextCleanerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'slug-generator' && <SlugGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'random-text' && <RandomTextTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'lorem-ipsum' && <LoremIpsumTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'find-and-replace' && <FindAndReplaceTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'text-diff' && <TextDiffTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'text-statistics' && <TextStatisticsTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: Word Counter
   ========================================================================= */
function WordCounterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'The quick brown fox jumps over the lazy dog. Digital tools built with privacy-first client-side web technologies run entirely in memory without uploading your confidential sentences.'
  );

  const stats = useMemo(() => {
    const rawWords = text.trim() ? text.trim().split(/\s+/) : [];
    const cleanWords = rawWords.map((w) => w.replace(/[^\w]/g, '').toLowerCase()).filter(Boolean);
    const uniqueWords = new Set(cleanWords).size;
    const longestWord = cleanWords.reduce((a, b) => (b.length > a.length ? b : a), '');
    const shortWords = cleanWords.filter((w) => w.length <= 3).length;

    return {
      totalWords: rawWords.length,
      cleanWordsCount: cleanWords.length,
      uniqueWords,
      longestWord,
      shortWords,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Words" value={stats.totalWords} highlight />
        <StatCard label="Unique Words" value={stats.uniqueWords} />
        <StatCard label="Short Words (≤3 chars)" value={stats.shortWords} />
        <StatCard label="Longest Word" value={stats.longestWord || 'None'} isString />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Content</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('')}
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
            >
              Clear
            </button>
            <button
              onClick={() => onCopy(String(stats.totalWords), 'wc-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'wc-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'wc-copy' ? 'Word Count Copied' : 'Copy Count'}</span>
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste or type text to count words..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500 font-mono transition-colors"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: Character Counter
   ========================================================================= */
function CharacterCounterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>('InstaImagetools Client-Side Precision Suite ✨ 2026');

  const stats = useMemo(() => {
    const totalChars = text.length;
    const noSpaces = text.replace(/\s+/g, '').length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const byteSize = new Blob([text]).size;

    return { totalChars, noSpaces, letters, digits, specialChars, byteSize };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Characters" value={stats.totalChars} highlight />
        <StatCard label="Without Spaces" value={stats.noSpaces} />
        <StatCard label="Letters (A-Z)" value={stats.letters} />
        <StatCard label="Digits (0-9)" value={stats.digits} />
        <StatCard label="Special Symbols" value={stats.specialChars} />
        <StatCard label="UTF-8 Bytes" value={`${stats.byteSize} B`} isString />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Content</label>
          <button
            onClick={() => onCopy(String(stats.totalChars), 'char-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'char-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'char-copy' ? 'Character Count Copied' : 'Copy Total'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Type or paste content to inspect character quantities..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: Sentence Counter
   ========================================================================= */
function SentenceCounterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'How many sentences are in this document? There are three distinct sentences here! Each one demonstrates punctuation-based sentence segmentation.'
  );

  const stats = useMemo(() => {
    if (!text.trim()) return { count: 0, avgWords: 0, sentencesList: [] };
    const rawSentences = text
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const totalWords = text.trim().split(/\s+/).length;
    const avgWords = rawSentences.length > 0 ? (totalWords / rawSentences.length).toFixed(1) : 0;

    return {
      count: rawSentences.length,
      avgWords,
      sentencesList: rawSentences,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard label="Detected Sentences" value={stats.count} highlight />
        <StatCard label="Average Words Per Sentence" value={`${stats.avgWords} words`} isString />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Content</label>
          <button
            onClick={() => onCopy(String(stats.count), 'sent-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'sent-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sent-copy' ? 'Copied' : 'Copy Sentence Count'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Paragraph Counter
   ========================================================================= */
function ParagraphCounterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'First paragraph introducing the client-side architecture.\n\nSecond paragraph explaining that data is held securely in RAM.\n\nThird paragraph concluding with zero external API calls.'
  );

  const stats = useMemo(() => {
    if (!text.trim()) return { paragraphs: 0, lines: 0, avgSentencesPerPara: 0 };
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const lines = text.split(/\r\n|\r|\n/).length;

    return {
      paragraphs: paragraphs.length,
      lines,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Paragraph Count" value={stats.paragraphs} highlight />
        <StatCard label="Total Physical Lines" value={stats.lines} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Paragraph Content</label>
          <button
            onClick={() => onCopy(String(stats.paragraphs), 'para-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'para-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'para-copy' ? 'Copied' : 'Copy Paragraph Count'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Reading Time Calculator
   ========================================================================= */
function ReadingTimeTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'Reading speed is typically calculated between 200 and 250 words per minute for silent adult reading, and 130 to 150 words per minute for spoken speech presentations. By evaluating the density and syllable flow of your paragraphs, content creators can accurately estimate audience retention times.'
  );

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const silentSeconds = Math.round((words / 225) * 60);
    const speechSeconds = Math.round((words / 130) * 60);

    const formatDuration = (s: number) => {
      if (s < 60) return `${s} sec`;
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
    };

    return {
      words,
      silentTime: formatDuration(silentSeconds),
      speakingTime: formatDuration(speechSeconds),
      silentSecTotal: silentSeconds,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Word Count" value={stats.words} />
        <StatCard label="Silent Reading Time (225 WPM)" value={stats.silentTime} isString highlight />
        <StatCard label="Speech Presentation (130 WPM)" value={stats.speakingTime} isString />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Content</label>
          <button
            onClick={() => onCopy(stats.silentTime, 'read-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'read-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'read-copy' ? 'Time Copied' : 'Copy Reading Time'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Case Converter
   ========================================================================= */
function CaseConverterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>('hello world from insta image tools');

  const conversions = useMemo(() => {
    if (!text) return {};
    const lower = text.toLowerCase();
    const upper = text.toUpperCase();
    const title = lower.replace(/\b\w/g, (c) => c.toUpperCase());
    const sentence = lower.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
    
    // words splitting
    const words = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/);

    const camel = words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
    const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    const kebab = words.map((w) => w.toLowerCase()).join('-');
    const snake = words.map((w) => w.toLowerCase()).join('_');
    const constant = words.map((w) => w.toUpperCase()).join('_');

    return { upper, lower, title, sentence, camel, pascal, kebab, snake, constant };
  }, [text]);

  const applyConversion = (val: string) => {
    setText(val);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Content</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Type or paste text to convert casing..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Case Formats (Click to Copy or Apply):</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'upper', label: 'UPPERCASE', val: conversions.upper || '' },
            { id: 'lower', label: 'lowercase', val: conversions.lower || '' },
            { id: 'title', label: 'Title Case', val: conversions.title || '' },
            { id: 'sentence', label: 'Sentence case', val: conversions.sentence || '' },
            { id: 'camel', label: 'camelCase', val: conversions.camel || '' },
            { id: 'pascal', label: 'PascalCase', val: conversions.pascal || '' },
            { id: 'kebab', label: 'kebab-case', val: conversions.kebab || '' },
            { id: 'snake', label: 'snake_case', val: conversions.snake || '' },
            { id: 'constant', label: 'CONSTANT_CASE', val: conversions.constant || '' },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between gap-2 group hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyConversion(item.val)}
                    className="text-[10px] text-slate-400 hover:text-cyan-300 font-mono"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => onCopy(item.val, `case-${item.id}`)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    {copiedKey === `case-${item.id}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-xs font-mono text-cyan-300 truncate">{item.val || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Remove Extra Spaces
   ========================================================================= */
function RemoveExtraSpacesTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(
    'This   sentence    has       excessive     spacing   between     every    single     word.'
  );

  const cleaned = useMemo(() => {
    return input
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Spaces Normalized</label>
            <button
              onClick={() => onCopy(cleaned, 'spaces-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'spaces-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'spaces-copy' ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={cleaned}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Remove Empty Lines
   ========================================================================= */
function RemoveEmptyLinesTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(
    'Item 1\n\n\nItem 2\n\n\n\nItem 3\n\nItem 4'
  );

  const cleaned = useMemo(() => {
    return input
      .split(/\r\n|\r|\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Multi-line</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Empty Lines Removed</label>
            <button
              onClick={() => onCopy(cleaned, 'empty-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'empty-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'empty-copy' ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={cleaned}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Reverse Text
   ========================================================================= */
function ReverseTextTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Hello World! 12345');
  const [mode, setMode] = useState<'chars' | 'words' | 'lines'>('chars');

  const reversed = useMemo(() => {
    if (!input) return '';
    if (mode === 'chars') {
      return Array.from(input).reverse().join('');
    }
    if (mode === 'words') {
      return input.split(/\s+/).reverse().join(' ');
    }
    if (mode === 'lines') {
      return input.split(/\r\n|\r|\n/).reverse().join('\n');
    }
    return input;
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'chars', label: 'Reverse Characters' },
          { id: 'words', label: 'Reverse Words' },
          { id: 'lines', label: 'Reverse Lines' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === m.id
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Reversed Output</label>
            <button
              onClick={() => onCopy(reversed, 'rev-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'rev-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'rev-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={reversed}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: Flip Text (Upside Down)
   ========================================================================= */
function FlipTextTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('InstaImageTools Flip Text');

  const flipMap: Record<string, string> = {
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l',
    m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
    y: 'ʎ', z: 'z', A: '∀', B: 'ᗺ', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ',
    K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥', U: '∩', V: 'Λ',
    W: 'M', X: 'X', Y: '⅄', Z: 'Z', '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
    '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡',
  };

  const flipped = useMemo(() => {
    return (Array.from(input) as string[])
      .reverse()
      .map((c: string) => flipMap[c] || c)
      .join('');
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Regular Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Upside Down Output</label>
            <button
              onClick={() => onCopy(flipped, 'flip-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'flip-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'flip-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={flipped}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Sort Text
   ========================================================================= */
function SortTextTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Zebra\nApple\nBanana\nOrange\nCat\nMango');
  const [order, setOrder] = useState<'az' | 'za' | 'len-asc' | 'len-desc'>('az');

  const sorted = useMemo(() => {
    const lines = input.split(/\r\n|\r|\n/);
    if (order === 'az') return lines.sort((a, b) => a.localeCompare(b)).join('\n');
    if (order === 'za') return lines.sort((a, b) => b.localeCompare(a)).join('\n');
    if (order === 'len-asc') return lines.sort((a, b) => a.length - b.length).join('\n');
    if (order === 'len-desc') return lines.sort((a, b) => b.length - a.length).join('\n');
    return input;
  }, [input, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'az', label: 'Alphabetical (A ➔ Z)' },
          { id: 'za', label: 'Alphabetical (Z ➔ A)' },
          { id: 'len-asc', label: 'Shortest to Longest' },
          { id: 'len-desc', label: 'Longest to Shortest' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setOrder(btn.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              order === btn.id
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Sorted Lines</label>
            <button
              onClick={() => onCopy(sorted, 'sort-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'sort-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'sort-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={sorted}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Shuffle Text
   ========================================================================= */
function ShuffleTextTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Red\nGreen\nBlue\nYellow\nPurple\nCyan\nOrange');
  const [seed, setSeed] = useState<number>(0);
  const [shuffleMode, setShuffleMode] = useState<'lines' | 'words'>('lines');

  const shuffled = useMemo(() => {
    if (!input) return '';
    if (shuffleMode === 'lines') {
      const arr = input.split(/\r\n|\r|\n/);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('\n');
    } else {
      const arr = input.split(/\s+/);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join(' ');
    }
  }, [input, seed, shuffleMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setShuffleMode('lines')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold ${shuffleMode === 'lines' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Shuffle Lines
          </button>
          <button
            onClick={() => setShuffleMode('words')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold ${shuffleMode === 'words' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Shuffle Words
          </button>
        </div>

        <button
          onClick={() => setSeed((prev) => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Reshuffle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Shuffled Output</label>
            <button
              onClick={() => onCopy(shuffled, 'shuff-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'shuff-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'shuff-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={shuffled}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 13: Duplicate Line Remover
   ========================================================================= */
function DuplicateRemoverTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(
    'apple\nbanana\napple\norange\nbanana\ncherry\napple'
  );
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);

  const stats = useMemo(() => {
    const lines = input.split(/\r\n|\r|\n/);
    const seen = new Set<string>();
    const unique: string[] = [];
    let duplicatesCount = 0;

    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      } else {
        duplicatesCount++;
      }
    }

    return {
      cleaned: unique.join('\n'),
      totalLines: lines.length,
      uniqueLines: unique.length,
      duplicatesCount,
    };
  }, [input, caseSensitive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Case Sensitive</span>
          </label>
          <span className="text-slate-500">
            Removed <strong>{stats.duplicatesCount}</strong> duplicates ({stats.uniqueLines} unique lines remaining)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Deduplicated Text</label>
            <button
              onClick={() => onCopy(stats.cleaned, 'dedup-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'dedup-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'dedup-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={stats.cleaned}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Text Cleaner
   ========================================================================= */
function TextCleanerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(
    '<div class="header"><h1>Welcome to InstaImageTools! 🚀</h1><p>Café & naïve text with special characters #@$%.</p></div>'
  );
  const [stripHtml, setStripHtml] = useState<boolean>(true);
  const [stripEmojis, setStripEmojis] = useState<boolean>(false);
  const [stripSpecial, setStripSpecial] = useState<boolean>(false);
  const [normalizeAccents, setNormalizeAccents] = useState<boolean>(true);

  const cleaned = useMemo(() => {
    let res = input;
    if (stripHtml) {
      res = res.replace(/<[^>]*>?/gm, '');
    }
    if (normalizeAccents) {
      res = res.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    if (stripEmojis) {
      res = res.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    }
    if (stripSpecial) {
      res = res.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    return res;
  }, [input, stripHtml, stripEmojis, stripSpecial, normalizeAccents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={stripHtml}
            onChange={(e) => setStripHtml(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Strip HTML Tags</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={normalizeAccents}
            onChange={(e) => setNormalizeAccents(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Normalize Accents (é ➔ e)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={stripEmojis}
            onChange={(e) => setStripEmojis(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Remove Emojis</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={stripSpecial}
            onChange={(e) => setStripSpecial(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Remove Special Symbols</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Cleaned Result</label>
            <button
              onClick={() => onCopy(cleaned, 'clean-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'clean-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'clean-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={cleaned}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Slug Generator
   ========================================================================= */
function SlugGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Top 10 Best Client-Side Image Tools in 2026!');
  const [delimiter, setDelimiter] = useState<string>('-');
  const [lowercase, setLowercase] = useState<boolean>(true);

  const slug = useMemo(() => {
    let res = input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/\s+/g, delimiter);

    if (lowercase) res = res.toLowerCase();
    return res;
  }, [input, delimiter, lowercase]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Article / Page Title</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
        />
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Separator:</span>
          {['-', '_', '.'].map((d) => (
            <button
              key={d}
              onClick={() => setDelimiter(d)}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold ${
                delimiter === d ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Force Lowercase</span>
        </label>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">URL Slug Output</label>
          <button
            onClick={() => onCopy(slug, 'slug-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'slug-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'slug-copy' ? 'Copied' : 'Copy Slug'}</span>
          </button>
        </div>
        <div className="text-base font-mono font-bold text-cyan-300 break-all">{slug || '—'}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 16: Random Text Generator
   ========================================================================= */
function RandomTextTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [length, setLength] = useState<number>(32);
  const [type, setType] = useState<'alphanumeric' | 'hex' | 'words'>('alphanumeric');
  const [output, setOutput] = useState<string>('');

  const generate = () => {
    if (type === 'hex') {
      const arr = new Uint8Array(Math.ceil(length / 2));
      crypto.getRandomValues(arr);
      setOutput(Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, length));
    } else if (type === 'alphanumeric') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      const vals = new Uint32Array(length);
      crypto.getRandomValues(vals);
      for (let i = 0; i < length; i++) res += chars[vals[i] % chars.length];
      setOutput(res);
    } else {
      const dictionary = ['quantum', 'matrix', 'cipher', 'vector', 'pixel', 'render', 'hyper', 'pulse', 'spark', 'vertex', 'orbit', 'flux', 'nexus'];
      const words: string[] = [];
      for (let i = 0; i < Math.ceil(length / 6); i++) {
        words.push(dictionary[Math.floor(Math.random() * dictionary.length)]);
      }
      setOutput(words.join(' '));
    }
  };

  React.useEffect(() => {
    generate();
  }, [length, type]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['alphanumeric', 'hex', 'words'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
                type === t ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Target Length</span>
          <span className="font-mono text-cyan-400">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={128}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
        />
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Random Result</label>
          <button
            onClick={() => onCopy(output, 'rand-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'rand-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'rand-copy' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="text-sm font-mono font-bold text-cyan-300 break-all">{output}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 17: Lorem Ipsum Generator
   ========================================================================= */
function LoremIpsumTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [count, setCount] = useState<number>(3);
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod',
    'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
    'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
    'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generated = useMemo(() => {
    const makeSentence = () => {
      const len = 8 + Math.floor(Math.random() * 8);
      const w: string[] = [];
      for (let i = 0; i < len; i++) {
        w.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      return w[0].charAt(0).toUpperCase() + w.join(' ').slice(1) + '.';
    };

    const makeParagraph = () => {
      const numSentences = 4 + Math.floor(Math.random() * 3);
      const sentences: string[] = [];
      for (let i = 0; i < numSentences; i++) sentences.push(makeSentence());
      return sentences.join(' ');
    };

    if (unit === 'words') {
      const w: string[] = [];
      for (let i = 0; i < count; i++) w.push(loremWords[i % loremWords.length]);
      return w.join(' ');
    }
    if (unit === 'sentences') {
      const s: string[] = [];
      for (let i = 0; i < count; i++) s.push(makeSentence());
      return s.join(' ');
    }
    if (unit === 'paragraphs') {
      const p: string[] = [];
      for (let i = 0; i < count; i++) p.push(makeParagraph());
      return p.join('\n\n');
    }
    return '';
  }, [count, unit]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Generate:</span>
          {(['paragraphs', 'sentences', 'words'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
                unit === u ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Quantity: <strong className="text-cyan-400">{count}</strong></span>
          <input
            type="range"
            min={1}
            max={unit === 'words' ? 100 : 10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-32 accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Generated Mock Text</label>
          <button
            onClick={() => onCopy(generated, 'lorem-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'lorem-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'lorem-copy' ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>
        <textarea
          readOnly
          value={generated}
          rows={8}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none leading-relaxed font-sans"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 18: Find and Replace
   ========================================================================= */
function FindAndReplaceTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'The quick red fox jumps over the red fence. Red foxes are swift animals.'
  );
  const [findStr, setFindStr] = useState<string>('red');
  const [replaceStr, setReplaceStr] = useState<string>('violet');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);

  const { result, matchCount } = useMemo(() => {
    if (!findStr) return { result: text, matchCount: 0 };
    try {
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      const regex = useRegex ? new RegExp(findStr, flags) : new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = text.match(regex);
      const matchCount = matches ? matches.length : 0;
      const result = text.replace(regex, replaceStr);
      return { result, matchCount };
    } catch (e) {
      return { result: text, matchCount: 0 };
    }
  }, [text, findStr, replaceStr, caseSensitive, useRegex]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Find Text</label>
          <input
            type="text"
            value={findStr}
            onChange={(e) => setFindStr(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            placeholder="Search string..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Replace With</label>
          <input
            type="text"
            value={replaceStr}
            onChange={(e) => setReplaceStr(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-300 outline-none focus:border-cyan-500 font-mono"
            placeholder="Replacement string..."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Case Sensitive</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Regex Mode</span>
          </label>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'} replaced
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Replaced Output</label>
            <button
              onClick={() => onCopy(result, 'fnr-copy')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copiedKey === 'fnr-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'fnr-copy' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={result}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 19: Text Diff Checker
   ========================================================================= */
function TextDiffTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [original, setOriginal] = useState<string>(
    'The client-side engine executes in the browser.\nNo servers or network payloads are used.'
  );
  const [modified, setModified] = useState<string>(
    'The client-side engine executes in your modern browser memory.\nZero external servers or network payloads are ever transmitted.'
  );

  const diffLines = useMemo(() => {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);
    const rows = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i] ?? '';
      const m = modLines[i] ?? '';
      const isSame = o === m;
      rows.push({ lineNum: i + 1, o, m, isSame });
    }
    return rows;
  }, [original, modified]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Version (A)</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Modified Version (B)</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Visual Diff Comparison Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs font-mono">
        <div className="grid grid-cols-12 bg-slate-900/80 p-2.5 text-slate-400 border-b border-slate-800 font-bold">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Original (A)</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-5">Modified (B)</div>
        </div>

        <div className="divide-y divide-slate-900 max-h-60 overflow-y-auto">
          {diffLines.map((row) => (
            <div
              key={row.lineNum}
              className={`grid grid-cols-12 p-2.5 items-center ${
                row.isSame ? 'bg-transparent text-slate-400' : 'bg-violet-950/20 text-cyan-200'
              }`}
            >
              <div className="col-span-1 text-center text-slate-600">{row.lineNum}</div>
              <div className="col-span-5 truncate">{row.o || <span className="text-slate-700 font-sans italic">empty</span>}</div>
              <div className="col-span-1 text-center">
                {row.isSame ? (
                  <span className="text-slate-600">==</span>
                ) : (
                  <span className="text-cyan-400 font-bold">!=</span>
                )}
              </div>
              <div className="col-span-5 truncate">{row.m || <span className="text-slate-700 font-sans italic">empty</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 20: Text Statistics & Readability
   ========================================================================= */
function TextStatisticsTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [text, setText] = useState<string>(
    'The mathematical elegance of client-side web utility architectures stems from executing cryptographic transformations, compression codecs, and linguistic parsers entirely within the user sandbox. This mitigates latency while providing unparalleled privacy assurances.'
  );

  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        words: 0,
        chars: 0,
        sentences: 0,
        syllables: 0,
        avgWordLen: 0,
        fleschScore: 0,
        readingLevel: 'N/A',
        lexicalDensity: '0%',
      };
    }

    const wordsArr = text.trim().split(/\s+/);
    const words = wordsArr.length;
    const chars = text.length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;

    // Simple syllable counter heuristic
    let syllables = 0;
    wordsArr.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length <= 3) {
        syllables += 1;
      } else {
        const matches = clean.match(/[aeiouy]{1,2}/g);
        syllables += matches ? matches.length : 1;
      }
    });

    const avgWordLen = (chars / (words || 1)).toFixed(1);
    
    // Flesch Reading Ease Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
    const flesch = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / (words || 1)));

    let readingLevel = 'Standard / Plain English';
    if (flesch >= 90) readingLevel = 'Very Easy (5th Grade)';
    else if (flesch >= 80) readingLevel = 'Easy (6th Grade)';
    else if (flesch >= 70) readingLevel = 'Fairly Easy (7th Grade)';
    else if (flesch >= 60) readingLevel = 'Standard (8th & 9th Grade)';
    else if (flesch >= 50) readingLevel = 'Fairly Difficult (High School)';
    else if (flesch >= 30) readingLevel = 'Difficult (College)';
    else readingLevel = 'Very Difficult (Graduate / Technical)';

    const uniqueWords = new Set(wordsArr.map((w) => w.toLowerCase())).size;
    const lexicalDensity = `${Math.round((uniqueWords / words) * 100)}%`;

    return {
      words,
      chars,
      sentences,
      syllables,
      avgWordLen,
      fleschScore: flesch,
      readingLevel,
      lexicalDensity,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Flesch Reading Ease" value={`${stats.fleschScore} / 100`} isString highlight />
        <StatCard label="Reading Grade Level" value={stats.readingLevel} isString />
        <StatCard label="Lexical Density" value={stats.lexicalDensity} isString />
        <StatCard label="Avg Characters / Word" value={stats.avgWordLen} isString />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Input Corpus</label>
          <button
            onClick={() => onCopy(`Flesch Score: ${stats.fleschScore}, Grade: ${stats.readingLevel}`, 'stats-copy')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            {copiedKey === 'stats-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'stats-copy' ? 'Copied' : 'Copy Metrics'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500 font-mono"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   Reusable Micro Stat Card
   ========================================================================= */
function StatCard({
  label,
  value,
  highlight = false,
  isString = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  isString?: boolean;
}) {
  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-violet-950/60 to-cyan-950/60 border-cyan-500/40 shadow-lg shadow-violet-950/30'
          : 'bg-slate-950 border-slate-800/80'
      }`}
    >
      <span className="text-[10px] font-semibold text-slate-400 truncate block leading-tight">{label}</span>
      <div
        className={`mt-1 font-extrabold truncate ${
          isString ? 'text-sm font-sans' : 'text-xl font-mono'
        } ${highlight ? 'text-cyan-300' : 'text-slate-100'}`}
      >
        {value}
      </div>
    </div>
  );
}
