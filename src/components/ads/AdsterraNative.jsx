import React, { useEffect, useRef, useState } from 'react';

/**
 * AdsterraNative
 * 
 * Standalone component for Adsterra Native Banner Ads.
 * Renders pure, clean Adsterra native banner ad slot without wrapper headers, footers, borders, or padded cards.
 */
export function AdsterraNative({
  adKey = import.meta.env.VITE_ADSTERRA_NATIVE_KEY || '5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
  layout = 'card', // 'card' | 'workspace' | 'compact'
  position = 'workspace',
  className = '',
  sponsorName = '',
  headline = '',
  description = '',
  ctaText = '',
  targetUrl = '#',
}) {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    // Safely inject Adsterra native banner script into target container if valid key provided
    const containerId = `container-${adKey}`;
    const targetElement = containerRef.current?.querySelector(`#${containerId}`) || document.getElementById(containerId);

    if (targetElement && adKey && !adKey.startsWith('5b6c7d8e')) {
      const existingScript = targetElement.querySelector('script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = `//pl${adKey}.highperformanceformat.com/${adKey}/invoke.js`;
        script.onerror = (e) => {
          setIsAdBlocked(true);
          if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
          }
        };
        script.onload = () => setScriptLoaded(true);

        targetElement.appendChild(script);

        return () => {
          try {
            if (targetElement.contains(script)) {
              targetElement.removeChild(script);
            }
          } catch {
            // Ignore unmount cleanup errors
          }
        };
      }
    }
  }, [adKey]);

  return (
    <div
      id={`adsterra-native-${position}`}
      ref={containerRef}
      className={`w-full flex items-center justify-center my-3 overflow-x-auto overflow-y-hidden ${className}`}
    >
      {/* Target injection container for Adsterra native code */}
      <div id={`container-${adKey}`} className="adsterra-native-slot w-full flex justify-center items-center" />
    </div>
  );
}

export default AdsterraNative;
