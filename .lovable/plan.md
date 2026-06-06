# Meetings, Committee, Assets/Inventory, Audit Logs — Full Implementation

## 1. Database Schema (new migration)

### Meetings
- `meetings` — title, meeting_date, location, agenda (text), kind (general/emergency/annual), status (scheduled/completed/cancelled), minutes (text)
- `meeting_documents` — meeting_id, file_url, file_name, uploaded_by
- `meeting_attendance` — meeting_id, member_id, status (present/absent/late), remarks

### Committee
- `committees` — name, tenure_start, tenure_end, status (active/expired), description
- `committee_members` — committee_id, member_id, position (president/vice_president/secretary/treasurer/member), joined_at
- `resolutions` — committee_id, meeting_id (nullable), title, content, resolution_date, status (proposed/passed/rejected)
- `resolution_votes` — resolution_id, member_id, vote (yes/no/abstain)

### Assets / Inventory
- `assets` — name, category, purchase_date, purchase_price, current_value, condition (good/fair/poor), location, photo_url, notes
- `inventory_items` — name, category, unit (pcs/kg/litre), current_stock, min_stock, unit_price
- `stock_transactions` — item_id, kind (in/out), quantity, reason, txn_date, created_by

### Audit Logs
- `audit_logs` — actor_user_id, actor_email, action (insert/update/delete/login/logout), entity (table name), entity_id, changes (jsonb), ip, user_agent, created_at
- Auto-populated via DB triggers on key tables (members, donations, expenses, income, subscriptions)

### Storage
- bucket `mosque-files` (private) — meeting docs, asset photos, inventory images

All tables: RLS enabled, `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated`, admin-managed via `is_admin(auth.uid())`, view by `true`.

## 2. UI Pages

### `/meetings`
- List table with date/title/status/attendance count
- Add/Edit dialog: title, date, location, kind, agenda, status
- Detail panel/dialog with 3 tabs: Agenda+Minutes | Documents (upload + list) | Attendance (member list with present/absent/late toggles + bulk-mark-present)

### `/committee`
- List of committees with tenure & status badge
- Add/Edit committee dialog
- Detail view: Members tab (assign existing members with position dropdown) + Resolutions tab (CRUD resolutions, record yes/no/abstain votes per member, show tally)

### `/assets`
- List table with category filter, search
- Add/Edit dialog with photo upload (storage bucket)
- KPI: total assets, total value

### `/inventory`
- List table with low-stock highlight (current_stock ≤ min_stock)
- Add/Edit item dialog
- "Stock In" / "Stock Out" action per row → dialog logs transaction + updates current_stock
- Transaction history panel

### `/audit-logs`
- Filters: search box (entity, actor email), action dropdown, role dropdown (uses user_roles join), date range
- Server-side pagination (page size 25)
- Export buttons: CSV (client-side from current results) + PDF (jspdf + autotable)
- Read-only — no add/edit

## 3. Shared Building Blocks (additions)
- `src/components/file-upload.tsx` — single-file upload wrapper around Supabase Storage with preview
- `src/hooks/use-storage.ts` — upload/delete helpers for `mosque-files` bucket
- `src/lib/export.ts` — `exportCsv(rows, filename)` + `exportPdf(title, columns, rows, filename)` using `jspdf` + `jspdf-autotable`
- New i18n keys (meeting, committee, asset, stock, audit terminology — ~40 keys × 2 languages)

## 4. Dependencies
- `jspdf` + `jspdf-autotable` for PDF export

## 5. Execution Order
1. Migration (tables + triggers + storage policies)
2. Create storage bucket `mosque-files` (private)
3. Install jspdf
4. Shared blocks (file-upload, use-storage, export.ts, i18n)
5. Meetings page (full)
6. Committee page (full)
7. Assets page
8. Inventory page
9. Audit Logs page

## Notes
- Audit log triggers will record `auth.uid()` automatically; UI can't write to audit_logs directly (no INSERT policy for authenticated, only service_role).
- Attendance & votes use composite unique constraints (meeting_id+member_id, resolution_id+member_id) so upsert works for toggling.
- File uploads stored under `{module}/{record_id}/{filename}` paths in the bucket.

Approve করলে start করব।
