# Tarmim Care Pro — Clinical Shift Handover Portal 🇸🇦

> A premium, multi-tenant administrative portal designed for clinical care teams in Saudi Arabia to streamline shift handovers and secure operational continuity.

---

## 🎯 Purpose and Scope
**Tarmim Care Pro** is built for clinic owners, managers, and receptionists to coordinate tasks across shifts. This includes tracking pending callbacks, insurance follow-ups, payment notes, and clinical supply statuses.

### 🚫 Strict Product Boundaries
* **No EMR/Medical Records**: No clinical chart details, diagnostics, or patient treatment plans are stored.
* **No Claims Adjudication**: Does not process financial insurance transactions directly.
* **Strictly Administrative**: Focuses entirely on administrative log handovers to secure patient care continuity.

---

## 💻 Tech Stack
* **Framework**: Next.js 16 (App Router + Server Actions)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (Saudi Green & White branding: `#007A3D` & `#FFFFFF`)
* **Icons**: Lucide React
* **Database**: Supabase PostgreSQL (Fully normalized schema)
* **Security**: Row-Level Security (RLS) policies scoped using custom `SECURITY DEFINER` SQL helper functions.
* **Route Protection**: Next.js native `proxy.ts` integration.

---

## 📁 Folder Structure
The codebase uses a clean, standard Next.js directory layout:
```text
/
├── public/                     # Static assets (logo.png)
├── src/
│   ├── proxy.ts                # Next.js global route guard (redirects unauthenticated users)
│   ├── app/
│   │   ├── actions.ts          # Server Actions (auth, CRUD, invites, comments)
│   │   ├── globals.css         # Tailwind directives & Saudi Green design variables
│   │   ├── layout.tsx          # Root template HTML structure
│   │   ├── loading.tsx         # Premium logo-pulsing loading spinner animation
│   │   ├── page.tsx            # Entrypoint routing redirect
│   │   ├── login/
│   │   ├── signup/             # Onboarding page with query parameter auto-provisoning
│   │   ├── dashboard/          # Dashboard panel (stats, list view, branch drawers)
│   │   ├── settings/           # Control Center (clinic profile, branches, staff invites)
│   │   └── items/
│   │       ├── new/            # Handover logger form
│   │       └── [id]/           # Handover details, status controls & activity logs
│   ├── components/
│   │   └── Header.tsx          # Branded header with role metadata & branch tags
│   └── lib/
│       ├── auth.ts             # Auth session extraction wrappers
│       ├── db-types.ts         # TypeScript mappings for database tables
│       ├── db.ts               # Database CRUD logic layer
│       └── supabase/           # SSR Supabase client & server initializers
├── supabase_schema.sql         # Master database DDL schema dump
├── supabase_rls_fix.sql        # Security definer RLS fixes and triggers
├── package.json
└── tsconfig.json
```

---

## 🔒 Security & Row-Level Security (RLS)
Data isolation is guaranteed through database policies:
* **Strict Tenant Isolation**: All tables have Row-Level Security (RLS) enabled. Rows are filtered dynamically using `public.get_my_clinic_id()`.
* **Zero Cross-Tenant Leaks**: A receptionist from Clinic A cannot view data from Clinic B under any circumstances.
* **Branch Isolation**: Receptionists and managers are locked into their assigned branch, while owners have global dashboard views.

---

## ⚡ Deployment & Environment Variables
Tarmim Care Pro is ready to be deployed on hosts like **Vercel** with the following environment variables configured:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-secure-service-role-key-here
```
