import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getHandoverItems, getBranches, getUsers, getAllActivityLogs } from '@/lib/db';
import Header from '@/components/Header';
import MobileFilterBar from './MobileFilterBar';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  PhoneCall, 
  CalendarRange, 
  Wallet, 
  AlertTriangle, 
  FileCheck2, 
  Package, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  Building2,
  Users,
  ChevronRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const rawParams = await searchParams;
  const searchQuery = (rawParams.q as string || '').toLowerCase();
  const branchFilter = (rawParams.branch as string || '');
  const statusFilter = (rawParams.status as string || 'unresolved'); // Default to unresolved
  const categoryFilter = (rawParams.category as string || 'all');
  const priorityFilter = (rawParams.priority as string || 'all');
  const shiftFilter = (rawParams.shift as string || 'all');

  const [allItems, allBranches, allUsers, allLogs] = await Promise.all([
    getHandoverItems(),
    getBranches(),
    getUsers(),
    getAllActivityLogs(),
  ]);

  const todayStr = new Date().toISOString().split('T')[0];

  const getBranchName = (id: string) => {
    return allBranches.find((b) => b.id === id)?.name || 'Unknown Branch';
  };

  const getBranchCode = (id: string) => {
    return allBranches.find((b) => b.id === id)?.code || 'UNK';
  };

  const getUserName = (id: string) => {
    return allUsers.find((u) => u.id === id)?.name || 'System';
  };

  // Helper to determine if an item is overdue
  const isOverdue = (followUpDate: string | null, status: string) => {
    if (!followUpDate || status === 'Completed') return false;
    return followUpDate < todayStr;
  };

  // 1. Filter items based on user role and selected query params
  const filteredItems = allItems.filter((item) => {
    // Role restrictions: Receptionist and Manager only see their branch
    if (user.role !== 'owner' && item.branchId !== user.branchId) {
      return false;
    }

    // Owner branch filter
    if (user.role === 'owner' && branchFilter && item.branchId !== branchFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'unresolved') {
      if (item.status === 'Completed') return false;
    } else if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
      return false;
    }

    // Shift filter
    if (shiftFilter !== 'all' && item.shiftName !== shiftFilter) {
      return false;
    }

    // Text search (title or details or assignee/author name)
    if (searchQuery) {
      const titleMatch = item.title.toLowerCase().includes(searchQuery);
      const detailsMatch = item.details.toLowerCase().includes(searchQuery);
      const authorMatch = getUserName(item.createdBy).toLowerCase().includes(searchQuery);
      const assigneeMatch = item.assignedTo ? getUserName(item.assignedTo).toLowerCase().includes(searchQuery) : false;
      return titleMatch || detailsMatch || authorMatch || assigneeMatch;
    }

    return true;
  });

  // Calculate metrics for cards (reflecting either the branch restriction or owner global view)
  const accessibleItems = allItems.filter((item) => {
    return user.role === 'owner' || item.branchId === user.branchId;
  });

  const openCount = accessibleItems.filter((i) => i.status === 'Open').length;
  const inProgressCount = accessibleItems.filter((i) => i.status === 'In Progress').length;
  const completedCount = accessibleItems.filter((i) => i.status === 'Completed').length;
  const overdueCount = accessibleItems.filter((i) => isOverdue(i.followUpDate, i.status)).length;
  
  // Category metrics mapping
  const categoriesList = ['Callback', 'Follow-up', 'Cash / payment', 'Complaint', 'Supplies', 'Insurance admin', 'Urgent', 'Other'];
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = accessibleItems.filter((i) => i.category === cat && i.status !== 'Completed').length;
    return acc;
  }, {} as Record<string, number>);

  // Priority metrics mapping
  const priorityCounts = {
    High: accessibleItems.filter((i) => i.priority === 'High' && i.status !== 'Completed').length,
    Medium: accessibleItems.filter((i) => i.priority === 'Medium' && i.status !== 'Completed').length,
    Low: accessibleItems.filter((i) => i.priority === 'Low' && i.status !== 'Completed').length,
  };

  // Recent logs (limit to 7 for display on dashboard)
  const accessibleLogs = allLogs.filter((log) => {
    const item = allItems.find((i) => i.id === (log as { itemId?: string }).itemId || (log as { item_id?: string }).item_id);
    if (!item) return false;
    return user.role === 'owner' || item.branchId === user.branchId;
  }).slice(0, 7);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Callback': return <PhoneCall className="w-4 h-4 text-emerald-600" />;
      case 'Follow-up': return <CalendarRange className="w-4 h-4 text-blue-600" />;
      case 'Cash / payment': return <Wallet className="w-4 h-4 text-amber-600" />;
      case 'Complaint': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Supplies': return <Package className="w-4 h-4 text-indigo-600" />;
      case 'Insurance admin': return <FileCheck2 className="w-4 h-4 text-cyan-600" />;
      case 'Urgent': return <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5 pb-24 lg:pb-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-teal-900 to-slate-955 text-white p-6 sm:p-8 rounded-3xl border border-teal-800/70 shadow-lg">
          {/* Decorative glowing backdrops */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                Welcome back, {user.name}
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              </h2>
              <p className="text-teal-200/80 text-xs sm:text-sm mt-1.5 font-medium">
                {user.role === 'owner'
                  ? 'Overviewing operations across all clinical branches globally.'
                  : `Managing handovers for ${getBranchName(user.branchId || '')} clinic branch.`}
              </p>
            </div>
            <Link
              href="/items/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-teal-950 bg-teal-350 hover:bg-teal-200 hover:scale-[1.02] shadow-md shadow-teal-500/10 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-950 stroke-[3]" />
              <span>Create Handover Item</span>
            </Link>
          </div>
        </div>

        {/* ── ONBOARDING: No branches yet (new clinic) ── */}
        {allBranches.length === 0 && user.role === 'owner' && (
          <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-dashed border-teal-200 rounded-3xl p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Welcome to Tarmim Care Pro!</h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                Your clinic account is set up. To start logging handovers, you need to add at least one clinic branch first.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                Add a clinic branch
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">2</span>
                Invite staff (optional)
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">3</span>
                Create handover logs
              </div>
            </div>
            <Link
              href="/branches/new"
              id="add-first-branch-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md active:scale-[0.98] hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Building2 className="w-4 h-4" />
              Add Your First Branch
            </Link>
          </div>
        )}

        {/* ── EMPTY STATE: Staff with no items in their branch ── */}
        {allBranches.length === 0 && user.role !== 'owner' && (
          <div className="bg-white border border-slate-250 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No branches set up yet</h3>
            <p className="text-sm text-slate-400">Your clinic owner needs to add a branch first. Contact your administrator.</p>
          </div>
        )}

        <MobileFilterBar
          branches={allBranches}
          currentUser={user}
          defaultBranch={branchFilter}
          defaultStatus={statusFilter}
          defaultCategory={categoryFilter}
          defaultPriority={priorityFilter}
          defaultQ={searchQuery}
          categoriesList={categoriesList}
        />

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Overdue Items */}
          <div className={`p-5 rounded-3xl border transition-all duration-200 hover:shadow-sm ${overdueCount > 0 ? 'bg-gradient-to-br from-red-50/70 to-white border-red-250 border-l-4 border-l-red-650' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${overdueCount > 0 ? 'text-red-800' : 'text-slate-500'}`}>Overdue (المتأخرة)</span>
              <AlertCircle className={`w-5 h-5 ${overdueCount > 0 ? 'text-red-650 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight ${overdueCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>{overdueCount}</span>
              <span className="text-[11px] font-semibold text-slate-450">needs action</span>
            </div>
          </div>

          {/* Open Items */}
          <div className="p-5 bg-gradient-to-br from-amber-50/70 to-white border border-amber-250 border-l-4 border-l-amber-500 rounded-3xl shadow-xs transition-all duration-200 hover:shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Open (مفتوحة)</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-amber-700">{openCount}</span>
              <span className="text-[11px] font-semibold text-slate-450">unresolved</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-5 bg-gradient-to-br from-sky-50/70 to-white border border-sky-250 border-l-4 border-l-blue-500 rounded-3xl shadow-xs transition-all duration-200 hover:shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">In Progress (قيد التنفيذ)</span>
              <TrendingUp className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-blue-700">{inProgressCount}</span>
              <span className="text-[11px] font-semibold text-slate-450">active now</span>
            </div>
          </div>

          {/* Completed */}
          <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-250 border-l-4 border-l-emerald-500 rounded-3xl shadow-xs transition-all duration-200 hover:shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Completed (منتهية)</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-700">{completedCount}</span>
              <span className="text-[11px] font-semibold text-slate-450">resolved total</span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: FILTERS & LIST (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SEARCH & FILTER BAR */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <form method="GET" className="space-y-4">
                
                {/* Search Text input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={rawParams.q as string || ''}
                    placeholder="Search handover logs (title, details, author, assignee)..."
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 placeholder:text-slate-400"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* Branch filter (only for owners) */}
                  {user.role === 'owner' ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Branch</label>
                      <select
                        name="branch"
                        defaultValue={branchFilter}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-teal-700"
                      >
                        <option value="">All Branches</option>
                        {allBranches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Branch</label>
                      <input
                        type="text"
                        disabled
                        value={getBranchName(user.branchId || '')}
                        className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-500 font-medium"
                      />
                    </div>
                  )}

                  {/* Status filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={statusFilter}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-teal-700"
                    >
                      <option value="unresolved">Unresolved (Default)</option>
                      <option value="Open">Open Only</option>
                      <option value="In Progress">In Progress Only</option>
                      <option value="Completed">Completed Only</option>
                      <option value="all">All Items</option>
                    </select>
                  </div>

                  {/* Category filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                    <select
                      name="category"
                      defaultValue={categoryFilter}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-teal-700"
                    >
                      <option value="all">All Categories</option>
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Priority</label>
                    <select
                      name="priority"
                      defaultValue={priorityFilter}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-teal-700"
                    >
                      <option value="all">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Submit / Reset row */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <Link 
                    href="/dashboard" 
                    className="text-xs text-slate-500 hover:text-teal-700 font-semibold flex items-center gap-1.5"
                  >
                    Clear All Filters
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.8 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Apply Filters
                  </button>
                </div>

              </form>
            </div>

            {/* HANDOVER ITEMS LIST */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                  Handover Log Entries ({filteredItems.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Sorted by creation date (latest first)</span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="bg-white border border-slate-250 p-12 text-center rounded-2xl shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-450 mb-3">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">No handover items match the filters</h4>
                  <p className="text-xs text-slate-450 mt-1">Try clearing filters or search queries above.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const overdue = isOverdue(item.followUpDate, item.status);
                  return (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className={`block bg-white rounded-2xl border ${overdue ? 'border-red-300 hover:border-red-400 bg-red-50/10' : 'border-slate-200/90 hover:border-slate-350'} hover-lift shadow-xs`}
                    >
                      <div className="p-5 space-y-4">
                        
                        {/* Row 1: Badges and Title */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          
                          {/* Title and Category */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1.5">
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </span>
                            
                            {/* Branch Indicator for Owner */}
                            {user.role === 'owner' && (
                              <span className="text-[10px] font-semibold bg-teal-50 text-teal-900 border border-teal-150 px-2 py-1 rounded-md">
                                {getBranchCode(item.branchId)} Clinic
                              </span>
                            )}

                            {/* Overdue Red Tag */}
                            {overdue && (
                              <span className="text-[10px] font-bold bg-red-100 text-red-750 px-2 py-1 rounded-md border border-red-150 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-red-650" />
                                Overdue (متأخر)
                              </span>
                            )}
                          </div>

                          {/* Status and Priority */}
                          <div className="flex items-center gap-2">
                            {/* Priority tag */}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                              item.priority === 'High' 
                                ? 'bg-red-50 text-red-700 border border-red-100' 
                                : item.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.priority} Priority
                            </span>

                            {/* Status tag */}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                              item.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : item.status === 'In Progress'
                                ? 'bg-sky-50 text-sky-700 border border-sky-150'
                                : 'bg-amber-50 text-amber-600 border border-amber-150'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Headline and Details snippet */}
                        <div>
                          <h4 className="font-bold text-slate-900 text-base tracking-tight leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                            {item.details}
                          </p>
                        </div>

                        {/* Row 3: Meta data footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 text-[11px] text-slate-450 font-medium">
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Created: <strong className="text-slate-650">{getUserName(item.createdBy)}</strong></span>
                            <span>Shift: <strong className="text-slate-650">{item.shiftName}</strong></span>
                            {item.assignedTo && (
                              <span>Assigned to: <strong className="text-slate-650">{getUserName(item.assignedTo)}</strong></span>
                            )}
                            {item.followUpDate && (
                              <span>Follow Up: <strong className={overdue ? 'text-red-650 font-bold' : 'text-slate-650'}>{item.followUpDate}</strong></span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-teal-850 font-semibold hover:text-teal-900 shrink-0">
                            View details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>

                        </div>

                      </div>
                    </Link>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: INSIGHTS & AUDIT TRAIL (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ABOUT PORTAL CARD */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-3xl border border-emerald-700 shadow-md">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
              <h3 className="font-bold text-xs tracking-tight border-b border-white/10 pb-2.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>About Tarmim Care Pro</span>
              </h3>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed mt-2.5">
                Tarmim Care Pro is a secure, multi-tenant shift handover & medical operations registry designed specifically for premier clinical care teams.
              </p>
              <div className="flex flex-wrap gap-2 mt-3.5">
                <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-900/40 px-2.5 py-1.5 rounded-lg border border-emerald-700/60">
                  <span>🇸🇦</span>
                  <span>Saudi Healthcare Support</span>
                </div>
                <div className="text-[10px] text-white font-bold flex items-center gap-1.5 bg-emerald-900/40 px-2.5 py-1.5 rounded-lg border border-emerald-700/60">
                  <span className="w-2 h-2 rounded-full bg-[#d6a827]" />
                  <span>Tarmim Agency Product</span>
                </div>
              </div>
            </div>

            {/* PRIORITY & CATEGORY INSIGHTS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2.5">
                Unresolved Workload (حجم العمل المتبقي)
              </h3>
              
              {/* Priorities breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">By Priority</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                    <span className="block text-[10px] font-bold text-red-800">High</span>
                    <span className="block text-lg font-extrabold text-red-700 mt-1">{priorityCounts.High}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <span className="block text-[10px] font-bold text-amber-800">Medium</span>
                    <span className="block text-lg font-extrabold text-amber-700 mt-1">{priorityCounts.Medium}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-600">Low</span>
                    <span className="block text-lg font-extrabold text-slate-600 mt-1">{priorityCounts.Low}</span>
                  </div>
                </div>
              </div>

              {/* Categories count list */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">By Category (Active Items)</span>
                
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {categoriesList.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-150">
                        <span className="flex items-center gap-2 font-medium">
                          {getCategoryIcon(cat)}
                          {cat}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${count > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-550'}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE AUDIT TRAIL / ACTIVITY LOG */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                  Audit History Log (سجل العمليات)
                </h3>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">Live</span>
              </div>

              <div className="space-y-4.5 max-h-[360px] overflow-y-auto pr-1">
                {accessibleLogs.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6">No activity logged yet.</p>
                ) : (
                  accessibleLogs.map((log) => {
                    const logItemId = (log as { itemId?: string }).itemId || (log as { item_id?: string }).item_id;
                    const item = allItems.find((i) => i.id === logItemId);
                    return (
                      <div key={log.id} className="text-xs space-y-1 border-l-2 border-teal-500 pl-3 relative py-0.5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">{getUserName(log.userId)}</span>
                          <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          {log.details}
                        </p>
                        {item ? (
                          <Link 
                            href={`/items/${item.id}`}
                            className="text-[10px] text-slate-400 hover:text-teal-700 block truncate font-medium mt-0.5"
                          >
                            Item: <span className="underline font-semibold">{item.title}</span>
                          </Link>
                        ) : (
                          <span className="text-[10px] text-slate-400 block font-medium">Deleted item</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Mobile sticky bottom create button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-50 shadow-lg">
        <Link
          href="/items/new"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white min-h-[44px] active:scale-[0.99] transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4.5 h-4.5" />
          New Handover Entry
        </Link>
      </div>
    </div>
  );
}
