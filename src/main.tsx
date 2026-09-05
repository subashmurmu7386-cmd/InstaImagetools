import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error filter to prevent external ad/cross-origin network errors from crashing or surfacing as unhandled exceptions
if (typeof window !== 'undefined') {
  const isExternalError = (msg?: string, source?: string) => {
    const m = (msg || '').toLowerCase();
    const s = (source || '').toLowerCase();
    return (
      m === 'script error.' ||
      m === 'script error' ||
      m.includes('script error') ||
      s.includes('profitableratecpmnetwork') ||
      s.includes('highperformanceformat') ||
      s.includes('adsterra')
    );
  };

  window.addEventListener('error', (event) => {
    if (isExternalError(event.message, event.filename)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason ? (event.reason.message || String(event.reason)) : '';
    if (isExternalError(reason)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);
}

// Polyfills for modern ECMAScript TypedArray and Number hex methods (prevents toHex is not a function errors)
if (typeof Uint8Array !== 'undefined') {
  if (!(Uint8Array.prototype as any).toHex) {
    (Uint8Array.prototype as any).toHex = function () {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, '0');
      }
      return hex;
    };
  }
  if (!(Uint8Array.prototype as any).setFromHex) {
    (Uint8Array.prototype as any).setFromHex = function (hexString: string) {
      const match = hexString.match(/.{1,2}/g) || [];
      for (let i = 0; i < Math.min(this.length, match.length); i++) {
        this[i] = parseInt(match[i], 16);
      }
      return { read: match.length * 2, written: Math.min(this.length, match.length) };
    };
  }
}

if (typeof Uint8ClampedArray !== 'undefined') {
  if (!(Uint8ClampedArray.prototype as any).toHex) {
    (Uint8ClampedArray.prototype as any).toHex = function () {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, '0');
      }
      return hex;
    };
  }
}

if (typeof Number !== 'undefined' && !(Number.prototype as any).toHex) {
  (Number.prototype as any).toHex = function (digits?: number) {
    const hex = (this.valueOf() >>> 0).toString(16);
    return digits ? hex.padStart(digits, '0') : hex;
  };
}

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW reg error:', err));
  });
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

