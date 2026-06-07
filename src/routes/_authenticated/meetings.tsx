import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { FileUpload } from "@/components/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users2, Pencil, Trash2, ExternalLink, FileText, Check, X, Clock, Printer } from "lucide-react";
import { toast } from "sonner";
import { deleteFile } from "@/lib/storage";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Hint } from "@/components/ui/hint";

export const Route = createFileRoute("/_authenticated/meetings")({ component: MeetingsPage });

type Meeting = { id: string; title: string; meeting_date: string; location: string | null; kind: string; meeting_type: string | null; status: string; agenda: string | null; minutes: string | null };

const empty = { title: "", meeting_date: new Date().toISOString().slice(0, 16), location: "", kind: "general", meeting_type: "local", status: "scheduled", agenda: "", minutes: "" };

function MeetingsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("meetings.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState(empty);
  const [detail, setDetail] = useState<Meeting | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as unknown as Meeting[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form };
      if (editing) {
        const { error } = await supabase.from("meetings").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meetings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["meetings"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("meetings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("deleted")); qc.invalidateQueries({ queryKey: ["meetings"] }); },
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { scheduled: "bg-primary/15 text-primary", completed: "bg-success/15 text-success", cancelled: "bg-destructive/15 text-destructive" };
    return <Badge className={map[s] ?? ""}>{t(s as any)}</Badge>;
  };

  const columns: Column<Meeting>[] = [
    { key: "date", header: t("date"), cell: (m) => fmtDate(m.meeting_date, lang) },
    { key: "title", header: t("title"), cell: (m) => (
      <div>
        <div className="font-medium">{m.title}</div>
        {m.location && <div className="text-xs text-muted-foreground">{m.location}</div>}
      </div>
    )},
    { key: "kind", header: t("type"), cell: (m) => <Badge variant="outline">{m.kind}</Badge> },
    { key: "meeting_type", header: lang === "bn" ? "মাধ্যম" : "Mode", cell: (m) => <Badge variant="secondary">{m.meeting_type === 'online' ? (lang === 'bn' ? 'অনলাইন' : 'Online') : (lang === 'bn' ? 'লোকাল' : 'Local')}</Badge> },
    { key: "status", header: t("status"), cell: (m) => statusBadge(m.status) },
    { key: "act", header: t("actions"), className: "text-right", cell: (m) => (
      <div className="flex gap-1 justify-end">
        <Hint label={t("view_details")}><Button size="icon" variant="ghost" onClick={() => setDetail(m)}><ExternalLink className="w-4 h-4 text-primary" /></Button></Hint>
        <PermissionGuard module="Meetings" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => { setEditing(m); setForm({ title: m.title, meeting_date: m.meeting_date.slice(0,16), location: m.location ?? "", kind: m.kind, meeting_type: m.meeting_type ?? "local", status: m.status, agenda: m.agenda ?? "", minutes: m.minutes ?? "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Meetings" action="Delete" fallback={<></>}>
          <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => setDeleteId(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></Hint>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader icon={Users2} title={t("meetings")} subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি সভা" : "meetings"}`} actionLabel={canCreate ? t("add") : undefined} onAction={canCreate ? () => { setEditing(null); setForm(empty); setOpen(true); } : undefined} />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["title", "location"]} />

      <CrudDialog open={open} onOpenChange={setOpen} title={editing ? t("edit") : t("add")} onSubmit={() => save.mutate()} saving={save.isPending}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2"><Label required>{t("title")}</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={lang === "bn" ? "যেমন: মাসিক সাধারণ সভা" : "e.g. Monthly General Meeting"} /></div>
          <div><Label required>{t("date")}</Label><Input type="datetime-local" required value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} /></div>
          <div><Label>{lang === "bn" ? "মাধ্যম" : "Mode"}</Label>
            <Select value={form.meeting_type} onValueChange={(v) => setForm({ ...form, meeting_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="local">{lang === "bn" ? "লোকাল" : "Local"}</SelectItem>
                <SelectItem value="online">{lang === "bn" ? "অনলাইন" : "Online"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{form.meeting_type === 'online' ? (lang === 'bn' ? 'মিটিং লিঙ্ক' : 'Meeting Link') : t("location")}</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={form.meeting_type === 'online' ? "https://zoom.us/..." : (lang === "bn" ? "যেমন: মসজিদ প্রাঙ্গণ" : "e.g. Mosque Premises")} /></div>
          <div><Label>{t("type")}</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="committee">Committee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t("status")}</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">{t("scheduled")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 md:col-span-2"><Label>{t("agenda")}</Label><Textarea rows={3} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
          <div className="col-span-1 md:col-span-2"><Label>{t("notes")}</Label><Textarea rows={2} value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} placeholder={lang === "bn" ? "সভার আলোচ্য বিষয় বা সিদ্ধান্ত..." : "Meeting agenda or decisions..."} /></div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />

      {detail && <MeetingDetailDialog meeting={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function MeetingDetailDialog({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Meeting_Minutes_${meeting.title.replace(/\s+/g, '_')}`,
  });

  const { data: docs } = useQuery({
    queryKey: ["meeting_documents", meeting.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("meeting_documents").select("*").eq("meeting_id", meeting.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members-list"],
    queryFn: async () => { const { data } = await supabase.from("members").select("id, full_name, member_code").order("full_name"); return data ?? []; },
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance", meeting.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("meeting_attendance").select("*").eq("meeting_id", meeting.id);
      if (error) throw error;
      return data;
    },
  });

  const addDoc = useMutation({
    mutationFn: async (info: { path: string; url: string; name: string }) => {
      const { error } = await supabase.from("meeting_documents").insert({ meeting_id: meeting.id, file_url: info.url, file_name: info.name } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting_documents", meeting.id] }),
  });

  const delDoc = useMutation({
    mutationFn: async (d: any) => {
      await supabase.from("meeting_documents").delete().eq("id", d.id);
      if (d.file_url) { try { const u = new URL(d.file_url); const i = u.pathname.indexOf("/mosque-files/"); if (i >= 0) await deleteFile(u.pathname.slice(i + "/mosque-files/".length)); } catch {} }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting_documents", meeting.id] }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ member_id, status }: { member_id: string; status: "present" | "absent" | "late" }) => {
      const { error } = await supabase.from("meeting_attendance").upsert({ meeting_id: meeting.id, member_id, status } as any, { onConflict: "meeting_id,member_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance", meeting.id] }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      if (!members?.length) return;
      const rows = members.map((m) => ({ meeting_id: meeting.id, member_id: m.id, status: "present" as const }));
      const { error } = await supabase.from("meeting_attendance").upsert(rows as any, { onConflict: "meeting_id,member_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["attendance", meeting.id] }); },
  });

  const statusOf = (mid: string) => attendance?.find((a) => a.member_id === mid)?.status as string | undefined;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between pr-8">
          <div>
            <DialogTitle className="text-primary">{meeting.title}</DialogTitle>
            <p className="text-xs text-muted-foreground">{fmtDate(meeting.meeting_date, lang)} • {meeting.meeting_type === 'online' ? 'Online' : 'Local'} • {meeting.location ?? "—"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePrint()} className="text-primary border-primary">
            <Printer className="w-4 h-4 mr-2" />
            {lang === "bn" ? "প্রিন্ট মিনিটস" : "Print Minutes"}
          </Button>
        </DialogHeader>
        <Tabs defaultValue="agenda">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agenda">{t("agenda")}</TabsTrigger>
            <TabsTrigger value="docs">{t("documents")}</TabsTrigger>
            <TabsTrigger value="att">{t("attendance")}</TabsTrigger>
          </TabsList>
          <TabsContent value="agenda" className="space-y-4 pt-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">{t("agenda")}</h4>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{meeting.agenda || "—"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{t("minutes_label")}</h4>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{meeting.minutes || "—"}</p>
            </div>
          </TabsContent>
          <TabsContent value="docs" className="space-y-4 pt-3">
            <FileUpload folder={`meetings/${meeting.id}`} onUploaded={(i) => addDoc.mutate(i)} />
            <div className="space-y-1">
              {docs?.length ? docs.map((d: any) => (
                <div key={d.id} className="flex items-center gap-2 p-2 border rounded-md text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:underline">{d.file_name}</a>
                  <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => delDoc.mutate(d)}><Trash2 className="w-4 h-4 text-destructive" /></Button></Hint>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">{t("no_data")}</p>}
            </div>
          </TabsContent>
          <TabsContent value="att" className="space-y-4 pt-3">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => markAll.mutate()}>{t("mark_all_present")}</Button>
            </div>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {members?.length ? members.map((m: any) => {
                const st = statusOf(m.id);
                return (
                  <div key={m.id} className="flex items-center gap-2 p-2 border rounded-md text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{m.full_name}</div>
                      {m.member_code && <div className="text-xs text-muted-foreground">{m.member_code}</div>}
                    </div>
                    <Hint label={lang === "bn" ? "উপস্থিত" : "Present"} side="top">
                      <Button size="sm" variant={st === "present" ? "default" : "outline"} className={st === "present" ? "bg-success hover:bg-success/90" : ""} onClick={() => setStatus.mutate({ member_id: m.id, status: "present" })}><Check className="w-3 h-3" /></Button>
                    </Hint>
                    <Hint label={lang === "bn" ? "বিলম্ব" : "Late"} side="top">
                      <Button size="sm" variant={st === "late" ? "default" : "outline"} className={st === "late" ? "bg-gold hover:bg-gold/90 text-primary" : ""} onClick={() => setStatus.mutate({ member_id: m.id, status: "late" })}><Clock className="w-3 h-3" /></Button>
                    </Hint>
                    <Hint label={lang === "bn" ? "অনুপস্থিত" : "Absent"} side="top">
                      <Button size="sm" variant={st === "absent" ? "default" : "outline"} className={st === "absent" ? "bg-destructive hover:bg-destructive/90" : ""} onClick={() => setStatus.mutate({ member_id: m.id, status: "absent" })}><X className="w-3 h-3" /></Button>
                    </Hint>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground text-center py-4">{t("no_data")}</p>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden Printable Minutes */}
        <div className="hidden">
          <div ref={printRef} className="p-10 bg-white text-black font-sans">
            <div className="text-center border-b-2 border-primary pb-4 mb-6">
              <h1 className="text-2xl font-bold text-primary mb-1">
                {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Jame Mosque"}
              </h1>
              <p className="text-sm text-gray-600">
                {lang === "bn" ? "মাইজঘোনা দক্ষিণ নতুন পাড়া, বাংলাদেশ" : "Maizghona Dakkhin Natun Para"}
              </p>
              <h2 className="text-xl font-semibold mt-4">
                {lang === "bn" ? "সভার কার্যবিবরণী (Minutes)" : "Meeting Minutes"}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
              <div><span className="font-bold text-gray-500">{lang === "bn" ? "সভার শিরোনাম:" : "Title:"}</span> {meeting.title}</div>
              <div><span className="font-bold text-gray-500">{lang === "bn" ? "তারিখ ও সময়:" : "Date & Time:"}</span> {fmtDate(meeting.meeting_date, lang)}</div>
              <div><span className="font-bold text-gray-500">{lang === "bn" ? "স্থান:" : "Location:"}</span> {meeting.location || "—"}</div>
              <div><span className="font-bold text-gray-500">{lang === "bn" ? "সভার ধরন:" : "Meeting Type:"}</span> {meeting.kind.toUpperCase()}</div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold border-b pb-1 mb-3">{lang === "bn" ? "আলোচ্য বিষয় (Agenda)" : "Agenda"}</h3>
              <p className="text-sm whitespace-pre-wrap">{meeting.agenda || "—"}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold border-b pb-1 mb-3">{lang === "bn" ? "সিদ্ধান্তসমূহ (Decisions / Minutes)" : "Decisions / Minutes"}</h3>
              <p className="text-sm whitespace-pre-wrap">{meeting.minutes || "—"}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold border-b pb-1 mb-3">{lang === "bn" ? "উপস্থিত সদস্যবৃন্দ" : "Attendees"}</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {members?.filter(m => statusOf(m.id) === "present" || statusOf(m.id) === "late").map((m: any, i) => (
                  <div key={m.id} className="flex justify-between border-b border-gray-100 pb-1">
                    <span>{i + 1}. {m.full_name}</span>
                    <span className="text-gray-400 text-xs">{statusOf(m.id) === "late" ? "(Late)" : ""}</span>
                  </div>
                ))}
                {members?.filter(m => statusOf(m.id) === "present" || statusOf(m.id) === "late").length === 0 && (
                  <div className="text-gray-500 italic">{lang === "bn" ? "উপস্থিতি রেকর্ড করা হয়নি" : "No attendance recorded"}</div>
                )}
              </div>
            </div>

            <div className="mt-20 pt-10 flex justify-between px-10">
              <div className="text-center border-t border-gray-400 w-40 pt-2 text-sm font-semibold">
                {lang === "bn" ? "সভাপতির স্বাক্ষর" : "President"}
              </div>
              <div className="text-center border-t border-gray-400 w-40 pt-2 text-sm font-semibold">
                {lang === "bn" ? "সাধারণ সম্পাদকের স্বাক্ষর" : "General Secretary"}
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
