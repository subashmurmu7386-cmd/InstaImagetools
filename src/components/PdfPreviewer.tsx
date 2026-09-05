import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Grid, Eye, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

// Configure pdfjs worker locally for 100% zero-server client execution
pdfjsLib.GlobalWorkerOptions.workerSrc = typeof window !== 'undefined' ? '/pdf.worker.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface PdfPreviewerProps {
  file?: File | null;
  data?: Uint8Array | ArrayBuffer | null;
  title?: string;
  selectablePages?: boolean;
  selectedPages?: number[]; // 1-indexed
  onSelectPage?: (pageNumber: number) => void;
  onToggleAllPages?: (allPageNumbers: number[]) => void;
}

export function PdfPreviewer({
  file,
  data,
  title,
  selectablePages = false,
  selectedPages = [],
  onSelectPage,
  onToggleAllPages,
}: PdfPreviewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);

      try {
        let buffer: ArrayBuffer;
        if (file) {
          buffer = await file.arrayBuffer();
        } else if (data) {
          if (data instanceof Uint8Array) {
            const copy = new Uint8Array(data.byteLength);
            copy.set(data);
            buffer = copy.buffer;
          } else if (data instanceof ArrayBuffer) {
            buffer = data.slice(0);
          } else {
            buffer = data;
          }
        } else {
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const doc = await loadingTask.promise;

        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('PDF.js loading error:', err);
        if (!isCancelled) {
          setError('Could not render PDF preview. File might be corrupted or password-protected.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [file, data]);

  // Render Single Page View
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'single' || !singleCanvasRef.current) return;

    let isCancelled = false;

    async function renderSinglePage() {
      if (!pdfDoc || !singleCanvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = singleCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    }

    renderSinglePage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, viewMode]);

  if (!file && !data) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/80 overflow-hidden text-slate-200">
      {/* Header bar */}
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">
            {title || file?.name || 'PDF Live Preview'}
          </span>
          {numPages > 0 && (
            <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded-full shrink-0">
              {numPages} {numPages === 1 ? 'Page' : 'Pages'}
            </span>
          )}
        </div>

        {!loading && !error && numPages > 0 && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Single Page View"
              >
                Page
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Thumbnail Grid View"
              >
                <Grid className="w-3 h-3" /> Grid
              </button>
            </div>

            {/* Selectable All Pages Helper */}
            {selectablePages && onToggleAllPages && (
              <button
                onClick={() => {
                  const allPages = Array.from({ length: numPages }, (_, i) => i + 1);
                  const isAllSelected = selectedPages.length === numPages;
                  onToggleAllPages(isAllSelected ? [] : allPages);
                }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-600 rounded-lg transition-colors font-medium"
              >
                {selectedPages.length === numPages ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 bg-slate-950/60 min-h-[220px] flex items-center justify-center relative">
        {loading && (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs font-medium">Rendering PDF Pages...</span>
          </div>
        )}

        {error && (
          <div className="py-8 px-4 text-center text-rose-400 text-xs bg-rose-500/10 rounded-lg border border-rose-500/20 max-w-md mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <>
            {/* Single Page View */}
            {viewMode === 'single' && (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="overflow-auto max-h-[480px] max-w-full rounded-lg border border-slate-800 shadow-2xl bg-slate-900 p-2 flex justify-center">
                  <canvas ref={singleCanvasRef} className="max-w-full h-auto rounded shadow-lg" />
                </div>

                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700/80 w-full max-w-md">
                  {/* Page Navigation */}
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono px-2 text-slate-300 text-xs">
                      {currentPage} / {numPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                      disabled={currentPage >= numPages}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-slate-400 min-w-[36px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Thumbnail View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-h-[500px] overflow-y-auto pr-1">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pgNum) => {
                  const isSelected = selectedPages.includes(pgNum);
                  return (
                    <PdfThumbnailCard
                      key={pgNum}
                      pdfDoc={pdfDoc}
                      pageNumber={pgNum}
                      isSelected={isSelected}
                      selectable={selectablePages}
                      onClick={() => {
                        if (selectablePages && onSelectPage) {
                          onSelectPage(pgNum);
                        } else {
                          setCurrentPage(pgNum);
                          setViewMode('single');
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual thumbnail rendering
function PdfThumbnailCard({
  pdfDoc,
  pageNumber,
  isSelected,
  selectable,
  onClick,
}: {
  key?: React.Key;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  isSelected?: boolean;
  selectable?: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function renderThumbnail() {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale: 0.3 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport } as any).promise;
        if (!isCancelled) setRendered(true);
      } catch (e) {
        // ignore
      }
    }

    renderThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border p-2 flex flex-col items-center transition-all cursor-pointer bg-slate-900 ${
        isSelected
          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/40'
          : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
      }`}
    >
      <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded bg-slate-950 p-1">
        <canvas ref={canvasRef} className="max-h-full max-w-full object-contain rounded" />
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          </div>
        )}

        {selectable && isSelected && (
          <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 text-center flex items-center justify-between w-full px-1">
        <span className="text-[11px] font-mono text-slate-400">Page {pageNumber}</span>
        {selectable && (
          <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
            {isSelected ? 'Selected' : 'Select'}
          </span>
        )}
      </div>
    </div>
  );
}
