import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { logActivity } from '../../lib/history';
import { copyToClipboard } from '../../lib/clipboard';
import { AdsterraNative } from '../ads/AdsterraNative';
import {
  Image as ImageIcon,
  Crop,
  Maximize2,
  RotateCw,
  FlipHorizontal,
  Minimize2,
  FileCheck,
  Sliders,
  Sun,
  Contrast,
  Droplet,
  Moon,
  Eye,
  Sparkles,
  Grid,
  Zap,
  Info,
  Code,
  FileCode,
  PenTool,
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Layers,
  Trash2,
  Move,
  Type,
  Square,
  Undo2,
} from 'lucide-react';

export type ImageToolId =
  | 'image-viewer'
  | 'image-cropper'
  | 'image-resizer'
  | 'image-rotator'
  | 'image-flipper'
  | 'image-compressor'
  | 'image-converter'
  | 'image-quality'
  | 'image-brightness'
  | 'image-contrast'
  | 'image-saturation'
  | 'image-grayscale'
  | 'image-blur'
  | 'image-sharpen'
  | 'image-pixelate'
  | 'image-invert'
  | 'image-metadata'
  | 'image-to-base64'
  | 'base64-to-image'
  | 'canvas-editor';

export interface ImageToolMeta {
  id: ImageToolId;
  name: string;
  category: 'edit-geometry' | 'filters-color' | 'optimize-convert' | 'creative-utils';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const IMAGE_TOOLS_META: ImageToolMeta[] = [
  {
    id: 'image-viewer',
    name: 'Image Viewer',
    category: 'creative-utils',
    categoryLabel: 'Creative & Utils',
    description: 'Inspect images with smooth zoom, pan, and real-time dimension & file overlays.',
    icon: Eye,
    badge: 'Inspect',
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    category: 'edit-geometry',
    categoryLabel: 'Edit & Geometry',
    description: 'Crop images with 1:1, 16:9, 4:3, 9:16 aspect ratio presets and freeform crop.',
    icon: Crop,
    badge: 'Essential',
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'edit-geometry',
    categoryLabel: 'Edit & Geometry',
    description: 'Scale pixel dimensions with aspect ratio lock and percentage slider (10%–400%).',
    icon: Maximize2,
  },
  {
    id: 'image-rotator',
    name: 'Image Rotator',
    category: 'edit-geometry',
    categoryLabel: 'Edit & Geometry',
    description: 'Rotate images 90°, 180°, 270° or arbitrary angle (-180° to +180°) with instant export.',
    icon: RotateCw,
  },
  {
    id: 'image-flipper',
    name: 'Image Flipper',
    category: 'edit-geometry',
    categoryLabel: 'Edit & Geometry',
    description: 'Mirror image horizontally (X-axis) or vertically (Y-axis) in 1 click.',
    icon: FlipHorizontal,
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'optimize-convert',
    categoryLabel: 'Optimize & Convert',
    description: 'Reduce file size in KB/MB with live compression ratio and target quality controls.',
    icon: Minimize2,
    badge: 'Save KB',
  },
  {
    id: 'image-converter',
    name: 'Format Converter',
    category: 'optimize-convert',
    categoryLabel: 'Optimize & Convert',
    description: 'Convert between PNG, JPEG, WebP, and BMP with transparency & quality settings.',
    icon: FileCheck,
  },
  {
    id: 'image-quality',
    name: 'Quality Adjuster',
    category: 'optimize-convert',
    categoryLabel: 'Optimize & Convert',
    description: 'Fine-tune lossy compression quality (1%–100%) with side-by-side inspection.',
    icon: Sliders,
  },
  {
    id: 'image-brightness',
    name: 'Brightness Adjuster',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Adjust image exposure and illumination slider from -100% to +100%.',
    icon: Sun,
  },
  {
    id: 'image-contrast',
    name: 'Contrast Adjuster',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Enhance tonal contrast and dynamic range with real-time visual preview.',
    icon: Contrast,
  },
  {
    id: 'image-saturation',
    name: 'Saturation Adjuster',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Boost color vibrancy or tone down color intensity (0% to 300%).',
    icon: Droplet,
  },
  {
    id: 'image-grayscale',
    name: 'Grayscale & B/W',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Convert color photos to classic monochrome, high-contrast B&W, or sepia.',
    icon: Moon,
  },
  {
    id: 'image-blur',
    name: 'Gaussian Blur',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Apply adjustable soft focus or background blur radius (0px–40px).',
    icon: Droplet,
  },
  {
    id: 'image-sharpen',
    name: 'Sharpen Tool',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Enhance edges and fine textures using a 3x3 convolution kernel filter.',
    icon: Sparkles,
    badge: 'Kernel',
  },
  {
    id: 'image-pixelate',
    name: 'Pixelate (8-Bit)',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Create retro mosaic pixel art effects with custom block size (2px–50px).',
    icon: Grid,
  },
  {
    id: 'image-invert',
    name: 'Color Inverter',
    category: 'filters-color',
    categoryLabel: 'Filters & Color',
    description: 'Invert color channels (255 - RGB) for creative negative film effects.',
    icon: Zap,
  },
  {
    id: 'image-metadata',
    name: 'Metadata Viewer',
    category: 'creative-utils',
    categoryLabel: 'Creative & Utils',
    description: 'Extract local dimensions, aspect ratio, megapixels, file size, and color depth.',
    icon: Info,
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    category: 'creative-utils',
    categoryLabel: 'Creative & Utils',
    description: 'Encode image into raw Base64 data URL, HTML img tag, or CSS background.',
    icon: Code,
  },
  {
    id: 'base64-to-image',
    name: 'Base64 to Image',
    category: 'creative-utils',
    categoryLabel: 'Creative & Utils',
    description: 'Paste Base64 data string to render preview and export as high-res PNG/JPG.',
    icon: FileCode,
  },
  {
    id: 'canvas-editor',
    name: 'Drawing Studio',
    category: 'creative-utils',
    categoryLabel: 'Creative & Utils',
    description: 'Draw, annotate, brush, erase, and add text overlays directly on photos.',
    icon: PenTool,
    badge: 'Canvas Studio',
  },
];

// High quality fallback demo sample image (SVG Data URL gradient with geometric shapes)
const DEMO_SAMPLE_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%234338ca"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg)"/><circle cx="400" cy="300" r="180" fill="url(%23g2)" opacity="0.85"/><rect x="220" y="160" width="360" height="280" rx="32" fill="none" stroke="%23ffffff" stroke-width="4" opacity="0.5"/><text x="400" y="290" fill="%23ffffff" font-size="36" font-family="sans-serif" font-weight="900" text-anchor="middle">OFFLINE IMAGE STUDIO</text><text x="400" y="340" fill="%23cbd5e1" font-size="18" font-family="sans-serif" font-weight="600" text-anchor="middle">20 Serverless Client-Side Canvas Tools</text></svg>`;

export function ImageStudioSuite() {
  const [activeTool, setActiveTool] = useState<ImageToolId>('image-cropper');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Global Image State shared across tools
  const [imageSrc, setImageSrc] = useState<string>(DEMO_SAMPLE_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    name: string;
    width: number;
    height: number;
    size: number;
    type: string;
  }>({
    name: 'demo-sample.svg',
    width: 800,
    height: 600,
    size: 24500,
    type: 'image/svg+xml',
  });

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0] || null;
    } else if (e.target.files) {
      file = e.target.files[0] || null;
    }

    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImageSrc(resultUrl);
          setImageMeta({
            name: file?.name || 'uploaded-image',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            size: file?.size || 0,
            type: file?.type || 'image/png',
          });
        };
        img.src = resultUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleImage = () => {
    setImageSrc(DEMO_SAMPLE_IMAGE);
    setImageFile(null);
    setImageMeta({
      name: 'demo-sample.svg',
      width: 800,
      height: 600,
      size: 24500,
      type: 'image/svg+xml',
    });
  };

  const filteredTools = useMemo(() => {
    return IMAGE_TOOLS_META.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  const currentToolMeta =
    IMAGE_TOOLS_META.find((t) => t.id === activeTool) || IMAGE_TOOLS_META[0];
  const CurrentIcon = currentToolMeta.icon;

  return (
    <div className="space-y-8" id="image-studio-suite-root">
      {/* 20 Image Tools Dashboard Switcher */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
                Image Studio Suite
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                20 OFFLINE TOOLS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              100% Client-side HTML5 Canvas manipulation: Crop, Resize, Compress, Convert, Filters, Sharpen & Drawing Editor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 20 image tools..."
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
                { id: 'edit-geometry', label: 'Geometry' },
                { id: 'filters-color', label: 'Filters' },
                { id: 'optimize-convert', label: 'Optimize' },
                { id: 'creative-utils', label: 'Creative' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCategory(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeCategory === f.id
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
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
                  document.getElementById('active-image-tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/20 border-cyan-400/50 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-sm'
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

      {/* Global Image Upload Strip */}
      <div className="p-4 sm:p-5 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileUpload}
          className="flex-1 flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-950/80 border border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl cursor-pointer transition-colors group relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
              Drag & Drop an Image or Click to Browse
            </div>
            <div className="text-[10px] text-slate-500 truncate font-mono">
              Supports PNG, JPG, WebP, SVG, GIF, BMP (100% Client-Side Local)
            </div>
          </div>
        </div>

        {/* Current Active Image Pill */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
            <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
              {imageMeta.name}
            </div>
            <div className="text-[10px] font-mono text-cyan-400">
              {imageMeta.width}×{imageMeta.height} px • {(imageMeta.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            onClick={loadSampleImage}
            title="Reset to Demo Sample"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Selected Tool Workspace */}
      <div id="active-image-tool-workspace" className="space-y-6">
        {/* Workspace Active Header */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-600/20 shrink-0">
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
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          {activeTool === 'image-viewer' && <ImageViewerTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-cropper' && <ImageCropperTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-resizer' && <ImageResizerTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-rotator' && <ImageRotatorTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-flipper' && <ImageFlipperTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-compressor' && <ImageCompressorTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-converter' && <ImageConverterTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-quality' && <ImageQualityTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-brightness' && <ImageBrightnessTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-contrast' && <ImageContrastTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-saturation' && <ImageSaturationTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-grayscale' && <ImageGrayscaleTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-blur' && <ImageBlurTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-sharpen' && <ImageSharpenTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-pixelate' && <ImagePixelateTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-invert' && <ImageInvertTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-metadata' && <ImageMetadataTool imageSrc={imageSrc} imageMeta={imageMeta} />}
          {activeTool === 'image-to-base64' && <ImageToBase64Tool imageSrc={imageSrc} imageMeta={imageMeta} onCopy={handleCopy} copiedKey={copiedKey} />}
          {activeTool === 'base64-to-image' && <Base64ToImageTool onSelectImage={(dataUrl, name) => {
            setImageSrc(dataUrl);
            const img = new Image();
            img.onload = () => {
              setImageMeta({
                name: name || 'decoded-base64.png',
                width: img.width,
                height: img.height,
                size: Math.round(dataUrl.length * 0.75),
                type: 'image/png',
              });
            };
            img.src = dataUrl;
          }} />}
          {activeTool === 'canvas-editor' && <CanvasDrawingEditorTool imageSrc={imageSrc} imageMeta={imageMeta} />}

          {/* Adsterra Native Banner below primary tool workspace */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <AdsterraNative
              layout="workspace"
              position="image-suite-workspace-bottom"
              sponsorName="DevMedia CDN"
              headline="Enterprise Image Processing & Asset Optimization"
              description="Automate media pipelines, generate responsive picture tags, and offload storage to global edge nodes."
              ctaText="Start Free"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper to trigger local browser file download */
function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  try {
    logActivity('Image Studio', `Processed & downloaded image: ${filename}`, 'download', dataUrl);
  } catch (e) {
    console.warn('Activity logging error:', e);
  }
}

/* =========================================================================
   TOOL 1: Image Viewer (Zoom, Pan, Details)
   ========================================================================= */
function ImageViewerTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [zoom, setZoom] = useState<number>(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-cyan-400 w-14 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(400, z + 25))}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white border border-slate-800"
          >
            Reset (100%)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>{imageMeta.width} × {imageMeta.height} px</span>
          <span>•</span>
          <span>{(imageMeta.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl min-h-[400px] flex items-center justify-center overflow-auto max-h-[600px] relative">
        <img
          src={imageSrc}
          alt="Preview"
          style={{ width: `${zoom}%`, maxWidth: 'none' }}
          className="transition-all duration-150 object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 2: Image Cropper (Aspect ratios & Freeform)
   ========================================================================= */
function ImageCropperTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [aspect, setAspect] = useState<string>('free');
  const [cropWidthPct, setCropWidthPct] = useState<number>(80);
  const [cropHeightPct, setCropHeightPct] = useState<number>(80);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);

  const executeCrop = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let targetW = (img.naturalWidth * cropWidthPct) / 100;
      let targetH = (img.naturalHeight * cropHeightPct) / 100;

      if (aspect === '1:1') {
        const side = Math.min(targetW, targetH);
        targetW = side;
        targetH = side;
      } else if (aspect === '16:9') {
        targetH = (targetW * 9) / 16;
      } else if (aspect === '4:3') {
        targetH = (targetW * 3) / 4;
      } else if (aspect === '9:16') {
        targetW = (targetH * 9) / 16;
      }

      canvas.width = Math.max(1, Math.round(targetW));
      canvas.height = Math.max(1, Math.round(targetH));

      // Center crop
      const startX = (img.naturalWidth - canvas.width) / 2;
      const startY = (img.naturalHeight - canvas.height) / 2;

      ctx.drawImage(
        img,
        Math.max(0, startX),
        Math.max(0, startY),
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      setCroppedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, aspect, cropWidthPct, cropHeightPct]);

  useEffect(() => {
    executeCrop();
  }, [executeCrop]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Aspect Ratio:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['free', '1:1', '16:9', '4:3', '9:16'].map((r) => (
              <button
                key={r}
                onClick={() => setAspect(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${
                  aspect === r ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Scale: {cropWidthPct}%</span>
            <input
              type="range"
              min="20"
              max="100"
              value={cropWidthPct}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCropWidthPct(val);
                setCropHeightPct(val);
              }}
              className="w-28 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {croppedDataUrl && (
          <div className="space-y-3 w-full">
            <button
              onClick={() => downloadDataUrl(croppedDataUrl, `cropped-${imageMeta.name}.png`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cropped Image</span>
            </button>
            <AdsterraNative
              layout="workspace"
              position="below-download-cropped-image"
              sponsorName="CloudMedia Optimizer"
              headline="High-Speed Cloud Media Storage & Image CDN"
              description="Accelerate your website images with automatic WebP conversion, global caching, and instant resizing."
              ctaText="Explore CDN"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-400">Original Source</span>
          <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-2">
            <img src={imageSrc} alt="Original" className="max-h-full object-contain rounded-lg" />
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-cyan-400">Cropped Result</span>
          <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-2">
            {croppedDataUrl && (
              <img src={croppedDataUrl} alt="Cropped" className="max-h-full object-contain rounded-lg shadow-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 3: Image Resizer (Custom pixel dimensions & scale percentage)
   ========================================================================= */
function ImageResizerTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [targetWidth, setTargetWidth] = useState<number>(imageMeta.width || 800);
  const [targetHeight, setTargetHeight] = useState<number>(imageMeta.height || 600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  useEffect(() => {
    setTargetWidth(imageMeta.width || 800);
    setTargetHeight(imageMeta.height || 600);
  }, [imageMeta]);

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspect && imageMeta.width > 0) {
      setTargetHeight(Math.round((w * imageMeta.height) / imageMeta.width));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspect && imageMeta.height > 0) {
      setTargetWidth(Math.round((h * imageMeta.width) / imageMeta.height));
    }
  };

  const executeResize = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, targetWidth);
      canvas.height = Math.max(1, targetHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setResizedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, targetWidth, targetHeight]);

  useEffect(() => {
    executeResize();
  }, [executeResize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Width:</span>
            <input
              type="number"
              value={targetWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              className="w-24 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-cyan-300 font-bold text-xs"
            />
            <span className="text-xs text-slate-500">px</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Height:</span>
            <input
              type="number"
              value={targetHeight}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              className="w-24 bg-slate-900 border border-slate-800 rounded-xl p-1.5 font-mono text-center text-cyan-300 font-bold text-xs"
            />
            <span className="text-xs text-slate-500">px</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-cyan-500"
            />
            <span>Lock Aspect Ratio</span>
          </label>
        </div>

        {resizedUrl && (
          <button
            onClick={() => downloadDataUrl(resizedUrl, `resized-${targetWidth}x${targetHeight}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({targetWidth}×{targetHeight})</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4">
        {resizedUrl && (
          <img
            src={resizedUrl}
            alt="Resized"
            style={{ maxWidth: '100%', maxHeight: '450px' }}
            className="object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 4: Image Rotator (90, 180, 270, arbitrary angle)
   ========================================================================= */
function ImageRotatorTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [rotation, setRotation] = useState<number>(0);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);

  const executeRotate = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));

      canvas.width = img.naturalWidth * cos + img.naturalHeight * sin;
      canvas.height = img.naturalWidth * sin + img.naturalHeight * cos;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      setRotatedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, rotation]);

  useEffect(() => {
    executeRotate();
  }, [executeRotate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-90° Left</span>
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+90° Right</span>
          </button>
          <button
            onClick={() => setRotation((r) => (r + 180) % 360)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800"
          >
            180° Flip
          </button>
          <button
            onClick={() => setRotation(0)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-800"
          >
            Reset
          </button>

          <span className="text-xs font-mono font-bold text-cyan-400">Angle: {rotation}°</span>
        </div>

        {rotatedUrl && (
          <button
            onClick={() => downloadDataUrl(rotatedUrl, `rotated-${rotation}deg-${imageMeta.name}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rotated Image</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {rotatedUrl && (
          <img
            src={rotatedUrl}
            alt="Rotated"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 5: Image Flipper (Horizontal and Vertical Mirroring)
   ========================================================================= */
function ImageFlipperTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [flippedUrl, setFlippedUrl] = useState<string | null>(null);

  const executeFlip = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      setFlippedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, flipH, flipV]);

  useEffect(() => {
    executeFlip();
  }, [executeFlip]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFlipH(!flipH)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              flipH ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Flip Horizontal (X)</span>
          </button>
          <button
            onClick={() => setFlipV(!flipV)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              flipV ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Move className="w-4 h-4" />
            <span>Flip Vertical (Y)</span>
          </button>
        </div>

        {flippedUrl && (
          <button
            onClick={() => downloadDataUrl(flippedUrl, `flipped-${imageMeta.name}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Flipped Image</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {flippedUrl && (
          <img
            src={flippedUrl}
            alt="Flipped"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 6: Image Compressor (Live quality & KB savings)
   ========================================================================= */
function ImageCompressorTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [quality, setQuality] = useState<number>(75);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const executeCompress = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedUrl(dataUrl);
      setCompressedSize(Math.round(dataUrl.length * 0.75));
    };
    img.src = imageSrc;
  }, [imageSrc, quality]);

  useEffect(() => {
    executeCompress();
  }, [executeCompress]);

  const savingsPct =
    imageMeta.size > 0
      ? Math.max(0, Math.round(((imageMeta.size - compressedSize) / imageMeta.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Quality: {quality}%</span>
          <input
            type="range"
            min="5"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-36 accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">Original: {(imageMeta.size / 1024).toFixed(1)} KB</span>
          <span className="text-cyan-400 font-bold">Compressed: {(compressedSize / 1024).toFixed(1)} KB</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
            {savingsPct}% Saved
          </span>
        </div>

        {compressedUrl && (
          <button
            onClick={() => downloadDataUrl(compressedUrl, `compressed-q${quality}.jpg`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Compressed</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {compressedUrl && (
          <img
            src={compressedUrl}
            alt="Compressed"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 7: Format Converter (PNG, JPEG, WebP, BMP)
   ========================================================================= */
function ImageConverterTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  const executeConvert = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      setConvertedUrl(canvas.toDataURL(targetFormat, 0.92));
    };
    img.src = imageSrc;
  }, [imageSrc, targetFormat]);

  useEffect(() => {
    executeConvert();
  }, [executeConvert]);

  const extMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Target Format:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'image/webp', label: 'WebP (Modern)' },
              { id: 'image/png', label: 'PNG (Lossless)' },
              { id: 'image/jpeg', label: 'JPEG (Universal)' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setTargetFormat(fmt.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  targetFormat === fmt.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {convertedUrl && (
          <button
            onClick={() => downloadDataUrl(convertedUrl, `converted.${extMap[targetFormat]}`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .{extMap[targetFormat].toUpperCase()}</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {convertedUrl && (
          <img
            src={convertedUrl}
            alt="Converted"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 8: Quality Adjuster
   ========================================================================= */
function ImageQualityTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [quality, setQuality] = useState<number>(85);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const executeQuality = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      setOutputUrl(canvas.toDataURL('image/jpeg', quality / 100));
    };
    img.src = imageSrc;
  }, [imageSrc, quality]);

  useEffect(() => {
    executeQuality();
  }, [executeQuality]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Export Quality: {quality}%</span>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
        </div>

        {outputUrl && (
          <button
            onClick={() => downloadDataUrl(outputUrl, `quality-${quality}pct.jpg`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({quality}% Quality)</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {outputUrl && (
          <img
            src={outputUrl}
            alt="Quality result"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 9: Brightness Adjuster (-100% to +100%)
   ========================================================================= */
function ImageBrightnessTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [brightness, setBrightness] = useState<number>(0);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyBrightness = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `brightness(${100 + brightness}%)`;
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, brightness]);

  useEffect(() => {
    applyBrightness();
  }, [applyBrightness]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Brightness: {brightness > 0 ? `+${brightness}` : brightness}%</span>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
          <button
            onClick={() => setBrightness(0)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-bold text-slate-400 hover:text-white"
          >
            Reset
          </button>
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `brightness-${brightness}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Processed</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Brightness"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 10: Contrast Adjuster (0% to 250%)
   ========================================================================= */
function ImageContrastTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [contrast, setContrast] = useState<number>(100);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyContrast = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, contrast]);

  useEffect(() => {
    applyContrast();
  }, [applyContrast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Contrast: {contrast}%</span>
          <input
            type="range"
            min="0"
            max="250"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
          <button
            onClick={() => setContrast(100)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-bold text-slate-400 hover:text-white"
          >
            Reset (100%)
          </button>
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `contrast-${contrast}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Processed</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Contrast"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 11: Saturation Adjuster (0% to 300%)
   ========================================================================= */
function ImageSaturationTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [saturate, setSaturate] = useState<number>(100);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applySaturation = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `saturate(${saturate}%)`;
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, saturate]);

  useEffect(() => {
    applySaturation();
  }, [applySaturation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Saturation: {saturate}%</span>
          <input
            type="range"
            min="0"
            max="300"
            value={saturate}
            onChange={(e) => setSaturate(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
          <button
            onClick={() => setSaturate(100)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-bold text-slate-400 hover:text-white"
          >
            Reset (100%)
          </button>
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `saturation-${saturate}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Processed</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Saturation"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 12: Grayscale & B/W Converter
   ========================================================================= */
function ImageGrayscaleTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [mode, setMode] = useState<'standard' | 'high-contrast' | 'sepia'>('standard');
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyGrayscale = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (mode === 'standard') {
        ctx.filter = 'grayscale(100%)';
      } else if (mode === 'high-contrast') {
        ctx.filter = 'grayscale(100%) contrast(160%) brightness(95%)';
      } else if (mode === 'sepia') {
        ctx.filter = 'sepia(90%) contrast(110%)';
      }
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, mode]);

  useEffect(() => {
    applyGrayscale();
  }, [applyGrayscale]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'standard', label: 'Classic Grayscale' },
            { id: 'high-contrast', label: 'Dramatic B&W' },
            { id: 'sepia', label: 'Vintage Sepia' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                mode === m.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `monochrome-${mode}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Monochrome</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Grayscale"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 13: Gaussian Blur Tool (0px to 30px)
   ========================================================================= */
function ImageBlurTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [blurRadius, setBlurRadius] = useState<number>(8);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyBlur = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, blurRadius]);

  useEffect(() => {
    applyBlur();
  }, [applyBlur]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Blur Radius: {blurRadius}px</span>
          <input
            type="range"
            min="0"
            max="30"
            value={blurRadius}
            onChange={(e) => setBlurRadius(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `blur-${blurRadius}px.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Blurred</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Blur"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 14: Sharpen Tool (3x3 Convolution Kernel)
   ========================================================================= */
function ImageSharpenTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [strength, setStrength] = useState<number>(2);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applySharpen = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 3x3 Sharpen Kernel: [0, -k, 0, -k, 1+4k, -k, 0, -k, 0]
      const k = strength * 0.5;
      const center = 1 + 4 * k;
      const copy = new Uint8ClampedArray(data);

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const val =
              copy[idx + c] * center -
              k * (
                copy[((y - 1) * w + x) * 4 + c] +
                copy[((y + 1) * w + x) * 4 + c] +
                copy[(y * w + (x - 1)) * 4 + c] +
                copy[(y * w + (x + 1)) * 4 + c]
              );
            data[idx + c] = Math.min(255, Math.max(0, val));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, strength]);

  useEffect(() => {
    applySharpen();
  }, [applySharpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Sharpen Intensity: {strength}x</span>
          <input
            type="range"
            min="1"
            max="5"
            value={strength}
            onChange={(e) => setStrength(parseInt(e.target.value))}
            className="w-36 accent-cyan-500 cursor-pointer"
          />
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `sharpen-${strength}x.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sharpened</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Sharpened"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 15: Pixelate Tool (8-Bit Mosaic Filter)
   ========================================================================= */
function ImagePixelateTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [blockSize, setBlockSize] = useState<number>(12);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyPixelate = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 1 / blockSize;
      const scaledW = Math.max(1, Math.floor(canvas.width * scale));
      const scaledH = Math.max(1, Math.floor(canvas.height * scale));

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledW;
      tempCanvas.height = scaledH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw downscaled
      tempCtx.drawImage(img, 0, 0, scaledW, scaledH);

      // Draw back upscaled with pixelated smoothing disabled
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, canvas.width, canvas.height);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc, blockSize]);

  useEffect(() => {
    applyPixelate();
  }, [applyPixelate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Pixel Block Size: {blockSize}px</span>
          <input
            type="range"
            min="2"
            max="40"
            value={blockSize}
            onChange={(e) => setBlockSize(parseInt(e.target.value))}
            className="w-40 accent-cyan-500 cursor-pointer"
          />
        </div>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `pixelate-${blockSize}px.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download 8-Bit Pixelated</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Pixelated"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 16: Color Inverter (Negative Film)
   ========================================================================= */
function ImageInvertTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const applyInvert = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = 'invert(100%)';
      ctx.drawImage(img, 0, 0);

      setRenderedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    applyInvert();
  }, [applyInvert]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <span className="text-xs font-bold text-slate-400">Color Channel Inversion (255 - RGB)</span>

        {renderedUrl && (
          <button
            onClick={() => downloadDataUrl(renderedUrl, `inverted-${imageMeta.name}.png`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Negative Image</span>
          </button>
        )}
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center min-h-[380px]">
        {renderedUrl && (
          <img
            src={renderedUrl}
            alt="Inverted"
            className="max-h-[420px] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 17: Image Metadata Viewer
   ========================================================================= */
function ImageMetadataTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const megapixels = ((imageMeta.width * imageMeta.height) / 1000000).toFixed(2);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(imageMeta.width, imageMeta.height) || 1;
  const aspectFraction = `${imageMeta.width / divisor}:${imageMeta.height / divisor}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'File Name', val: imageMeta.name, icon: FileCode },
          { label: 'Dimensions', val: `${imageMeta.width} × ${imageMeta.height} px`, icon: Maximize2 },
          { label: 'Aspect Ratio', val: aspectFraction, icon: Crop },
          { label: 'Resolution', val: `${megapixels} Megapixels`, icon: Sparkles },
          { label: 'File Size', val: `${(imageMeta.size / 1024).toFixed(1)} KB`, icon: Minimize2 },
          { label: 'MIME Type', val: imageMeta.type || 'image/png', icon: Info },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-200 truncate">{item.val}</div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex justify-center">
        <img
          src={imageSrc}
          alt="Metadata preview"
          className="max-h-[340px] object-contain rounded-xl shadow-xl border border-slate-800"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 18: Image to Base64 Converter
   ========================================================================= */
function ImageToBase64Tool({
  imageSrc,
  imageMeta,
  onCopy,
  copiedKey,
}: {
  imageSrc: string;
  imageMeta: any;
  onCopy: (t: string, k: string) => void;
  copiedKey: string | null;
}) {
  const htmlTag = `<img src="${imageSrc}" alt="${imageMeta.name}" />`;
  const cssBackground = `background-image: url("${imageSrc}");`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Raw Base64 Data URL</span>
            <button
              onClick={() => onCopy(imageSrc, 'base64-raw')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              {copiedKey === 'base64-raw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Data URL</span>
            </button>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-amber-300 break-all select-all max-h-28 overflow-y-auto">
            {imageSrc.slice(0, 500)}... ({imageSrc.length} characters)
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>HTML Image Embed Tag</span>
            <button
              onClick={() => onCopy(htmlTag, 'base64-html')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              {copiedKey === 'base64-html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy HTML</span>
            </button>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 break-all select-all">
            {htmlTag.slice(0, 300)}...
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TOOL 19: Base64 to Image Converter
   ========================================================================= */
function Base64ToImageTool({ onSelectImage }: { onSelectImage: (url: string, name: string) => void }) {
  const [base64Input, setBase64Input] = useState<string>('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const handleDecode = () => {
    let clean = base64Input.trim();
    if (!clean) return;
    if (!clean.startsWith('data:image')) {
      clean = `data:image/png;base64,${clean}`;
    }
    setPreviewSrc(clean);
    onSelectImage(clean, 'decoded-image.png');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-400">Paste Raw Base64 or Data URL:</span>
        <textarea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder="Paste Base64 data string (e.g. data:image/png;base64,iVBORw0KGgo...)"
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white outline-none focus:border-cyan-500"
        />
        <div className="flex justify-end">
          <button
            onClick={handleDecode}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Decode & Render Image</span>
          </button>
        </div>
      </div>

      {previewSrc && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-4">
          <img src={previewSrc} alt="Decoded" className="max-h-[380px] object-contain rounded-xl shadow-xl" />
          <button
            onClick={() => downloadDataUrl(previewSrc, 'decoded-image.png')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Decoded Image (PNG)</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TOOL 20: Canvas Drawing & Annotation Studio
   ========================================================================= */
function CanvasDrawingEditorTool({ imageSrc, imageMeta }: { imageSrc: string; imageMeta: any }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState<string>('#ec4899');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [mode, setMode] = useState<'brush' | 'eraser' | 'text'>('brush');
  const [textInput, setTextInput] = useState<string>('Sample Caption');

  // Initialize canvas with photo
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (mode === 'text') {
      ctx.font = `bold ${brushSize * 4}px sans-serif`;
      ctx.fillStyle = brushColor;
      ctx.fillText(textInput, x, y);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL('image/png'), 'drawing-canvas.png');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('brush')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                mode === 'brush' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Brush</span>
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                mode === 'eraser' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                mode === 'text' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text Stamp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Color:</span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Size: {brushSize}px</span>
            <input
              type="range"
              min="1"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-cyan-500 cursor-pointer"
            />
          </div>

          {mode === 'text' && (
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Text to stamp..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-cyan-500"
            />
          )}

          <button
            onClick={initCanvas}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white border border-slate-800 flex items-center gap-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Clear / Reset</span>
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Canvas</span>
        </button>
      </div>

      <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={drawMove}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="max-h-[500px] max-w-full rounded-2xl shadow-2xl cursor-crosshair border border-slate-800"
        />
      </div>
    </div>
  );
}
