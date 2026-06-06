import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Receipt, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: ExpensesPage,
});

type Expense = {
  id: string;
  category: string;
  vendor: string | null;
  amount: number;
  expense_date: string | null;
  account_id: string | null;
  bill_no: string | null;
  approved: boolean | null;
  notes: string | null;
};

const empty = {
  category: "utility",
  vendor: "",
  amount: 0,
  expense_date: new Date().toISOString().slice(0, 10),
  account_id: "",
  bill_no: "",
  notes: "",
};

function ExpensesPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("income & expense.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });
  const { data: accounts } = useQuery({
    queryKey: ["accounts-all"],
    queryFn: async () => (await supabase.from("accounts").select("id, name, kind")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, amount: Number(form.amount) || 0 };
      if (!payload.account_id) delete payload.account_id;
      if (editing) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["expenses"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["expenses"] }); },
  });

  const total = (data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const accName = (id: string | null) => accounts?.find((a: any) => a.id === id)?.name ?? "—";

  const columns: Column<Expense>[] = [
    { key: "date", header: t("date"), cell: (e) => fmtDate(e.expense_date, lang) },
    { key: "cat", header: t("category"), cell: (e) => <span className="font-medium">{e.category}</span> },
    { key: "vendor", header: lang === "bn" ? "বিক্রেতা" : "Vendor", cell: (e) => e.vendor ?? "—" },
    { key: "bill", header: lang === "bn" ? "বিল নং" : "Bill No", cell: (e) => e.bill_no ?? "—" },
    { key: "acc", header: t("account"), cell: (e) => accName(e.account_id) },
    { key: "status", header: t("status"), cell: (e) => (
      <Badge className={e.approved ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
        {e.approved ? (lang === "bn" ? "অনুমোদিত" : "Approved") : (lang === "bn" ? "অপেক্ষমাণ" : "Pending")}
      </Badge>
    )},
    { key: "amt", header: t("amount"), className: "text-right", cell: (e) => (
      <span className="font-semibold text-destructive">{fmtCurrency(Number(e.amount), lang)}</span>
    )},
    { key: "act", header: t("actions"), className: "text-right", cell: (e) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Income & Expense" action="Edit" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => { setEditing(e); setForm({
            category: e.category ? e.category.toLowerCase() : "utility", vendor: e.vendor ?? "", amount: Number(e.amount), expense_date: e.expense_date ?? "",
            account_id: e.account_id ?? "", bill_no: e.bill_no ?? "", notes: e.notes ?? "",
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        </PermissionGuard>
        <PermissionGuard module="Income & Expense" action="Delete" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Receipt} title={t("expenses")} subtitle={`${t("total")}: ${fmtCurrency(total, lang)}`}
        actionLabel={canCreate ? t("expense_entry") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["category", "vendor", "bill_no"]} />
      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("expense_entry")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("category")} *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="utility">{lang === "bn" ? "ইউটিলিটি" : "Utility"}</SelectItem>
                <SelectItem value="salary">{lang === "bn" ? "বেতন" : "Salary"}</SelectItem>
                <SelectItem value="maintenance">{lang === "bn" ? "মেরামত" : "Maintenance"}</SelectItem>
                <SelectItem value="construction">{lang === "bn" ? "নির্মাণ" : "Construction"}</SelectItem>
                <SelectItem value="supplies">{lang === "bn" ? "সরবরাহ" : "Supplies"}</SelectItem>
                <SelectItem value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{lang === "bn" ? "বিক্রেতা" : "Vendor"}</Label>
            <Input required value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder={lang === "bn" ? "যেমন: জননী স্টোর" : "e.g. Janani Store"} />
          </div>
          <div>
            <Label>{t("amount")} (৳) *</Label>
            <Input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="1500" />
          </div>
          <div>
            <Label>{t("date")}</Label>
            <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
          </div>
          <div>
            <Label>{lang === "bn" ? "বিল নং" : "Bill No"}</Label>
            <Input required value={form.bill_no} onChange={(e) => setForm({ ...form, bill_no: e.target.value })} placeholder={lang === "bn" ? "যেমন: বিল-২০২৪-০১" : "e.g. BILL-2024-01"} />
          </div>
          <div>
            <Label>{t("account")}</Label>
            <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
              <SelectTrigger><SelectValue placeholder={t("select_option")} /></SelectTrigger>
              <SelectContent>
                {(accounts ?? []).map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.kind})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>{t("notes")}</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "যেকোনো মন্তব্য বা বিবরণ..." : "Any comments or details..."} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
