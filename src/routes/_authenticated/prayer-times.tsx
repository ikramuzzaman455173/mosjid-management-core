import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate, toBnNum } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/prayer-times")({
  component: PrayerPage,
});

const SLOTS = [
  { key: "fajr", bn: "ফজর", en: "Fajr" },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr" },
  { key: "asr", bn: "আসর", en: "Asr" },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib" },
  { key: "isha", bn: "এশা", en: "Isha" },
  { key: "jummah", bn: "জুমা", en: "Jummah" },
] as const;

function PrayerPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: existing } = useQuery({
    queryKey: ["prayer", date],
    queryFn: async () => (await supabase.from("prayer_times").select("*").eq("effective_date", date).maybeSingle()).data,
  });
  const { data: list } = useQuery({
    queryKey: ["prayer-list"],
    queryFn: async () => (await supabase.from("prayer_times").select("*").order("effective_date", { ascending: false }).limit(20)).data ?? [],
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { effective_date: date, ...form };
      // Clean empty strings
      Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);
      if (existing) {
        const { error } = await supabase.from("prayer_times").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prayer_times").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["prayer", date] }); qc.invalidateQueries({ queryKey: ["prayer-list"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <PageHeader icon={Clock} title={t("prayer_times")} subtitle={lang === "bn" ? "দৈনিক নামাজের সময়সূচী" : "Daily prayer schedule"} />

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Label className="shrink-0">{t("date")}:</Label>
          <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setForm({}); }} className="max-w-xs" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SLOTS.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <Label className="text-primary font-semibold">{lang === "bn" ? s.bn : s.en}</Label>
              <Input type="time" value={form[s.key] ?? (existing as any)?.[s.key] ?? ""} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} />
              <Input type="time" placeholder={lang === "bn" ? "ইকামত" : "Iqamah"} value={form[`${s.key}_iqamah`] ?? (existing as any)?.[`${s.key}_iqamah`] ?? ""} onChange={(e) => setForm({ ...form, [`${s.key}_iqamah`]: e.target.value })} />
            </div>
          ))}
        </div>
        <Button className="mt-4 bg-primary" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? t("saving") : t("save")}
        </Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-primary mb-3">{lang === "bn" ? "সাম্প্রতিক সময়সূচী" : "Recent schedules"}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-2">{t("date")}</th>
                {SLOTS.map(s => <th key={s.key} className="p-2 text-center">{lang === "bn" ? s.bn : s.en}</th>)}
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((r: any) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-medium">{fmtDate(r.effective_date, lang)}</td>
                  {SLOTS.map(s => <td key={s.key} className="p-2 text-center text-xs">{r[s.key] ? toBnNum(r[s.key].slice(0, 5), lang) : "—"}</td>)}
                </tr>
              ))}
              {(list ?? []).length === 0 && <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">{t("no_data")}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
