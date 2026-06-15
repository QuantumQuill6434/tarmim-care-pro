import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getClinic, getBranches, getUsers } from '@/lib/db';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import SettingsClient from './SettingsClient';
import { ArrowLeft, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Only owners and managers should access settings
  if (user.role !== 'owner' && user.role !== 'manager') {
    redirect('/dashboard');
  }

  const [clinic, allBranches, allUsers] = await Promise.all([
    getClinic(),
    getBranches(),
    getUsers(),
  ]);

  if (!clinic) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5 text-teal-700" />
            <h1 className="text-lg font-bold">Clinic Settings</h1>
          </div>
        </div>

        {/* Client side tab/sub-sections */}
        <SettingsClient
          currentUser={user}
          clinic={clinic}
          branches={allBranches}
          users={allUsers}
        />
      </main>
    </div>
  );
}
