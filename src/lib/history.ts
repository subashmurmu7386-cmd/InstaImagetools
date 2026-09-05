export interface HistoryItem {
  id: string;
  toolName: string;
  timestamp: string | number; // ISO string or timestamp
  outputSummary: string;
  details?: string; // backwards compatibility
  actionType?: 'download' | 'copy' | 'none';
  actionData?: string; // URL for download or text for copy
}

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem('instaimagetools_history');
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    // Normalize and sort in reverse chronological order (newest first)
    return parsed
      .map((item: any) => {
        const summary = item.outputSummary || item.details || 'Action completed';
        const ts = item.timestamp || new Date().toISOString();
        return {
          id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          toolName: item.toolName || 'General Tool',
          timestamp: ts,
          outputSummary: summary,
          details: summary,
          actionType: item.actionType || 'none',
          actionData: item.actionData || summary,
        };
      })
      .sort((a, b) => {
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
  } catch (e) {
    return [];
  }
};

/**
 * Global logActivity helper to persist activity into localStorage and notify listeners
 */
export const logActivity = (
  toolName: string,
  outputSummary: string,
  actionType: 'download' | 'copy' | 'none' = 'none',
  actionData?: string
): HistoryItem => {
  const history = getHistory();
  const now = new Date();
  const newItem: HistoryItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    toolName: toolName.trim() || 'Tool Action',
    timestamp: now.toISOString(),
    outputSummary: outputSummary || 'Operation completed',
    details: outputSummary || 'Operation completed',
    actionType,
    actionData: actionData || outputSummary,
  };

  // Keep up to 100 recent entries in reverse chronological order
  const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 100);
  try {
    localStorage.setItem('instaimagetools_history', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save activity to localStorage:', e);
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('history_updated'));
  }
  return newItem;
};

// Global window registration for accessibility across all modules
if (typeof window !== 'undefined') {
  (window as any).logActivity = logActivity;
}

export const addHistory = (item: {
  toolName: string;
  details?: string;
  outputSummary?: string;
  actionType?: 'download' | 'copy' | 'none';
  actionData?: string;
}) => {
  return logActivity(
    item.toolName,
    item.outputSummary || item.details || 'Action completed',
    item.actionType || 'none',
    item.actionData
  );
};

export const removeHistory = (id: string) => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem('instaimagetools_history', JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('history_updated'));
  }
};

export const clearHistory = () => {
  localStorage.removeItem('instaimagetools_history');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('history_updated'));
  }
};

