'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HandoverItem, ItemComment, ItemActivityLog, Branch, User, HandoverStatus } from '@/lib/db-types';
import { updateItemStatusAction, updateItemAssigneeAction, addCommentAction, deleteItemAction } from '@/app/actions';
import {
  ArrowLeft, Clock, Building, Calendar, MessageSquare,
  CheckCircle2, AlertCircle, HelpCircle, PhoneCall,
  CalendarRange, Wallet, AlertTriangle, FileCheck2,
  Package, Send, Loader2, TrendingUp, Trash2
} from 'lucide-react';

interface Props {
  item: HandoverItem;
  comments: ItemComment[];
  activityLogs: ItemActivityLog[];
  branches: Branch[];
  users: User[];
  currentUser: User;
}

export default function ItemDetailsClient({ item, comments, activityLogs, branches, users, currentUser }: Props) {
  const router = useRouter();
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isAssigneePending, startAssigneeTransition] = useTransition();
  const [isCommentPending, startCommentTransition] = useTransition();

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = item.followUpDate && item.status !== 'Completed' && item.followUpDate < todayStr;
  const branch = branches.find((b) => b.id === item.branchId);
  const assignableUsers = users.filter((u) => u.branchId === item.branchId || u.role === 'owner');

  const getUserName = (id: string | null) => id ? (users.find((u) => u.id === id)?.name || 'Unknown') : 'Unassigned';
  const getUserRole = (id: string | null) => id ? (users.find((u) => u.id === id)?.role || '') : '';

  const handleStatusChange = (status: HandoverStatus) => {
    setStatusError(null);
    startStatusTransition(async () => {
      try { await updateItemStatusAction(item.id, status); router.refresh(); }
      catch (err: unknown) { setStatusError((err as Error)?.message || 'Failed to update status'); }
    });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    setAssigneeError(null);
    startAssigneeTransition(async () => {
      try { await updateItemAssigneeAction(item.id, assigneeId || null); router.refresh(); }
      catch (err: unknown) { setAssigneeError((err as Error)?.message || 'Failed to update assignee'); }
    });
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await deleteItemAction(item.id);
      if (res?.success) {
        router.push('/dashboard');
      } else {
        setDeleteError('Failed to delete item');
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || 'Failed to delete item');
      setIsDeleting(false);
    }
  };

  const canDelete = currentUser.role === 'owner' || currentUser.role === 'manager' || currentUser.id === item.createdBy;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setCommentError(null);
    startCommentTransition(async () => {
      try {
        const res = await addCommentAction(item.id, commentContent.trim());
        if (res?.error) { setCommentError(res.error); }
        else {
          setCommentContent('');
          setIsRefreshing(true);
          router.refresh();
          setTimeout(() => setIsRefreshing(false), 1500);
        }
      } catch (err: unknown) { setCommentError((err as Error)?.message || 'Failed to post comment'); }
    });
  };

  const getCategoryIcon = (cat: string) => {
    const cls = "w-4 h-4 shrink-0";
    switch (cat) {
      case 'Callback': return <PhoneCall className={`${cls} text-emerald-600`} />;
      case 'Follow-up': return <CalendarRange className={`${cls} text-blue-600`} />;
      case 'Cash / payment': return <Wallet className={`${cls} text-amber-600`} />;
      case 'Complaint': return <AlertTriangle className={`${cls} text-orange-600`} />;
      case 'Supplies': return <Package className={`${cls} text-indigo-600`} />;
      case 'Insurance admin': return <FileCheck2 className={`${cls} text-cyan-600`} />;
      case 'Urgent': return <AlertCircle className={`${cls} text-red-600 animate-pulse`} />;
      default: return <HelpCircle className={`${cls} text-slate-500`} />;
    }
  };

  const fmtDateTime = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusConfig: Record<HandoverStatus, string> = {
    'Open': 'bg-amber-100 text-amber-800 border-amber-300',
    'In Progress': 'bg-sky-100 text-sky-800 border-sky-300',
    'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* ── MOBILE: Resolution controls on top ── DESKTOP: right column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* RIGHT SIDEBAR — shown first on mobile via order */}
        <div className="lg:col-span-4 order-first lg:order-last space-y-5">

          {/* STATUS CONTROLS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2.5 flex justify-between items-center">
              <span>Resolution Controls</span>
              {item.status === 'Completed' && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </h3>

            {item.status !== 'Completed' && (
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 text-center space-y-2">
                <p className="text-xs text-slate-600 font-semibold leading-normal">
                  Has this handover note or action item been resolved?
                </p>
                <button
                  onClick={() => handleStatusChange('Completed')}
                  disabled={isStatusPending}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs min-h-[44px]"
                >
                  {isStatusPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark as Completed
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Handover Status</label>
              {statusError && (
                <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 font-medium">{statusError}</div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {(['Open', 'In Progress', 'Completed'] as HandoverStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isStatusPending}
                    className={`py-2.5 px-1 border rounded-xl text-center text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 min-h-[44px] ${item.status === s ? statusConfig[s] + ' font-bold' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {isStatusPending && item.status !== s && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span className="leading-tight">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Staff Member</label>
              {assigneeError && (
                <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 font-medium">{assigneeError}</div>
              )}
              <div className="relative">
                <select
                  value={item.assignedTo || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isAssigneePending}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[44px] focus:outline-none focus:border-teal-700 appearance-none animate-none"
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                {isAssigneePending && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-teal-700" />}
              </div>
            </div>

            {/* Static meta */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="flex items-center gap-1 text-slate-500"><Building className="w-3.5 h-3.5" />Branch:</span><span className="font-bold text-slate-800">{branch?.name || 'Unknown'}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1 text-slate-500"><Calendar className="w-3.5 h-3.5" />Created:</span><span className="font-bold text-slate-800">{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div>
              {item.status === 'Completed' && item.completedBy && (
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" />Completed by:</span>
                  <span className="font-bold text-slate-800">{getUserName(item.completedBy)}</span>
                </div>
              )}
            </div>

            {/* Delete Option */}
            {canDelete && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {deleteError && (
                  <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 font-medium">{deleteError}</div>
                )}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer min-h-[38px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Handover Note
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 space-y-2 text-center">
                    <p className="text-[10px] font-bold text-red-800 leading-tight">Confirm Deletion?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVITY HISTORY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2.5">Activity History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-slate-400 text-xs py-2 text-center">No activity yet.</p>
              ) : activityLogs.map((log) => (
                <div key={log.id} className="text-xs pl-3.5 border-l-2 border-teal-500 pb-1 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white absolute -left-[5px] top-0.5" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{getUserName(log.userId)}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-snug mt-0.5">{log.details}</p>
                  <span className="text-[9px] text-slate-400">{new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEFT CONTENT — details + comments */}
        <div className="lg:col-span-8 order-last lg:order-first space-y-5">

          {/* ITEM DETAILS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md flex items-center gap-1.5">
                {getCategoryIcon(item.category)}{item.category}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${item.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : item.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {item.priority} Priority
              </span>
              {isOverdue && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />Overdue
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{item.title}</h1>
              <p className="text-[10px] text-slate-500 font-medium mt-1">ID: <code className="bg-slate-100 px-1 py-0.5 rounded-sm text-[9px]">{item.id}</code></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Administrative Notes</h3>
              <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{item.details}</p>
            </div>

            {/* Meta grid — 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div><span className="text-slate-500 block font-medium">Created By</span><strong className="text-slate-800 block mt-0.5">{getUserName(item.createdBy)}</strong></div>
              <div><span className="text-slate-500 block font-medium">Shift</span><strong className="text-slate-800 block mt-0.5">{item.shiftName}</strong></div>
              <div><span className="text-slate-500 block font-medium">Follow Up</span><strong className={`${isOverdue ? 'text-red-600' : 'text-slate-800'} block mt-0.5`}>{item.followUpDate || 'None'}</strong></div>
              <div><span className="text-slate-500 block font-medium">Updated</span><strong className="text-slate-800 block mt-0.5">{fmtDateTime(item.updatedAt)}</strong></div>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-700" />
              Comments ({comments.length})
            </h2>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-slate-400 text-xs py-2">No comments yet. Post an update for the next shift.</p>
              ) : comments.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="flex flex-wrap justify-between items-center gap-1 text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{getUserName(c.userId)} <span className="text-[10px] text-slate-500 font-normal">({getUserRole(c.userId)})</span></span>
                    <span className="text-[10px] text-slate-400">{fmtDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-100 space-y-3">
              {commentError && <div className="p-2.5 bg-red-50 text-xs text-red-700 rounded-lg border border-red-200">{commentError}</div>}
              <textarea
                rows={3}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Type a handover update for the next shift..."
                disabled={isCommentPending}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 placeholder:text-slate-400 min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                {isRefreshing && (
                  <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Refreshing...
                  </span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || isCommentPending || isRefreshing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isCommentPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Posting...</> : <><Send className="w-3.5 h-3.5" />Post Comment</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-2 z-50 shadow-lg">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        {item.status !== 'Completed' && (
          <button
            onClick={() => handleStatusChange('Completed')}
            disabled={isStatusPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold min-h-[44px] active:scale-[0.98] transition-all cursor-pointer"
          >
            {isStatusPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
