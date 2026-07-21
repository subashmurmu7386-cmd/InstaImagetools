import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Lock, Unlock } from 'lucide-react';
import { AdSpace } from './AdSpace';
import { addHistory } from '../lib/history';

export function ImageTools() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'compress' | 'resize' | 'convert'>('compress');

  // Compress State
  const [quality, setQuality] = useState(80);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Resize State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [lockAspect, setLockAspect] = useState(true);

  // Convert State
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

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

  useEffect(() => {
    if (originalImageRef.current) {
      processImage(originalImageRef.current);
    }
  }, [quality, width, height, targetFormat, activeSubTab]);

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
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let mimeType = file?.type || 'image/jpeg';
    let outputQuality = 1;

    if (activeSubTab === 'compress') {
      outputQuality = quality / 100;
      if (mimeType === 'image/png') mimeType = 'image/jpeg'; // PNG doesn't support quality well in canvas
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
      
      const prefix = activeSubTab === 'compress' ? 'compressed' : activeSubTab === 'resize' ? 'resized' : 'converted';
      a.download = `${prefix}-${file.name.split('.')[0]}.${ext}`;
      a.click();

      // Log history
      const toolNames = {
        'compress': 'Image Compressor',
        'resize': 'Image Resizer',
        'convert': 'Format Converter'
      };
      
      let details = a.download;
      if (activeSubTab === 'compress') {
        const saved = Math.round((1 - compressedSize / file.size) * 100);
        details += ` (Saved ${saved}%)`;
      } else if (activeSubTab === 'resize') {
        details += ` (${width}x${height})`;
      }

      addHistory({
        toolName: toolNames[activeSubTab],
        details,
        actionType: 'download',
        actionData: compressedUrl
      });
    }
  };

  return (
    <div className="space-y-6">
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
          <h3 className="text-lg font-bold text-slate-100 mb-2">Drag & drop image files here</h3>
          <p className="text-slate-500 text-xs">Supports JPG, PNG, and WebP (Client-side only)</p>
          <button className="mt-6 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">Browse Files</button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700 bg-slate-800/50">
            {['compress', 'resize', 'convert'].map((tab) => (
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
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" /> Download Image
                </button>
              </div>
            </div>
            
            <AdSpace type="native" />
          </div>
        </div>
      )}
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
