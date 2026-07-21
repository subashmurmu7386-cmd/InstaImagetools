import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdSpace } from './components/AdSpace';
import { ImageTools } from './components/ImageTools';
import { PdfTools } from './components/PdfTools';
import { TextTools } from './components/TextTools';
import { HistoryTools } from './components/HistoryTools';

export default function App() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 font-sans flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <AdSpace type="banner" />

        <div className="mt-8 transition-opacity duration-300">
          {activeTab === 'image' && <ImageTools />}
          {activeTab === 'pdf' && <PdfTools />}
          {activeTab === 'text' && <TextTools />}
          {activeTab === 'history' && <HistoryTools />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
