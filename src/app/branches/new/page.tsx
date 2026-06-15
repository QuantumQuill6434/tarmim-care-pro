'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { createBranchAction } from '@/app/actions';
import { Building2, ArrowLeft, Loader2, MapPin, Hash, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function NewBranchPage() {
  const [state, formAction, isPending] = useActionState(createBranchAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 py-4 px-6 flex items-center gap-4 shadow-xs">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <Building2 className="w-4 h-4 text-teal-700" />
          <span className="text-sm font-bold text-slate-800">Add Clinic Branch</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">

          {/* Icon + Title */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-teal-700" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add a Branch</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Each branch represents a clinic location. You can add as many as you need.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">

            {/* Success */}
            {state?.success ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-14 h-14 text-teal-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Branch Created!</h3>
                <p className="text-sm text-slate-500">&ldquo;{state.branchName}&rdquo; has been added to your clinic.</p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/branches/new"
                    id="add-another-branch-btn"
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Add Another
                  </Link>
                  <Link
                    href="/dashboard"
                    id="go-to-dashboard-after-branch"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                {state?.error && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium border border-red-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{state.error}</span>
                  </div>
                )}

                {/* Branch Name */}
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Branch Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="e.g. Olaya Clinic, North Branch"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm"
                    />
                  </div>
                </div>

                {/* Branch Code */}
                <div>
                  <label htmlFor="code" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Short Code *
                    <span className="ml-2 font-normal normal-case text-slate-400">(used as badge label, e.g. OLY, HMR)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      required
                      maxLength={6}
                      placeholder="e.g. OLY"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm uppercase"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    City / Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      placeholder="e.g. Riyadh, Jeddah"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="create-branch-btn"
                  disabled={isPending}
                  className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Branch...
                    </span>
                  ) : (
                    'Create Branch'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
