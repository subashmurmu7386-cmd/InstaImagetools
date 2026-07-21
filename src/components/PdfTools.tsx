import React, { useState } from 'react';
import { Upload, Download, FileUp, Image as ImageIcon, Scissors, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { AdSpace } from './AdSpace';
import { addHistory } from '../lib/history';

export function PdfTools() {
  const [activeTab, setActiveTab] = useState<'merge' | 'imagetopdf' | 'split'>('merge');
  
  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image to PDF State
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Split State
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(0);

  // -- Handlers for Merge --
  const handleMergeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setMergeFiles(prev => [...prev, ...files]);
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
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setImageFiles(prev => [...prev, ...files]);
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
          // Skip unsupported for now, or we could convert using canvas first.
          // PDF-lib supports JPG and PNG.
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
      // Load it to get page count
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
      // Parse page range (e.g. "1,3,5-7")
      const pagesToExtract = new Set<number>();
      const parts = pageRange.split(',');
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.add(i - 1); // 0-indexed for pdf-lib
            }
          }
        } else {
          const num = parseInt(part.trim());
          if (!isNaN(num)) {
            pagesToExtract.add(num - 1); // 0-indexed
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
    // Not revoking URL immediately so it can be used in history
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
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Merge PDF Files</h3>
                <p className="text-slate-400 text-sm">Combine multiple PDFs into a single document.</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleMergeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-slate-100 mb-2">Select PDF files to merge</p>
                <button className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">Browse Files</button>
              </div>

              {mergeFiles.length > 0 && (
                <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Selected Files ({mergeFiles.length})</h4>
                  <ul className="space-y-2 mb-6">
                    {mergeFiles.map((f, i) => (
                      <li key={i} className="flex justify-between items-center text-sm bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <span className="truncate max-w-[200px] sm:max-w-[400px] text-slate-300">{f.name}</span>
                        <button onClick={() => setMergeFiles(mergeFiles.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 p-1 transition-colors">
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
                    {isProcessing ? 'Processing...' : 'Merge PDFs Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'imagetopdf' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Images to PDF</h3>
                <p className="text-slate-400 text-sm">Convert JPG or PNG images into a single PDF.</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-slate-100 mb-2">Select Images</p>
                <p className="text-slate-500 text-xs">Supports JPG and PNG</p>
                <button className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">Browse Files</button>
              </div>

              {imageFiles.length > 0 && (
                <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Selected Images ({imageFiles.length})</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {imageFiles.map((f, i) => (
                      <div key={i} className="relative w-16 h-16 border border-slate-600 rounded bg-slate-900 overflow-hidden group">
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
                    {isProcessing ? 'Processing...' : 'Generate PDF'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold text-slate-100">Extract PDF Pages</h3>
                <p className="text-slate-400 text-sm">Upload a PDF and select pages to extract.</p>
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
                  <p className="text-lg font-bold text-slate-100 mb-2">Select PDF file</p>
                  <button className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">Browse Files</button>
                </div>
              ) : (
                <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-6 space-y-4">
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">{splitFile.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pdfPageCount} Pages</p>
                    </div>
                    <button onClick={() => setSplitFile(null)} className="text-sm text-rose-400 hover:text-rose-300 transition-colors">Remove</button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pages to Extract</label>
                    <input 
                      type="text" 
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g. 1, 3, 5-7"
                      className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Separate page numbers or ranges with commas.</p>
                  </div>

                  <button
                    onClick={executeSplit}
                    disabled={!pageRange || isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Extract Pages'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AdSpace type="native" />
    </div>
  );
}
