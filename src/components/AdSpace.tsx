import React from 'react';

interface AdSpaceProps {
  type: 'banner' | 'native';
}

export function AdSpace({ type }: AdSpaceProps) {
  return (
    <div className={`w-full bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-mono text-sm tracking-widest ${type === 'banner' ? 'h-[90px] max-w-[728px] mx-auto' : 'h-[250px] max-w-[300px] mx-auto'} my-6 rounded-lg`}>
      {type === 'banner' ? 'AD SPACE: BANNER 728 x 90' : 'AD SPACE: IN-CONTENT NATIVE'}
    </div>
  );
}
