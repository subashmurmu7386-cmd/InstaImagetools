import React, { useEffect, useRef } from 'react';

interface AdSpaceProps {
  type: 'banner' | 'native';
  className?: string;
}

export function AdSpace({ type, className = '' }: AdSpaceProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adRef.current;
    if (!container) return;

    // Purana content clean karein
    container.innerHTML = '';

    if (type === 'banner') {
      // --- Banner 728x90 Ad Setup ---
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '24394e08665d00063b3669c40e783ad2',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const loadScript = document.createElement('script');
      loadScript.type = 'text/javascript';
      loadScript.src = 'https://www.highperformanceformat.com/24394e08665d00063b3669c40e783ad2/invoke.js';

      container.appendChild(confScript);
      container.appendChild(loadScript);
    } else if (type === 'native') {
      // --- Native Banner Ad Setup ---
      const nativeDiv = document.createElement('div');
      nativeDiv.id = 'container-1af45142b72c319f5d008f1716e73fae';

      const nativeScript = document.createElement('script');
      nativeScript.async = true;
      nativeScript.setAttribute('data-cfasync', 'false');
      nativeScript.src = 'https://pl30476706.effectivecpmnetwork.com/1af45142b72c319f5d008f1716e73fae/invoke.js';

      container.appendChild(nativeScript);
      container.appendChild(nativeDiv);
    }
  }, [type]);

  return (
    <div className={`my-4 flex justify-center items-center min-h-[90px] overflow-hidden bg-slate-800/20 rounded-lg border border-slate-700/40 ${className}`}>
      <div ref={adRef}></div>
    </div>
  );
  }
      
