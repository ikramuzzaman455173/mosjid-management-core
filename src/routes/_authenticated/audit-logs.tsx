import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileClock, Search, FileDown, FileText, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { exportCsv, exportPdf } from "@/lib/export";

export const Route = createFileRoute("/_authenticated/audit-logs")({ component: AuditLogsPage });

const PAGE_SIZE = 25;
const ENTITIES = ["members", "donations", "income", "expenses", "subscriptions", "meetings", "committees", "assets", "inventory_items"];

function AuditLogsPage() {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string>("all");
  const [entity, setEntity] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const { data: roleMap } = useQuery({
    queryKey: ["user_roles_map"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles" as any).select("user_id, role");
      const m: Record<string, string[]> = {};
      data?.forEach((r: any) => { (m[r.user_id] ??= []).push(r.role); });
      return m;
    },
  });

  const userIdsForRole = role === "all" ? null : Object.entries(roleMap ?? {}).filter(([, rs]) => rs.includes(role)).map(([id]) => id);

  const { data, isLoading } = useQuery({
    queryKey: ["audit_logs", search, action, entity, role, from, to, page, userIdsForRole?.join(",")],
    queryFn: async () => {
      let q = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (action !== "all") q = q.eq("action", action as any);
      if (entity !== "all") q = q.eq("entity", entity);
      if (search.trim()) q = q.or(`actor_email.ilike.%${search}%,entity_id.ilike.%${search}%,entity.ilike.%${search}%`);
      if (from) q = q.gte("created_at", from);
      if (to) q = q.lte("created_at", to + "T23:59:59");
      if (userIdsForRole) {
        if (userIdsForRole.length === 0) return { rows: [], count: 0 };
        q = q.in("actor_user_id", userIdsForRole);
      }
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const actionBadge = (a: string) => {
    const map: Record<string, string> = { insert: "bg-success/15 text-success", update: "bg-primary/15 text-primary", delete: "bg-destructive/15 text-destructive" };
    return <Badge className={map[a]}>{t(a as any)}</Badge>;
  };

  const exportRows = () => rows.map((r: any) => [fmtDate(r.created_at, "en"), r.action, r.entity, r.entity_id, r.actor_email ?? "—"]);
  const cols = [t("date"), t("action"), t("entity"), "ID", t("actor")];

  return (
    <div className="space-y-4">
      <PageHeader icon={FileClock} title={t("audit_logs")} subtitle={`${total} ${lang === "bn" ? "টি লগ" : "logs"}`} actions={
        <>
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 shadow-sm border-0 font-medium" onClick={() => exportCsv("audit-logs", cols, exportRows())}>
            <FileDown className="w-4 h-4 mr-1" />{t("export_csv")}
          </Button>
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 shadow-sm border-0 font-medium" onClick={() => exportPdf(t("audit_logs"), cols, exportRows(), "audit-logs")}>
            <FileText className="w-4 h-4 mr-1" />{t("export_pdf")}
          </Button>
        </>
      } />

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <Label className="text-xs">{t("search")}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder={lang === "bn" ? "ইমেইল / টেবিল / ID" : "email / table / ID"} className="pl-8 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t("action")}</Label>
            <Select value={action} onValueChange={(v) => { setAction(v); setPage(0); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="insert">{t("insert")}</SelectItem>
                <SelectItem value="update">{t("update")}</SelectItem>
                <SelectItem value="delete">{t("delete")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("entity")}</Label>
            <Select value={entity} onValueChange={(v) => { setEntity(v); setPage(0); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {ENTITIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("role")}</Label>
            <Select value={role} onValueChange={(v) => { setRole(v); setPage(0); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="mosque_admin">Mosque Admin</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="imam">Imam</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("from_date")}</Label>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">{t("to_date")}</Label>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="h-9" />
          </div>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("action")}</TableHead>
                <TableHead>{t("entity")}</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>{t("actor")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">{t("loading")}</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Inbox className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" /><p className="text-sm text-muted-foreground">{t("no_data")}</p></TableCell></TableRow>
              ) : rows.map((r: any) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>{actionBadge(r.action)}</TableCell>
                  <TableCell><Badge variant="outline">{r.entity}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.entity_id?.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm">{r.actor_email ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("page")} {page + 1} / {pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" />{t("prev")}</Button>
            <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>{t("next")}<ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
