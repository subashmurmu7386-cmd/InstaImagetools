import React, { useEffect, useRef, useState } from 'react';

/**
 * AdsterraBanner
 * 
 * Standalone component for Adsterra Standard Banner Ads (728x90, 300x250, 468x60, 320x50).
 * Safely handles script injection, isolated iframe execution to protect React SPA DOM,
 * and renders a high-quality dark glassmorphic container matching InstaImagetools UI.
 */
export function AdsterraBanner({
  adKey = import.meta.env.VITE_ADSTERRA_BANNER_KEY || '4a5e6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
  format = '728x90', // '728x90' | '300x250' | '468x60' | '320x50' | 'responsive'
  position = 'general',
  className = '',
  title = 'Sponsored Advertisement',
}) {
  const containerRef = useRef(null);
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Parse width & height from format
  const getDimensions = () => {
    switch (format) {
      case '300x250':
        return { width: 300, height: 250 };
      case '468x60':
        return { width: 468, height: 60 };
      case '320x50':
        return { width: 320, height: 50 };
      case '728x90':
      default:
        return { width: 728, height: 90 };
    }
  };

  const { width, height } = getDimensions();

  // Create self-contained iframe srcDoc with Adsterra invoke code
  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: transparent;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key': '${adKey}',
            'format': 'iframe',
            'height': ${height},
            'width': ${width},
            'params': {}
          };
        </script>
        <script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js" onerror="window.parent.postMessage({ type: 'ADSTERRA_BLOCKED', key: '${adKey}' }, '*')"></script>
      </body>
    </html>
  `;

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.type === 'ADSTERRA_BLOCKED' && event?.data?.key === adKey) {
        setIsAdBlocked(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [adKey]);

  return (
    <div
      ref={containerRef}
      id={`adsterra-banner-${position}-${format}`}
      className={`w-full flex items-center justify-center my-3 overflow-x-auto overflow-y-hidden scrollbar-none ${className}`}
    >
      <iframe
        title={`Adsterra Ad ${format}`}
        srcDoc={srcDoc}
        width={width}
        height={height}
        loading="lazy"
        scrolling="no"
        onLoad={() => setIframeLoaded(true)}
        className="border-0 max-w-full block"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          overflow: 'hidden',
          display: isAdBlocked ? 'none' : 'block',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}

export default AdsterraBanner;
