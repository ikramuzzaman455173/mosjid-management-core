import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate, toBnNum } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Clock, Sunrise, Sun, SunMedium, Sunset, Moon, Users } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, type Column } from "@/components/data-table";

export const Route = createFileRoute("/_authenticated/prayer-times")({
  component: PrayerPage,
});

const SLOTS = [
  { key: "fajr", bn: "ফজর", en: "Fajr", icon: Sunrise },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr", icon: Sun },
  { key: "asr", bn: "আসর", en: "Asr", icon: SunMedium },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib", icon: Sunset },
  { key: "isha", bn: "এশা", en: "Isha", icon: Moon },
  { key: "jummah", bn: "জুমা", en: "Jummah", icon: Users },
] as const;

const DEFAULT_TIMES: Record<string, { azan: string; iqamah: string }> = {
  fajr: { azan: "04:30", iqamah: "05:00" },
  dhuhr: { azan: "13:00", iqamah: "13:30" },
  asr: { azan: "16:15", iqamah: "16:30" },
  maghrib: { azan: "18:00", iqamah: "18:10" },
  isha: { azan: "19:30", iqamah: "20:00" },
  jummah: { azan: "13:00", iqamah: "13:30" },
};

const format12h = (timeStr?: string) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const hNum = parseInt(hStr, 10);
  if (isNaN(hNum)) return timeStr;
  const ampm = hNum >= 12 ? "PM" : "AM";
  const h12 = hNum % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${mStr} ${ampm}`;
};

function PrayerPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("prayer schedule.create");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: existing } = useQuery({
    queryKey: ["prayer", "exact", date],
    queryFn: async () =>
      (await supabase.from("prayer_times").select("*").eq("effective_date", date).maybeSingle())
        .data,
  });

  const { data: active } = useQuery({
    queryKey: ["prayer", "active", date],
    queryFn: async () => {
      const { data } = await supabase
        .from("prayer_times")
        .select("*")
        .lte("effective_date", date)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
  const { data: list, isLoading } = useQuery({
    queryKey: ["prayer-list"],
    queryFn: async () =>
      (
        await supabase
          .from("prayer_times")
          .select("*")
          .order("effective_date", { ascending: false })
          .limit(20)
      ).data ?? [],
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async () => {
      let payload: any = { effective_date: date };

      // If there is no exact record, we will create a new one. Pre-fill with the active record's values so unaffected times carry over.
      if (!existing) {
        SLOTS.forEach((s) => {
          payload[s.key] = (active as any)?.[s.key] ?? DEFAULT_TIMES[s.key].azan;
          payload[`${s.key}_iqamah`] =
            (active as any)?.[`${s.key}_iqamah`] ?? DEFAULT_TIMES[s.key].iqamah;
        });
      }

      // Override with user changes
      payload = { ...payload, ...form };

      // Clean empty strings and invalid columns
      Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
      delete payload.jummah_iqamah; // Jummah iqamah column does not exist in schema

      if (existing) {
        const { error } = await supabase.from("prayer_times").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prayer_times").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["prayer"] });
      qc.invalidateQueries({ queryKey: ["prayer-list"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Clock}
        title={t("prayer_times")}
        subtitle={lang === "bn" ? "দৈনিক নামাজের সময়সূচী" : "Daily prayer schedule"}
      />

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Label className="shrink-0">{t("date")}:</Label>
          <DatePicker
            value={date}
            onChange={(v) => {
              setDate(v);
              setForm({});
            }}
            className="max-w-xs"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SLOTS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="p-4 border rounded-xl bg-card shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-primary">{lang === "bn" ? s.bn : s.en}</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {lang === "bn" ? "আযান/শুরু" : "Azan/Start"}
                    </span>
                    <TimePicker
                      value={
                        form[s.key] ??
                        (existing as any)?.[s.key] ??
                        (active as any)?.[s.key] ??
                        DEFAULT_TIMES[s.key].azan
                      }
                      onChange={(v) => setForm({ ...form, [s.key]: v })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {lang === "bn" ? "ইকামত" : "Iqamah"}
                    </span>
                    <TimePicker
                      value={
                        form[`${s.key}_iqamah`] ??
                        (existing as any)?.[`${s.key}_iqamah`] ??
                        (active as any)?.[`${s.key}_iqamah`] ??
                        DEFAULT_TIMES[s.key].iqamah
                      }
                      onChange={(v) => setForm({ ...form, [`${s.key}_iqamah`]: v })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <PermissionGuard module="Prayer Schedule" action="Edit" fallback={<></>}>
          <Button
            className="mt-4 bg-primary w-full sm:w-auto"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? t("saving") : t("save")}
          </Button>
        </PermissionGuard>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-primary px-1">
          {lang === "bn" ? "সাম্প্রতিক সময়সূচী" : "Recent schedules"}
        </h3>
        <DataTable
          data={list as any[]}
          columns={[
            {
              key: "effective_date",
              header: t("date"),
              cell: (r) => <span className="font-medium">{fmtDate(r.effective_date, lang)}</span>,
            },
            ...SLOTS.map((s) => ({
              key: s.key,
              header: lang === "bn" ? s.bn : s.en,
              cell: (r: any) => (
                <span className="text-xs">
                  {r[s.key] ? toBnNum(format12h(r[s.key].slice(0, 5)), lang) : "—"}
                </span>
              ),
            })),
          ]}
          loading={isLoading}
          hidePagination
        />
      </div>
    </div>
  );
}
