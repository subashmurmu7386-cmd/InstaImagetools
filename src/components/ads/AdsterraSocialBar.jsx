import React, { useEffect } from 'react';

/**
 * AdsterraSocialBar
 * 
 * Standalone global component for Adsterra Social Bar Ads.
 * Injects the Adsterra Social Bar ad script globally into the application.
 * Ensures the Social Bar ad loads smoothly on top/bottom viewports across mobile and desktop
 * devices without overlapping or blocking critical UI buttons (such as mobile bottom category tabs or copy buttons).
 */
export function AdsterraSocialBar({
  adKey = import.meta.env.VITE_ADSTERRA_SOCIAL_BAR_KEY || 'a9e3512ade6f030830f25e6da56df1a1',
  scriptUrl = import.meta.env.VITE_ADSTERRA_SOCIAL_BAR_URL || 'https://pl31185385.profitableratecpmnetwork.com/a9/e3/51/a9e3512ade6f030830f25e6da56df1a1.js',
}) {
  useEffect(() => {
    const scriptId = 'adsterra-social-bar-script';
    const src = scriptUrl || `https://pl31185385.profitableratecpmnetwork.com/a9/e3/51/${adKey}.js`;

    // Prevent duplicate injection if already added via index.html or previous mount
    if (
      document.getElementById(scriptId) ||
      document.querySelector(`script[src*="${adKey}"]`) ||
      document.querySelector(`script[src*="profitableratecpmnetwork"]`)
    ) {
      return;
    }

    try {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = src;
      script.onerror = () => {
        // Silently handle if blocked by client adblockers
      };

      document.body.appendChild(script);

      return () => {
        try {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        } catch {
          // Ignore unmount error
        }
      };
    } catch {
      // Safe fallback
    }
  }, [adKey, scriptUrl]);

  return null;
}

export default AdsterraSocialBar;
