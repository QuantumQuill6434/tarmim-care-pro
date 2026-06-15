import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/app/actions';
import { getBranches } from '@/lib/db';
import { LogOut, User, Building, Settings } from 'lucide-react';

export default async function Header() {
  const user = await getCurrentUser();
  if (!user) return null;

  const branches = await getBranches();
  const branch = branches.find((b) => b.id === user.branchId);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Clinic Owner / المالك';
      case 'manager':
        return 'Branch Manager / مدير الفرع';
      case 'receptionist':
        return 'Receptionist / موظف استقبال';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-emerald-950/80 shadow-md text-white backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Name */}
          <div className="flex">
            <Link href="/dashboard" className="flex items-center shrink-0 gap-3">
              <img 
                src="/logo.png" 
                alt="Tarmim Care Pro Logo" 
                className="w-10 h-10 object-contain rounded-lg border border-emerald-800/60 shadow-inner" 
              />
              <div>
                <span className="font-bold text-emerald-300 text-base tracking-tight leading-none block">Tarmim Care Pro</span>
                <span className="text-[10px] text-slate-400 font-bold leading-none block mt-1.5 uppercase tracking-wider">Shift Handover Portal</span>
              </div>
            </Link>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* User Meta Card */}
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 justify-end">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-450 font-bold uppercase mt-0.5 tracking-wide">
                  {getRoleLabel(user.role).split(' / ')[0]}
                </div>
              </div>
              
              {/* Branch Tag */}
              <div className="h-9 px-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                {user.role === 'owner' ? 'All Branches' : branch?.name || 'Branch'}
              </div>
            </div>

            {/* Mobile simplified info */}
            <div className="sm:hidden flex items-center gap-2 border-r border-slate-800 pr-3">
              <div className="text-xs font-bold bg-emerald-950/60 text-emerald-300 px-2 py-1.5 rounded-lg border border-emerald-800/80">
                {user.role === 'owner' ? 'Owner' : branch?.code || 'Staff'}
              </div>
            </div>

            {/* Settings Link (Owner/Manager only) */}
            {(user.role === 'owner' || user.role === 'manager') && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-850/50 bg-emerald-950/40 rounded-lg text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/40 hover:border-emerald-700 active:scale-[0.98] transition-all duration-150"
                title="Portal Settings"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Settings</span>
              </Link>
            )}

            {/* Logout Trigger */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-800 bg-slate-900/50 rounded-lg text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                title="Sign out of system"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
