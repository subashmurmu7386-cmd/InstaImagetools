import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Lock, Unlock, Layers, Trash2, Archive, CheckCircle2, Loader2, Sparkles, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { addHistory } from '../lib/history';

interface BatchFileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
  processedUrl?: string;
  processedSize?: number;
  outputFilename?: string;
}

export function ImageTools() {
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Single Image State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'compress' | 'resize' | 'convert' | 'filters'>('compress');

  // Compress State
  const [quality, setQuality] = useState(80);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Resize State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [lockAspect, setLockAspect] = useState(true);
  const [resizePercent, setResizePercent] = useState<number>(100);

  // Convert State
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  // Filters State
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert'>('none');
  const [brightness, setBrightness] = useState<number>(100);

  // Batch Mode State
  const [batchItems, setBatchItems] = useState<BatchFileItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Single File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
        originalImageRef.current = img;
        processImage(img);
      };
      img.src = url;
    }
  };

  // Batch Files Upload Handler
  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f: File) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const newItems: BatchFileItem[] = [];

    files.forEach((f: File) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      const id = crypto.randomUUID();

      img.onload = () => {
        setBatchItems(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              originalWidth: img.width,
              originalHeight: img.height,
            };
          }
          return item;
        }));
      };
      img.src = url;

      newItems.push({
        id,
        file: f,
        previewUrl: url,
        originalWidth: 0,
        originalHeight: 0,
        status: 'idle',
      });
    });

    setBatchItems(prev => [...prev, ...newItems]);
  };

  useEffect(() => {
    if (!isBatchMode && originalImageRef.current) {
      processImage(originalImageRef.current);
    }
  }, [quality, width, height, targetFormat, activeSubTab, filter, brightness, isBatchMode]);

  // Automatically re-process batch when settings change or items added
  useEffect(() => {
    if (isBatchMode && batchItems.length > 0) {
      processAllBatchItems();
    }
  }, [isBatchMode, quality, resizePercent, targetFormat, activeSubTab, filter, brightness]);

  const processImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetWidth = img.width;
    let targetHeight = img.height;

    if (activeSubTab === 'resize' && width > 0 && height > 0) {
      targetWidth = width;
      targetHeight = height;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Apply HTML5 Canvas filters
    const filterParts: string[] = [];
    if (filter === 'grayscale') filterParts.push('grayscale(100%)');
    if (filter === 'sepia') filterParts.push('sepia(100%)');
    if (filter === 'invert') filterParts.push('invert(100%)');
    if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);

    const filterString = filterParts.join(' ');
    ctx.filter = filterString || 'none';

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    if (('filter' in ctx) && ctx.filter === 'none' && filterParts.length > 0) {
      applyPixelFilters(ctx, targetWidth, targetHeight, filter, brightness);
    }

    ctx.filter = 'none';

    let mimeType = file?.type || 'image/jpeg';
    let outputQuality = 1;

    if (activeSubTab === 'compress') {
      outputQuality = quality / 100;
      if (mimeType === 'image/png') mimeType = 'image/jpeg';
    } else if (activeSubTab === 'convert') {
      mimeType = targetFormat;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
          setCompressedSize(blob.size);
        }
      },
      mimeType,
      outputQuality
    );
  };

  const processSingleBatchItem = (item: BatchFileItem): Promise<Partial<BatchFileItem>> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ status: 'error' });
          return;
        }

        let targetWidth = img.width;
        let targetHeight = img.height;

        if (activeSubTab === 'resize' && resizePercent > 0) {
          targetWidth = Math.max(1, Math.round((img.width * resizePercent) / 100));
          targetHeight = Math.max(1, Math.round((img.height * resizePercent) / 100));
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const filterParts: string[] = [];
        if (filter === 'grayscale') filterParts.push('grayscale(100%)');
        if (filter === 'sepia') filterParts.push('sepia(100%)');
        if (filter === 'invert') filterParts.push('invert(100%)');
        if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);

        const filterString = filterParts.join(' ');
        ctx.filter = filterString || 'none';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        if (('filter' in ctx) && ctx.filter === 'none' && filterParts.length > 0) {
          applyPixelFilters(ctx, targetWidth, targetHeight, filter, brightness);
        }

        ctx.filter = 'none';

        let mimeType = item.file.type || 'image/jpeg';
        let outputQuality = 1;
        let ext = 'jpg';

        if (activeSubTab === 'compress') {
          outputQuality = quality / 100;
          if (mimeType === 'image/png') mimeType = 'image/jpeg';
          ext = 'jpg';
        } else if (activeSubTab === 'convert') {
          mimeType = targetFormat;
          ext = targetFormat.split('/')[1];
        } else if (item.file.type === 'image/png') {
          ext = 'png';
        } else if (item.file.type === 'image/webp') {
          ext = 'webp';
        }

        const prefix = activeSubTab === 'compress' ? 'compressed' : activeSubTab === 'resize' ? 'resized' : activeSubTab === 'convert' ? 'converted' : 'filtered';
        const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
        const outputFilename = `${prefix}-${baseName}.${ext}`;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                status: 'done',
                processedBlob: blob,
                processedUrl: url,
                processedSize: blob.size,
                outputFilename,
              });
            } else {
              resolve({ status: 'error' });
            }
          },
          mimeType,
          outputQuality
        );
      };

      img.onerror = () => {
        resolve({ status: 'error' });
      };

      img.src = item.previewUrl;
    });
  };

  const processAllBatchItems = async () => {
    if (isProcessingBatch || batchItems.length === 0) return;
    setIsProcessingBatch(true);

    // Set processing status
    setBatchItems(prev => prev.map(item => ({ ...item, status: 'processing' })));

    const updatedItems = [...batchItems];
    for (let i = 0; i < updatedItems.length; i++) {
      const result = await processSingleBatchItem(updatedItems[i]);
      updatedItems[i] = {
        ...updatedItems[i],
        ...result,
      };
      setBatchItems([...updatedItems]);
    }

    setIsProcessingBatch(false);
  };

  const applyPixelFilters = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    filterType: 'none' | 'grayscale' | 'sepia' | 'invert',
    bLevel: number
  ) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const bFactor = bLevel / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filterType === 'grayscale') {
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = avg;
      } else if (filterType === 'sepia') {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = Math.min(255, sr);
        g = Math.min(255, sg);
        b = Math.min(255, sb);
      } else if (filterType === 'invert') {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      if (bLevel !== 100) {
        r = Math.min(255, Math.max(0, r * bFactor));
        g = Math.min(255, Math.max(0, g * bFactor));
        b = Math.min(255, Math.max(0, b * bFactor));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    setWidth(newWidth);
    if (lockAspect && newWidth > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    setHeight(newHeight);
    if (lockAspect && newHeight > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (compressedUrl && file) {
      const a = document.createElement('a');
      a.href = compressedUrl;
      let ext = 'jpg';
      if (activeSubTab === 'convert') {
        ext = targetFormat.split('/')[1];
      } else if (file.type === 'image/png' && activeSubTab !== 'compress') {
        ext = 'png';
      } else if (file.type === 'image/webp') {
        ext = 'webp';
      }
      
      const prefix = activeSubTab === 'compress' ? 'compressed' : activeSubTab === 'resize' ? 'resized' : activeSubTab === 'convert' ? 'converted' : 'filtered';
      a.download = `${prefix}-${file.name.split('.')[0]}.${ext}`;
      a.click();

      const toolNames = {
        'compress': 'Image Compressor',
        'resize': 'Image Resizer',
        'convert': 'Format Converter',
        'filters': 'Image Filters'
      };
      
      let details = a.download;
      if (activeSubTab === 'compress') {
        const saved = Math.round((1 - compressedSize / file.size) * 100);
        details += ` (Saved ${saved}%)`;
      } else if (activeSubTab === 'resize') {
        details += ` (${width}x${height})`;
      } else if (activeSubTab === 'filters') {
        details += ` (${filter !== 'none' ? filter : 'normal'}, brightness ${brightness}%)`;
      }

      addHistory({
        toolName: toolNames[activeSubTab],
        details,
        actionType: 'download',
        actionData: compressedUrl
      });
    }
  };

  const handleDownloadSingleBatch = (item: BatchFileItem) => {
    if (!item.processedUrl || !item.outputFilename) return;
    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = item.outputFilename;
    a.click();

    addHistory({
      toolName: `Batch ${activeSubTab.toUpperCase()} (${item.file.name})`,
      details: item.outputFilename,
      actionType: 'download',
      actionData: item.processedUrl
    });
  };

  const handleDownloadAllZip = async () => {
    const readyItems = batchItems.filter(i => i.status === 'done' && i.processedBlob);
    if (readyItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      readyItems.forEach(item => {
        if (item.processedBlob && item.outputFilename) {
          zip.file(item.outputFilename, item.processedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `batch-${activeSubTab}-images.zip`;
      a.click();

      addHistory({
        toolName: `Batch Image Processing (${readyItems.length} files)`,
        details: `Downloaded ${readyItems.length} images as ZIP`,
        actionType: 'download',
        actionData: zipUrl
      });
    } catch (err) {
      console.error('Failed to create ZIP', err);
      alert('Failed to generate ZIP archive. You can still download images individually.');
    } finally {
      setIsZipping(false);
    }
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.processedUrl) URL.revokeObjectURL(item.processedUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearBatchItems = () => {
    batchItems.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });
    setBatchItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-slate-700 shadow-xl gap-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Processing Mode</span>
            <span className="text-[10px] text-slate-400">
              {isBatchMode ? 'Process multiple images simultaneously' : 'Single image editing & live preview'}
            </span>
          </div>
        </div>

        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setIsBatchMode(false)}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isBatchMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Image
          </button>
          <button
            onClick={() => setIsBatchMode(true)}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isBatchMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Batch Processing
          </button>
        </div>
      </div>

      {/* SINGLE MODE */}
      {!isBatchMode && (
        <>
          {!file ? (
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Drag & drop an image file here</h3>
              <p className="text-slate-500 text-xs">Supports JPG, PNG, and WebP (Client-side only)</p>
              <button className="mt-6 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">Browse File</button>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
              <div className="flex border-b border-slate-700 bg-slate-800/50">
                {['compress', 'resize', 'convert', 'filters'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab as any)}
                    className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                      activeSubTab === tab ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-slate-100">Original</h3>
                      <button onClick={() => setFile(null)} className="text-sm text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Change Image
                      </button>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl overflow-hidden flex items-center justify-center h-64 border border-slate-700 p-2">
                      <img src={previewUrl!} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
                    </div>
                    <p className="text-xs text-slate-500 text-center font-mono">
                      {formatBytes(file.size)} &bull; {originalImageRef.current?.width}x{originalImageRef.current?.height}
                    </p>

                    {/* Controls based on active tab */}
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                      {activeSubTab === 'compress' && (
                        <div className="space-y-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Compression Quality: {quality}%
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-slate-500">Lossless</span>
                            <span className="text-[10px] text-slate-500">Small</span>
                          </div>
                        </div>
                      )}

                      {activeSubTab === 'resize' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Width (px)</label>
                              <input
                                type="number"
                                value={width}
                                onChange={handleWidthChange}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </div>
                            <button 
                              onClick={() => setLockAspect(!lockAspect)}
                              className={`mt-6 p-2 rounded-md transition-colors ${lockAspect ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400 hover:text-slate-300'}`}
                              title="Lock aspect ratio"
                            >
                              {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Height (px)</label>
                              <input
                                type="number"
                                value={height}
                                onChange={handleHeightChange}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSubTab === 'convert' && (
                        <div className="space-y-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Format</label>
                          <div className="flex gap-2">
                            {['image/jpeg', 'image/png', 'image/webp'].map((format) => (
                              <button
                                key={format}
                                onClick={() => setTargetFormat(format as any)}
                                className={`flex-1 py-2 text-sm rounded-md border font-medium transition-colors ${
                                  targetFormat === format
                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                    : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {format.split('/')[1].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeSubTab === 'filters' && (
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Filter Preset
                              </label>
                              {(filter !== 'none' || brightness !== 100) && (
                                <button
                                  onClick={() => {
                                    setFilter('none');
                                    setBrightness(100);
                                  }}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                  Reset Filters
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: 'none', label: 'Normal' },
                                { id: 'grayscale', label: 'Grayscale' },
                                { id: 'sepia', label: 'Sepia' },
                                { id: 'invert', label: 'Invert' },
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setFilter(item.id as any)}
                                  className={`py-2 px-3 text-xs rounded-md border font-medium transition-colors ${
                                    filter === item.id
                                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                      : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Brightness: {brightness}%
                              </label>
                              {brightness !== 100 && (
                                <button
                                  onClick={() => setBrightness(100)}
                                  className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors font-medium"
                                >
                                  Reset Brightness
                                </button>
                              )}
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={brightness}
                              onChange={(e) => setBrightness(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                              <span>0% (Dark)</span>
                              <span>100% (Normal)</span>
                              <span>200% (Bright)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-slate-100">Output Preview</h3>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl overflow-hidden flex items-center justify-center h-64 border border-slate-700 p-2">
                      {compressedUrl ? (
                        <img src={compressedUrl} alt="Output" className="max-h-full max-w-full object-contain rounded-lg" />
                      ) : (
                        <span className="text-slate-600 text-sm">Processing...</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={compressedSize < file.size ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {formatBytes(compressedSize)} 
                        {activeSubTab === 'compress' && (
                          <span className="text-slate-500 ml-2 font-normal text-[10px]">
                            ({Math.round((1 - compressedSize / file.size) * 100)}% saved)
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500">
                        {width}x{height}
                      </span>
                    </div>

                    <button
                      onClick={handleDownload}
                      disabled={!compressedUrl}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Download className="w-5 h-5" /> Download Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* BATCH MODE */}
      {isBatchMode && (
        <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
          {/* Sub-tabs for Batch Action */}
          <div className="flex border-b border-slate-700 bg-slate-800/50">
            {['compress', 'resize', 'convert', 'filters'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab as any)}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                  activeSubTab === tab ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Batch {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6">
            {/* Shared Batch Settings Panel */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Batch Operation Settings
                </h4>
                <span className="text-[11px] text-slate-400">Applied automatically to all uploaded images</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {activeSubTab === 'compress' && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300 font-bold">
                      <span>Compression Quality: {quality}%</span>
                      <span className="text-slate-400 font-normal">Smaller file size &harr; Higher quality</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}

                {activeSubTab === 'resize' && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300 font-bold">
                      <span>Resize Scale Ratio: {resizePercent}%</span>
                      <span className="text-slate-400 font-normal">Scale dimensions proportionally</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={resizePercent}
                      onChange={(e) => setResizePercent(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>10% (Mini)</span>
                      <span>50% (Half)</span>
                      <span>100% (Original)</span>
                      <span>150% (Enlarge)</span>
                      <span>200% (Double)</span>
                    </div>
                  </div>
                )}

                {activeSubTab === 'convert' && (
                  <div className="col-span-2 space-y-2">
                    <label className="block text-xs text-slate-300 font-bold">Batch Target Format</label>
                    <div className="flex gap-3">
                      {['image/jpeg', 'image/png', 'image/webp'].map((format) => (
                        <button
                          key={format}
                          onClick={() => setTargetFormat(format as any)}
                          className={`flex-1 py-2.5 text-xs rounded-lg border font-bold transition-all ${
                            targetFormat === format
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Convert all to {format.split('/')[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSubTab === 'filters' && (
                  <div className="col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-bold mb-2">Filter Preset</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: 'Normal' },
                          { id: 'grayscale', label: 'Grayscale' },
                          { id: 'sepia', label: 'Sepia' },
                          { id: 'invert', label: 'Invert' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setFilter(item.id as any)}
                            className={`py-2 px-3 text-xs rounded-lg border font-bold transition-colors ${
                              filter === item.id
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                        <span>Brightness: {brightness}%</span>
                        {brightness !== 100 && (
                          <button onClick={() => setBrightness(100)} className="text-[10px] text-indigo-400 hover:underline">Reset</button>
                        )}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Multiple Files Upload Dropzone */}
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleBatchUpload}
              />
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-3 border border-slate-700">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                {batchItems.length === 0 ? 'Upload multiple images for batch processing' : 'Add more images to batch'}
              </h3>
              <p className="text-slate-500 text-xs">Select or drag & drop multiple JPG, PNG, or WebP files</p>
            </div>

            {/* Batch Items List & Actions */}
            {batchItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>{batchItems.length} Images in Queue</span>
                    {isProcessingBatch && (
                      <span className="text-xs text-amber-400 font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadAllZip}
                      disabled={isZipping || batchItems.every(i => i.status !== 'done')}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isZipping ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Zipping...</>
                      ) : (
                        <><Archive className="w-3.5 h-3.5" /> Download All (ZIP)</>
                      )}
                    </button>
                    <button
                      onClick={clearBatchItems}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 font-medium text-xs rounded-lg transition-all"
                      title="Clear list"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Batch Items Table / Cards */}
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  {batchItems.map((item, idx) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                        <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate max-w-xs sm:max-w-md">{item.file.name}</p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span>Original: {formatBytes(item.file.size)}</span>
                            {item.originalWidth > 0 && <span>({item.originalWidth}x{item.originalHeight})</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Processed Stats */}
                        {item.status === 'done' && item.processedSize && (
                          <div className="text-right font-mono text-xs hidden sm:block">
                            <span className="text-emerald-400 font-bold block">{formatBytes(item.processedSize)}</span>
                            {activeSubTab === 'compress' && item.file.size > 0 && (
                              <span className="text-[10px] text-slate-500">
                                {Math.round((1 - item.processedSize / item.file.size) * 100)}% saved
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status Indicator */}
                        {item.status === 'processing' && (
                          <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}

                        {/* Action Buttons */}
                        {item.status === 'done' && (
                          <button
                            onClick={() => handleDownloadSingleBatch(item)}
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Download processed file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeBatchItem(item.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-rose-400 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden canvas for single processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
