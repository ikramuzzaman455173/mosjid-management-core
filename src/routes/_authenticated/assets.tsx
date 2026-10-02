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
import { FileUpload } from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/assets")({ component: AssetsPage });

type Asset = { id: string; name: string; category: string; purchase_date: string | null; purchase_price: number | null; current_value: number | null; condition: string; location: string | null; photo_url: string | null; notes: string | null };

const empty = { name: "", category: "general", purchase_date: "", purchase_price: 0, current_value: 0, condition: "good", location: "", photo_url: "", notes: "" };

function AssetsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("assets.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => { const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as Asset[]; },
  });

  const totalValue = (data ?? []).reduce((s, a) => s + Number(a.current_value ?? 0), 0);
  const totalPurchase = (data ?? []).reduce((s, a) => s + Number(a.purchase_price ?? 0), 0);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, purchase_date: form.purchase_date || null, purchase_price: Number(form.purchase_price) || 0, current_value: Number(form.current_value) || 0 };
      if (editing) { const { error } = await supabase.from("assets").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await supabase.from("assets").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["assets"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("assets").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["assets"] }); },
  });

  const condBadge = (c: string) => {
    if (c === "good") return <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium shadow-none">Good</Badge>;
    if (c === "fair") return <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium shadow-none">Fair</Badge>;
    if (c === "poor") return <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-medium shadow-none">Poor</Badge>;
    return <Badge variant="outline">{c}</Badge>;
  };

  const columns: Column<Asset>[] = [
    { key: "name", header: t("name"), cell: (a) => (
      <div className="flex items-center gap-2">
        {a.photo_url ? <img src={a.photo_url} alt="" className="w-9 h-9 rounded object-cover" /> : <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><Building2 className="w-4 h-4 text-muted-foreground" /></div>}
        <div>
          <div className="font-medium">{a.name}</div>
          {a.location && <div className="text-xs text-muted-foreground">{a.location}</div>}
        </div>
      </div>
    )},
    { key: "cat", header: t("category"), cell: (a) => <Badge variant="outline">{a.category}</Badge> },
    { key: "cond", header: t("condition"), cell: (a) => condBadge(a.condition) },
    { key: "pp", header: t("purchase_price"), cell: (a) => fmtCurrency(Number(a.purchase_price ?? 0), lang) },
    { key: "cv", header: t("current_value"), cell: (a) => <span className="font-medium text-primary">{fmtCurrency(Number(a.current_value ?? 0), lang)}</span> },
    { key: "act", header: t("actions"), className: "text-right", cell: (a) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Assets" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => { setEditing(a); setForm({ name: a.name, category: a.category, purchase_date: a.purchase_date ?? "", purchase_price: Number(a.purchase_price ?? 0), current_value: Number(a.current_value ?? 0), condition: a.condition, location: a.location ?? "", photo_url: a.photo_url ?? "", notes: a.notes ?? "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Assets" action="Delete" fallback={<></>}>
          <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></Hint>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Building2} title={t("assets")} subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি সম্পদ" : "assets"}`} actionLabel={canCreate ? t("add") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">{lang === "bn" ? "মোট সম্পদ" : "Total assets"}</p><p className="text-2xl font-bold text-primary">{data?.length ?? 0}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">{t("purchase_price")}</p><p className="text-2xl font-bold">{fmtCurrency(totalPurchase, lang)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">{t("current_value")}</p><p className="text-2xl font-bold text-gold">{fmtCurrency(totalValue, lang)}</p></Card>
      </div>

      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["name", "category", "location"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2"><Label required>{t("name")}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "bn" ? "যেমন: মাইক সেট / জেনারেটর" : "e.g. Sound System / Generator"} /></div>
          <div><Label>{t("category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={lang === "bn" ? "যেমন: ইলেকট্রনিক্স / আসবাবপত্র" : "e.g. Electronics / Furniture"} /></div>
          <div><Label>{t("location")}</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={lang === "bn" ? "যেমন: নিচতলা স্টোররুম" : "e.g. Ground Floor Store"} /></div>
          <div><Label>{t("purchase_date")}</Label><DatePicker  value={form.purchase_date} onChange={(v) => setForm({ ...form, purchase_date: v })} /></div>
          <div><Label>{t("condition")}</Label>
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
              <SelectTrigger><SelectValue placeholder={lang === "bn" ? "অবস্থা নির্বাচন করুন" : "Select condition"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t("purchase_price")}</Label><Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} placeholder="15000" /></div>
          <div><Label>{t("current_value")}</Label><Input type="number" step="0.01" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: Number(e.target.value) })} placeholder="12000" /></div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("photo")}</Label>
            {form.photo_url && <img src={form.photo_url} alt="" className="w-24 h-24 rounded object-cover mb-2" />}
            <FileUpload folder="assets" accept="image/*" onUploaded={(i) => setForm({ ...form, photo_url: i.url })} />
          </div>
          <div className="col-span-1 md:col-span-2"><Label>{t("notes")}</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "bn" ? "সম্পদ সংক্রান্ত কোনো বিবরণ বা মন্তব্য..." : "Asset notes or remarks..."} /></div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
