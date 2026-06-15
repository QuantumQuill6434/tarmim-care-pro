import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  getHandoverItemById,
  getBranches,
  getUsers,
  getItemComments,
  getItemActivityLogs
} from '@/lib/db';
import Header from '@/components/Header';
import ItemDetailsClient from './ItemDetailsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Find item directly by ID (no need to load all items)
  const item = await getHandoverItemById(id);
  if (!item) {
    notFound();
  }

  // Authorization check: Receptionists/Managers can only view their own branch items
  if (user.role !== 'owner' && item.branchId !== user.branchId) {
    redirect('/dashboard?error=unauthorized');
  }

  const [branches, users, comments, activityLogs] = await Promise.all([
    getBranches(),
    getUsers(),
    getItemComments(id),
    getItemActivityLogs(id),
  ]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <ItemDetailsClient
          item={item}
          comments={comments}
          activityLogs={activityLogs}
          branches={branches}
          users={users}
          currentUser={user}
        />
      </main>
    </div>
  );
}
