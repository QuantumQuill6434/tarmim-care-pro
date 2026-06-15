/**
 * db.ts — Supabase database layer with proper snake_case → camelCase mapping.
 * Supabase returns snake_case columns; our TypeScript types use camelCase.
 * All mapper functions handle the conversion.
 */

import { createClient } from '@/lib/supabase/server';
import {
  User,
  UserRole,
  Branch,
  HandoverItem,
  HandoverCategory,
  HandoverPriority,
  HandoverStatus,
  ItemComment,
  ItemActivityLog,
  Clinic,
} from './db-types';

// ─── Row Mappers (snake_case DB → camelCase TypeScript) ───────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    clinic_id: row.clinic_id,
    branchId: row.branch_id ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBranch(row: any): Branch {
  return {
    id: row.id,
    clinic_id: row.clinic_id,
    name: row.name,
    code: row.code,
    location: row.location ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHandoverItem(row: any): HandoverItem {
  return {
    id: row.id,
    title: row.title,
    details: row.details ?? '',
    category: row.category as HandoverCategory,
    priority: row.priority as HandoverPriority,
    status: row.status as HandoverStatus,
    branchId: row.branch_id,
    createdBy: row.created_by,
    assignedTo: row.assigned_to ?? null,
    shiftName: row.shift_name,
    followUpDate: row.follow_up_date ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? null,
    completedBy: row.completed_by ?? null,
    clinic_id: row.clinic_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(row: any): ItemComment {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapActivityLog(row: any): ItemActivityLog {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    action: row.action as ItemActivityLog['action'],
    details: row.details ?? '',
    createdAt: row.created_at,
  };
}

export async function getClinic(): Promise<Clinic | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from('profiles').select('clinic_id').eq('id', authUser.id).single();
  if (!profile?.clinic_id) return null;

  const { data, error } = await supabase
    .from('clinics').select('*').eq('id', profile.clinic_id).single();

  if (error || !data) {
    console.error('getClinic error:', error?.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    owner_id: data.owner_id || '',
    created_at: data.created_at || '',
  };
}

export async function updateClinicName(name: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return false;

  const { data: profile } = await supabase
    .from('profiles').select('clinic_id').eq('id', authUser.id).single();
  if (!profile?.clinic_id) return false;

  const { error } = await supabase
    .from('clinics').update({ name }).eq('id', profile.clinic_id);

  if (error) {
    console.error('updateClinicName error:', error.message);
    return false;
  }
  return true;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) { console.error('getUsers error:', error.message); return []; }
  return (data ?? []).map(mapUser);
}

export async function findUserById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', id).single();
  if (error) return null;
  return mapUser(data);
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('branches').select('*').order('name');
  if (error) { console.error('getBranches error:', error.message); return []; }
  return (data ?? []).map(mapBranch);
}

export async function createBranch(
  branch: { name: string; code: string; location: string }
): Promise<Branch | null> {
  const supabase = await createClient();

  // Get clinic_id from authenticated user's profile
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from('profiles').select('clinic_id').eq('id', authUser.id).single();
  if (!profile?.clinic_id) return null;

  const { data, error } = await supabase
    .from('branches')
    .insert({ ...branch, clinic_id: profile.clinic_id })
    .select().single();

  if (error) { console.error('createBranch error:', error.message); return null; }
  return mapBranch(data);
}

// ─── Handover Items ───────────────────────────────────────────────────────────

export async function getHandoverItems(): Promise<HandoverItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('handover_items').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getHandoverItems error:', error.message); return []; }
  return (data ?? []).map(mapHandoverItem);
}

export async function getHandoverItemById(id: string): Promise<HandoverItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('handover_items').select('*').eq('id', id).single();
  if (error) return null;
  return mapHandoverItem(data);
}

export async function createHandoverItem(
  item: Omit<HandoverItem, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'completedBy'>
): Promise<HandoverItem> {
  const supabase = await createClient();

  // First get the clinic_id from the current user's profile
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles').select('clinic_id').eq('id', authUser.id).single();
  if (!profile) throw new Error('Profile not found');

  const { data, error } = await supabase
    .from('handover_items')
    .insert({
      title: item.title,
      details: item.details,
      category: item.category,
      priority: item.priority,
      status: item.status,
      branch_id: item.branchId,
      clinic_id: profile.clinic_id,
      created_by: item.createdBy,
      assigned_to: item.assignedTo,
      shift_name: item.shiftName,
      follow_up_date: item.followUpDate,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('createHandoverItem error:', error?.message);
    throw new Error('Failed to create handover item');
  }

  // Log activity
  await supabase.from('item_activity_logs').insert({
    item_id: data.id,
    user_id: item.createdBy,
    action: 'created',
    details: 'Created handover item',
  });

  return mapHandoverItem(data);
}

export async function updateHandoverItem(
  id: string,
  updates: Partial<Omit<HandoverItem, 'id' | 'createdAt' | 'createdBy'>>,
  actorUserId: string
): Promise<HandoverItem | null> {
  const supabase = await createClient();

  const { data: oldRow } = await supabase
    .from('handover_items').select('*').eq('id', id).single();
  if (!oldRow) return null;

  const nowStr = new Date().toISOString();
  const dbUpdates: Record<string, unknown> = { updated_at: nowStr };
  const logs: Array<{ item_id: string; user_id: string; action: string; details: string }> = [];

  if (updates.status !== undefined && updates.status !== oldRow.status) {
    dbUpdates.status = updates.status;
    if (updates.status === 'Completed') {
      dbUpdates.completed_at = nowStr;
      dbUpdates.completed_by = actorUserId;
      logs.push({ item_id: id, user_id: actorUserId, action: 'status_changed', details: 'Marked item as Completed' });
    } else if (oldRow.status === 'Completed') {
      dbUpdates.completed_at = null;
      dbUpdates.completed_by = null;
      logs.push({ item_id: id, user_id: actorUserId, action: 'status_changed', details: `Changed status to ${updates.status}` });
    } else {
      logs.push({ item_id: id, user_id: actorUserId, action: 'status_changed', details: `Changed status to ${updates.status}` });
    }
  }

  if (updates.assignedTo !== undefined) {
    dbUpdates.assigned_to = updates.assignedTo;
    if (updates.assignedTo !== oldRow.assigned_to) {
      const { data: assignedUser } = await supabase
        .from('profiles').select('name').eq('id', updates.assignedTo ?? '').single();
      logs.push({
        item_id: id, user_id: actorUserId, action: 'assigned',
        details: `Assigned to ${assignedUser?.name ?? 'Unassigned'}`,
      });
    }
  }

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.details !== undefined) dbUpdates.details = updates.details;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

  const { data: updatedRow, error } = await supabase
    .from('handover_items').update(dbUpdates).eq('id', id).select().single();

  if (error) { console.error('updateHandoverItem error:', error.message); return null; }

  if (logs.length > 0) {
    await supabase.from('item_activity_logs').insert(logs);
  }

  return mapHandoverItem(updatedRow);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getItemComments(itemId: string): Promise<ItemComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('item_comments').select('*').eq('item_id', itemId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getItemComments error:', error.message); return []; }
  return (data ?? []).map(mapComment);
}

export async function addComment(
  itemId: string, userId: string, content: string
): Promise<ItemComment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('item_comments')
    .insert({ item_id: itemId, user_id: userId, content })
    .select().single();

  if (error || !data) {
    console.error('addComment error:', error?.message);
    throw new Error('Failed to add comment');
  }

  await supabase.from('item_activity_logs').insert({
    item_id: itemId, user_id: userId, action: 'comment_added', details: 'Added a comment',
  });

  await supabase
    .from('handover_items').update({ updated_at: new Date().toISOString() }).eq('id', itemId);

  return mapComment(data);
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function getItemActivityLogs(itemId: string): Promise<ItemActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('item_activity_logs').select('*').eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getItemActivityLogs error:', error.message); return []; }
  return (data ?? []).map(mapActivityLog);
}

export async function getAllActivityLogs(): Promise<ItemActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('item_activity_logs').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getAllActivityLogs error:', error.message); return []; }
  return (data ?? []).map(mapActivityLog);
}

export async function deleteHandoverItem(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('handover_items')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('deleteHandoverItem error:', error.message);
    return false;
  }
  return true;
}

export async function deleteBranch(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('deleteBranch error:', error.message);
    return false;
  }
  return true;
}

// ─── Legacy stub (keeps old callers from crashing) ───────────────────────────
export function findUserByUsername(_username: string) {
  console.warn('findUserByUsername is deprecated — use Supabase Auth email login.');
  return undefined;
}
