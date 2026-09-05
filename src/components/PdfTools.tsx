import React, { useState, useEffect } from 'react';
import { Upload, Download, FileUp, Image as ImageIcon, Scissors, Trash2, Eye, RefreshCw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { addHistory } from '../lib/history';
import { PdfPreviewer } from './PdfPreviewer';

export function PdfTools() {
  const [activeTab, setActiveTab] = useState<'merge' | 'imagetopdf' | 'split'>('merge');
  
  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [selectedMergePreviewIdx, setSelectedMergePreviewIdx] = useState<number>(0);
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image to PDF State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePdfBytes, setImagePdfBytes] = useState<Uint8Array | null>(null);

  // Split State
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [extractedPdfBytes, setExtractedPdfBytes] = useState<Uint8Array | null>(null);
  const [selectedPagesList, setSelectedPagesList] = useState<number[]>([]);

  // Keep selectedPagesList and pageRange string in sync
  const parsePageRange = (rangeStr: string, total: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= total) pages.add(i);
          }
        }
      } else {
        const num = parseInt(part.trim());
        if (!isNaN(num) && num >= 1 && num <= total) {
          pages.add(num);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handlePageRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPageRange(val);
    if (pdfPageCount > 0) {
      const parsed = parsePageRange(val, pdfPageCount);
      setSelectedPagesList(parsed);
    }
  };

  const handleToggleSelectPage = (pageNumber: number) => {
    let updated: number[];
    if (selectedPagesList.includes(pageNumber)) {
      updated = selectedPagesList.filter(p => p !== pageNumber);
    } else {
      updated = [...selectedPagesList, pageNumber].sort((a, b) => a - b);
    }
    setSelectedPagesList(updated);
    setPageRange(formatPagesToRangeString(updated));
  };

  const handleToggleAllPages = (allPages: number[]) => {
    setSelectedPagesList(allPages);
    setPageRange(formatPagesToRangeString(allPages));
  };

  const formatPagesToRangeString = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = sorted[i];
        prev = start;
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(', ');
  };

  // -- Handlers for Merge --
  const handleMergeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      setMergeFiles(prev => [...prev, ...files]);
      setMergedPdfBytes(null);
    }
  };

  const executeMerge = async () => {
    if (mergeFiles.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      setMergedPdfBytes(pdfBytes);
      downloadPdf(pdfBytes, 'merged-document.pdf', 'PDF Merger', `Merged ${mergeFiles.length} files`);
    } catch (error) {
      console.error('Merge failed', error);
      alert('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
    } finally {
      setIsProcessing(false);
    }
  };

  // -- Handlers for Image to PDF --
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      setImageFiles(prev => [...prev, ...files]);
      setImagePdfBytes(null);
    }
  };

  const executeImageToPdf = async () => {
    if (imageFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of imageFiles) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          console.warn(`Unsupported type for direct PDF embedding: ${file.type}`);
          continue; 
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      setImagePdfBytes(pdfBytes);
      downloadPdf(pdfBytes, 'images-to.pdf', 'Images to PDF', `Converted ${imageFiles.length} images`);
    } catch (error) {
      console.error('Image to PDF failed', error);
      alert('Failed to convert. Ensure images are JPG or PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  // -- Handlers for Split --
  const handleSplitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSplitFile(file);
      setExtractedPdfBytes(null);
      setPageRange('');
      setSelectedPagesList([]);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfPageCount(pdfDoc.getPageCount());
      } catch (e) {
        console.error("Could not load PDF to count pages");
      }
    }
  };

  const executeSplit = async () => {
    if (!splitFile || !pageRange) return;
    setIsProcessing(true);
    
    try {
      const pagesToExtract = new Set<number>();
      const parts = pageRange.split(',');
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.add(i - 1);
            }
          }
        } else {
          const num = parseInt(part.trim());
          if (!isNaN(num)) {
            pagesToExtract.add(num - 1);
          }
        }
      }

      const validPages = Array.from(pagesToExtract).filter(p => p >= 0 && p < pdfPageCount).sort((a,b) => a-b);
      
      if (validPages.length === 0) {
        alert("Invalid page range specified.");
        setIsProcessing(false);
        return;
      }

      const arrayBuffer = await splitFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(pdfDoc, validPages);
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      setExtractedPdfBytes(pdfBytes);
      downloadPdf(pdfBytes, 'extracted-pages.pdf', 'Extract PDF Pages', `Extracted pages ${pageRange}`);
    } catch (error) {
      console.error('Split failed', error);
      alert('Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // -- Helper --
  const downloadPdf = (bytes: Uint8Array, filename: string, toolName: string, details: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    addHistory({
      toolName,
      details,
      actionType: 'download',
      actionData: url
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-700 bg-slate-800/50 flex-col sm:flex-row">
          <button
            onClick={() => setActiveTab('merge')}
            className={`flex-1 py-4 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'merge' ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-4 h-4" /> Merge PDFs
          </button>
          <button
            onClick={() => setActiveTab('imagetopdf')}
            className={`flex-1 py-4 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'imagetopdf' ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Images to PDF
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`flex-1 py-4 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'split' ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" /> Extract Pages
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'merge' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Merge PDF Files</h3>
                <p className="text-slate-400 text-sm">Combine multiple PDFs into a single document with instant live page previewing.</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleMergeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-base font-bold text-slate-100 mb-1">Select PDF files to merge</p>
                <p className="text-xs text-slate-400">Drag & drop or click to upload</p>
              </div>

              {mergeFiles.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Files ({mergeFiles.length})</h4>
                      <button
                        onClick={() => { setMergeFiles([]); setMergedPdfBytes(null); }}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Clear All
                      </button>
                    </div>

                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {mergeFiles.map((f, i) => (
                        <li
                          key={i}
                          onClick={() => setSelectedMergePreviewIdx(i)}
                          className={`flex justify-between items-center text-sm p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedMergePreviewIdx === i && !mergedPdfBytes
                              ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate text-xs font-medium">{f.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = mergeFiles.filter((_, idx) => idx !== i);
                              setMergeFiles(newFiles);
                              if (selectedMergePreviewIdx >= newFiles.length) {
                                setSelectedMergePreviewIdx(Math.max(0, newFiles.length - 1));
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={executeMerge}
                      disabled={mergeFiles.length < 2 || isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {isProcessing ? 'Merging PDFs...' : 'Merge PDFs Now'}
                    </button>
                  </div>

                  {/* Live Preview Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">
                        {mergedPdfBytes ? 'Merged Result Live Preview' : 'Source File Live Preview'}
                      </span>
                      {mergedPdfBytes && (
                        <button
                          onClick={() => setMergedPdfBytes(null)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" /> Preview Source File
                        </button>
                      )}
                    </div>

                    {mergedPdfBytes ? (
                      <PdfPreviewer
                        data={mergedPdfBytes}
                        title="Merged Document Result"
                      />
                    ) : mergeFiles[selectedMergePreviewIdx] ? (
                      <PdfPreviewer
                        file={mergeFiles[selectedMergePreviewIdx]}
                        title={`Source: ${mergeFiles[selectedMergePreviewIdx].name}`}
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'imagetopdf' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Images to PDF</h3>
                <p className="text-slate-400 text-sm">Convert JPG or PNG images into a PDF with instant client-side preview.</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <p className="text-base font-bold text-slate-100 mb-1">Select Images</p>
                <p className="text-slate-500 text-xs">Supports JPG and PNG</p>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-5 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Images ({imageFiles.length})</h4>
                    <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto">
                      {imageFiles.map((f, i) => (
                        <div key={i} className="relative w-16 h-16 border border-slate-600 rounded-lg bg-slate-900 overflow-hidden group">
                          <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                          <button 
                            onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))} 
                            className="absolute inset-0 bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={executeImageToPdf}
                      disabled={imageFiles.length === 0 || isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
                    </button>
                  </div>

                  {/* Live Preview Panel */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Generated PDF Live Preview</span>
                    {imagePdfBytes ? (
                      <PdfPreviewer data={imagePdfBytes} title="Generated Images PDF" />
                    ) : (
                      <div className="border border-slate-800 rounded-xl p-8 text-center text-slate-500 bg-slate-950/40 text-xs">
                        Click "Generate PDF" to visualize the converted PDF preview here.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Extract PDF Pages</h3>
                <p className="text-slate-400 text-sm">Visualize pages in grid view and click page thumbnails directly to select pages to extract.</p>
              </div>

              {!splitFile ? (
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleSplitUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-slate-100 mb-2">Select PDF File</p>
                  <p className="text-slate-400 text-xs">Upload a PDF to view page thumbnails and select pages</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File header bar */}
                  <div className="flex flex-wrap items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-slate-700 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 truncate max-w-[280px] sm:max-w-[400px]">{splitFile.name}</h4>
                        <p className="text-xs text-slate-400">{pdfPageCount} Pages Total</p>
                      </div>
                    </div>
                    <button onClick={() => { setSplitFile(null); setExtractedPdfBytes(null); }} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                      Change File
                    </button>
                  </div>

                  {/* Range controls & preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Controls */}
                    <div className="lg:col-span-5 bg-slate-800/40 rounded-xl border border-slate-700 p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pages to Extract</label>
                        <input 
                          type="text" 
                          value={pageRange}
                          onChange={handlePageRangeInputChange}
                          placeholder="Click thumbnails or type: e.g. 1, 3, 5-7"
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                        />
                        <p className="text-[11px] text-slate-400 mt-2">
                          💡 <span className="text-slate-300">Tip:</span> Click page cards in the preview to select/deselect them directly!
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60">
                        <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                          <span>Selected Pages:</span>
                          <span className="font-bold text-indigo-400">{selectedPagesList.length} of {pdfPageCount}</span>
                        </div>

                        <button
                          onClick={executeSplit}
                          disabled={!pageRange || isProcessing}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {isProcessing ? 'Extracting Pages...' : 'Extract & Download Selected Pages'}
                        </button>
                      </div>

                      {extractedPdfBytes && (
                        <div className="mt-4 pt-4 border-t border-slate-700/60 text-center">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            ✓ Pages extracted & downloaded!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PDF Visual Previewer with Click Selection */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">
                          {extractedPdfBytes ? 'Extracted PDF Result Live Preview' : 'Source Document Page Preview'}
                        </span>
                        {extractedPdfBytes && (
                          <button
                            onClick={() => setExtractedPdfBytes(null)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                          >
                            <RefreshCw className="w-3 h-3" /> Back to Page Selection
                          </button>
                        )}
                      </div>

                      {extractedPdfBytes ? (
                        <PdfPreviewer
                          data={extractedPdfBytes}
                          title="Extracted PDF Document"
                        />
                      ) : (
                        <PdfPreviewer
                          file={splitFile}
                          title={splitFile.name}
                          selectablePages={true}
                          selectedPages={selectedPagesList}
                          onSelectPage={handleToggleSelectPage}
                          onToggleAllPages={handleToggleAllPages}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
