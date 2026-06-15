import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="text-center space-y-6">
        {/* Pulsing logo with animated ring */}
        <div className="relative flex items-center justify-center mx-auto">
          {/* Pulsing outer ring */}
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
          
          {/* Rotating borders */}
          <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-250 border-t-emerald-700 animate-spin"></div>
          
          {/* Logo container */}
          <div className="relative w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-md overflow-hidden p-1.5 animate-pulse">
            <img
              src="/logo.png"
              alt="Tarmim Care Pro Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800 tracking-wide">Tarmim Care Pro</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
            Syncing Portal State / جاري مزامنة البوابة...
          </p>
        </div>
      </div>
    </div>
  );
}
