import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
import { Gift, Pencil, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { PrintableReceipt, type ReceiptData } from "@/components/printable-receipt";

export const Route = createFileRoute("/_authenticated/donations")({
  component: DonationsPage,
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
  kind: "general",
  donation_date: new Date().toISOString().slice(0, 10),
  receipt_no: "",
  notes: "",
};

function DonationsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [form, setForm] = useState(empty);

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<ReceiptData | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Donation_Receipt",
  });

  const triggerPrint = (data: ReceiptData) => {
    setPrintData(data);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donations").select("*").order("donation_date", { ascending: false });
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
      qc.invalidateQueries({ queryKey: ["donations"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("donations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["donations"] }); },
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
    { key: "kind", header: t("category"), cell: (d) => <Badge variant="outline">{d.kind}</Badge> },
    { key: "receipt", header: lang === "bn" ? "রসিদ নং" : "Receipt", cell: (d) => d.receipt_no ?? "—" },
    { key: "amt", header: t("amount"), className: "text-right", cell: (d) => (
      <span className="font-semibold text-success">{fmtCurrency(Number(d.amount), lang)}</span>
    )},
    { key: "act", header: t("actions"), className: "text-right", cell: (d) => (
      <div className="flex gap-1 justify-end">
        <Button size="icon" variant="outline" className="text-primary border-primary hover:bg-primary/10" onClick={() => {
          triggerPrint({
            id: d.id,
            type: "donation",
            date: d.donation_date ?? new Date().toISOString().slice(0, 10),
            amount: Number(d.amount),
            name: d.donor_name,
            phone: d.donor_phone ?? undefined,
            details: d.notes ?? `Donation for ${d.kind}`,
          });
        }}>
          <Printer className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => { setEditing(d); setForm({
          donor_name: d.donor_name, donor_phone: d.donor_phone ?? "", amount: Number(d.amount), kind: d.kind,
          donation_date: d.donation_date ?? "", receipt_no: d.receipt_no ?? "", notes: d.notes ?? "",
        }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" onClick={() => setDeleteId(d.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Gift}
        title={t("donations")}
        subtitle={`${t("total")}: ${fmtCurrency(total, lang)}`}
        actionLabel={t("receive_donation")}
        onAction={() => { setEditing(null); setForm(empty); setOpen(true); }}
      />

      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["donor_name", "donor_phone", "receipt_no"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("receive_donation")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>{lang === "bn" ? "দাতার নাম" : "Donor name"} *</Label>
            <Input required value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} placeholder={lang === "bn" ? "যেমন: আব্দুর রহমান" : "e.g. Abdur Rahman"} />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input value={form.donor_phone} onChange={(e) => setForm({ ...form, donor_phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <Label>{t("amount")} (৳) *</Label>
            <Input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="5000" />
          </div>
          <div>
            <Label>{t("category")}</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="zakat">Zakat</SelectItem>
                <SelectItem value="sadaqah">Sadaqah</SelectItem>
                <SelectItem value="fitra">Fitra</SelectItem>
                <SelectItem value="qurbani">Qurbani</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("date")}</Label>
            <Input type="date" value={form.donation_date} onChange={(e) => setForm({ ...form, donation_date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>{lang === "bn" ? "রসিদ নং" : "Receipt No"}</Label>
            <Input value={form.receipt_no} onChange={(e) => setForm({ ...form, receipt_no: e.target.value })} placeholder={lang === "bn" ? "রসিদ নং (ঐচ্ছিক)" : "Receipt No (optional)"} />
          </div>
          <div className="col-span-2">
            <Label>{t("notes")}</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "যেকোনো মন্তব্য বা বিবরণ..." : "Any comments or details..."} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
      
      {/* Hidden Print Area */}
      <div className="hidden">
        {printData && <PrintableReceipt ref={printRef} data={printData} />}
      </div>
    </div>
  );
}
