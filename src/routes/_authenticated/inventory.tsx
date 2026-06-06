import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, fmtDate, toBnNum } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inventory")({ component: InventoryPage });

type Item = { id: string; name: string; category: string; unit: string; current_stock: number; min_stock: number; unit_price: number | null; notes: string | null };

const empty = { name: "", category: "general", unit: "pcs", current_stock: 0, min_stock: 0, unit_price: 0, notes: "" };

function InventoryPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState(empty);
  const [stockOn, setStockOn] = useState<{ item: Item; kind: "in" | "out" } | null>(null);
  const [historyOn, setHistoryOn] = useState<Item | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => { const { data, error } = await supabase.from("inventory_items").select("*").order("name"); if (error) throw error; return data as Item[]; },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, current_stock: Number(form.current_stock) || 0, min_stock: Number(form.min_stock) || 0, unit_price: Number(form.unit_price) || 0 };
      if (editing) { const { error } = await supabase.from("inventory_items").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await supabase.from("inventory_items").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["inventory_items"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("inventory_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["inventory_items"] }); },
  });

  const columns: Column<Item>[] = [
    { key: "name", header: t("name"), cell: (i) => <div className="font-medium">{i.name}</div> },
    { key: "cat", header: t("category"), cell: (i) => <Badge variant="outline">{i.category}</Badge> },
    { key: "stock", header: t("current_stock"), cell: (i) => {
      const low = Number(i.current_stock) <= Number(i.min_stock);
      return <span className={low ? "text-destructive font-semibold" : "font-medium"}>{toBnNum(i.current_stock, lang)} {i.unit}{low && <Badge className="ml-2 bg-destructive/15 text-destructive">{t("low_stock")}</Badge>}</span>;
    }},
    { key: "min", header: t("min_stock"), cell: (i) => `${toBnNum(i.min_stock, lang)} ${i.unit}` },
    { key: "price", header: t("amount"), cell: (i) => fmtCurrency(Number(i.unit_price ?? 0), lang) },
    { key: "act", header: t("actions"), className: "text-right", cell: (i) => (
      <div className="flex gap-1 justify-end">
        <Button size="icon" variant="ghost" title={t("stock_in")} onClick={() => setStockOn({ item: i, kind: "in" })}><ArrowDownToLine className="w-4 h-4 text-success" /></Button>
        <Button size="icon" variant="ghost" title={t("stock_out")} onClick={() => setStockOn({ item: i, kind: "out" })}><ArrowUpFromLine className="w-4 h-4 text-destructive" /></Button>
        <Button size="icon" variant="ghost" title={t("transactions")} onClick={() => setHistoryOn(i)}><History className="w-4 h-4 text-primary" /></Button>
        <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setForm({ name: i.name, category: i.category, unit: i.unit, current_stock: Number(i.current_stock), min_stock: Number(i.min_stock), unit_price: Number(i.unit_price ?? 0), notes: i.notes ?? "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" onClick={() => setDeleteId(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Package} title={t("inventory")} subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি আইটেম" : "items"}`} actionLabel={t("add")} onAction={() => { setEditing(null); setForm(empty); setOpen(true); }} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["name", "category"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>{t("name")} *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "bn" ? "যেমন: জায়নামাজ" : "e.g. Prayer Mat"} /></div>
          <div><Label>{t("category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={lang === "bn" ? "যেমন: কার্পেট" : "e.g. Carpet"} /></div>
          <div><Label>{t("unit")}</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="box">box</SelectItem>
                <SelectItem value="pack">pack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!editing && <div><Label>{t("current_stock")}</Label><Input type="number" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })} placeholder="10" /></div>}
          <div><Label>{t("min_stock")}</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} placeholder="5" /></div>
          <div className={editing ? "col-span-2" : ""}><Label>{lang === "bn" ? "একক মূল্য" : "Unit price"}</Label><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })} placeholder="1200" /></div>
          <div className="col-span-2"><Label>{t("notes")}</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />

      {stockOn && <StockTxnDialog item={stockOn.item} kind={stockOn.kind} onClose={() => setStockOn(null)} />}
      {historyOn && <HistoryDialog item={historyOn} onClose={() => setHistoryOn(null)} />}
    </div>
  );
}

function StockTxnDialog({ item, kind, onClose }: { item: Item; kind: "in" | "out"; onClose: () => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = useMutation({
    mutationFn: async () => {
      if (qty <= 0) throw new Error(lang === "bn" ? "সঠিক পরিমাণ দিন" : "Enter valid quantity");
      if (kind === "out" && Number(item.current_stock) < qty) throw new Error(lang === "bn" ? "স্টক যথেষ্ট নয়" : "Insufficient stock");
      const { error } = await supabase.from("stock_transactions").insert({ item_id: item.id, kind, quantity: qty, reason, txn_date: date } as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["inventory_items"] }); qc.invalidateQueries({ queryKey: ["stock_txn", item.id] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{kind === "in" ? t("stock_in") : t("stock_out")} — {item.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("current_stock")}: <strong>{toBnNum(item.current_stock, lang)} {item.unit}</strong></p>
          <div><Label>{t("quantity")} *</Label><Input type="number" min="0" step="0.01" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="5" /></div>
          <div><Label>{t("date")}</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>{t("reason")}</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={lang === "bn" ? "যেমন: নষ্ট হয়ে গেছে" : "e.g. Damaged"} /></div>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending} className="w-full">{t("save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { data } = useQuery({
    queryKey: ["stock_txn", item.id],
    queryFn: async () => { const { data, error } = await supabase.from("stock_transactions").select("*").eq("item_id", item.id).order("txn_date", { ascending: false }).limit(100); if (error) throw error; return data; },
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t("transactions")} — {item.name}</DialogTitle></DialogHeader>
        <div className="space-y-1">
          {data?.length ? data.map((tx: any) => (
            <div key={tx.id} className="flex items-center gap-2 p-2 border rounded-md text-sm">
              <Badge className={tx.kind === "in" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}>{tx.kind === "in" ? t("stock_in") : t("stock_out")}</Badge>
              <div className="flex-1">
                <div className="font-medium">{toBnNum(tx.quantity, lang)} {item.unit}</div>
                {tx.reason && <div className="text-xs text-muted-foreground">{tx.reason}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{fmtDate(tx.txn_date, lang)}</div>
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">{t("no_data")}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
