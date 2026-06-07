import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, toBnNum } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_type: string | null;
  event_date: string;
};

const empty = {
  title: "",
  description: "",
  location: "",
  event_type: "general",
  event_date: new Date().toISOString().slice(0, 16),
};

function EventsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("events.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data as EventRow[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, event_date: new Date(form.event_date).toISOString() };
      if (editing) {
        const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["events"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["events"] }); },
  });

  const fmtDt = (d: string) => {
    const dt = new Date(d);
    const date = dt.toISOString().slice(0, 10);
    const time = dt.toTimeString().slice(0, 5);
    return `${toBnNum(date, lang)} ${toBnNum(time, lang)}`;
  };

  const columns: Column<EventRow>[] = [
    { key: "date", header: t("date"), cell: (e) => <span className="text-xs">{fmtDt(e.event_date)}</span> },
    { key: "title", header: t("title"), cell: (e) => (
      <div>
        <div className="font-medium">{e.title}</div>
        {e.description && <div className="text-xs text-muted-foreground truncate max-w-md">{e.description}</div>}
      </div>
    )},
    { key: "loc", header: lang === "bn" ? "স্থান" : "Location", cell: (e) => e.location ? (
      <span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" /> {e.location}</span>
    ) : "—" },
    { key: "type", header: t("type"), cell: (e) => e.event_type ?? "—" },
    { key: "act", header: t("actions"), className: "text-right", cell: (e) => (
      <div className="flex gap-1 justify-end">
        <PermissionGuard module="Events" action="Edit" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => { setEditing(e); setForm({
            title: e.title, description: e.description ?? "", location: e.location ?? "",
            event_type: e.event_type ?? "general", event_date: e.event_date.slice(0, 16),
          }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
        </PermissionGuard>
        <PermissionGuard module="Events" action="Delete" fallback={<></>}>
          <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Calendar} title={t("events")} subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি ইভেন্ট" : "events"}`}
        actionLabel={canCreate ? t("add") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["title", "location"]} />
      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label required>{t("title")}</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={lang === "bn" ? "যেমন: মিলাদ মাহফিল" : "e.g. Milad Mahfil"} />
          </div>
          <div>
            <Label>{t("date")} & {lang === "bn" ? "সময়" : "Time"}</Label>
            <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div>
            <Label>{t("type")}</Label>
            <Input value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{lang === "bn" ? "স্থান" : "Location"}</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("description")}</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
    </div>
  );
}
