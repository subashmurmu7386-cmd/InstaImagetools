import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import jsQR from 'jsqr';
import JSZip from 'jszip';
import {
  QrCode,
  Scan,
  Barcode,
  Camera,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Contact,
  Link,
  Type,
  Calendar,
  Palette,
  Download,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

export type QrBarcodeToolId =
  | 'qr-generator'
  | 'qr-scanner'
  | 'barcode-generator'
  | 'barcode-reader'
  | 'wifi-qr'
  | 'email-qr'
  | 'phone-qr'
  | 'sms-qr'
  | 'contact-qr'
  | 'url-qr'
  | 'text-qr'
  | 'event-qr'
  | 'qr-color-customizer'
  | 'qr-download'
  | 'batch-qr';

export interface QrBarcodeToolMeta {
  id: QrBarcodeToolId;
  name: string;
  category: 'qr' | 'barcode' | 'payload' | 'utility';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const QR_BARCODE_TOOLS_META: QrBarcodeToolMeta[] = [
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'qr',
    categoryLabel: 'Core QR',
    description: 'High-speed offline QR generator with error correction, sizing, and SVG/PNG copy.',
    icon: QrCode,
    badge: 'Popular',
  },
  {
    id: 'qr-scanner',
    name: 'QR Scanner (Camera)',
    category: 'qr',
    categoryLabel: 'Core QR',
    description: 'Live HTML5 camera scanner and file upload reader using pure browser video stream.',
    icon: Camera,
    badge: 'Live Cam',
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'barcode',
    categoryLabel: 'Barcodes',
    description: 'Generate 1D barcodes: CODE128, EAN-13, UPC-A, CODE39, ITF-14, and MSI.',
    icon: Barcode,
    badge: '1D Codes',
  },
  {
    id: 'barcode-reader',
    name: 'Barcode Reader',
    category: 'barcode',
    categoryLabel: 'Barcodes',
    description: 'Scan 1D barcodes from image files or camera with native BarcodeDetector & fallback.',
    icon: Scan,
  },
  {
    id: 'wifi-qr',
    name: 'WiFi QR Generator',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Instant zero-typing network connection QRs for WPA/WPA2/WPA3 and WEP networks.',
    icon: Wifi,
    badge: 'WiFi Auto',
  },
  {
    id: 'email-qr',
    name: 'Email QR Generator',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Generates mailto: links with recipient, subject, and pre-filled email body.',
    icon: Mail,
  },
  {
    id: 'phone-qr',
    name: 'Phone Call QR',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Generates tel: protocol QRs for instant speed dial on mobile devices.',
    icon: Phone,
  },
  {
    id: 'sms-qr',
    name: 'SMS QR Generator',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Pre-compose SMS messages with target recipient phone numbers for instant texting.',
    icon: MessageSquare,
  },
  {
    id: 'contact-qr',
    name: 'Contact QR (vCard)',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Complete vCard 3.0 digital business card for iOS & Android address books.',
    icon: Contact,
    badge: 'vCard 3.0',
  },
  {
    id: 'url-qr',
    name: 'URL QR Generator',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Optimized web link QR code builder with URL validation and UTM sanitizer.',
    icon: Link,
  },
  {
    id: 'text-qr',
    name: 'Plain Text QR',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Encodes raw multi-line text strings, notes, and cryptographic keys.',
    icon: Type,
  },
  {
    id: 'event-qr',
    name: 'Event QR (iCalendar)',
    category: 'payload',
    categoryLabel: 'Payloads',
    description: 'Standard vEvent QR codes that add scheduled events to Apple, Google & Outlook calendars.',
    icon: Calendar,
  },
  {
    id: 'qr-color-customizer',
    name: 'QR Color & Logo Studio',
    category: 'utility',
    categoryLabel: 'Studio',
    description: 'Custom brand palettes, transparent backgrounds, and centered logo overlays.',
    icon: Palette,
    badge: 'Branded',
  },
  {
    id: 'qr-download',
    name: 'High-Res QR Exporter',
    category: 'utility',
    categoryLabel: 'Studio',
    description: 'Export vector SVGs and ultra-high-resolution PNGs up to 4096px (300 DPI Print).',
    icon: Download,
    badge: '300 DPI',
  },
  {
    id: 'batch-qr',
    name: 'Batch QR Creator (ZIP)',
    category: 'utility',
    categoryLabel: 'Studio',
    description: 'Generate hundreds of QR codes from CSV/text lists and export all as a ZIP archive.',
    icon: Layers,
    badge: 'ZIP Export',
  },
];

// Simple synthesized beep sound for scanner using Web Audio API
function playScanChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function QrBarcodeToolsSuite() {
  const [activeTool, setActiveTool] = useState<QrBarcodeToolId>('qr-generator');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    try {
      const tool = QR_BARCODE_TOOLS_META.find((t) => t.id === activeTool);
      const toolName = tool ? tool.name : 'QR & Barcode Suite';
      const preview = text.length > 40 ? `${text.slice(0, 40)}...` : text;
      logActivity(toolName, `Copied barcode/QR payload: ${preview}`, 'copy', text);
    } catch (e) {
      console.warn('Activity logging error:', e);
    }
  }, [activeTool]);

  const handleCopyImageFromCanvas = useCallback(async (canvas: HTMLCanvasElement, key: string) => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        let copied = false;
        if (navigator.clipboard && (window as any).ClipboardItem) {
          try {
            const item = new (window as any).ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            copied = true;
          } catch (e) {
            console.warn('Image clipboard write failed, attempting data URL copy:', e);
          }
        }
        if (!copied) {
          // Fallback to data URL copy
          await copyToClipboard(canvas.toDataURL());
        }
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        try {
          const tool = QR_BARCODE_TOOLS_META.find((t) => t.id === activeTool);
          const toolName = tool ? tool.name : 'QR & Barcode Suite';
          logActivity(toolName, `Copied QR / Barcode PNG to clipboard`, 'copy');
        } catch (e) {
          console.warn('Activity logging error:', e);
        }
      });
    } catch {
      // Fallback
    }
  }, [activeTool]);

  const filteredTools = useMemo(() => {
    return QR_BARCODE_TOOLS_META.filter((tool) => {
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
    QR_BARCODE_TOOLS_META.find((t) => t.id === activeTool) || QR_BARCODE_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="qr-barcode-tools-suite-root">
      {/* 15 Tools Quick Selector Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                QR & Barcode Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                15 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pure client-side HTML5 Canvas & Camera decoders. No remote APIs or cloud uploads.
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
                placeholder="Search 15 QR/Barcode tools..."
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
                { id: 'qr', label: 'QR Core' },
                { id: 'barcode', label: 'Barcodes' },
                { id: 'payload', label: 'Payloads' },
                { id: 'utility', label: 'Studio & Batch' },
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
                  document.getElementById('active-qr-barcode-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
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
      <div id="active-qr-barcode-tool-workspace" className="space-y-6">
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
            <span>100% In-Memory Safe</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'qr-generator' && <QrGeneratorTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'qr-scanner' && <QrScannerTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'barcode-generator' && <BarcodeGeneratorTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'barcode-reader' && <BarcodeReaderTool onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'wifi-qr' && <WifiQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'email-qr' && <EmailQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'phone-qr' && <PhoneQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'sms-qr' && <SmsQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'contact-qr' && <ContactQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'url-qr' && <UrlQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'text-qr' && <TextQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'event-qr' && <EventQrTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'qr-color-customizer' && <QrColorCustomizerTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'qr-download' && <QrDownloadTool onCopy={handleCopy} onCopyImage={handleCopyImageFromCanvas} copiedKey={copiedKey} />}
          {activeTool === 'batch-qr' && <BatchQrTool copiedKey={copiedKey} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 1: General QR Code Generator
   ========================================================================= */
function QrGeneratorTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [text, setText] = useState<string>('https://instaimagetools.com');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState<number>(2);
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderQr = useCallback(() => {
    if (!canvasRef.current || !text) return;
    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: 280,
        margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }, [text, errorLevel, margin, fgColor, bgColor]);

  useEffect(() => {
    renderQr();
  }, [renderQr]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Configuration Form */}
      <div className="lg:col-span-7 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">QR Code Content / Text / URL</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type or paste any URL, text, or payload..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-cyan-300 outline-none focus:border-cyan-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>{text.length} characters</span>
            <span>UTF-8 Supported</span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">Error Correction Level:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'L', label: 'L (7%)' },
                { id: 'M', label: 'M (15%)' },
                { id: 'Q', label: 'Q (25%)' },
                { id: 'H', label: 'H (30%)' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setErrorLevel(lvl.id as any)}
                  className={`py-1.5 rounded-xl text-xs font-semibold border ${
                    errorLevel === lvl.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span>Quiet Zone (Margin):</span>
              <span className="font-mono text-cyan-400">{margin} modules</span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Quick Samples:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Website Link', val: 'https://instaimagetools.com' },
              { label: 'Google Maps Location', val: 'https://maps.google.com/?q=37.7749,-122.4194' },
              { label: 'Bitcoin Address', val: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p.val)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview & Actions */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-5">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Render Preview</div>

        <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
          <canvas ref={canvasRef} className="w-full max-w-[240px] h-auto block" />
        </div>

        <div className="w-full grid grid-cols-2 gap-2.5">
          <button
            onClick={() => canvasRef.current && onCopyImage(canvasRef.current, 'qr-img-copy')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            {copiedKey === 'qr-img-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedKey === 'qr-img-copy' ? 'Copied PNG!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-950/50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: QR Scanner using Browser Camera & File Upload
   ========================================================================= */
function QrScannerTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Scan frame loop
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setScannedResult(code.data);
        if (soundEnabled) playScanChime();
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, [soundEnabled, stopCamera]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.error(err);
      setCameraError(err.message || 'Unable to access camera. Please check camera permissions.');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle image file upload for scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setScannedResult(code.data);
          if (soundEnabled) playScanChime();
          setCameraError(null);
        } else {
          setCameraError('No readable QR code found in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Scanner Viewport */}
      <div className="lg:col-span-7 space-y-4">
        <div className="relative aspect-video sm:aspect-4/3 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
          <video ref={videoRef} className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`} />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay Targeting Reticle when scanning */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-cyan-400 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
              </div>
            </div>
          )}

          {!isScanning && (
            <div className="text-center p-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-800">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Live Camera QR Scanner</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Scan QR codes in real time using your device camera or upload an image file.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer hover:opacity-95"
              >
                Start Camera Scan
              </button>
            </div>
          )}

          {/* Scanning Control Bar */}
          {isScanning && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Scanning active...
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
                  title="Toggle Chime"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File upload alternative */}
        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <Upload className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">Upload Image to Scan</div>
              <div className="text-[10px] text-slate-500">PNG, JPG, WebP screenshot or photo</div>
            </div>
          </div>
          <label className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition-colors">
            <span>Choose File</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {cameraError && (
          <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* Scanned Result Card */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Decoded Payload</span>
            {scannedResult && (
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Decoded
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/90 min-h-[160px] flex flex-col justify-between">
            {scannedResult ? (
              <div className="text-xs sm:text-sm font-mono text-cyan-300 break-all select-all leading-relaxed">
                {scannedResult}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center text-slate-600">
                <Scan className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">No QR code scanned yet</span>
              </div>
            )}

            {scannedResult && (
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
                {scannedResult.startsWith('http') ? (
                  <a
                    href={scannedResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Text Payload</span>
                )}

                <button
                  onClick={() => onCopy(scannedResult, 'scan-res')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  {copiedKey === 'scan-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'scan-res' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {scannedResult && (
            <button
              onClick={() => {
                setScannedResult(null);
                startCamera();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800"
            >
              Scan Another Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: 1D Barcode Generator
   ========================================================================= */
function BarcodeGeneratorTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [value, setValue] = useState<string>('INSTA-894028');
  const [format, setFormat] = useState<string>('CODE128');
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [height, setHeight] = useState<number>(80);
  const [width, setWidth] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const renderBarcode = useCallback(() => {
    setErrorMsg(null);
    if (!canvasRef.current || !value) return;

    try {
      JsBarcode(canvasRef.current, value, {
        format,
        width,
        height,
        displayValue,
        font: 'monospace',
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 4,
        fontSize: 14,
        background: '#ffffff',
        lineColor: '#000000',
        margin: 12,
      });

      if (svgRef.current) {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          font: 'monospace',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 4,
          fontSize: 14,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 12,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid barcode value for selected format.');
    }
  }, [value, format, displayValue, height, width]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `barcode-${format}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Controls */}
      <div className="lg:col-span-7 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Barcode Value / Number</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none focus:border-cyan-500"
          />
        </div>

        {/* Formats Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">Barcode Symbology Standard:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'CODE128', label: 'CODE 128 (Universal)' },
              { id: 'EAN13', label: 'EAN-13 (Retail)' },
              { id: 'UPC', label: 'UPC-A (USA)' },
              { id: 'CODE39', label: 'CODE 39 (Alphanumeric)' },
              { id: 'ITF14', label: 'ITF-14 (Packaging)' },
              { id: 'MSI', label: 'MSI Plessey' },
              { id: 'pharmacode', label: 'Pharmacode' },
              { id: 'codabar', label: 'Codabar' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => {
                  setFormat(fmt.id);
                  if (fmt.id === 'EAN13' && !/^\d{12,13}$/.test(value)) setValue('590123412345');
                  if (fmt.id === 'UPC' && !/^\d{11,12}$/.test(value)) setValue('012345678905');
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                  format === fmt.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span>Bar Height:</span>
              <span className="font-mono text-cyan-400">{height}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={160}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span>Show Readable Text Below Barcode</span>
            </label>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Rendered Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-5">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Barcode Preview</div>

        <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-x-auto max-w-full">
          <canvas ref={canvasRef} className="block mx-auto max-w-full" />
          <svg ref={svgRef} className="hidden" />
        </div>

        <div className="w-full grid grid-cols-2 gap-2.5">
          <button
            onClick={() => canvasRef.current && onCopyImage(canvasRef.current, 'bar-img')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
          >
            {copiedKey === 'bar-img' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedKey === 'bar-img' ? 'Copied PNG!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Barcode Reader (Scanner & File Upload)
   ========================================================================= */
function BarcodeReaderTool({ onCopy, copiedKey }: { onCopy: (t: string, k: string) => void; copiedKey: string | null }) {
  const [result, setResult] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMsg('Analyzing barcode image...');
    setResult(null);

    try {
      const img = new Image();
      img.onload = async () => {
        // Attempt Native BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_39', 'itf'],
            });
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes.length > 0) {
              setResult(barcodes[0].rawValue);
              setFormat(barcodes[0].format || 'Detected Barcode');
              setStatusMsg(null);
              playScanChime();
              return;
            }
          } catch (detErr) {
            console.warn('Native BarcodeDetector failed, falling back...', detErr);
          }
        }

        // Fallback with jsQR
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setResult(code.data);
            setFormat('QR Code');
            setStatusMsg(null);
            playScanChime();
            return;
          }
        }

        setStatusMsg('No barcode recognized. Make sure image is well-lit and unblurred.');
      };
      img.src = URL.createObjectURL(file);
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to read image.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
          <Scan className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Upload Barcode or QR Image</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Supports product barcodes (EAN, UPC, CODE128, CODE39) and QR codes from photos and screenshots.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer hover:opacity-95">
          <Upload className="w-4 h-4" />
          <span>Select Barcode Image</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {statusMsg && <p className="text-xs font-mono text-amber-400 pt-2">{statusMsg}</p>}
      </div>

      {result && (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span className="uppercase">Decoded Barcode Content</span>
            {format && <span className="text-cyan-400 font-mono font-semibold">{format}</span>}
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-sm sm:text-base text-cyan-300 break-all select-all">
            {result}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onCopy(result, 'bc-read')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              {copiedKey === 'bc-read' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'bc-read' ? 'Copied Value' : 'Copy Value'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 5: WiFi QR Generator
   ========================================================================= */
function WifiQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [ssid, setSsid] = useState<string>('Home_Fiber_5G');
  const [password, setPassword] = useState<string>('SecretWiFiPass2026!');
  const [authType, setAuthType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // WiFi payload standard: WIFI:T:WPA;S:MySSID;P:MyPassword;H:false;;
  const wifiPayload = useMemo(() => {
    const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
    const p = authType === 'nopass' ? '' : `P:${esc(password)};`;
    return `WIFI:T:${authType};S:${esc(ssid)};${p}H:${hidden};;`;
  }, [ssid, password, authType, hidden]);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, wifiPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [wifiPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Network Name (SSID)</label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="e.g. CoffeeShop_Guest"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-sans text-cyan-300 outline-none focus:border-cyan-500"
          />
        </div>

        {authType !== 'nopass' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">WiFi Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter network password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pr-12 text-sm font-mono text-cyan-300 outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">Encryption Type:</span>
            <div className="flex gap-2">
              {[
                { id: 'WPA', label: 'WPA/WPA2/WPA3' },
                { id: 'WEP', label: 'WEP' },
                { id: 'nopass', label: 'Open (No Pass)' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAuthType(a.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    authType === a.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span>Hidden Network SSID</span>
            </label>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800 truncate">
          Raw: {wifiPayload}
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <span>WiFi Connect QR</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <div className="w-full grid grid-cols-2 gap-2.5">
          <button
            onClick={() => canvasRef.current && onCopyImage(canvasRef.current, 'wifi-qr-img')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
          >
            {copiedKey === 'wifi-qr-img' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>Copy QR</span>
          </button>

          <button
            onClick={() => {
              if (!canvasRef.current) return;
              const a = document.createElement('a');
              a.download = `wifi-${ssid.replace(/\s+/g, '_')}-qr.png`;
              a.href = canvasRef.current.toDataURL();
              a.click();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Email QR Generator
   ========================================================================= */
function EmailQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [email, setEmail] = useState<string>('support@instaimagetools.com');
  const [subject, setSubject] = useState<string>('Inquiry / Partnership');
  const [body, setBody] = useState<string>('Hello,\n\nI would like to get more information about your tools.');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mailtoPayload = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, mailtoPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [mailtoPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Recipient Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-cyan-300 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Email Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-sans text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Pre-composed Email Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 outline-none"
          />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Email QR Preview</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `email-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download Email QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Phone Call QR Generator
   ========================================================================= */
function PhoneQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [phoneNumber, setPhoneNumber] = useState<string>('+1 (800) 555-0199');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
  const telPayload = `tel:${cleanNumber}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, telPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [telPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 555 123 4567"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base font-mono text-cyan-300 outline-none"
          />
          <p className="text-xs text-slate-500">
            Scanning this code on any smartphone immediately opens the phone dialer with this number dialed.
          </p>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Phone className="w-4 h-4 text-cyan-400" />
          <span>Phone Speed-Dial QR</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `phone-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download Phone QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: SMS QR Generator
   ========================================================================= */
function SmsQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [phoneNumber, setPhoneNumber] = useState<string>('+1 (555) 019-2834');
  const [message, setMessage] = useState<string>('Hi, I am interested in your services.');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanNum = phoneNumber.replace(/[^0-9+]/g, '');
  const smsPayload = `SMSTO:${cleanNum}:${message}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, smsPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [smsPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Recipient Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-cyan-300 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Pre-written SMS Text</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 outline-none"
          />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>SMS QR Code</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `sms-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download SMS QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Contact QR (vCard 3.0)
   ========================================================================= */
function ContactQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [firstName, setFirstName] = useState<string>('Alex');
  const [lastName, setLastName] = useState<string>('Morgan');
  const [org, setOrg] = useState<string>('InstaImageTools Labs');
  const [title, setTitle] = useState<string>('Lead Engineer');
  const [phone, setPhone] = useState<string>('+1 (415) 555-2671');
  const [email, setEmail] = useState<string>('alex.morgan@instaimagetools.com');
  const [url, setUrl] = useState<string>('https://instaimagetools.com');
  const [city, setCity] = useState<string>('San Francisco, CA');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const vCardPayload = useMemo(() => {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${firstName} ${lastName}`,
      `ORG:${org}`,
      `TITLE:${title}`,
      `TEL;TYPE=CELL:${phone}`,
      `EMAIL:${email}`,
      `URL:${url}`,
      `ADR;TYPE=WORK:;;;${city};;;`,
      'END:VCARD',
    ].join('\n');
  }, [firstName, lastName, org, title, phone, email, url, city]);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, vCardPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [vCardPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Company / Org</label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Mobile Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-cyan-300"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Website URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">City / Region</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Contact className="w-4 h-4 text-cyan-400" />
          <span>vCard 3.0 QR</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `vcard-${firstName}_${lastName}.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download vCard QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: URL QR Generator
   ========================================================================= */
function UrlQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [url, setUrl] = useState<string>('https://instaimagetools.com');
  const [stripUtm, setStripUtm] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanUrl = useMemo(() => {
    try {
      let u = url.trim();
      if (!u.startsWith('http://') && !u.startsWith('https://')) {
        u = 'https://' + u;
      }
      const parsed = new URL(u);
      if (stripUtm) {
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach((p) =>
          parsed.searchParams.delete(p)
        );
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }, [url, stripUtm]);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, cleanUrl, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [cleanUrl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Website Address (URL)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-300 outline-none"
          />
        </div>

        <div className="flex items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={stripUtm}
              onChange={(e) => setStripUtm(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Strip Tracking Parameters (Clean URL for faster scanning)</span>
          </label>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Link className="w-4 h-4 text-cyan-400" />
          <span>URL QR Code</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `url-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download URL QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Text QR Generator
   ========================================================================= */
function TextQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [text, setText] = useState<string>('Special Note: Thank you for testing InstaImageTools offline suite!');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [text]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Raw Plain Text Payload</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-cyan-300 outline-none"
          />
          <div className="text-[11px] text-slate-500 font-mono">{text.length} characters</div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Type className="w-4 h-4 text-cyan-400" />
          <span>Text QR Code</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `text-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download Text QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Event QR (iCalendar vEvent)
   ========================================================================= */
function EventQrTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [title, setTitle] = useState<string>('InstaImageTools Product Launch');
  const [location, setLocation] = useState<string>('Online / Virtual');
  const [description, setDescription] = useState<string>('Keynote showcase of offline utilities.');
  const [startDate, setStartDate] = useState<string>('2026-09-01T10:00');
  const [endDate, setEndDate] = useState<string>('2026-09-01T12:00');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const vEventPayload = useMemo(() => {
    const formatDt = (dtStr: string) => dtStr.replace(/[-:]/g, '') + '00Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      `DTSTART:${formatDt(startDate)}`,
      `DTEND:${formatDt(endDate)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
  }, [title, location, description, startDate, endDate]);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, vEventPayload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [vEventPayload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Event Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Calendar vEvent QR</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `event-${title.replace(/\s+/g, '_')}.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download Event QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 13: QR Color & Logo Customizer Studio
   ========================================================================= */
function QrColorCustomizerTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [text, setText] = useState<string>('https://instaimagetools.com');
  const [fgColor, setFgColor] = useState<string>('#4f46e5');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawBrandedQr = useCallback(() => {
    if (!canvasRef.current || !text) return;
    const canvas = canvasRef.current;
    const size = 320;

    QRCode.toCanvas(
      canvas,
      text,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction so logo doesn't break scanner
        color: { dark: fgColor, light: bgColor },
      },
      (err) => {
        if (err) return;
        if (logoImage) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const img = new Image();
          img.onload = () => {
            const logoSize = size * 0.22;
            const center = (size - logoSize) / 2;

            // Draw white background circle / rounded rect behind logo
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, (logoSize / 2) + 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw logo image
            ctx.drawImage(img, center, center, logoSize, logoSize);
          };
          img.src = logoImage;
        }
      }
    );
  }, [text, fgColor, bgColor, logoImage]);

  useEffect(() => {
    drawBrandedQr();
  }, [drawBrandedQr]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Target Payload / Link</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Foreground QR Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-300">{fgColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-300">{bgColor}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Center Brand Logo</label>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Center Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {logoImage && (
              <button
                onClick={() => setLogoImage(null)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Logo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Branded Preview</div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[240px]" />
        </div>

        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const a = document.createElement('a');
            a.download = `branded-qr.png`;
            a.href = canvasRef.current.toDataURL();
            a.click();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          Download Branded QR
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: High-Res QR Exporter (PNG, SVG, WebP)
   ========================================================================= */
function QrDownloadTool({
  onCopy,
  onCopyImage,
  copiedKey,
}: {
  onCopy: (t: string, k: string) => void;
  onCopyImage: (c: HTMLCanvasElement, k: string) => void;
  copiedKey: string | null;
}) {
  const [text, setText] = useState<string>('https://instaimagetools.com');
  const [resolution, setResolution] = useState<number>(1024);
  const [format, setFormat] = useState<'png' | 'svg' | 'webp'>('png');
  const [svgString, setSvgString] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: resolution,
        margin: 2,
        errorCorrectionLevel: 'H',
      });
    }

    QRCode.toString(text, { type: 'svg', margin: 2 }, (err, str) => {
      if (!err && str) setSvgString(str);
    });
  }, [text, resolution]);

  const handleExport = () => {
    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `qrcode-vector.svg`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } else if (canvasRef.current) {
      const mime = format === 'webp' ? 'image/webp' : 'image/png';
      const a = document.createElement('a');
      a.download = `qrcode-${resolution}px.${format}`;
      a.href = canvasRef.current.toDataURL(mime);
      a.click();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Payload</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300"
          />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2">Export Format:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'png', label: 'PNG (Raster Image)' },
              { id: 'svg', label: 'SVG (Vector Scalable)' },
              { id: 'webp', label: 'WebP (High Compression)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`p-3 rounded-xl text-xs font-semibold text-left border ${
                  format === f.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {format !== 'svg' && (
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">Resolution Size:</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { px: 512, label: '512px (Web)' },
                { px: 1024, label: '1024px (HD)' },
                { px: 2048, label: '2048px (Print 300DPI)' },
                { px: 4096, label: '4096px (Ultra Master)' },
              ].map((res) => (
                <button
                  key={res.px}
                  onClick={() => setResolution(res.px)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${
                    resolution === res.px ? 'bg-violet-500/20 border-violet-400 text-violet-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">High-Res Render Engine</div>

        <div className="p-3 bg-white rounded-2xl shadow-xl">
          <canvas ref={canvasRef} className="block mx-auto max-w-[220px] max-h-[220px]" />
        </div>

        <button
          onClick={handleExport}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export {format.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Batch QR Creator (ZIP Export)
   ========================================================================= */
function BatchQrTool({ copiedKey }: { copiedKey: string | null }) {
  const [listText, setListText] = useState<string>(
    'https://instaimagetools.com/tool-1,Tool 1 Link\nhttps://instaimagetools.com/tool-2,Tool 2 Link\nhttps://instaimagetools.com/tool-3,Tool 3 Link'
  );
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  const items = useMemo(() => {
    return listText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split(',');
        const content = parts[0].trim();
        const label = parts[1] ? parts[1].trim() : `QR_${idx + 1}`;
        return { content, label };
      });
  }, [listText]);

  const handleDownloadZip = async () => {
    if (items.length === 0) return;
    setIsGeneratingZip(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('qr-codes');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const dataUrl = await QRCode.toDataURL(item.content, {
          width: 512,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `${String(i + 1).padStart(2, '0')}_${item.label.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
        folder?.file(filename, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.download = `batch_qrcodes_${Date.now()}.zip`;
      a.href = URL.createObjectURL(content);
      a.click();
    } catch (err) {
      console.error('Batch ZIP creation failed', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Paste Multiple Items (Format: Content, Optional Label per line)
        </label>
        <textarea
          value={listText}
          onChange={(e) => setListText(e.target.value)}
          rows={6}
          placeholder="https://example.com/1, Product 1&#10;https://example.com/2, Product 2"
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{items.length} items parsed</span>
          <button
            onClick={handleDownloadZip}
            disabled={isGeneratingZip || items.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isGeneratingZip ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isGeneratingZip ? 'Compiling ZIP...' : `Download All ${items.length} in ZIP`}</span>
          </button>
        </div>
      </div>

      {/* Item List Table Preview */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
          Batch Items Queue Preview ({items.length})
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-900">
          {items.map((it, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3 truncate mr-4">
                <span className="text-slate-500 w-6">#{idx + 1}</span>
                <span className="text-cyan-300 font-bold">{it.label}:</span>
                <span className="text-slate-400 truncate">{it.content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
