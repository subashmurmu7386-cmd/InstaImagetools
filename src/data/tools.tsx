import React from 'react';
import {
  Image,
  Maximize2,
  Repeat,
  Layers,
  Sliders,
  Crop,
  ShieldCheck,
  Palette,
  Eye,
  Stamp,
  FilePlus2,
  Scissors,
  FileImage,
  ArrowUpDown,
  FileText,
  FileArchive,
  Lock,
  DownloadCloud,
  AlignLeft,
  CaseSensitive,
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
  Sparkles,
} from 'lucide-react';
import { TOTAL_TOOLS_COUNT } from '../components/CategoryNav';

export interface ToolItem {
  id: string;
  name: string;
  category: 'image' | 'pdf' | 'text' | 'vector';
  categoryLabel: string;
  description: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  isNew?: boolean;
  actionTab: 'image' | 'pdf' | 'text' | 'history' | 'dev';
  subMode?: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', count: TOTAL_TOOLS_COUNT },
  { id: 'image', label: 'Image Studio', count: 10, icon: 'Image' },
  { id: 'pdf', label: 'PDF Suite', count: 8, icon: 'FileText' },
  { id: 'text', label: 'Text & Dev Utilities', count: 10, icon: 'Braces' },
  { id: 'vector', label: 'Canvas & Vectors', count: 4, icon: 'Boxes' },
];

export const TOOLS_LIST: ToolItem[] = [
  // Image Studio (10 Tools)
  {
    id: 'image-compress',
    name: 'Image Compressor',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Compress PNG, JPG, and WebP photos with custom quality slider and real-time size reduction.',
    iconName: 'Image',
    badge: 'Lossless / Lossy',
    popular: true,
    actionTab: 'image',
    subMode: 'compress',
  },
  {
    id: 'image-resize',
    name: 'Smart Resizer',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Scale photos by percentage or exact pixels with aspect ratio preservation and presets.',
    iconName: 'Maximize2',
    badge: 'HD / 4K Presets',
    popular: true,
    actionTab: 'image',
    subMode: 'resize',
  },
  {
    id: 'image-convert',
    name: 'Format Converter',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Transform images between modern WebP, PNG, JPEG, and AVIF formats in milliseconds.',
    iconName: 'Repeat',
    badge: 'WebP / PNG / JPG',
    popular: true,
    actionTab: 'image',
    subMode: 'convert',
  },
  {
    id: 'image-batch',
    name: 'Bulk Batch Processor',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Compress, convert, or resize up to 50 photos simultaneously with one-click ZIP download.',
    iconName: 'Layers',
    badge: 'Bulk ZIP',
    popular: true,
    actionTab: 'image',
    subMode: 'batch',
  },
  {
    id: 'image-filters',
    name: 'Filter & Adjustment Lab',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Tune brightness, contrast, saturation, blur, sepia, invert, and exposure with live preview.',
    iconName: 'Sliders',
    badge: 'Real-Time FX',
    actionTab: 'image',
    subMode: 'filter',
  },
  {
    id: 'image-crop',
    name: 'Aspect Ratio Cropper',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Crop images to 1:1 Square, 16:9 Cinema, 4:5 Portrait, or custom framing grids.',
    iconName: 'Crop',
    badge: 'Social Presets',
    actionTab: 'image',
    subMode: 'crop',
  },
  {
    id: 'image-metadata',
    name: 'EXIF Metadata Stripper',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Remove sensitive GPS location coordinates, camera models, and timestamp data for privacy.',
    iconName: 'ShieldCheck',
    badge: 'Privacy Safe',
    actionTab: 'image',
    subMode: 'metadata',
  },
  {
    id: 'image-palette',
    name: 'Color Palette Extractor',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Sample dominant hex color codes, RGB channels, and mood palettes from any uploaded picture.',
    iconName: 'Palette',
    badge: 'HEX / RGB Codes',
    actionTab: 'image',
    subMode: 'palette',
  },
  {
    id: 'image-duotone',
    name: 'Monochrome & Duotone',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Convert color photos into high-contrast black & white or vibrant cyber-duotone stylings.',
    iconName: 'Eye',
    badge: 'B&W / Duotone',
    actionTab: 'image',
    subMode: 'filter',
  },
  {
    id: 'image-watermark',
    name: 'Watermark Studio',
    category: 'image',
    categoryLabel: 'Image Studio',
    description: 'Overlay custom copyright text or stamps with adjustable opacity and corner positioning.',
    iconName: 'Stamp',
    badge: 'Custom Stamps',
    actionTab: 'image',
    subMode: 'watermark',
  },

  // PDF Suite (8 Tools)
  {
    id: 'pdf-merge',
    name: 'PDF Merger',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Combine multiple PDF files into one clean document with drag-and-drop order rearrangement.',
    iconName: 'FilePlus2',
    badge: 'Multi-Doc',
    popular: true,
    actionTab: 'pdf',
    subMode: 'merge',
  },
  {
    id: 'pdf-split',
    name: 'PDF Splitter & Extractor',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Inspect pages with PDF.js thumbnail preview and extract custom page ranges or single sheets.',
    iconName: 'Scissors',
    badge: 'Visual PDF.js',
    popular: true,
    actionTab: 'pdf',
    subMode: 'split',
  },
  {
    id: 'pdf-images-to-pdf',
    name: 'Images to PDF',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Compile multiple PNG and JPG photos into a formatted multi-page PDF ready for sharing.',
    iconName: 'FileImage',
    badge: 'Multi-Page',
    popular: true,
    actionTab: 'pdf',
    subMode: 'imagetopdf',
  },
  {
    id: 'pdf-reorder',
    name: 'Visual Page Reorder',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Rotate, reorganize, and delete individual PDF pages using thumbnail grid management.',
    iconName: 'ArrowUpDown',
    badge: 'Drag & Drop',
    actionTab: 'pdf',
    subMode: 'split',
  },
  {
    id: 'pdf-text-extract',
    name: 'PDF Text Extractor',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Extract raw selectable text paragraphs and tables from PDF documents client-side.',
    iconName: 'FileText',
    badge: 'OCR & Text',
    actionTab: 'pdf',
    subMode: 'split',
  },
  {
    id: 'pdf-compress',
    name: 'PDF Optimizer',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Reduce heavy PDF attachment sizes for seamless email delivery and rapid upload.',
    iconName: 'FileArchive',
    badge: 'Fast Shrink',
    actionTab: 'pdf',
    subMode: 'merge',
  },
  {
    id: 'pdf-lock',
    name: 'Protect & Lock PDF',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Add client-side security passcodes to protect confidential contracts and documents.',
    iconName: 'Lock',
    badge: 'Encrypted',
    actionTab: 'pdf',
    subMode: 'merge',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Image Renderer',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    description: 'Render every PDF page into sharp high-resolution PNG or JPG image files with PDF.js.',
    iconName: 'DownloadCloud',
    badge: 'Hi-Res Render',
    actionTab: 'pdf',
    subMode: 'split',
  },

  // Text & Dev Utilities (10 Tools)
  {
    id: 'text-counter',
    name: 'Word & Character Counter',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Real-time analysis of words, characters, sentences, paragraphs, and estimated reading time.',
    iconName: 'AlignLeft',
    badge: 'Live Analytics',
    popular: true,
    actionTab: 'text',
    subMode: 'counter',
  },
  {
    id: 'text-case',
    name: 'Case Converter',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Instant conversion between UPPERCASE, lowercase, Title Case, camelCase, and kebab-case.',
    iconName: 'CaseSensitive',
    badge: 'One-Click',
    actionTab: 'text',
    subMode: 'case',
  },
  {
    id: 'dev-json',
    name: 'JSON Formatter & Validator',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Beautify, validate syntax errors, minify, and inspect complex JSON structures.',
    iconName: 'Braces',
    badge: 'Syntax Highlighting',
    popular: true,
    actionTab: 'text',
    subMode: 'json',
  },
  {
    id: 'dev-base64',
    name: 'Base64 Encoder & Decoder',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Encode and decode strings or drag-and-drop images into Data URL Base64 strings.',
    iconName: 'Binary',
    badge: 'Text & Files',
    actionTab: 'text',
    subMode: 'base64',
  },
  {
    id: 'dev-hash',
    name: 'Crypto Hash Generator',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Generate cryptographic SHA-256, SHA-512, SHA-1, and MD5 checksum hashes in browser.',
    iconName: 'Hash',
    badge: 'SHA-256 / MD5',
    actionTab: 'text',
    subMode: 'hash',
  },
  {
    id: 'dev-url',
    name: 'URL Encoder & Decoder',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Safely escape URI characters or decode URL query parameters and URI components.',
    iconName: 'Link2',
    badge: 'RFC 3986',
    actionTab: 'text',
    subMode: 'url',
  },
  {
    id: 'dev-markdown',
    name: 'Markdown Live Studio',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Split-view Markdown editor with live HTML rendering and quick formatting toolbar.',
    iconName: 'FileCode2',
    badge: 'Split Preview',
    actionTab: 'text',
    subMode: 'markdown',
  },
  {
    id: 'dev-qrcode',
    name: 'QR Code Generator',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Create custom vector QR codes for URLs, WiFi credentials, vCards, and plain text.',
    iconName: 'QrCode',
    badge: 'Custom SVG / PNG',
    popular: true,
    actionTab: 'text',
    subMode: 'qrcode',
  },
  {
    id: 'dev-lorem',
    name: 'Lorem Ipsum Generator',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Generate customized dummy placeholder text, paragraphs, words, or unordered list items.',
    iconName: 'FileSpreadsheet',
    badge: 'Custom Length',
    actionTab: 'text',
    subMode: 'lorem',
  },
  {
    id: 'dev-uuid',
    name: 'UUID & Token Generator',
    category: 'text',
    categoryLabel: 'Text & Dev',
    description: 'Generate cryptographically random UUID v4 strings, alphanumeric API keys, and secure tokens.',
    iconName: 'Key',
    badge: 'Crypto v4',
    actionTab: 'text',
    subMode: 'uuid',
  },

  // Canvas & Vectors (4 Tools)
  {
    id: 'vector-svg',
    name: 'SVG Optimizer & Cleaner',
    category: 'vector',
    categoryLabel: 'Canvas & Vectors',
    description: 'Minify SVG markup, eliminate metadata bloat, and preview raw vector code safely.',
    iconName: 'Boxes',
    badge: 'Code Cleaner',
    actionTab: 'text',
    subMode: 'svg',
  },
  {
    id: 'canvas-sketchpad',
    name: 'Canvas Sketchpad & Sign',
    category: 'vector',
    categoryLabel: 'Canvas & Vectors',
    description: 'Interactive HTML5 drawing canvas for digital signatures, doodles, and transparent PNG exports.',
    iconName: 'PenTool',
    badge: 'Touch / Stylus',
    actionTab: 'text',
    subMode: 'sketchpad',
  },
  {
    id: 'vector-gradient',
    name: 'CSS Gradient Studio',
    category: 'vector',
    categoryLabel: 'Canvas & Vectors',
    description: 'Interactive visual linear and radial CSS gradient builder with instant CSS code generation.',
    iconName: 'Blend',
    badge: 'CSS3 Output',
    popular: true,
    actionTab: 'text',
    subMode: 'gradient',
  },
  {
    id: 'vector-aspect',
    name: 'Aspect Ratio Calculator',
    category: 'vector',
    categoryLabel: 'Canvas & Vectors',
    description: 'Compute proportional width, height, and display scale ratios for UI & responsive video.',
    iconName: 'Monitor',
    badge: '16:9 / 4:3 / Custom',
    actionTab: 'text',
    subMode: 'aspect',
  },
];

export function getToolIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Image':
      return <Image className={className} />;
    case 'Maximize2':
      return <Maximize2 className={className} />;
    case 'Repeat':
      return <Repeat className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Crop':
      return <Crop className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Stamp':
      return <Stamp className={className} />;
    case 'FilePlus2':
      return <FilePlus2 className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'FileImage':
      return <FileImage className={className} />;
    case 'ArrowUpDown':
      return <ArrowUpDown className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'FileArchive':
      return <FileArchive className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'DownloadCloud':
      return <DownloadCloud className={className} />;
    case 'AlignLeft':
      return <AlignLeft className={className} />;
    case 'CaseSensitive':
      return <CaseSensitive className={className} />;
    case 'Braces':
      return <Braces className={className} />;
    case 'Binary':
      return <Binary className={className} />;
    case 'Hash':
      return <Hash className={className} />;
    case 'Link2':
      return <Link2 className={className} />;
    case 'FileCode2':
      return <FileCode2 className={className} />;
    case 'QrCode':
      return <QrCode className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'Key':
      return <Key className={className} />;
    case 'Boxes':
      return <Boxes className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Blend':
      return <Blend className={className} />;
    case 'Monitor':
      return <Monitor className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}
