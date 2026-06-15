'use server';

import { login, logout, getCurrentUser, signUp } from '@/lib/auth';
import {
  createHandoverItem,
  updateHandoverItem,
  addComment,
  getHandoverItemById,
  createBranch,
  deleteHandoverItem,
  updateClinicName,
  deleteBranch,
} from '@/lib/db';
import { HandoverCategory, HandoverPriority, HandoverStatus } from '@/lib/db-types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Auth Actions ─────────────────────────────────────────────────────────────

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password' };
  }

  const result = await login(email, password);

  if (result.success) {
    redirect('/dashboard');
  } else {
    return { error: result.error || 'Authentication failed' };
  }
}

export async function signUpAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  const clinicId = formData.get('clinicId') as string;
  const role = formData.get('role') as string;
  const branchId = formData.get('branchId') as string;

  const isStaffInvite = !!clinicId;

  if (isStaffInvite) {
    if (!email || !password || !name) {
      return { error: 'Please fill in all fields' };
    }
  } else {
    const clinicName = formData.get('clinicName') as string;
    if (!email || !password || !name || !clinicName) {
      return { error: 'Please fill in all fields' };
    }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  let result;
  if (isStaffInvite) {
    result = await signUp(email, password, name, undefined, {
      clinicId,
      role: role || 'receptionist',
      branchId: branchId || null,
    });
  } else {
    const clinicName = formData.get('clinicName') as string;
    result = await signUp(email, password, name, clinicName);
  }

  if (result.success) {
    return {
      success: true,
      message: 'Account created! Please check your email to verify your account, then log in.',
    };
  } else {
    return { error: result.error || 'Sign up failed' };
  }
}

export async function logoutAction() {
  await logout();
  redirect('/login');
}

// ─── Item Actions ─────────────────────────────────────────────────────────────

export async function createItemAction(data: {
  title: string;
  details: string;
  category: HandoverCategory;
  priority: HandoverPriority;
  branchId: string;
  shiftName: string;
  assignedTo: string | null;
  followUpDate: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Receptionists/managers can only create items for their own branch
  if (user.role !== 'owner' && user.branchId !== data.branchId) {
    throw new Error('Unauthorized to create items for another branch');
  }

  const newItem = await createHandoverItem({
    title: data.title,
    details: data.details,
    category: data.category,
    priority: data.priority,
    status: 'Open',
    branchId: data.branchId,
    createdBy: user.id,
    assignedTo: data.assignedTo || null,
    shiftName: data.shiftName,
    followUpDate: data.followUpDate || null,
  });

  revalidatePath('/dashboard');
  revalidatePath(`/items/${newItem.id}`);
  return { success: true, itemId: newItem.id };
}

export async function updateItemStatusAction(itemId: string, status: HandoverStatus) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbItem = await getHandoverItemById(itemId);
  if (!dbItem) {
    throw new Error('Item not found');
  }

  if (user.role !== 'owner' && user.branchId !== dbItem.branchId) {
    throw new Error('Unauthorized to update this item');
  }

  await updateHandoverItem(itemId, { status }, user.id);

  revalidatePath('/dashboard');
  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

export async function updateItemAssigneeAction(itemId: string, assignedTo: string | null) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbItem = await getHandoverItemById(itemId);
  if (!dbItem) {
    throw new Error('Item not found');
  }

  if (user.role !== 'owner' && user.branchId !== dbItem.branchId) {
    throw new Error('Unauthorized to assign this item');
  }

  await updateHandoverItem(itemId, { assignedTo }, user.id);

  revalidatePath('/dashboard');
  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

export async function addCommentAction(itemId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbItem = await getHandoverItemById(itemId);
  if (!dbItem) {
    throw new Error('Item not found');
  }

  if (user.role !== 'owner' && user.branchId !== dbItem.branchId) {
    throw new Error('Unauthorized to add comments to this item');
  }

  if (!content.trim()) {
    return { error: 'Comment content cannot be empty' };
  }

  await addComment(itemId, user.id, content.trim());

  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

// ─── Branch Actions ───────────────────────────────────────────────────────────

export async function createBranchAction(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };
  if (user.role !== 'owner') return { error: 'Only clinic owners can add branches' };

  const name = (formData.get('name') as string)?.trim();
  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const location = (formData.get('location') as string)?.trim() || '';

  if (!name) return { error: 'Branch name is required' };
  if (!code) return { error: 'Branch code is required' };

  const branch = await createBranch({ name, code, location });
  if (!branch) return { error: 'Failed to create branch. Please try again.' };

  revalidatePath('/dashboard');
  revalidatePath('/branches');

  return { success: true, branchName: name };
}

export async function deleteItemAction(itemId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbItem = await getHandoverItemById(itemId);
  if (!dbItem) {
    throw new Error('Item not found');
  }

  if (user.role !== 'owner' && user.branchId !== dbItem.branchId) {
    throw new Error('Unauthorized to delete this item');
  }

  if (user.role !== 'owner' && user.role !== 'manager' && user.id !== dbItem.createdBy) {
    throw new Error('Unauthorized to delete this item. Only owners, managers, or the creator can delete.');
  }

  const success = await deleteHandoverItem(itemId);
  if (!success) {
    throw new Error('Failed to delete item');
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateClinicNameAction(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };
  if (user.role !== 'owner') return { error: 'Only clinic owners can rename the clinic' };

  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Clinic name cannot be empty' };

  const success = await updateClinicName(name);
  if (!success) return { error: 'Failed to update clinic name' };

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true, message: 'Clinic name updated successfully' };
}

export async function deleteBranchAction(branchId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  if (user.role !== 'owner') throw new Error('Only clinic owners can delete branches');

  const success = await deleteBranch(branchId);
  if (!success) throw new Error('Failed to delete branch');

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}
