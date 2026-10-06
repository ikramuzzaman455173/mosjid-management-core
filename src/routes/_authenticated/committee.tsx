import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hint } from "@/components/ui/hint";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/committee")({ component: CommitteePage });

type Committee = {
  id: string;
  name: string;
  tenure_start: string;
  tenure_end: string | null;
  status: string;
  description: string | null;
};

const POSITIONS = [
  "president",
  "vice_president",
  "secretary",
  "joint_secretary",
  "treasurer",
  "member",
] as const;

const empty = {
  name: "",
  tenure_start: new Date().toISOString().slice(0, 10),
  tenure_end: "",
  status: "active",
  description: "",
};

function CommitteePage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("committee.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState(empty);
  const [detail, setDetail] = useState<Committee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["committees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committees")
        .select("*")
        .order("tenure_start", { ascending: false });
      if (error) throw error;
      return data as Committee[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, tenure_end: form.tenure_end || null };
      if (editing) {
        const { error } = await supabase.from("committees").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("committees").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["committees"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("committees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("deleted"));
      qc.invalidateQueries({ queryKey: ["committees"] });
    },
  });

  const columns: Column<Committee>[] = [
    { key: "name", header: t("name"), cell: (c) => <div className="font-medium">{c.name}</div> },
    {
      key: "tenure",
      header: t("tenure"),
      cell: (c) => `${fmtDate(c.tenure_start, lang)} → ${fmtDate(c.tenure_end, lang)}`,
    },
    {
      key: "status",
      header: t("status"),
      cell: (c) => (
        <Badge
          variant="outline"
          className={
            c.status === "active"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium shadow-none"
              : "border-muted-foreground/30 bg-muted text-muted-foreground font-medium shadow-none"
          }
        >
          {t(c.status as any)}
        </Badge>
      ),
    },
    {
      key: "act",
      header: t("actions"),
      className: "text-right",
      cell: (c) => (
        <div className="flex gap-1 justify-end">
          <Hint label={t("view_details")}>
            <Button size="icon" variant="ghost" onClick={() => setDetail(c)}>
              <ExternalLink className="w-4 h-4 text-primary" />
            </Button>
          </Hint>
          <PermissionGuard module="Committee" action="Edit" fallback={<></>}>
            <Hint label={t("edit")}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditing(c);
                  setForm({
                    name: c.name,
                    tenure_start: c.tenure_start,
                    tenure_end: c.tenure_end ?? "",
                    status: c.status,
                    description: c.description ?? "",
                  });
                  setOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </Hint>
          </PermissionGuard>
          <PermissionGuard module="Committee" action="Delete" fallback={<></>}>
            <Hint label={t("delete")}>
              <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Hint>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ShieldCheck}
        title={t("committee")}
        subtitle={`${data?.length ?? 0} ${lang === "bn" ? "টি কমিটি" : "committees"}`}
        actionLabel={canCreate ? t("add") : undefined}
        onAction={
          canCreate
            ? () => {
                setEditing(null);
                setForm(empty);
                setOpen(true);
              }
            : undefined
        }
      />
      <DataTable data={data} columns={columns} loading={isLoading} searchKeys={["name"]} />

      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("edit") : t("add")}
        onSubmit={() => save.mutate()}
        saving={save.isPending}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label required>{t("name")}</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                lang === "bn" ? "যেমন: পরিচালনা কমিটি ২০২৪-২৬" : "e.g. Managing Committee 2024-26"
              }
            />
          </div>
          <div>
            <Label required>{lang === "bn" ? "শুরু" : "Start"}</Label>
            <DatePicker
              required
              value={form.tenure_start}
              onChange={(v) => setForm({ ...form, tenure_start: v })}
            />
          </div>
          <div>
            <Label>{lang === "bn" ? "শেষ" : "End"}</Label>
            <DatePicker
              value={form.tenure_end}
              onChange={(v) => setForm({ ...form, tenure_end: v })}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("status")}</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue
                  placeholder={lang === "bn" ? "স্ট্যাটাস নির্বাচন করুন" : "Select status"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="expired">{t("expired")}</SelectItem>
                <SelectItem value="dissolved">{lang === "bn" ? "বিলুপ্ত" : "Dissolved"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("description")}</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={lang === "bn" ? "কমিটির বিস্তারিত বিবরণ..." : "Committee description..."}
            />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog
        id={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={(id) => del.mutate(id)}
      />

      {detail && <CommitteeDetailDialog committee={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function CommitteeDetailDialog({
  committee,
  onClose,
}: {
  committee: Committee;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [memberOpen, setMemberOpen] = useState(false);
  const [selMember, setSelMember] = useState("");
  const [selPos, setSelPos] = useState<string>("member");

  const [resOpen, setResOpen] = useState(false);
  const [resForm, setResForm] = useState({
    title: "",
    content: "",
    status: "proposed",
    resolution_date: new Date().toISOString().slice(0, 10),
  });
  const [voteOn, setVoteOn] = useState<string | null>(null);

  const { data: cmembers } = useQuery({
    queryKey: ["committee_members", committee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committee_members")
        .select("*, members(full_name, member_code)")
        .eq("committee_id", committee.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: allMembers } = useQuery({
    queryKey: ["members-list"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("id, full_name").order("full_name");
      return data ?? [];
    },
  });

  const { data: resolutions } = useQuery({
    queryKey: ["resolutions", committee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resolutions")
        .select("*")
        .eq("committee_id", committee.id)
        .order("resolution_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      if (!selMember) throw new Error(lang === "bn" ? "সদস্য বাছুন" : "Select member");
      const { error } = await supabase
        .from("committee_members")
        .insert({ committee_id: committee.id, member_id: selMember, position: selPos } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["committee_members", committee.id] });
      setMemberOpen(false);
      setSelMember("");
      setSelPos("member");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delCM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("committee_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committee_members", committee.id] }),
  });

  const saveRes = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("resolutions")
        .insert({ ...resForm, committee_id: committee.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["resolutions", committee.id] });
      setResOpen(false);
      setResForm({
        title: "",
        content: "",
        status: "proposed",
        resolution_date: new Date().toISOString().slice(0, 10),
      });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delRes = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resolutions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resolutions", committee.id] }),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">{committee.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {fmtDate(committee.tenure_start, lang)} → {fmtDate(committee.tenure_end, lang)}
          </p>
        </DialogHeader>
        <Tabs defaultValue="members">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">{lang === "bn" ? "সদস্যবৃন্দ" : "Members"}</TabsTrigger>
            <TabsTrigger value="res">{t("resolutions")}</TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-4 pt-3">
            <PermissionGuard module="Committee" action="Create" fallback={<></>}>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setMemberOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t("add_member")}
                </Button>
              </div>
            </PermissionGuard>
            <div className="space-y-1">
              {cmembers?.length ? (
                cmembers.map((cm: any) => (
                  <div
                    key={cm.id}
                    className="flex items-center gap-2 p-2 border rounded-md text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{cm.members?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{t(cm.position)}</div>
                    </div>
                    <PermissionGuard module="Committee" action="Delete" fallback={<></>}>
                      <Hint label={t("delete")}>
                        <Button size="icon" variant="ghost" onClick={() => delCM.mutate(cm.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </Hint>
                    </PermissionGuard>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("no_data")}</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="res" className="space-y-4 pt-3">
            <PermissionGuard module="Committee" action="Create" fallback={<></>}>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setResOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t("add")}
                </Button>
              </div>
            </PermissionGuard>
            <div className="space-y-2">
              {resolutions?.length ? (
                resolutions.map((r: any) => (
                  <div key={r.id} className="p-3 border rounded-md">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {fmtDate(r.resolution_date, lang)} •{" "}
                          <Badge variant="outline">{t(r.status)}</Badge>
                        </div>
                        {r.content && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {r.content}
                          </p>
                        )}
                      </div>
                      <PermissionGuard module="Committee" action="Edit" fallback={<></>}>
                        <Button size="sm" variant="outline" onClick={() => setVoteOn(r.id)}>
                          {t("vote")}
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard module="Committee" action="Delete" fallback={<></>}>
                        <Hint label={t("delete")}>
                          <Button size="icon" variant="ghost" onClick={() => delRes.mutate(r.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </Hint>
                      </PermissionGuard>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("no_data")}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add_member")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("name")}</Label>
                <Select value={selMember} onValueChange={setSelMember}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_option")} />
                  </SelectTrigger>
                  <SelectContent>
                    {allMembers?.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("position")}</Label>
                <Select value={selPos} onValueChange={setSelPos}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={lang === "bn" ? "স্ট্যাটাস নির্বাচন করুন" : "Select status"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(p as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => addMember.mutate()}
                disabled={addMember.isPending}
                className="w-full"
              >
                {t("save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <CrudDialog
          open={resOpen}
          onOpenChange={setResOpen}
          title={t("add")}
          onSubmit={() => saveRes.mutate()}
          saving={saveRes.isPending}
        >
          <div className="space-y-4">
            <div>
              <Label required>{t("title")}</Label>
              <Input
                required
                value={resForm.title}
                onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                placeholder={lang === "bn" ? "সিদ্ধান্তের শিরোনাম" : "Resolution Title"}
              />
            </div>
            <div>
              <Label>{t("description")}</Label>
              <Textarea
                rows={3}
                value={resForm.content}
                onChange={(e) => setResForm({ ...resForm, content: e.target.value })}
                placeholder={
                  lang === "bn" ? "সিদ্ধান্তের বিস্তারিত বিবরণ..." : "Resolution details..."
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("date")}</Label>
                <DatePicker
                  value={resForm.resolution_date}
                  onChange={(v) => setResForm({ ...resForm, resolution_date: v })}
                />
              </div>
              <div>
                <Label>{t("status")}</Label>
                <Select
                  value={resForm.status}
                  onValueChange={(v) => setResForm({ ...resForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposed">{t("proposed")}</SelectItem>
                    <SelectItem value="passed">{t("passed")}</SelectItem>
                    <SelectItem value="rejected">{t("rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CrudDialog>

        {voteOn && (
          <VoteDialog
            resolutionId={voteOn}
            members={cmembers ?? []}
            onClose={() => setVoteOn(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VoteDialog({
  resolutionId,
  members,
  onClose,
}: {
  resolutionId: string;
  members: any[];
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: votes } = useQuery({
    queryKey: ["votes", resolutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("resolution_votes")
        .select("*")
        .eq("resolution_id", resolutionId);
      return data ?? [];
    },
  });

  const vote = useMutation({
    mutationFn: async ({
      member_id,
      choice,
    }: {
      member_id: string;
      choice: "yes" | "no" | "abstain";
    }) => {
      const existing = votes?.find((v: any) => v.member_id === member_id);
      if (existing) {
        const { error } = await supabase
          .from("resolution_votes")
          .update({ vote: choice } as any)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resolution_votes")
          .insert({ resolution_id: resolutionId, member_id, vote: choice } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["votes", resolutionId] }),
  });

  const tally = { yes: 0, no: 0, abstain: 0 };
  votes?.forEach((v: any) => {
    tally[v.vote as keyof typeof tally]++;
  });
  const voteOf = (mid: string) => votes?.find((v: any) => v.member_id === mid)?.vote;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("vote")}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          <Badge className="bg-success/15 text-success">
            {t("yes")}: {tally.yes}
          </Badge>
          <Badge className="bg-destructive/15 text-destructive">
            {t("no")}: {tally.no}
          </Badge>
          <Badge variant="outline">
            {t("abstain")}: {tally.abstain}
          </Badge>
        </div>
        <div className="space-y-1">
          {members.length ? (
            members.map((cm: any) => {
              const v = voteOf(cm.member_id);
              return (
                <div
                  key={cm.member_id}
                  className="flex items-center gap-2 p-2 border rounded-md text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{cm.members?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{t(cm.position)}</div>
                  </div>
                  <PermissionGuard module="Committee" action="Edit" fallback={<></>}>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={v === "yes" ? "default" : "outline"}
                        className={v === "yes" ? "bg-success hover:bg-success/90" : ""}
                        onClick={() => vote.mutate({ member_id: cm.member_id, choice: "yes" })}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={v === "no" ? "default" : "outline"}
                        className={v === "no" ? "bg-destructive hover:bg-destructive/90" : ""}
                        onClick={() => vote.mutate({ member_id: cm.member_id, choice: "no" })}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={v === "abstain" ? "default" : "outline"}
                        onClick={() => vote.mutate({ member_id: cm.member_id, choice: "abstain" })}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  </PermissionGuard>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === "bn" ? "প্রথমে কমিটি সদস্য যোগ করুন" : "Add committee members first"}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
