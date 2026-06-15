'use client';

import React, { useState } from 'react';
import { Filter, X, Search, ChevronDown } from 'lucide-react';

interface MobileFilterBarProps {
  branches: { id: string; name: string }[];
  currentUser: { role: string; branchId: string | null };
  defaultBranch: string;
  defaultStatus: string;
  defaultCategory: string;
  defaultPriority: string;
  defaultQ: string;
  categoriesList: string[];
}

export default function MobileFilterBar({
  branches, currentUser, defaultBranch, defaultStatus,
  defaultCategory, defaultPriority, defaultQ, categoriesList
}: MobileFilterBarProps) {
  const [open, setOpen] = useState(false);
  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || 'Branch';

  return (
    <>
      {/* Mobile quick search + filter toggle */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-xs p-3 flex gap-2">
        <form method="GET" className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={defaultQ}
            placeholder="Search handover logs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700"
          />
          {/* carry existing filters forward */}
          <input type="hidden" name="branch" value={defaultBranch} />
          <input type="hidden" name="status" value={defaultStatus} />
          <input type="hidden" name="category" value={defaultCategory} />
          <input type="hidden" name="priority" value={defaultPriority} />
        </form>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold min-h-[44px] cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-xl p-5 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Filter Handovers</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form method="GET" className="space-y-4" onSubmit={() => setOpen(false)}>
              <input type="hidden" name="q" value={defaultQ} />

              {currentUser.role === 'owner' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Branch</label>
                  <select name="branch" defaultValue={defaultBranch} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[44px]">
                    <option value="">All Branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                <select name="status" defaultValue={defaultStatus} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[44px]">
                  <option value="unresolved">Unresolved (Default)</option>
                  <option value="Open">Open Only</option>
                  <option value="In Progress">In Progress Only</option>
                  <option value="Completed">Completed Only</option>
                  <option value="all">All Items</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                <select name="category" defaultValue={defaultCategory} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[44px]">
                  <option value="all">All Categories</option>
                  {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Priority</label>
                <select name="priority" defaultValue={defaultPriority} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[44px]">
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <a href="/dashboard" className="flex-1 text-center py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 min-h-[44px] flex items-center justify-center">
                  Clear All
                </a>
                <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-bold text-white min-h-[44px] cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
