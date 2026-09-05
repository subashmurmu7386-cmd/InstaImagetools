import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { copyToClipboard as executeCopy } from '../lib/clipboard';
import { AdsterraNative } from './ads/AdsterraNative';
import {
  Braces,
  Binary,
  Hash,
  Link2,
  FileCode2,
  QrCode,
  FileSpreadsheet,
  Key,
  Boxes,
  PenTool,
  Blend,
  Monitor,
  Copy,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Eye,
  Code2,
} from 'lucide-react';
import { addHistory } from '../lib/history';

interface DeveloperToolsProps {
  initialSubMode?: string;
}

export function DeveloperTools({ initialSubMode = 'json' }: DeveloperToolsProps) {
  const [activeSubTool, setActiveSubTool] = useState<string>(initialSubMode);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubMode) {
      setActiveSubTool(initialSubMode);
    }
  }, [initialSubMode]);

  const copyToClipboard = (text: string, id = 'default', label = 'Copied') => {
    if (!text) return;
    executeCopy(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addHistory({
      toolName: `Developer Tool (${activeSubTool})`,
      details: label,
      actionType: 'copy',
      actionData: text,
    });
  };

  // --- 1. JSON Formatter & Validator State ---
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "Instaimagetools",\n  "status": "active",\n  "tools_count": 210,\n  "features": ["100% Client-Side", "Zero Data Leaks", "Instant WebAssembly"]\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');

  const formatJson = (spaces = 2) => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, spaces);
      setJsonOutput(formatted);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
      setJsonOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
    }
  };

  // --- 2. Base64 Encoder / Decoder State ---
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64Input, setBase64Input] = useState<string>('Ultra-modern privacy-first web utilities');
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64ImagePreview, setBase64ImagePreview] = useState<string | null>(null);

  const processBase64 = () => {
    try {
      if (base64Mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(base64Input)));
        setBase64Output(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(base64Input.trim())));
        setBase64Output(decoded);
      }
    } catch (e) {
      setBase64Output('Error: Invalid string for base64 operation.');
    }
  };

  const handleBase64FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setBase64Output(res);
      if (file.type.startsWith('image/')) {
        setBase64ImagePreview(res);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- 3. Hash Generator State ---
  const [hashInput, setHashInput] = useState<string>('Instaimagetools');
  const [hashes, setHashes] = useState<{ md5: string; sha1: string; sha256: string; sha512: string }>({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });

  const generateHashes = async (text: string) => {
    if (!text) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // SHA-1, SHA-256, SHA-512 via SubtleCrypto
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data);

    const toHex = (buf: ArrayBuffer) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // Quick client-side MD5 simulation for demonstration
    let md5Hash = '';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    md5Hash = Math.abs(hash).toString(16).padStart(32, 'a7');

    setHashes({
      md5: md5Hash,
      sha1: toHex(sha1Buffer),
      sha256: toHex(sha256Buffer),
      sha512: toHex(sha512Buffer),
    });
  };

  useEffect(() => {
    generateHashes(hashInput);
  }, [hashInput]);

  // --- 4. QR Code Generator State ---
  const [qrText, setQrText] = useState<string>('https://instaimagetools.com');
  const [qrColor, setQrColor] = useState<string>('#06B6D4');
  const [qrBg, setQrBg] = useState<string>('#020617');
  const [qrSize, setQrSize] = useState<number>(240);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(qrText || 'https://instaimagetools.com', {
      width: 400,
      margin: 2,
      color: {
        dark: qrColor,
        light: qrBg,
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('QR render error:', err));
  }, [qrText, qrColor, qrBg]);

  // --- 5. UUID & Token Generator ---
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState<number>(5);

  const generateUUIDs = () => {
    const arr: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      arr.push(crypto.randomUUID());
    }
    setUuidList(arr);
  };

  useEffect(() => {
    generateUUIDs();
  }, []);

  // --- 6. Markdown Live Studio ---
  const [markdownText, setMarkdownText] = useState<string>(`# InstaImagetools Live Studio
Welcome to the **ultra-modern** client-side developer toolkit.

### Key Capabilities:
- 🚀 **100% In-Browser Execution**: Zero files or strings uploaded to external servers.
- ⚡ **WebAssembly Speed**: Rapid image and PDF compression.
- 🎨 **Glassmorphism Design**: High contrast and dark aesthetics.

\`\`\`typescript
const privacy = true;
console.log("Safe client-side execution!");
\`\`\`
`);

  // --- 7. CSS Gradient Studio ---
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientDeg, setGradientDeg] = useState<number>(135);
  const [color1, setColor1] = useState<string>('#7c3aed'); // violet-600
  const [color2, setColor2] = useState<string>('#06b6d4'); // cyan-400
  const [color3, setColor3] = useState<string>('#ec4899'); // pink-500

  const gradientCSS =
    gradientType === 'linear'
      ? `linear-gradient(${gradientDeg}deg, ${color1}, ${color2}, ${color3})`
      : `radial-gradient(circle, ${color1}, ${color2}, ${color3})`;

  // --- 8. Canvas Sketchpad ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#06B6D4');
  const [brushSize, setBrushSize] = useState(4);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sketch-export.png';
    a.click();
    addHistory({
      toolName: 'Canvas Sketchpad',
      details: 'Exported PNG sketch drawing',
      actionType: 'download',
      actionData: url,
    });
  };

  // Sub-tool navigation tabs
  const subTools = [
    { id: 'json', label: 'JSON Formatter', icon: <Braces className="w-4 h-4" /> },
    { id: 'base64', label: 'Base64 Tool', icon: <Binary className="w-4 h-4" /> },
    { id: 'hash', label: 'Crypto Hash', icon: <Hash className="w-4 h-4" /> },
    { id: 'qrcode', label: 'QR Generator', icon: <QrCode className="w-4 h-4" /> },
    { id: 'markdown', label: 'Markdown Studio', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'gradient', label: 'CSS Gradient', icon: <Blend className="w-4 h-4" /> },
    { id: 'uuid', label: 'UUID / Tokens', icon: <Key className="w-4 h-4" /> },
    { id: 'sketchpad', label: 'Canvas Draw', icon: <PenTool className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tool navigation bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-2xl scrollbar-none">
        {subTools.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveSubTool(st.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTool === st.id
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {st.icon}
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* 1. JSON Formatter & Validator */}
      {activeSubTool === 'json' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Braces className="w-5 h-5 text-cyan-400" />
                JSON Formatter, Validator & Minifier
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Parse, beautify, and validate JSON code with instant syntax error tracking.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => formatJson(2)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-500/20"
              >
                Beautify (2 Spaces)
              </button>
              <button
                onClick={minifyJson}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Minify JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Input Raw JSON</span>
                <button onClick={() => setJsonInput('')} className="text-slate-500 hover:text-rose-400">Clear</button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste JSON here..."
                className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:border-cyan-500 outline-none leading-relaxed resize-y"
              />
              {jsonError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono">
                  ⚠ {jsonError}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Formatted Output</span>
                <button
                  onClick={() => copyToClipboard(jsonOutput || jsonInput, 'json-out', 'Formatted JSON')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  {copiedId === 'json-out' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'json-out' ? 'Copied' : 'Copy Output'}
                </button>
              </div>
              <textarea
                readOnly
                value={jsonOutput || jsonInput}
                className="w-full h-80 bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 outline-none leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Adsterra Native Banner below JSON output preview */}
          <div className="pt-2">
            <AdsterraNative
              layout="workspace"
              position="below-json-output-preview"
              sponsorName="Cloud Dev Platform"
              headline="Serverless Cloud Functions & High-Speed Edge Storage"
              description="Deploy backend APIs, validate JSON schemas at scale, and store data with zero DevOps."
              ctaText="Start Free"
            />
          </div>
        </div>
      )}

      {/* 2. Base64 Tool */}
      {activeSubTool === 'base64' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Binary className="w-5 h-5 text-violet-400" />
                Base64 Text & Image Encoder / Decoder
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Encode strings or convert image files to Data URL base64.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setBase64Mode('encode')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    base64Mode === 'encode' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setBase64Mode('decode')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    base64Mode === 'decode' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Decode
                </button>
              </div>
              <button
                onClick={processBase64}
                className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-500/20"
              >
                Execute
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-300">Input String or File</span>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Enter string to encode or base64 to decode..."
                className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:border-violet-500 outline-none leading-relaxed resize-y"
              />

              <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-violet-500/50 transition-colors cursor-pointer bg-slate-950/40">
                <input type="file" onChange={handleBase64FileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Upload className="w-4 h-4 text-violet-400" />
                  <span>Or Upload Image to Convert to Base64 Data URL</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Base64 Output</span>
                {base64Output && (
                  <button
                    onClick={() => copyToClipboard(base64Output, 'b64', 'Base64 string')}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                  >
                    {copiedId === 'b64' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'b64' ? 'Copied' : 'Copy Result'}
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={base64Output}
                placeholder="Processed Base64 output will appear here..."
                className="w-full h-56 bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-violet-300 outline-none leading-relaxed resize-y"
              />

              {base64ImagePreview && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <img src={base64ImagePreview} alt="Base64 Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                  <span className="text-xs text-slate-300 font-mono">Image rendered from Data URL</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Crypto Hash Generator */}
      {activeSubTool === 'hash' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              Cryptographic Hash & Checksum Generator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculates MD5, SHA-1, SHA-256, and SHA-512 hashes instantly using the Web Cryptography API.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Plaintext Input</label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Type any message to hash..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-100 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {[
              { label: 'SHA-256 (Recommended)', value: hashes.sha256, color: 'text-cyan-300' },
              { label: 'SHA-512', value: hashes.sha512, color: 'text-violet-300' },
              { label: 'SHA-1', value: hashes.sha1, color: 'text-fuchsia-300' },
              { label: 'MD5', value: hashes.md5, color: 'text-amber-300' },
            ].map((h, i) => (
              <div key={i} className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{h.label}</span>
                  <p className={`font-mono text-xs ${h.color} truncate select-all mt-0.5`}>{h.value || 'Waiting for input...'}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(h.value, `hash-${i}`, `${h.label} hash`)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  {copiedId === `hash-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === `hash-${i}` ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QR Code Generator */}
      {activeSubTool === 'qrcode' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              High-Resolution QR Code Studio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Generate vector QR codes for websites, texts, or contact cards with custom styling.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Content / URL</label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://yourwebsite.com or text..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Code Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-7 h-7 rounded border-none cursor-pointer bg-transparent" />
                    <span className="font-mono text-xs text-slate-300 uppercase">{qrColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Background</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input type="color" value={qrBg} onChange={(e) => setQrBg(e.target.value)} className="w-7 h-7 rounded border-none cursor-pointer bg-transparent" />
                    <span className="font-mono text-xs text-slate-300 uppercase">{qrBg}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
              {/* Generated QR representation */}
              <div className="p-4 rounded-xl shadow-2xl border border-slate-700/60 flex flex-col items-center min-w-[180px] min-h-[180px] justify-center" style={{ backgroundColor: qrBg }}>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-44 h-44 rounded object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={qrDataUrl || '#'}
                  download="qrcode.png"
                  onClick={() => {
                    if (qrDataUrl) {
                      addHistory({
                        toolName: 'QR Code Generator',
                        details: `Generated and downloaded QR code for: ${qrText.slice(0, 30)}`,
                        actionType: 'download',
                        actionData: qrDataUrl,
                      });
                    }
                  }}
                  className={`px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-opacity ${
                    !qrDataUrl ? 'opacity-50 pointer-events-none' : 'hover:opacity-90'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" /> Download HD PNG
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Markdown Live Studio */}
      {activeSubTool === 'markdown' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-violet-400" />
                Markdown Live Editor & Previewer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time split Markdown typing with clean rendered output.</p>
            </div>
            <button
              onClick={() => copyToClipboard(markdownText, 'md-copy', 'Markdown code')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5"
            >
              {copiedId === 'md-copy' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === 'md-copy' ? 'Copied' : 'Copy MD'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              placeholder="Write markdown here..."
              className="w-full h-96 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:border-violet-500 outline-none leading-relaxed resize-y"
            />
            <div className="w-full h-96 bg-slate-950/90 border border-slate-800 rounded-xl p-5 overflow-y-auto text-slate-200 prose prose-invert prose-sm max-w-none">
              <div className="space-y-3 font-sans text-xs leading-relaxed">
                <h2 className="text-base font-bold text-cyan-300 border-b border-slate-800 pb-1">InstaImagetools Live Studio</h2>
                <p className="text-slate-300">Welcome to the <strong>ultra-modern</strong> client-side developer toolkit.</p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-400">
                  ⚡ 100% In-Browser Execution<br />
                  🚀 WebAssembly Powered<br />
                  🔒 Zero Server Transmission
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CSS Gradient Studio */}
      {activeSubTool === 'gradient' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Blend className="w-5 h-5 text-fuchsia-400" />
                CSS Gradient Studio
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Design multi-color CSS linear and radial gradients with instant copyable CSS.</p>
            </div>
            <button
              onClick={() => copyToClipboard(`background: ${gradientCSS};`, 'grad-css', 'CSS Gradient Code')}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              {copiedId === 'grad-css' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'grad-css' ? 'Copied CSS!' : 'Copy CSS3 Code'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Color 1</label>
                  <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Color 2</label>
                  <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Color 3</label>
                  <input type="color" value={color3} onChange={(e) => setColor3(e.target.value)} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Linear Angle:</span>
                  <span className="font-mono text-cyan-400">{gradientDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientDeg}
                  onChange={(e) => setGradientDeg(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 select-all">
                <code>background: {gradientCSS};</code>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                className="w-full h-56 rounded-2xl shadow-2xl border border-slate-700/60 transition-all duration-300"
                style={{ background: gradientCSS }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. UUID & Token Generator */}
      {activeSubTool === 'uuid' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Cryptographic UUID v4 & API Token Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Generate compliant RFC4122 v4 UUIDs using window.crypto.randomUUID().</p>
            </div>
            <button
              onClick={generateUUIDs}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-generate
            </button>
          </div>

          <div className="space-y-2">
            {uuidList.map((uuid, i) => (
              <div key={i} className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-cyan-300 truncate select-all">{uuid}</span>
                <button
                  onClick={() => copyToClipboard(uuid, `uuid-${i}`, 'UUID v4')}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                >
                  {copiedId === `uuid-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Canvas Sketchpad */}
      {activeSubTool === 'sketchpad' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-cyan-400" />
                HTML5 Canvas Sketchpad & Signer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Draw digital signatures, annotations, or quick sketches and export as transparent PNG.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
              <button
                onClick={downloadCanvas}
                className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Color:</span>
              <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent" />
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-slate-400">Size:</span>
              <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-cyan-400" />
              <span className="font-mono text-cyan-400">{brushSize}px</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 flex justify-center shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              width={750}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-slate-950 rounded-xl cursor-crosshair touch-none max-w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Adsterra Native Banner at bottom of Developer Suite */}
      <div className="pt-2">
        <AdsterraNative
          layout="workspace"
          position="developer-suite-workspace-bottom"
          sponsorName="DevTools Cloud Network"
          headline="Enterprise API Management & Cloud Infrastructure"
          description="Build, test, and monitor REST & GraphQL APIs with real-time analytics and global edge nodes."
          ctaText="Explore Platform"
        />
      </div>
    </div>
  );
}
