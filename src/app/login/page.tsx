'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions';
import { ShieldAlert, KeyRound, Mail, Loader2, Eye, EyeOff, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-emerald-200">
      {/* Top clinical banner (hidden on mobile to save vertical space) */}
      <header className="hidden sm:flex border-b border-slate-200/80 bg-white py-3.5 px-6 justify-between items-center shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Tarmim Care Pro Logo"
            className="w-8 h-8 object-contain rounded-md"
          />
          <div>
            <h1 className="font-bold text-emerald-800 text-sm tracking-tight leading-tight">Tarmim Care Pro</h1>
            <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none">Operations Portal</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saudi Arabia</div>
      </header>

      {/* Main card section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center sm:hidden">
            {/* Show smaller logo on mobile header if top header is hidden */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="/logo.png"
                alt="Tarmim Care Pro Logo"
                className="w-9 h-9 object-contain rounded-lg shadow-xs"
              />
              <span className="font-extrabold text-emerald-800 text-base tracking-tight">Tarmim Care Pro</span>
            </div>
          </div>

          <div className="text-center">
            <img
              src="/logo.png"
              alt="Tarmim Care Pro Logo"
              className="hidden sm:block w-16 h-16 mx-auto object-contain rounded-2xl shadow-xs mb-2.5"
            />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
              Shift Handover Logbook / سجل تسليم المناوبات
            </p>
          </div>

          <div className="bg-white py-6 px-5 shadow-lg rounded-2xl border border-slate-200/80 sm:px-8">
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 font-medium border border-red-100 flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-650 uppercase tracking-wider mb-1.5">
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-base"
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-650 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    required
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isPending}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:opacity-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

            <div className="mt-5 border-t border-slate-200 pt-4 text-center">
              <p className="text-xs text-slate-500">
                New clinic?{' '}
                <Link
                  href="/signup"
                  id="go-to-signup-link"
                  className="font-semibold text-emerald-750 hover:text-emerald-900 transition-colors"
                >
                  Register your clinic →
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-100/60 p-2 rounded-lg border border-slate-200">
            Administrative tool only — Strictly no clinical patient medical records.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3.5 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-semibold">
        <p>© {new Date().getFullYear()} Tarmim Care Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
