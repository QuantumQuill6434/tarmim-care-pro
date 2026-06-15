import React from 'react';
import { Loader2 } from 'lucide-react';

export default function NewItemLoading() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-32 h-3.5 rounded bg-slate-100 animate-pulse" />
            <div className="w-24 h-2.5 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-32 h-4 rounded bg-slate-200 animate-pulse mb-5" />
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="w-48 h-4 rounded bg-slate-200" />
              <div className="w-32 h-3 rounded bg-slate-200" />
            </div>
          </div>
          <div className="p-6 space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-24 h-3 rounded bg-slate-100" />
                <div className="w-full h-10 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-end justify-center pb-12 pointer-events-none">
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
          <span className="text-xs font-semibold text-slate-600">Loading form...</span>
        </div>
      </div>
    </div>
  );
}
