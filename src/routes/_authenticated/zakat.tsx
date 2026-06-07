import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { HandCoins, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";

export const Route = createFileRoute("/_authenticated/zakat")({
  component: ZakatPage,
});

type Donation = {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  kind: string;
  donation_date: string | null;
  receipt_no: string | null;
  notes: string | null;
};

const empty = {
  donor_name: "",
  donor_phone: "",
  amount: 0,
  kind: "zakat",
  donation_date: new Date().toISOString().slice(0, 10),
  receipt_no: "",
  notes: "",
};

function ZakatPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("donations & zakat.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [form, setForm] = useState(empty);
  const [calcOpen, setCalcOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["zakat-donations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donations").select("*").eq("kind", "zakat").order("donation_date", { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, amount: Number(form.amount) || 0 };
      if (editing) {
        const { error } = await supabase.from("donations").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("donations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["zakat-donations"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("donations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["zakat-donations"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const total = (data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);

  const columns: Column<Donation>[] = [
    { key: "date", header: t("date"), cell: (d) => fmtDate(d.donation_date, lang) },
    { key: "donor", header: lang === "bn" ? "দাতা" : "Donor", cell: (d) => (
      <div>
        <div className="font-medium">{d.donor_name}</div>
        <div className="text-xs text-muted-foreground">{d.donor_phone ?? "—"}</div>
      </div>
    )},
    { key: "receipt", header: lang === "bn" ? "রসিদ নং" : "Receipt", cell: (d) => d.receipt_no ?? "—" },
    { key: "amt", header: t("amount"), className: "text-right", cell: (d) => (
      <span className="font-semibold text-success">{fmtCurrency(Number(d.amount), lang)}</span>
    )},
    { key: "act", header: t("actions"), className: "text-right", cell: (d) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Donations & Zakat" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => { setEditing(d); setForm({
            donor_name: d.donor_name, donor_phone: d.donor_phone ?? "", amount: Number(d.amount), kind: d.kind,
            donation_date: d.donation_date ?? "", receipt_no: d.receipt_no ?? "", notes: d.notes ?? "",
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Donations & Zakat" action="Delete" fallback={<></>}>
          <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => setDeleteId(d.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button></Hint>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={HandCoins}
        title={lang === "bn" ? "যাকাত" : "Zakat"}
        subtitle={`${t("total")} ${lang === "bn" ? "সংগ্রহ" : "Collection"}: ${fmtCurrency(total, lang)}`}
        actionLabel={canCreate ? (lang === "bn" ? "নতুন যাকাত এন্ট্রি" : "New Zakat Entry") : undefined}
        onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-primary mb-1">{lang === "bn" ? "যাকাত ক্যালকুলেটর" : "Zakat Calculator"}</h3>
          <p className="text-xs text-muted-foreground mb-3">{lang === "bn" ? "সহজেই যাকাতের পরিমাণ হিসাব করুন।" : "Easily calculate zakat amount."}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setCalcOpen(true)}>
            {lang === "bn" ? "ক্যালকুলেটর খুলুন" : "Open Calculator"}
          </Button>
        </Card>
      </div>

      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["donor_name", "donor_phone", "receipt_no"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : (lang === "bn" ? "নতুন যাকাত" : "New Zakat")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label required>{lang === "bn" ? "দাতার নাম" : "Donor name"}</Label>
            <Input required value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} placeholder={lang === "bn" ? "যেমন: আব্দুর রহমান" : "e.g. Abdur Rahman"} />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input value={form.donor_phone} onChange={(e) => setForm({ ...form, donor_phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <Label required>{t("amount")} (৳)</Label>
            <Input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="5000" />
          </div>
          <div>
            <Label>{t("date")}</Label>
            <DatePicker  value={form.donation_date} onChange={(v) => setForm({ ...form, donation_date: v })} />
          </div>
          <div>
            <Label>{lang === "bn" ? "রসিদ নং" : "Receipt No"}</Label>
            <Input value={form.receipt_no} onChange={(e) => setForm({ ...form, receipt_no: e.target.value })} placeholder={lang === "bn" ? "রসিদ নং (ঐচ্ছিক)" : "Receipt No (optional)"} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("notes")}</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "যেকোনো মন্তব্য বা বিবরণ..." : "Any comments or details..."} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />

      <ZakatCalculator 
        open={calcOpen} 
        onOpenChange={setCalcOpen} 
        onApplyZakat={(amount) => {
          setEditing(null);
          setForm({ ...empty, amount });
          setOpen(true);
        }} 
      />
    </div>
  );
}
