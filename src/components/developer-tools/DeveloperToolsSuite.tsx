import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Code,
  FileJson,
  CheckCircle2,
  Minimize2,
  FileCode,
  CheckCheck,
  Globe,
  Palette,
  Terminal,
  FileText,
  FileSearch,
  Clock,
  Fingerprint,
  Key,
  ShieldCheck,
  Calendar,
  Database,
  Users,
  Copy,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';

export type DeveloperToolId =
  | 'json-formatter'
  | 'json-validator'
  | 'json-minifier'
  | 'json-beautifier'
  | 'xml-formatter'
  | 'xml-validator'
  | 'html-formatter'
  | 'css-formatter'
  | 'js-beautifier'
  | 'js-minifier'
  | 'css-minifier'
  | 'html-minifier'
  | 'regex-tester'
  | 'cron-generator'
  | 'uuid-generator'
  | 'hash-generator'
  | 'uuid-validator'
  | 'timestamp-converter'
  | 'mock-api-generator'
  | 'fake-data-generator';

export interface DeveloperToolMeta {
  id: DeveloperToolId;
  name: string;
  category: 'json-xml' | 'format-minify' | 'crypto-regex' | 'generators';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const DEVELOPER_TOOLS_META: DeveloperToolMeta[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Format and prettify raw JSON strings with custom 2-space, 4-space, or tab indentations.',
    icon: FileJson,
    badge: 'Popular',
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Real-time JSON syntax validator highlighting exact errors and line numbers.',
    icon: CheckCircle2,
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Compress JSON by removing whitespace, line breaks, and unnecessary spaces.',
    icon: Minimize2,
  },
  {
    id: 'json-beautifier',
    name: 'JSON Tree Beautifier',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Syntax-colored, collapsible and expandable JSON interactive tree viewer.',
    icon: Code,
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Pretty-print messy XML strings with properly nested tag indentations.',
    icon: FileCode,
  },
  {
    id: 'xml-validator',
    name: 'XML Validator',
    category: 'json-xml',
    categoryLabel: 'JSON & XML',
    description: 'Validate XML markup using native browser DOMParser with error diagnosis.',
    icon: CheckCheck,
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Clean up unformatted HTML snippets with proper structural indentations.',
    icon: Globe,
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Beautify CSS stylesheets with consistent selector blocks and rule formatting.',
    icon: Palette,
  },
  {
    id: 'js-beautifier',
    name: 'JavaScript Beautifier',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Format unorganized JavaScript code snippets with clean bracket and tab spacing.',
    icon: Terminal,
  },
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Minify JavaScript by stripping single/multi-line comments and whitespace.',
    icon: Minimize2,
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Compress CSS stylesheets by removing comments, newlines, and space padding.',
    icon: Minimize2,
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    category: 'format-minify',
    categoryLabel: 'Format & Minify',
    description: 'Compress HTML markup by stripping comments and redundant whitespace.',
    icon: Minimize2,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    category: 'crypto-regex',
    categoryLabel: 'Crypto & Regex',
    description: 'Interactive regular expression tester with flags, live match highlights, and groups.',
    icon: FileSearch,
    badge: 'Regex Flags',
  },
  {
    id: 'cron-generator',
    name: 'Cron Schedule Generator',
    category: 'crypto-regex',
    categoryLabel: 'Crypto & Regex',
    description: 'Visual builder for 5-part Cron expressions with plain-English human schedule summaries.',
    icon: Calendar,
  },
  {
    id: 'uuid-generator',
    name: 'UUID v4 Bulk Generator',
    category: 'crypto-regex',
    categoryLabel: 'Crypto & Regex',
    description: 'Generate cryptographically random UUID v4 strings using window.crypto.',
    icon: Fingerprint,
    badge: 'Crypto',
  },
  {
    id: 'hash-generator',
    name: 'Crypto Hash Generator',
    category: 'crypto-regex',
    categoryLabel: 'Crypto & Regex',
    description: 'Generate SHA-256, SHA-512, SHA-1, and MD5 hashes using client-side SubtleCrypto.',
    icon: Key,
    badge: 'SubtleCrypto',
  },
  {
    id: 'uuid-validator',
    name: 'UUID Validator',
    category: 'crypto-regex',
    categoryLabel: 'Crypto & Regex',
    description: 'Verify strings against standard UUID RFC 4122 versions (v1, v3, v4, v5).',
    icon: ShieldCheck,
  },
  {
    id: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    category: 'generators',
    categoryLabel: 'Generators & Mock',
    description: 'Convert Unix epoch timestamps (seconds/ms) to ISO 8601, UTC, and local date formats.',
    icon: Clock,
  },
  {
    id: 'mock-api-generator',
    name: 'Mock API / JSON Generator',
    category: 'generators',
    categoryLabel: 'Generators & Mock',
    description: 'Generate offline mock REST API JSON payloads for users, products, and posts.',
    icon: Database,
    badge: 'Mock REST',
  },
  {
    id: 'fake-data-generator',
    name: 'Fake Data Generator',
    category: 'generators',
    categoryLabel: 'Generators & Mock',
    description: 'Generate mock user profiles, names, emails, phone numbers, and addresses.',
    icon: Users,
  },
];

/* =========================================================================
   PURE CLIENT-SIDE UTILITIES FOR DEVELOPER TOOLS
   ========================================================================= */

// Pure client-side MD5 implementation
export function md5(str: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = convertToWordArray(str);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// Client-side XML Prettifier
export function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  xml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
  const pad = (n: number) => tab.repeat(Math.max(0, n));

  xml.split('\r\n').forEach((node) => {
    node = node.trim();
    if (!node) return;
    let indentAdjustment = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indentAdjustment = 0;
    } else if (node.match(/^<\/\w/)) {
      if (indent > 0) indent -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indentAdjustment = 1;
    }
    formatted += pad(indent) + node + '\r\n';
    indent += indentAdjustment;
  });
  return formatted.trim();
}

// Client-side HTML Formatter
export function formatHtml(html: string): string {
  let indent = 0;
  const tab = '  ';
  return html
    .replace(/></g, '>\n<')
    .split('\n')
    .map((line) => {
      line = line.trim();
      if (!line) return '';
      if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
      const res = tab.repeat(indent) + line;
      if (line.match(/^<\w[^>]*[^\/]>$/) && !line.startsWith('<!') && !line.startsWith('<?')) {
        indent += 1;
      }
      return res;
    })
    .filter(Boolean)
    .join('\n');
}

// Client-side CSS Formatter
export function formatCss(css: string): string {
  return css
    .replace(/\s*\{\s*/g, ' {\n  ')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*\}\s*/g, '\n}\n\n')
    .replace(/\n\s*\n\s*\}/g, '\n}')
    .trim();
}

// Client-side JS Beautifier
export function formatJs(js: string): string {
  let indent = 0;
  const tab = '  ';
  const lines = js
    .replace(/\{/g, '{\n')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .split('\n');

  return lines
    .map((line) => {
      line = line.trim();
      if (!line) return '';
      if (line.startsWith('}')) indent = Math.max(0, indent - 1);
      const formatted = tab.repeat(indent) + line;
      if (line.endsWith('{')) indent += 1;
      return formatted;
    })
    .filter(Boolean)
    .join('\n');
}

export function DeveloperToolsSuite() {
  const [activeTool, setActiveTool] = useState<DeveloperToolId>('json-formatter');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const toolName = DEVELOPER_TOOLS_META.find((t) => t.id === activeTool)?.name || 'Developer Tool';
      logActivity(toolName, `Copied output (${text.length} chars)`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return DEVELOPER_TOOLS_META.filter((tool) => {
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
    DEVELOPER_TOOLS_META.find((t) => t.id === activeTool) || DEVELOPER_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="developer-tools-suite-root">
      {/* 20 Tools Dashboard Switcher */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                Developer Tools Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                20 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              JSON/XML/CSS/HTML formatters & minifiers, Regex tester, Cron scheduler, UUID v4, Crypto Hashes & Mock Data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 20 developer tools..."
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
                { id: 'json-xml', label: 'JSON & XML' },
                { id: 'format-minify', label: 'Format & Minify' },
                { id: 'crypto-regex', label: 'Crypto & Regex' },
                { id: 'generators', label: 'Mock & Generators' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 20 Tools Multi-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  document.getElementById('active-developer-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-500/20 border-cyan-400/50 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-sm'
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
      <div id="active-developer-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-[1.5px] shadow-lg shadow-cyan-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentToolMeta.name}</h3>
                {currentToolMeta.badge && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                    {currentToolMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentToolMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Pure JS</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'json-formatter' && <JsonFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'json-validator' && <JsonValidatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'json-minifier' && <JsonMinifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'json-beautifier' && <JsonBeautifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'xml-formatter' && <XmlFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'xml-validator' && <XmlValidatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'html-formatter' && <HtmlFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'css-formatter' && <CssFormatterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'js-beautifier' && <JsBeautifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'js-minifier' && <JsMinifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'css-minifier' && <CssMinifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'html-minifier' && <HtmlMinifierTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'regex-tester' && <RegexTesterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'cron-generator' && <CronGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'uuid-generator' && <UuidGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'hash-generator' && <HashGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'uuid-validator' && <UuidValidatorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'timestamp-converter' && <TimestampConverterTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'mock-api-generator' && <MockApiGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'fake-data-generator' && <FakeDataGeneratorTool onCopy={handleCopy} copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1, 2, 3, 4: JSON Formatter, Validator, Minifier, Tree Beautifier
   ========================================================================= */
const DEFAULT_JSON = `{\n  "appName": "DevSuite",\n  "version": 2.5,\n  "offline": true,\n  "features": ["formatting", "validation", "mocking"],\n  "author": {\n    "name": "Alex Smith",\n    "role": "Lead Architect"\n  }\n}`;

function JsonFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_JSON);
  const [indent, setIndent] = useState<number>(2);

  const { output, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      return { output: JSON.stringify(parsed, null, indent), error: null };
    } catch (err: any) {
      return { output: '', error: err.message };
    }
  }, [input, indent]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400">Indentation:</span>
        <div className="flex gap-2">
          {[
            { label: '2 Spaces', val: 2 },
            { label: '4 Spaces', val: 4 },
            { label: 'Compact', val: 0 },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setIndent(opt.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                indent === opt.val ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <SideBySideCodePanel
        input={input}
        setInput={setInput}
        output={error ? `// JSON Syntax Error:\n${error}` : output}
        isError={!!error}
        inputLabel="Raw JSON Input"
        outputLabel="Formatted JSON"
        copyKey="json-fmt"
        onCopy={onCopy}
        copiedKey={copiedKey}
      />
    </div>
  );
}

function JsonValidatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_JSON);

  const validation = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      const countKeys = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 1;
        return Object.keys(obj).length;
      };
      return {
        isValid: true,
        message: 'Valid JSON format! Syntax check passed.',
        keys: countKeys(parsed),
        type: Array.isArray(parsed) ? 'Array' : typeof parsed,
      };
    } catch (err: any) {
      return {
        isValid: false,
        message: err.message,
        keys: 0,
        type: 'Invalid',
      };
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        validation.isValid
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          {validation.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <div>
            <div className="font-bold text-sm">{validation.isValid ? 'Valid JSON' : 'Syntax Error Detected'}</div>
            <div className="text-xs opacity-90 font-mono mt-0.5">{validation.message}</div>
          </div>
        </div>
        {validation.isValid && (
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/30">
            Root: {validation.type}
          </span>
        )}
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON Input to Validate</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white outline-none focus:border-cyan-500"
        />
      </div>
    </div>
  );
}

function JsonMinifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_JSON);

  const { output, error, ratio } = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      const saved = input.length ? Math.round(((input.length - minified.length) / input.length) * 100) : 0;
      return { output: minified, error: null, ratio: Math.max(0, saved) };
    } catch (err: any) {
      return { output: '', error: err.message, ratio: 0 };
    }
  }, [input]);

  return (
    <div className="space-y-4">
      {ratio > 0 && (
        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-xl w-fit">
          Saved ~{ratio}% file size reduction!
        </div>
      )}
      <SideBySideCodePanel
        input={input}
        setInput={setInput}
        output={error ? `// Error: ${error}` : output}
        isError={!!error}
        inputLabel="Formatted JSON"
        outputLabel="Minified JSON (Single-line)"
        copyKey="json-min"
        onCopy={onCopy}
        copiedKey={copiedKey}
      />
    </div>
  );
}

function JsonBeautifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_JSON);

  const parsedData = useMemo(() => {
    try {
      return { data: JSON.parse(input), error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, [input]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON Source</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Interactive JSON Tree</span>
          <button
            onClick={() => onCopy(input, 'json-tree')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            {copiedKey === 'json-tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Raw</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[300px] overflow-y-auto font-mono text-xs text-slate-300">
          {parsedData.error ? (
            <div className="text-rose-400 font-sans text-xs">Invalid JSON: {parsedData.error}</div>
          ) : (
            <JsonTreeNode data={parsedData.data} label="root" isLast />
          )}
        </div>
      </div>
    </div>
  );
}

function JsonTreeNode({ data, label, isLast }: { data: any; label: string; isLast: boolean; key?: React.Key }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  if (!isObject) {
    let color = 'text-amber-300';
    if (typeof data === 'string') color = 'text-emerald-300';
    if (typeof data === 'boolean') color = 'text-purple-300';
    if (data === null) color = 'text-slate-500';

    return (
      <div className="pl-4 py-0.5">
        <span className="text-cyan-400 font-semibold">"{label}"</span>: <span className={color}>{JSON.stringify(data)}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="pl-4 py-0.5">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="cursor-pointer hover:bg-slate-800/60 rounded px-1 -ml-1 inline-flex items-center gap-1 select-none"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        <span className="text-cyan-400 font-semibold">"{label}"</span>: <span className="text-slate-400">{openBracket}</span>
        {collapsed && <span className="text-slate-500 text-[10px]">({keys.length} items)...</span>}
      </div>

      {!collapsed && (
        <div className="border-l border-slate-800 ml-2">
          {keys.map((k, idx) => (
            <JsonTreeNode key={k} data={data[k]} label={k} isLast={idx === keys.length - 1} />
          ))}
        </div>
      )}

      <div>
        <span className="text-slate-400">{closeBracket}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5 & 6: XML Formatter & Validator
   ========================================================================= */
const DEFAULT_XML = `<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>`;

function XmlFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_XML);
  const output = useMemo(() => formatXml(input), [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="Raw XML" outputLabel="Formatted XML" copyKey="xml-fmt" onCopy={onCopy} copiedKey={copiedKey} />;
}

function XmlValidatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>(DEFAULT_XML);

  const validation = useMemo(() => {
    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(input, 'application/xml');
      const parserError = dom.querySelector('parsererror');
      if (parserError) {
        return { isValid: false, message: parserError.textContent || 'XML Parsing Error' };
      }
      return { isValid: true, message: 'Valid XML document! No syntax issues found.' };
    } catch (err: any) {
      return { isValid: false, message: err.message };
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
        validation.isValid ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
      }`}>
        {validation.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <div>
          <div className="font-bold text-sm">{validation.isValid ? 'Valid XML Structure' : 'XML Parsing Error'}</div>
          <div className="text-xs opacity-90 font-mono mt-0.5">{validation.message}</div>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">XML Markup</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white outline-none focus:border-cyan-500"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7, 8, 9: HTML, CSS, JS Formatters
   ========================================================================= */
function HtmlFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('<div class="container"><header><h1>Title</h1><p>Description</p></header><main><button>Click Me</button></main></div>');
  const output = useMemo(() => formatHtml(input), [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="Messy HTML" outputLabel="Formatted HTML" copyKey="html-fmt" onCopy={onCopy} copiedKey={copiedKey} />;
}

function CssFormatterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('body{background:#000;color:#fff;font-family:sans-serif}.btn{padding:10px 20px;border-radius:8px;background:blue}');
  const output = useMemo(() => formatCss(input), [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="Raw CSS" outputLabel="Formatted CSS" copyKey="css-fmt" onCopy={onCopy} copiedKey={copiedKey} />;
}

function JsBeautifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('function calculateSum(a,b){const total=a+b;if(total>100){console.log("Large sum");return total;}return 0;}');
  const output = useMemo(() => formatJs(input), [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="Minified / Raw JavaScript" outputLabel="Beautified JavaScript" copyKey="js-fmt" onCopy={onCopy} copiedKey={copiedKey} />;
}

/* =========================================================================
   TOOL 10, 11, 12: JS, CSS, HTML Minifiers
   ========================================================================= */
function JsMinifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('// Calculator utility\nfunction add(a, b) {\n  /* Multi-line comment */\n  return a + b;\n}');
  const output = useMemo(() => {
    return input
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([=+\-*/%{}();,:])\s*/g, '$1')
      .trim();
  }, [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="Source JavaScript" outputLabel="Minified JS" copyKey="js-min" onCopy={onCopy} copiedKey={copiedKey} />;
}

function CssMinifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('/* Main Stylesheet */\nbody {\n  background-color: #0f172a;\n  color: #f8fafc;\n  padding: 20px;\n}');
  const output = useMemo(() => {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }, [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="CSS Stylesheet" outputLabel="Minified CSS" copyKey="css-min" onCopy={onCopy} copiedKey={copiedKey} />;
}

function HtmlMinifierTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('<!-- Page Header -->\n<div class="card">\n  <h2>Hello World</h2>\n  <p>Test description</p>\n</div>');
  const output = useMemo(() => {
    return input
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }, [input]);

  return <SideBySideCodePanel input={input} setInput={setInput} output={output} inputLabel="HTML Document" outputLabel="Minified HTML" copyKey="html-min" onCopy={onCopy} copiedKey={copiedKey} />;
}

/* =========================================================================
   TOOL 13: Regex Tester
   ========================================================================= */
function RegexTesterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [pattern, setPattern] = useState<string>('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });
  const [testText, setTestText] = useState<string>('Contact us at info@example.com or support@google.com for assistance.');

  const flagStr = useMemo(() => {
    let res = '';
    if (flags.g) res += 'g';
    if (flags.i) res += 'i';
    if (flags.m) res += 'm';
    if (flags.s) res += 's';
    if (flags.u) res += 'u';
    return res;
  }, [flags]);

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flagStr);
      const matchArr: { match: string; index: number; groups?: string[] }[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(testText)) !== null) {
          matchArr.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        const m = regex.exec(testText);
        if (m) matchArr.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return { matches: matchArr, error: null };
    } catch (err: any) {
      return { matches: [], error: err.message };
    }
  }, [pattern, flagStr, testText, flags.g]);

  return (
    <div className="space-y-6">
      {/* Pattern and Flags Input */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Regular Expression Pattern</label>
          <div className="flex items-center gap-2">
            {(['g', 'i', 'm', 's', 'u'] as const).map((flag) => (
              <button
                key={flag}
                onClick={() => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold border transition-all ${
                  flags[flag]
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3">
          <span className="text-slate-500 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-transparent font-mono text-sm text-cyan-300 outline-none"
            placeholder="[a-zA-Z0-9]+"
          />
          <span className="text-slate-500 font-mono">/{flagStr}</span>
        </div>
        {error && <div className="text-xs text-rose-400 font-mono">{error}</div>}
      </div>

      {/* Test String & Live Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Test String</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
            <span>Match Results ({matches.length})</span>
            {matches.length > 0 && (
              <button
                onClick={() => onCopy(matches.map((m) => m.match).join('\n'), 'regex-res')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'regex-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Matches</span>
              </button>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[220px] overflow-y-auto space-y-2 font-mono text-xs">
            {matches.length === 0 ? (
              <div className="text-slate-500 italic">No matches found for pattern.</div>
            ) : (
              matches.map((m, idx) => (
                <div key={idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-emerald-300 font-bold">{m.match}</span>
                  <span className="text-slate-500 text-[10px]">index {m.index}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Cron Schedule Generator
   ========================================================================= */
function CronGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [minute, setMinute] = useState<string>('0');
  const [hour, setHour] = useState<string>('12');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const description = useMemo(() => {
    if (cronExpression === '* * * * *') return 'Runs every minute of every day.';
    if (cronExpression === '0 * * * *') return 'Runs at minute 0 of every hour.';
    if (cronExpression === '0 0 * * *') return 'Runs at midnight (00:00) every day.';
    if (cronExpression === '0 12 * * *') return 'Runs at 12:00 PM (Noon) every day.';
    if (cronExpression === '*/15 * * * *') return 'Runs every 15 minutes.';
    if (cronExpression === '0 0 * * 0') return 'Runs at midnight every Sunday.';
    return `Runs at minute ${minute}, hour ${hour}, on day ${dayOfMonth} of month ${month}, day of week ${dayOfWeek}.`;
  }, [cronExpression, minute, hour, dayOfMonth, month, dayOfWeek]);

  return (
    <div className="space-y-6">
      {/* Generated Cron Preview Card */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Generated Cron Expression</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 tracking-widest select-all">
            {cronExpression}
          </span>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{description}</span>
          </p>
        </div>

        <button
          onClick={() => onCopy(cronExpression, 'cron-exp')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-90"
        >
          {copiedKey === 'cron-exp' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>Copy Cron</span>
        </button>
      </div>

      {/* Preset Quick Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase">Common Presets</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Every Minute', exp: ['*', '*', '*', '*', '*'] },
            { label: 'Every 15 Mins', exp: ['*/15', '*', '*', '*', '*'] },
            { label: 'Every Hour', exp: ['0', '*', '*', '*', '*'] },
            { label: 'Daily at Noon', exp: ['0', '12', '*', '*', '*'] },
            { label: 'Daily Midnight', exp: ['0', '0', '*', '*', '*'] },
            { label: 'Weekly (Sun)', exp: ['0', '0', '*', '*', '0'] },
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMinute(p.exp[0]);
                setHour(p.exp[1]);
                setDayOfMonth(p.exp[2]);
                setMonth(p.exp[3]);
                setDayOfWeek(p.exp[4]);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Field Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Minute (0-59)', val: minute, setVal: setMinute },
          { label: 'Hour (0-23)', val: hour, setVal: setHour },
          { label: 'Day of Month (1-31)', val: dayOfMonth, setVal: setDayOfMonth },
          { label: 'Month (1-12)', val: month, setVal: setMonth },
          { label: 'Day of Week (0-6)', val: dayOfWeek, setVal: setDayOfWeek },
        ].map((f, i) => (
          <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block truncate">{f.label}</span>
            <input
              type="text"
              value={f.val}
              onChange={(e) => f.setVal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center text-cyan-300 font-bold text-sm outline-none focus:border-cyan-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: UUID v4 Bulk Generator
   ========================================================================= */
function UuidGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [noHyphens, setNoHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      if (noHyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  }, [count, uppercase, noHyphens]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Count:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-cyan-300 font-bold text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-cyan-500"
            />
            <span>UPPERCASE</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={noHyphens}
              onChange={(e) => setNoHyphens(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-cyan-500"
            />
            <span>No Hyphens</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateUuids}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={() => onCopy(uuids.join('\n'), 'all-uuids')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            {copiedKey === 'all-uuids' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {uuids.map((id, idx) => (
          <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="font-mono text-xs text-cyan-300 select-all">{id}</span>
            <button
              onClick={() => onCopy(id, `uuid-${idx}`)}
              className="text-slate-400 hover:text-white p-1"
            >
              {copiedKey === `uuid-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 16: Crypto Hash Generator (SubtleCrypto + Pure MD5)
   ========================================================================= */
function HashGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('Hello AI Studio 2026');
  const [hashes, setHashes] = useState<Record<string, string>>({
    'MD5': '',
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': '',
  });

  useEffect(() => {
    async function computeHashes() {
      const md5Result = md5(input);
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      async function digest(algo: string) {
        try {
          const buffer = await crypto.subtle.digest(algo, data);
          return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        } catch {
          return 'Unsupported algorithm';
        }
      }

      const sha1 = await digest('SHA-1');
      const sha256 = await digest('SHA-256');
      const sha512 = await digest('SHA-512');

      setHashes({
        'MD5': md5Result,
        'SHA-1': sha1,
        'SHA-256': sha256,
        'SHA-512': sha512,
      });
    }

    computeHashes();
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase">Input Text to Hash</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white text-sm outline-none focus:border-cyan-500"
        />
      </div>

      <div className="space-y-3">
        {Object.entries(hashes).map(([algo, hashVal]) => (
          <div key={algo} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span className="text-cyan-400">{algo}</span>
              <button
                onClick={() => onCopy(hashVal as string, algo)}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === algo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl text-xs font-mono text-amber-300 break-all select-all">
              {(hashVal as string) || 'Calculating...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 17: UUID Validator
   ========================================================================= */
function UuidValidatorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [input, setInput] = useState<string>('c83bfa0c-26da-4f12-9c16-d3a933f7c461');

  const validation = useMemo(() => {
    const trimmed = input.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const match = trimmed.match(uuidRegex);

    if (match) {
      return {
        isValid: true,
        version: `UUID Version ${match[1]}`,
        message: 'Valid RFC 4122 standard UUID format!',
      };
    }
    return {
      isValid: false,
      version: 'None',
      message: 'Invalid UUID. Expected format: 8-4-4-4-12 hex characters.',
    };
  }, [input]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        validation.isValid ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          {validation.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <div>
            <div className="font-bold text-sm">{validation.isValid ? 'Valid UUID String' : 'Invalid UUID Format'}</div>
            <div className="text-xs opacity-90 font-mono mt-0.5">{validation.message}</div>
          </div>
        </div>
        {validation.isValid && (
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/30">
            {validation.version}
          </span>
        )}
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase">Input UUID String</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-500"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 18: Unix Timestamp Converter
   ========================================================================= */
function TimestampConverterTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [timestamp, setTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());

  const parsedDate = useMemo(() => {
    const num = parseInt(timestamp, 10);
    if (isNaN(num)) return null;
    const ms = timestamp.length > 10 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;

    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative: timeAgo(date),
    };
  }, [timestamp]);

  function timeAgo(date: Date) {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase">Unix Epoch Timestamp (Seconds or ms)</label>
          <button
            onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Set Current Time
          </button>
        </div>
        <input
          type="text"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-lg text-cyan-300 font-bold outline-none"
        />
      </div>

      {parsedDate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'ISO 8601', val: parsedDate.iso, id: 'ts-iso' },
            { label: 'UTC String', val: parsedDate.utc, id: 'ts-utc' },
            { label: 'Local Timezone', val: parsedDate.local, id: 'ts-loc' },
            { label: 'Relative Difference', val: parsedDate.relative, id: 'ts-rel' },
          ].map((item) => (
            <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>{item.label}</span>
                <button onClick={() => onCopy(item.val, item.id)} className="text-slate-400 hover:text-white">
                  {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm font-mono text-white break-all">{item.val}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-mono">
          Invalid Unix timestamp number.
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 19: Mock API / JSON Generator
   ========================================================================= */
function MockApiGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [schemaType, setSchemaType] = useState<'users' | 'products' | 'posts'>('users');
  const [count, setCount] = useState<number>(3);

  const mockPayload = useMemo(() => {
    const list: any[] = [];
    for (let i = 1; i <= count; i++) {
      if (schemaType === 'users') {
        list.push({
          id: i,
          name: ['Alex Rivera', 'Sarah Jenkins', 'Marcus Chen', 'Emily Blunt', 'David Kim'][i % 5],
          email: `user${i}@example.com`,
          role: i === 1 ? 'admin' : 'member',
          status: 'active',
          avatarUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%236366f1'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='24' font-family='sans-serif'>U${i}</text></svg>`,
        });
      } else if (schemaType === 'products') {
        list.push({
          id: i,
          title: ['Wireless Mechanical Keyboard', 'Ultra-Wide 4K Monitor', 'Noise Cancelling Headphones', 'Ergonomic Chair'][i % 4],
          price: 99.99 + i * 20,
          category: 'electronics',
          inStock: true,
          rating: 4.8,
        });
      } else {
        list.push({
          id: i,
          title: `Building Offline-First Web Applications - Part ${i}`,
          authorId: 10 + i,
          tags: ['typescript', 'react', 'tailwind'],
          publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
          views: 1240 * i,
        });
      }
    }
    return JSON.stringify({ status: 200, total: count, data: list }, null, 2);
  }, [schemaType, count]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Endpoint Entity:</span>
          {(['users', 'products', 'posts'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSchemaType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${
                schemaType === type ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Records:</span>
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-cyan-300 font-bold text-xs"
          />
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
          <span>Mock JSON Response Payload</span>
          <button
            onClick={() => onCopy(mockPayload, 'mock-payload')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            {copiedKey === 'mock-payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Mock JSON</span>
          </button>
        </div>
        <textarea
          readOnly
          value={mockPayload}
          rows={12}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-amber-300 outline-none select-all"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 20: Fake Data Generator
   ========================================================================= */
function FakeDataGeneratorTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [count, setCount] = useState<number>(4);

  const fakeData = useMemo(() => {
    const firstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'James', 'Amelia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const cities = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Singapore'];

    const items = [];
    for (let i = 0; i < count; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[(i + 2) % lastNames.length];
      const city = cities[i % cities.length];
      items.push({
        id: crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `uid-${i + 1}`,
        fullName: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.org`,
        phone: `+1 (555) ${100 + i * 15}-${1000 + i * 23}`,
        city: city,
        ipAddress: `192.168.1.${10 + i}`,
      });
    }
    return items;
  }, [count]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Generate Profiles:</span>
          <input
            type="number"
            min="1"
            max="15"
            value={count}
            onChange={(e) => setCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-cyan-300 font-bold text-xs"
          />
        </div>

        <button
          onClick={() => onCopy(JSON.stringify(fakeData, null, 2), 'fake-profiles')}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          {copiedKey === 'fake-profiles' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy JSON Array</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fakeData.map((profile) => (
          <div key={profile.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">{profile.fullName}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                ID: {profile.id}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>Email: <span className="text-slate-200">{profile.email}</span></div>
              <div>Phone: <span className="text-slate-200">{profile.phone}</span></div>
              <div>City: <span className="text-slate-200">{profile.city}</span></div>
              <div>IP: <span className="text-slate-200">{profile.ipAddress}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   REUSABLE CODE PANEL COMPONENT
   ========================================================================= */
interface SideBySideCodePanelProps {
  input: string;
  setInput: (val: string) => void;
  output: string;
  inputLabel: string;
  outputLabel: string;
  copyKey: string;
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
  isError?: boolean;
}

function SideBySideCodePanel({
  input,
  setInput,
  output,
  inputLabel,
  outputLabel,
  copyKey,
  onCopy,
  copiedKey,
  isError,
}: SideBySideCodePanelProps) {
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
          rows={10}
          placeholder="Paste or write code here..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-cyan-500 resize-y"
        />
      </div>

      {/* Output Panel */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>{outputLabel}</span>
          <button
            onClick={() => onCopy(output, copyKey)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {copiedKey === copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          rows={10}
          className={`w-full border rounded-2xl p-4 text-xs font-mono outline-none select-all resize-y ${
            isError
              ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
              : 'bg-slate-900/80 border-slate-800 text-cyan-300'
          }`}
        />
      </div>
    </div>
  );
}
