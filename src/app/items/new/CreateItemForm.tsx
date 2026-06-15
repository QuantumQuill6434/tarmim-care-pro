'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Branch, HandoverCategory, HandoverPriority } from '@/lib/db-types';
import { createItemAction } from '@/app/actions';
import { ArrowLeft, ClipboardList, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface CreateItemFormProps {
  currentUser: User;
  branches: Branch[];
  users: User[];
}

export default function CreateItemForm({ currentUser, branches, users }: CreateItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<HandoverCategory>('Callback');
  const [priority, setPriority] = useState<HandoverPriority>('Medium');
  const [branchId, setBranchId] = useState(currentUser.branchId || branches[0]?.id || '');
  const [shiftName, setShiftName] = useState('Morning');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Filter users based on selected branch
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Show users who belong to the selected branch, plus the owner (u1)
    const filtered = users.filter((u) => u.branchId === branchId || u.role === 'owner');
    setFilteredUsers(filtered);

    // Reset assigned user if they are not in the new filtered list
    if (assignedTo && !filtered.some((u) => u.id === assignedTo)) {
      setAssignedTo('');
    }
  }, [branchId, users, assignedTo]);

  // Set default assignee to current user if they are in the list
  useEffect(() => {
    if (!assignedTo && filteredUsers.some((u) => u.id === currentUser.id)) {
      setAssignedTo(currentUser.id);
    }
  }, [filteredUsers, currentUser.id, assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      setError('Title and Details are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createItemAction({
        title: title.trim(),
        details: details.trim(),
        category,
        priority,
        branchId,
        shiftName,
        assignedTo: assignedTo || null,
        followUpDate: followUpDate || null,
      });

      if (response.success) {
        router.push(`/items/${response.itemId}`);
      } else {
        setError('Failed to create handover item.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* No branches guard */}
      {branches.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-bold text-slate-800">No Branches Found</h3>
          <p className="text-sm text-slate-500">
            You need to add at least one clinic branch before creating handover items.
          </p>
          {currentUser.role === 'owner' && (
            <Link
              href="/branches/new"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Add a Branch First
            </Link>
          )}
        </div>
      )}


      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Form Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <ClipboardList className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Create Handover Log Entry
            </h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Tarmim Care Pro / تسجيل تسليم جديد
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-150 text-xs text-red-750 rounded-lg font-semibold">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <label htmlFor="title" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Title / Subject *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patient Callback, Cash Mismatch, low stock"
              required
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 placeholder:text-slate-400"
            />
          </div>

          {/* Details input */}
          <div>
            <label htmlFor="details" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Operational Details * (Do not include patient clinical records)
            </label>
            <textarea
              id="details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide clear steps for the next shift staff. State names, contacts, or cash amounts. DO NOT write dental clinical files."
              required
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 placeholder:text-slate-400"
            />
          </div>

          {/* Category, Priority Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category selection */}
            <div>
              <label htmlFor="category" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as HandoverCategory)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-teal-700"
              >
                <option value="Callback">Callback / مكالمة هاتفية</option>
                <option value="Follow-up">Follow-up / متابعة</option>
                <option value="Cash / payment">Cash & Payment / النقد والدفع</option>
                <option value="Complaint">Complaint / شكوى</option>
                <option value="Supplies">Supplies / مستلزمات</option>
                <option value="Insurance admin">Insurance Admin / شؤون التأمين</option>
                <option value="Urgent">Urgent / عاجل وهام</option>
                <option value="Other">Other / أخرى</option>
              </select>
            </div>

            {/* Priority selection */}
            <div>
              <label htmlFor="priority" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as HandoverPriority)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-teal-700"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

          </div>

          {/* Branch, Shift, Assigned Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Branch selection */}
            <div>
              <label htmlFor="branch" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Clinic Branch
              </label>
              {currentUser.role === 'owner' ? (
                <select
                  id="branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-teal-700"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={branches.find((b) => b.id === branchId)?.name || ''}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-500 font-semibold cursor-not-allowed"
                />
              )}
            </div>

            {/* Shift selection */}
            <div>
              <label htmlFor="shift" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Current Shift
              </label>
              <select
                id="shift"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-teal-700"
              >
                <option value="Morning">Morning Shift / صباحي</option>
                <option value="Evening">Evening Shift / مسائي</option>
                <option value="Night">Night Shift / ليلي</option>
              </select>
            </div>

            {/* Assigned To selection */}
            <div>
              <label htmlFor="assignedTo" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Assign To Staff
              </label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-teal-700"
              >
                <option value="">Unassigned</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Follow Up Date */}
          <div className="max-w-xs">
            <label htmlFor="followUpDate" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              id="followUpDate"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-550/10 hover:text-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-all duration-150 cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Handover Entry
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
