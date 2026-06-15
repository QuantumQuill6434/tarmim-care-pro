export type UserRole = 'receptionist' | 'manager' | 'owner';

export interface User {
  id: string;           // UUID from Supabase Auth
  email: string;
  name: string;
  role: UserRole;
  clinic_id: string;    // Which clinic this user belongs to
  branchId: string | null; // null for owners, non-null for receptionists/managers
  username?: string;    // kept for backwards compatibility display
}

export interface Clinic {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Branch {
  id: string;
  clinic_id: string;
  name: string;
  code: string;
  location: string;
}

export type HandoverCategory =
  | 'Callback'
  | 'Follow-up'
  | 'Cash / payment'
  | 'Complaint'
  | 'Supplies'
  | 'Insurance admin'
  | 'Urgent'
  | 'Other';

export type HandoverPriority = 'Low' | 'Medium' | 'High';

export type HandoverStatus = 'Open' | 'In Progress' | 'Completed';

export interface HandoverItem {
  id: string;
  title: string;
  details: string;
  category: HandoverCategory;
  priority: HandoverPriority;
  status: HandoverStatus;
  branchId: string;      // maps to branch_id in DB
  createdBy: string;     // maps to created_by in DB
  assignedTo: string | null;  // maps to assigned_to in DB
  shiftName: string;     // maps to shift_name in DB
  followUpDate: string | null; // maps to follow_up_date in DB
  createdAt: string;     // maps to created_at in DB
  updatedAt: string;     // maps to updated_at in DB
  completedAt: string | null;  // maps to completed_at in DB
  completedBy: string | null;  // maps to completed_by in DB
  clinic_id?: string;    // automatically set via RLS
}

export interface ItemComment {
  id: string;
  itemId: string;        // maps to item_id in DB
  userId: string;        // maps to user_id in DB
  content: string;
  createdAt: string;     // maps to created_at in DB
}

export interface ItemActivityLog {
  id: string;
  itemId: string;        // maps to item_id in DB
  userId: string;        // maps to user_id in DB
  action: 'created' | 'status_changed' | 'comment_added' | 'assigned' | 'details_updated';
  details: string;
  createdAt: string;     // maps to created_at in DB
}

export interface DatabaseSchema {
  users: User[];
  branches: Branch[];
  handoverItems: HandoverItem[];
  itemComments: ItemComment[];
  itemActivityLogs: ItemActivityLog[];
}
