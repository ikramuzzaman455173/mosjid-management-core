import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/mobile-banking")({
  component: MBPage,
});

function MBPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("bank & mobile banking.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bank_name: "bKash", account_no: "", opening_balance: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", "mobile_banking"],
    queryFn: async () => (await supabase.from("accounts").select("*").eq("kind", "mobile_banking").order("name")).data ?? [],
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, kind: "mobile_banking", current_balance: Number(form.opening_balance) || 0, opening_balance: Number(form.opening_balance) || 0 };
      if (editing) {
        const { error } = await supabase.from("accounts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["accounts", "mobile_banking"] }); setOpen(false); setForm({ name: "", bank_name: "bKash", account_no: "", opening_balance: 0 }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("accounts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["accounts", "mobile_banking"] }); },
  });

  const total = (data ?? []).reduce((s: number, a: any) => s + Number(a.current_balance || 0), 0);
  const columns: Column<any>[] = [
    { key: "name", header: t("name"), cell: (a) => <span className="font-medium">{a.name}</span> },
    { key: "prov", header: lang === "bn" ? "প্রোভাইডার" : "Provider", cell: (a) => a.bank_name ?? "—" },
    { key: "no", header: lang === "bn" ? "নম্বর" : "Number", cell: (a) => a.account_no ?? "—" },
    { key: "bal", header: t("balance"), className: "text-right", cell: (a) => <span className="font-bold text-primary">{fmtCurrency(Number(a.current_balance ?? 0), lang)}</span> },
    { key: "act", header: t("actions"), className: "text-right", cell: (a) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Bank & Mobile Banking" action="Edit" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setForm({ name: a.name, bank_name: a.bank_name ?? "", account_no: a.account_no ?? "", opening_balance: Number(a.opening_balance ?? 0) }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        </PermissionGuard>
        <PermissionGuard module="Bank & Mobile Banking" action="Delete" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Smartphone} title={t("mobile_banking")} subtitle={`${t("total")}: ${fmtCurrency(total, lang)}`} actionLabel={canCreate ? t("add") : undefined} onAction={canCreate ? () => { setEditing(null); setForm({ name: "", bank_name: "bKash", account_no: "", opening_balance: 0 }); setOpen(true); } : undefined} />
      <DataTable data={data as any[]} columns={columns} loading={isLoading} searchKeys={["name", "bank_name", "account_no"]} />
      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="space-y-4">
          <div><Label required>{t("name")}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="bKash - Personal" /></div>
          <div><Label>{lang === "bn" ? "প্রোভাইডার" : "Provider"}</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="bKash / Nagad / Rocket" /></div>
          <div><Label>{lang === "bn" ? "নম্বর" : "Number"}</Label><Input value={form.account_no} onChange={(e) => setForm({ ...form, account_no: e.target.value })} placeholder="01XXXXXXXXX" /></div>
          <div><Label>{lang === "bn" ? "ওপেনিং ব্যালেন্স" : "Opening Balance"} (৳)</Label><Input type="number" min="0" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: Number(e.target.value) })} placeholder="0" /></div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
