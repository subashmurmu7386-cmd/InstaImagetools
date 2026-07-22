import React from 'react';

interface AdSpaceProps {
  type: 'banner' | 'native';
}

export function AdSpace({ type }: AdSpaceProps) {
  return (
    <div className={`w-full bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-mono text-sm tracking-widest ${type === 'banner' ? 'h-[90px] max-w-[728px] mx-auto' : 'h-[250px] max-w-[300px] mx-auto'} my-6 rounded-lg`}>
      {type === 'banner' ? '<script>
  atOptions = {
    'key' : '24394e08665d00063b3669c40e783ad2',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/24394e08665d00063b3669c40e783ad2/invoke.js"></script>' : '<script async="async" data-cfasync="false" src="https://pl30476706.effectivecpmnetwork.com/1af45142b72c319f5d008f1716e73fae/invoke.js"></script>
<div id="container-1af45142b72c319f5d008f1716e73fae"></div>'}
    </div>
  );
}
