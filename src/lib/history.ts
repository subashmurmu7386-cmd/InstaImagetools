export interface HistoryItem {
  id: string;
  toolName: string;
  details: string;
  timestamp: number;
  actionType: 'download' | 'copy' | 'none';
  actionData?: string; // URL for download or text for copy
}

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem('instaimagetools_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  localStorage.setItem('instaimagetools_history', JSON.stringify([newItem, ...history]));
  window.dispatchEvent(new Event('history_updated'));
};

export const removeHistory = (id: string) => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem('instaimagetools_history', JSON.stringify(filtered));
  window.dispatchEvent(new Event('history_updated'));
};

export const clearHistory = () => {
  localStorage.removeItem('instaimagetools_history');
  window.dispatchEvent(new Event('history_updated'));
};
