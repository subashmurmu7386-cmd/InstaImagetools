import React, { useEffect, useState } from 'react';
import { HistoryItem, getHistory, removeHistory, clearHistory } from '../lib/history';
import { copyToClipboard } from '../lib/clipboard';
import { Trash2, Copy, Download, History as HistoryIcon, AlertCircle, FileDown, Loader2, Clock, Check } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export function HistoryTools() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());

    const handleUpdate = () => {
      setHistory(getHistory());
    };

    window.addEventListener('history_updated', handleUpdate);
    return () => window.removeEventListener('history_updated', handleUpdate);
  }, []);

  const formatDate = (timestamp: string | number) => {
    try {
      const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
      if (isNaN(date.getTime())) return String(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(date);
    } catch {
      return String(timestamp);
    }
  };

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadSingleItem = (item: HistoryItem) => {
    // If it is a data URL (e.g. image canvas or generated file), download directly
    if (item.actionType === 'download' && item.actionData && item.actionData.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = item.actionData;
      const safeName = (item.toolName || 'Tool').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}_Result`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Download formatted report for this specific activity
    const safeToolName = (item.toolName || 'Tool').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeToolName}_Result.txt`;
    const formattedDate = formatDate(item.timestamp);
    const summary = item.outputSummary || item.details || 'Action completed successfully';

    const content = [
      '================================================================================',
      'InstaImagetools - Activity Log Result',
      '================================================================================',
      `Tool Name:        ${item.toolName}`,
      `Timestamp:        ${formattedDate}`,
      `Activity ID:      ${item.id}`,
      '--------------------------------------------------------------------------------',
      'OUTPUT / ACTIVITY SUMMARY:',
      '--------------------------------------------------------------------------------',
      summary,
      '',
      ...(item.actionData && item.actionData !== summary
        ? [
            '--------------------------------------------------------------------------------',
            'DATA PAYLOAD / RECORD:',
            '--------------------------------------------------------------------------------',
            item.actionData,
            ''
          ]
        : []),
      '================================================================================',
      '100% Client-Side Private In-Browser Execution by InstaImagetools',
      'Zero Data Leaks • No External Server Storage',
      '================================================================================'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHistoryToPdf = async () => {
    if (history.length === 0 || isExporting) return;
    setIsExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Sanitize ASCII characters for standard Helvetica font encoding
      const clean = (text: string) =>
        text.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ').replace(/\s+/g, ' ').trim();

      const wrap = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
        const words = clean(text).split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [''];
      };

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      const drawHeader = (currentPage: any, isFirstPage: boolean) => {
        if (isFirstPage) {
          // Top accent bar
          currentPage.drawRectangle({
            x: margin,
            y: currentY - 3,
            width: contentWidth,
            height: 3,
            color: rgb(0.024, 0.714, 0.831), // Cyan 500
          });
          currentY -= 20;

          // Document Title
          currentPage.drawText('InstaImagetools - User Activity History Report', {
            x: margin,
            y: currentY,
            size: 16,
            font: helveticaBold,
            color: rgb(0.06, 0.09, 0.16),
          });
          currentY -= 16;

          // Subtitle & Export Date
          const exportDateStr = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium',
          }).format(new Date());

          currentPage.drawText(`Exported on: ${exportDateStr}`, {
            x: margin,
            y: currentY,
            size: 9,
            font: helvetica,
            color: rgb(0.4, 0.45, 0.53),
          });
          currentY -= 13;

          currentPage.drawText(`Total Records: ${history.length}  |  Privacy: 100% In-Browser Client-Side Execution (Zero Server Transmission)`, {
            x: margin,
            y: currentY,
            size: 8,
            font: helvetica,
            color: rgb(0.18, 0.5, 0.6),
          });
          currentY -= 16;

          // Divider
          currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: margin + contentWidth, y: currentY },
            thickness: 1,
            color: rgb(0.85, 0.88, 0.92),
          });
          currentY -= 14;
        } else {
          // Compact header for subsequent pages
          currentPage.drawText('InstaImagetools - User Activity History Report (Continued)', {
            x: margin,
            y: currentY,
            size: 10,
            font: helveticaBold,
            color: rgb(0.3, 0.35, 0.42),
          });
          currentY -= 12;
          currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: margin + contentWidth, y: currentY },
            thickness: 0.75,
            color: rgb(0.85, 0.88, 0.92),
          });
          currentY -= 14;
        }

        // Table Header
        const colDateWidth = 110;
        const colToolWidth = 140;

        currentPage.drawRectangle({
          x: margin,
          y: currentY - 14,
          width: contentWidth,
          height: 18,
          color: rgb(0.94, 0.96, 0.98),
        });

        currentPage.drawText('TIMESTAMP', {
          x: margin + 8,
          y: currentY - 9,
          size: 8,
          font: helveticaBold,
          color: rgb(0.3, 0.35, 0.45),
        });
        currentPage.drawText('TOOL NAME', {
          x: margin + colDateWidth + 8,
          y: currentY - 9,
          size: 8,
          font: helveticaBold,
          color: rgb(0.3, 0.35, 0.45),
        });
        currentPage.drawText('ACTIVITY SUMMARY / DETAILS', {
          x: margin + colDateWidth + colToolWidth + 8,
          y: currentY - 9,
          size: 8,
          font: helveticaBold,
          color: rgb(0.3, 0.35, 0.45),
        });

        currentY -= 20;
      };

      drawHeader(page, true);

      const colDateWidth = 110;
      const colToolWidth = 140;
      const colDetailsWidth = contentWidth - colDateWidth - colToolWidth;

      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        const dateStr = formatDate(item.timestamp);
        const toolStr = clean(item.toolName);
        const summaryText = item.outputSummary || item.details || 'Action completed';
        const detailLines = wrap(summaryText, colDetailsWidth - 16, helvetica, 8);

        const lineHeight = 11;
        const rowHeight = Math.max(22, detailLines.length * lineHeight + 10);

        // Check if page break needed
        if (currentY - rowHeight < margin + 25) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
          drawHeader(page, false);
        }

        // Alternating row background
        if (i % 2 === 1) {
          page.drawRectangle({
            x: margin,
            y: currentY - rowHeight + 4,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.98, 0.99, 1),
          });
        }

        // Bottom row border
        page.drawLine({
          start: { x: margin, y: currentY - rowHeight + 4 },
          end: { x: margin + contentWidth, y: currentY - rowHeight + 4 },
          thickness: 0.5,
          color: rgb(0.9, 0.92, 0.95),
        });

        // Date text
        page.drawText(clean(dateStr), {
          x: margin + 8,
          y: currentY - 9,
          size: 8,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.52),
        });

        // Tool text
        page.drawText(toolStr, {
          x: margin + colDateWidth + 8,
          y: currentY - 9,
          size: 8.5,
          font: helveticaBold,
          color: rgb(0.12, 0.16, 0.24),
        });

        // Details text (multi-line)
        let detailY = currentY - 9;
        for (const line of detailLines) {
          page.drawText(line, {
            x: margin + colDateWidth + colToolWidth + 8,
            y: detailY,
            size: 8,
            font: helvetica,
            color: rgb(0.25, 0.3, 0.38),
          });
          detailY -= lineHeight;
        }

        currentY -= rowHeight;
      }

      // Draw footers on all pages
      const totalPages = pdfDoc.getPageCount();
      for (let pIdx = 0; pIdx < totalPages; pIdx++) {
        const p = pdfDoc.getPage(pIdx);
        p.drawLine({
          start: { x: margin, y: margin + 14 },
          end: { x: margin + contentWidth, y: margin + 14 },
          thickness: 0.5,
          color: rgb(0.85, 0.88, 0.92),
        });

        p.drawText('InstaImagetools Activity History Report  •  100% Client-Side Privacy', {
          x: margin,
          y: margin + 4,
          size: 7.5,
          font: helvetica,
          color: rgb(0.5, 0.55, 0.62),
        });

        const pageStr = `Page ${pIdx + 1} of ${totalPages}`;
        const pageStrWidth = helvetica.widthOfTextAtSize(pageStr, 7.5);
        p.drawText(pageStr, {
          x: margin + contentWidth - pageStrWidth,
          y: margin + 4,
          size: 7.5,
          font: helvetica,
          color: rgb(0.5, 0.55, 0.62),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'InstaImagetools_Activity_History.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export history PDF:', err);
      alert('Failed to generate PDF export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden">
        {/* Header with Title and Bulk Actions */}
        <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-slate-950/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/30">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Activity History</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {history.length} {history.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Private, in-browser history tracking all tool operations and outputs with zero server transmission.
              </p>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={exportHistoryToPdf}
              disabled={history.length === 0 || isExporting}
              className={`px-4 py-2.5 font-bold rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-center gap-2 flex-1 sm:flex-initial ${
                history.length === 0
                  ? 'bg-slate-800/40 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 text-cyan-300 hover:text-cyan-200 border-cyan-500/40 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/30 cursor-pointer active:scale-95'
              }`}
              title={history.length === 0 ? 'No activity logs to export' : 'Export complete history report as PDF'}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <FileDown className="w-4 h-4 text-cyan-400" />
              )}
              <span>{isExporting ? 'Generating PDF...' : 'Export History To PDF Format'}</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all activity history? This will delete all saved records from local storage.')) {
                    clearHistory();
                  }
                }}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold rounded-xl border border-rose-500/30 hover:border-rose-400/40 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-1 sm:flex-initial"
                title="Clear All Saved History"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area: Card Layout */}
        <div className="p-4 sm:p-6 lg:p-8">
          {history.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800/80">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 mb-4 border border-slate-800 shadow-inner">
                <AlertCircle className="w-8 h-8 text-cyan-500/60" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-1.5">No recent activity found</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                Your activities across Image Studio, PDF Suite, Text Tools, and Developer Tools will automatically be recorded here in private local storage.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg shadow-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/15 to-violet-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
                        {item.toolName}
                      </span>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 break-words select-text">
                      {item.outputSummary || item.details || 'Action completed successfully'}
                    </div>
                  </div>

                  {/* Individual Item Actions (Download & Delete) */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-full sm:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                    {item.actionType === 'copy' && item.actionData && (
                      <button
                        onClick={() => handleCopy(item.actionData!, item.id)}
                        className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Copy text data"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => downloadSingleItem(item)}
                      className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 rounded-xl text-xs font-bold border border-cyan-500/30 hover:border-cyan-400/50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shadow-cyan-950/20"
                      title="Download item summary report"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => removeHistory(item.id)}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold border border-rose-500/20 hover:border-rose-400/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

