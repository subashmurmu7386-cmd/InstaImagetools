import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#1E293B] border-t border-slate-700 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p className="uppercase tracking-widest">&copy; {new Date().getFullYear()} Instaimagetools</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
