import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { QurbaniAnimalCosts } from "@/components/qurbani-animal-costs";
import { QurbaniShareManagement } from "@/components/qurbani-share-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Beef, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Hint } from "@/components/ui/hint";

export const Route = createFileRoute("/_authenticated/qurbani")({
  component: QurbaniPage,
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
  kind: "qurbani",
  donation_date: new Date().toISOString().slice(0, 10),
  receipt_no: "",
  notes: "",
};

function QurbaniPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("qurbani.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [form, setForm] = useState(empty);
  
  const [costsOpen, setCostsOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["qurbani-donations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donations").select("*").eq("kind", "qurbani").order("donation_date", { ascending: false });
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
      qc.invalidateQueries({ queryKey: ["qurbani-donations"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("donations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["qurbani-donations"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const total = (data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);

  const columns: Column<Donation>[] = [
    { key: "date", header: t("date"), cell: (d) => fmtDate(d.donation_date, lang) },
    { key: "donor", header: lang === "bn" ? "দাতা / অংশীদার" : "Donor / Shareholder", cell: (d) => (
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
        <PermissionGuard module="Qurbani" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => { setEditing(d); setForm({
            donor_name: d.donor_name, donor_phone: d.donor_phone ?? "", amount: Number(d.amount), kind: d.kind,
            donation_date: d.donation_date ?? "", receipt_no: d.receipt_no ?? "", notes: d.notes ?? "",
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Qurbani" action="Delete" fallback={<></>}>
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
        icon={Beef}
        title={lang === "bn" ? "কুরবানি" : "Qurbani"}
        subtitle={`${t("total")} ${lang === "bn" ? "সংগ্রহ" : "Collection"}: ${fmtCurrency(total, lang)}`}
        actionLabel={canCreate ? (lang === "bn" ? "নতুন কুরবানি এন্ট্রি" : "New Qurbani Entry") : undefined}
        onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-primary mb-1">{lang === "bn" ? "ভাগ (Share) ম্যানেজমেন্ট" : "Share Management"}</h3>
          <p className="text-xs text-muted-foreground mb-3">{lang === "bn" ? "পশুর ভাগের হিসাব ও বণ্টন।" : "Animal share calculation and distribution."}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setSharesOpen(true)}>
            {lang === "bn" ? "ম্যানেজ করুন" : "Manage Shares"}
          </Button>
        </Card>
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <h3 className="font-semibold text-destructive mb-1">{lang === "bn" ? "পশু ক্রয় ও খরচ" : "Animal Purchase & Costs"}</h3>
          <p className="text-xs text-muted-foreground mb-3">{lang === "bn" ? "কুরবানির পশু ক্রয় এবং অন্যান্য খরচ ট্র্যাকিং।" : "Tracking animal purchases and other expenses."}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setCostsOpen(true)}>
            {lang === "bn" ? "ম্যানেজ করুন" : "Manage Costs"}
          </Button>
        </Card>
      </div>

      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["donor_name", "donor_phone", "receipt_no"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : (lang === "bn" ? "নতুন কুরবানি এন্ট্রি" : "New Qurbani Entry")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label required>{lang === "bn" ? "দাতা / অংশীদারের নাম" : "Donor / Shareholder name"}</Label>
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
            <Input type="date" value={form.donation_date} onChange={(e) => setForm({ ...form, donation_date: e.target.value })} />
          </div>
          <div>
            <Label>{lang === "bn" ? "রসিদ নং" : "Receipt No"}</Label>
            <Input value={form.receipt_no} onChange={(e) => setForm({ ...form, receipt_no: e.target.value })} placeholder={lang === "bn" ? "রসিদ নং (ঐচ্ছিক)" : "Receipt No (optional)"} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("notes")}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "যেকোনো মন্তব্য বা বিবরণ..." : "Any comments or details..."} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />

      <QurbaniAnimalCosts open={costsOpen} onOpenChange={setCostsOpen} />
      <QurbaniShareManagement open={sharesOpen} onOpenChange={setSharesOpen} />
    </div>
  );
}
