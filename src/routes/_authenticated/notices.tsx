import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/notices")({
  component: NoticesPage,
});

type Notice = {
  id: string;
  title: string;
  content: string | null;
  kind: string | null;
  notice_date: string | null;
  published: boolean | null;
};

const empty = {
  title: "",
  content: "",
  kind: "general",
  notice_date: new Date().toISOString().slice(0, 10),
  published: true,
};

function NoticesPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("notices.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("notice_date", { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form };
      if (editing) {
        const { error } = await supabase.from("notices").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["notices"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["notices"] }); },
  });

  const columns: Column<Notice>[] = [
    { key: "date", header: t("date"), cell: (n) => fmtDate(n.notice_date, lang) },
    { key: "title", header: t("title"), cell: (n) => (
      <div>
        <div className="font-medium">{n.title}</div>
        {n.content && <div className="text-xs text-muted-foreground truncate max-w-md">{n.content}</div>}
      </div>
    )},
    { key: "kind", header: t("type"), cell: (n) => <Badge variant="outline">{n.kind ?? "—"}</Badge> },
    { key: "pub", header: t("status"), cell: (n) => (
      <Badge className={n.published ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
        {n.published ? (lang === "bn" ? "প্রকাশিত" : "Published") : (lang === "bn" ? "খসড়া" : "Draft")}
      </Badge>
    )},
    { key: "act", header: t("actions"), className: "text-right", cell: (n) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Notices" action="Edit" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => { setEditing(n); setForm({
            title: n.title, content: n.content ?? "", kind: n.kind ?? "general",
            notice_date: n.notice_date ?? "", published: n.published ?? true,
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        </PermissionGuard>
        <PermissionGuard module="Notices" action="Delete" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => setDeleteId(n.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Bell} title={t("notices")} subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি নোটিশ" : "notices"}`}
        actionLabel={canCreate ? t("add") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["title", "content"]} />
      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label required>{t("title")}</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={lang === "bn" ? "যেমন: জুমার নামাজের সময়সূচি" : "e.g. Jummah Prayer Time"} />
          </div>
          <div>
            <Label>{t("type")}</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("date")}</Label>
            <Input type="date" value={form.notice_date} onChange={(e) => setForm({ ...form, notice_date: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("description")}</Label>
            <Textarea required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={lang === "bn" ? "নোটিশের বিস্তারিত লিখুন..." : "Enter notice details..."} />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            <Label>{lang === "bn" ? "প্রকাশ করুন" : "Publish"}</Label>
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
