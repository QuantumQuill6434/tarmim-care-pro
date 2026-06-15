import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getBranches, getUsers } from '@/lib/db';
import Header from '@/components/Header';
import CreateItemForm from './CreateItemForm';

export const dynamic = 'force-dynamic';

export default async function NewItemPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [branches, users] = await Promise.all([getBranches(), getUsers()]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
      <Header />
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <CreateItemForm 
          currentUser={user} 
          branches={branches} 
          users={users} 
        />
      </main>
    </div>
  );
}
