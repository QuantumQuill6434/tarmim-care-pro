'use client';

import React, { useState, useTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clinic, Branch, User } from '@/lib/db-types';
import { updateClinicNameAction, createBranchAction, deleteBranchAction } from '@/app/actions';
import {
  Building2, Users, ClipboardList, Check, Copy, Trash2, Plus, Loader2,
  Shield, CheckCircle2, AlertCircle, MapPin, Code
} from 'lucide-react';

interface Props {
  currentUser: User;
  clinic: Clinic;
  branches: Branch[];
  users: User[];
}

type Tab = 'clinic' | 'branches' | 'staff';

export default function SettingsClient({ currentUser, clinic, branches, users }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('clinic');

  // Clinic renaming states
  const [renameState, renameFormAction, isRenamePending] = useActionState(updateClinicNameAction, null);

  // Branch creation states
  const [branchState, branchFormAction, isBranchPending] = useActionState(createBranchAction, null);
  const [showAddBranch, setShowAddBranch] = useState(false);

  // Branch deletion states
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);

  // Invite Generator states
  const [inviteRole, setInviteRole] = useState<'manager' | 'receptionist'>('receptionist');
  const [inviteBranchId, setInviteBranchId] = useState<string>('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Construct invite link dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const clinicNameEncoded = encodeURIComponent(clinic.name);
      let link = `${origin}/signup?clinicId=${clinic.id}&clinicName=${clinicNameEncoded}&role=${inviteRole}`;
      if (inviteBranchId) {
        link += `&branchId=${inviteBranchId}`;
      }
      setInviteLink(link);
    }
  }, [clinic.id, clinic.name, inviteRole, inviteBranchId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteBranch = async (branchId: string) => {
    setBranchError(null);
    setIsDeletingBranch(true);
    try {
      await deleteBranchAction(branchId);
      setDeletingBranchId(null);
      router.refresh();
    } catch (err: unknown) {
      setBranchError((err as Error)?.message || 'Failed to delete branch');
    } finally {
      setIsDeletingBranch(false);
    }
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'All Branches / Super Admin';
    return branches.find((b) => b.id === branchId)?.name || 'Unknown Branch';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`flex-1 lg:w-full whitespace-nowrap flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'clinic'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          Clinic Details
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex-1 lg:w-full whitespace-nowrap flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          Branches ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 lg:w-full whitespace-nowrap flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Staff & Team ({users.length})
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* ─── Tab 1: Clinic Details ─── */}
        {activeTab === 'clinic' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Clinic Profile</h2>
              <p className="text-xs text-slate-500">Update clinic branding name and administrative info.</p>
            </div>

            <form action={renameFormAction} className="space-y-4 max-w-xl">
              {renameState?.error && (
                <div className="p-3 bg-red-50 text-xs text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{renameState.error}</span>
                </div>
              )}
              {renameState?.success && (
                <div className="p-3 bg-emerald-50 text-xs text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{renameState.message}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinic ID (Supabase Referrer)</label>
                <code className="block bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3.5 text-xs font-mono select-all select-none">
                  {clinic.id}
                </code>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinic Branding Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  defaultValue={clinic.name}
                  disabled={currentUser.role !== 'owner' || isRenamePending}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-teal-700 disabled:opacity-60"
                />
              </div>

              {currentUser.role === 'owner' && (
                <button
                  type="submit"
                  disabled={isRenamePending}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
                >
                  {isRenamePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Clinic Profile'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* ─── Tab 2: Branches ─── */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Clinic Branches</h2>
                  <p className="text-xs text-slate-500">Manage branches assigned to this clinic portal.</p>
                </div>
                {currentUser.role === 'owner' && (
                  <button
                    onClick={() => setShowAddBranch(!showAddBranch)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px]"
                  >
                    <Plus className="w-4 h-4" /> Add Branch
                  </button>
                )}
              </div>

              {branchError && (
                <div className="p-3 bg-red-50 text-xs text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{branchError}</span>
                </div>
              )}

              {/* Add Branch Inline Form */}
              {showAddBranch && (
                <form action={branchFormAction} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-none">
                  <h3 className="font-bold text-slate-700 text-xs">New Branch Registration</h3>
                  {branchState?.error && (
                    <div className="p-2.5 bg-red-50 text-xs text-red-700 rounded-lg border border-red-200">{branchState.error}</div>
                  )}
                  {branchState?.success && (
                    <div className="p-2.5 bg-emerald-50 text-xs text-emerald-800 rounded-lg border border-emerald-200">
                      Branch &apos;{branchState.branchName}&apos; added successfully!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Branch Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-teal-700"
                        placeholder="e.g. Riyadh Branch"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Code (Unique 3 Letters)</label>
                      <input
                        type="text"
                        name="code"
                        required
                        maxLength={3}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-teal-700"
                        placeholder="e.g. RUH"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Location / Address</label>
                      <input
                        type="text"
                        name="location"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-teal-700"
                        placeholder="e.g. Olaya District"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddBranch(false)}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBranchPending}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      {isBranchPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Branch'}
                    </button>
                  </div>
                </form>
              )}

              {/* Branches List */}
              <div className="divide-y divide-slate-100">
                {branches.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">No branches registered. Click Add Branch above.</p>
                ) : (
                  branches.map((b) => (
                    <div key={b.id} className="py-4 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 text-sm font-bold">{b.name}</strong>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 bg-teal-50 border border-teal-150 text-teal-850 rounded-md">
                            <Code className="w-2.5 h-2.5" /> {b.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {b.location || 'No address registered'}
                        </p>
                      </div>

                      {currentUser.role === 'owner' && (
                        <div>
                          {deletingBranchId !== b.id ? (
                            <button
                              onClick={() => setDeletingBranchId(b.id)}
                              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-xl transition-all cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl p-1.5">
                              <span className="text-[9px] font-bold text-red-800 px-1">Confirm delete?</span>
                              <button
                                onClick={() => handleDeleteBranch(b.id)}
                                disabled={isDeletingBranch}
                                className="px-2 py-1 bg-red-650 text-white text-[9px] font-bold rounded-lg hover:bg-red-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingBranchId(null)}
                                className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold rounded-lg hover:bg-slate-50"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab 3: Staff & Team ─── */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {/* Invite link generator (Owners/Managers only) */}
            {currentUser.role === 'owner' && (
              <div className="bg-gradient-to-br from-teal-800 to-slate-900 border border-teal-750 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-teal-300" />
                    Staff Invite Link Generator
                  </h3>
                  <p className="text-xs text-teal-200 mt-1">Generate a secure signup url to onboard staff members to this clinic.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Staff Access Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'manager' | 'receptionist')}
                      className="w-full text-xs bg-teal-900/60 border border-teal-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="receptionist" className="text-slate-800">Receptionist / Medical Assistant</option>
                      <option value="manager" className="text-slate-800">Manager / Shift Supervisor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Assigned Branch (Optional)</label>
                    <select
                      value={inviteBranchId}
                      onChange={(e) => setInviteBranchId(e.target.value)}
                      className="w-full text-xs bg-teal-900/60 border border-teal-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="" className="text-slate-800">Unassigned (Super-Admin / All Branches)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id} className="text-slate-800">{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-teal-200 mb-1.5">Generated Signup URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 text-xs bg-teal-950/80 border border-teal-800 rounded-xl px-3 py-2.5 font-mono text-teal-300 focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer min-w-[120px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-teal-300 mt-2 font-medium">Send this link to your new team member. They will be registered directly into this clinic profile.</p>
                </div>
              </div>
            )}

            {/* Current team members list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Team Roster</h2>
                <p className="text-xs text-slate-500">Current active accounts assigned to this clinic.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-1">Name</th>
                      <th className="py-3 px-1">Email</th>
                      <th className="py-3 px-1">Role</th>
                      <th className="py-3 px-1">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-1 font-bold text-slate-800">{u.name}</td>
                        <td className="py-3.5 px-1 text-slate-500 font-mono">{u.email}</td>
                        <td className="py-3.5 px-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.role === 'owner'
                              ? 'bg-purple-100 text-purple-800 border border-purple-250'
                              : u.role === 'manager'
                              ? 'bg-blue-105 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-1 font-medium">{getBranchName(u.branchId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
