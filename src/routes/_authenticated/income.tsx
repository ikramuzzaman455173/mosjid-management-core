import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hint } from "@/components/ui/hint";
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
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { TrendingUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/income")({
  component: IncomePage,
});

type Income = {
  id: string;
  category: string;
  source: string | null;
  amount: number;
  income_date: string | null;
  account_id: string | null;
  notes: string | null;
};

const empty = {
  category: "general",
  source: "",
  amount: 0,
  income_date: new Date().toISOString().slice(0, 10),
  account_id: "",
  notes: "",
};

function IncomePage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("income & expense.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["income"],
    queryFn: async () => {
      const { data, error } = await supabase.from("income").select("*").order("income_date", { ascending: false });
      if (error) throw error;
      return data as Income[];
    },
  });
  const { data: accounts } = useQuery({
    queryKey: ["accounts-all"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("id, name, kind");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, amount: Number(form.amount) || 0 };
      if (!payload.account_id) delete payload.account_id;
      if (editing) {
        const { error } = await supabase.from("income").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("income").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["income"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("income").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["income"] }); },
  });

  const total = (data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const accName = (id: string | null) => accounts?.find((a: any) => a.id === id)?.name ?? "—";

  const columns: Column<Income>[] = [
    { key: "date", header: t("date"), cell: (i) => fmtDate(i.income_date, lang) },
    { key: "cat", header: t("category"), cell: (i) => <span className="font-medium">{i.category}</span> },
    { key: "src", header: lang === "bn" ? "উৎস" : "Source", cell: (i) => i.source ?? "—" },
    { key: "acc", header: t("account"), cell: (i) => accName(i.account_id) },
    { key: "amt", header: t("amount"), className: "text-right", cell: (i) => (
      <span className="font-semibold text-success">{fmtCurrency(Number(i.amount), lang)}</span>
    )},
    { key: "act", header: t("actions"), className: "text-right", cell: (i) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Income & Expense" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => { setEditing(i); setForm({
            category: i.category, source: i.source ?? "", amount: Number(i.amount), income_date: i.income_date ?? "",
            account_id: i.account_id ?? "", notes: i.notes ?? "",
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Income & Expense" action="Delete" fallback={<></>}>
          <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => setDeleteId(i.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button></Hint>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={TrendingUp} title={t("income")} subtitle={`${t("total")}: ${fmtCurrency(total, lang)}`}
        actionLabel={canCreate ? t("new_entry") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["category", "source"]} />
      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("new_entry")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>{t("category")}</Label>
            <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={lang === "bn" ? "যেমন: ভাড়া" : "e.g. Rent"} />
          </div>
          <div>
            <Label>{lang === "bn" ? "উৎস" : "Source"}</Label>
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder={lang === "bn" ? "যেমন: দোকান নং ২" : "e.g. Shop No 2"} />
          </div>
          <div>
            <Label required>{t("amount")} (৳)</Label>
            <Input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="5000" />
          </div>
          <div>
            <Label>{t("date")}</Label>
            <Input type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("account")}</Label>
            <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
              <SelectTrigger><SelectValue placeholder={t("select_option")} /></SelectTrigger>
              <SelectContent>
                {(accounts ?? []).map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.kind})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("notes")}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "যেকোনো মন্তব্য বা বিবরণ..." : "Any comments or details..."} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
