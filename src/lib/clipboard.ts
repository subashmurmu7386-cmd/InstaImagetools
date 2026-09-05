/**
 * Cross-browser, resilient clipboard helper for InstaImagetools.
 *
 * Designed to reliably copy text to the system clipboard across:
 * - Desktop browsers (Chrome, Edge, Firefox, Safari)
 * - Mobile browsers (iOS Safari, Android Chrome, Samsung Internet)
 * - WebViews, PWA standalone mode, and sandboxed iframes (e.g., AI Studio preview)
 */

export async function copyToClipboard(textToCopy: any): Promise<boolean> {
  // Coerce any input into a clean string representation
  let text = '';
  if (textToCopy === null || textToCopy === undefined) {
    text = '';
  } else if (typeof textToCopy === 'string') {
    text = textToCopy;
  } else if (typeof textToCopy === 'object') {
    try {
      text = JSON.stringify(textToCopy, null, 2);
    } catch {
      text = String(textToCopy);
    }
  } else {
    text = String(textToCopy);
  }

  if (!text) {
    return false;
  }

  let copySuccess = false;

  // 1. Try modern navigator.clipboard API first
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
    } catch (err) {
      // In iframes or without explicit user activation / permissions, writeText may fail
      console.warn('navigator.clipboard.writeText failed or was restricted, attempting execCommand fallback:', err);
    }
  }

  // 2. Fallback using hidden <textarea> + document.execCommand('copy')
  if (!copySuccess && typeof document !== 'undefined' && document.body) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;

      // Ensure element is hidden from view and doesn't trigger scroll/zoom
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.fontSize = '16px'; // Prevent zoom on iOS
      textarea.style.zIndex = '-99999';
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');

      document.body.appendChild(textarea);

      // Handle iOS Safari specific selection quirks
      const isIOS = typeof navigator !== 'undefined' && /ipad|iphone|ipod/i.test(navigator.userAgent);
      if (isIOS) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textarea.setSelectionRange(0, 999999);
      } else {
        textarea.focus({ preventScroll: true });
        textarea.select();
      }

      copySuccess = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (execErr) {
      console.error('document.execCommand fallback copy failed:', execErr);
    }
  }

  if (copySuccess && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app:clipboard_copied', {
        detail: { text, timestamp: Date.now() },
      })
    );
  }

  return copySuccess;
}
