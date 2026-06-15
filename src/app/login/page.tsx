'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions';
import { ShieldAlert, KeyRound, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-teal-200">
      {/* Top clinical banner */}
      <header className="border-b border-slate-200/80 bg-white py-4 px-6 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Tarmim Care Pro Logo"
            className="w-8 h-8 object-contain rounded-md"
          />
          <div>
            <h1 className="font-bold text-teal-900 text-sm tracking-tight leading-tight">Tarmim Care Pro</h1>
            <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none">Operations Portal</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saudi Arabia</div>
      </header>

      {/* Main card section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="Tarmim Care Pro Logo"
              className="w-24 h-24 mx-auto object-contain rounded-2xl shadow-sm mb-3"
            />
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome Back
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Shift Handover Logbook / سجل تسليم المناوبات
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-150/80 sm:px-10">
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-750 font-medium border border-red-100 flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-655 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    autoComplete="email"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-350 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm"
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-350 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isPending}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-5 text-center">
              <p className="text-xs text-slate-500">
                New clinic?{' '}
                <Link
                  href="/signup"
                  id="go-to-signup-link"
                  className="font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  Register your clinic →
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Administrative tool only — Strictly no clinical patient medical records.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-semibold">
        <p>© {new Date().getFullYear()} Tarmim Care Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
