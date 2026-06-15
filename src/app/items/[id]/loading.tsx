import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ItemDetailLoading() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-32 h-3.5 rounded bg-slate-100 animate-pulse" />
            <div className="w-24 h-2.5 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back link skeleton */}
        <div className="w-32 h-4 rounded bg-slate-200 animate-pulse mb-5" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Right sidebar skeleton */}
          <div className="lg:col-span-4 order-first lg:order-last space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4 h-56" />
            <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-48" />
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-8 order-last lg:order-first space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="flex gap-2">
                <div className="w-20 h-6 rounded-md bg-slate-100" />
                <div className="w-16 h-6 rounded-md bg-slate-100" />
              </div>
              <div className="w-3/4 h-7 rounded bg-slate-100" />
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="w-full h-3.5 rounded bg-slate-200" />
                <div className="w-full h-3.5 rounded bg-slate-200" />
                <div className="w-2/3 h-3.5 rounded bg-slate-200" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="w-32 h-5 rounded bg-slate-100" />
              <div className="space-y-2">
                <div className="w-full h-16 rounded-xl bg-slate-100" />
                <div className="w-full h-16 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-end justify-center pb-12 pointer-events-none">
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
          <span className="text-xs font-semibold text-slate-600">Loading item...</span>
        </div>
      </div>
    </div>
  );
}
