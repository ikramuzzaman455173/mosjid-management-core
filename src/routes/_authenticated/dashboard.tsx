import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n, fmtCurrency, toBnNum } from "@/lib/i18n";
import {
  Users, Coins, AlertCircle, Gift, Wallet, Landmark,
  HandCoins, UserPlus, HandHeart, Receipt, BarChart3, Bell,
  ArrowUpRight, ArrowDownRight, ArrowRight, Calendar as CalendarIcon,
  Sunrise, Sun, SunMedium, Sunset, Moon, Clock, TrendingUp,
  PieChart as PieChartIcon, Sparkles, Tv
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Hint } from "@/components/ui/hint";
import { MosqueIcon } from "@/components/ui/mosque-icon";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const PRAYER_SLOTS = [
  { key: "fajr", bn: "ফজর", en: "Fajr", icon: Sunrise, defaultAzan: "04:50", defaultIqamah: "05:15" },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr", icon: Sun, defaultAzan: "13:00", defaultIqamah: "13:30" },
  { key: "asr", bn: "আসর", en: "Asr", icon: SunMedium, defaultAzan: "16:30", defaultIqamah: "16:45" },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib", icon: Sunset, defaultAzan: "18:05", defaultIqamah: "18:15" },
  { key: "isha", bn: "এশা", en: "Isha", icon: Moon, defaultAzan: "19:45", defaultIqamah: "20:00" },
  { key: "jummah", bn: "জুমা", en: "Jummah", icon: Users, defaultAzan: "12:45", defaultIqamah: "13:30" },
] as const;

function getPrayerSlotTimes(todayPrayer: any, slotKey: string, defaultAzan: string, defaultIqamah: string) {
  if (!todayPrayer) return { azan: defaultAzan, iqamah: defaultIqamah };
  if (slotKey === "fajr") return { azan: todayPrayer.fajr || defaultAzan, iqamah: todayPrayer.fajr_iqamah || defaultIqamah };
  if (slotKey === "dhuhr") return { azan: todayPrayer.dhuhr || defaultAzan, iqamah: todayPrayer.dhuhr_iqamah || defaultIqamah };
  if (slotKey === "asr") return { azan: todayPrayer.asr || defaultAzan, iqamah: todayPrayer.asr_iqamah || defaultIqamah };
  if (slotKey === "maghrib") return { azan: todayPrayer.maghrib || defaultAzan, iqamah: todayPrayer.maghrib_iqamah || defaultIqamah };
  if (slotKey === "isha") return { azan: todayPrayer.isha || defaultAzan, iqamah: todayPrayer.isha_iqamah || defaultIqamah };
  if (slotKey === "jummah") return { azan: todayPrayer.jummah || defaultAzan, iqamah: defaultIqamah };
  return { azan: defaultAzan, iqamah: defaultIqamah };
}

const format12h = (timeStr?: string) => {
  if (!timeStr) return "—";
  const [hStr, mStr] = timeStr.split(":");
  const hNum = parseInt(hStr, 10);
  if (isNaN(hNum)) return timeStr;
  const ampm = hNum >= 12 ? "PM" : "AM";
  const h12 = hNum % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${mStr || "00"} ${ampm}`;
};

function Dashboard() {
  const { t, lang } = useI18n();
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly">("monthly");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // 1. Core KPIs
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

      const [membersRes, subsRes, donationsRes, expensesRes, accountsRes] = await Promise.all([
        supabase.from("members").select("id, status"),
        supabase.from("subscriptions").select("amount, paid_amount, status").eq("year", now.getFullYear()).eq("month", now.getMonth() + 1),
        supabase.from("donations").select("amount").gte("donation_date", firstOfMonth),
        supabase.from("expenses").select("amount").gte("expense_date", firstOfMonth),
        supabase.from("accounts").select("kind, current_balance, is_active"),
      ]);

      const membersList = membersRes.data ?? [];
      const totalMembers = membersList.length;
      const activeMembers = membersList.filter((m: any) => m.status === "active").length;

      const subsList = subsRes.data ?? [];
      const monthlyCollection = subsList.reduce((s, r: any) => s + Number(r.paid_amount || 0), 0);
      const dueAmount = subsList.reduce((s, r: any) => s + Math.max(0, Number(r.amount || 0) - Number(r.paid_amount || 0)), 0);
      const dueMembers = subsList.filter((r: any) => r.status !== "paid").length;
      const targetCollection = subsList.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const collectionRate = targetCollection > 0 ? Math.round((monthlyCollection / targetCollection) * 100) : 100;

      const totalDonations = (donationsRes.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const monthlyExpense = (expensesRes.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

      const accountsList = (accountsRes.data ?? []).filter((a: any) => a.is_active !== false);
      const cashBal = accountsList.filter((a: any) => a.kind === "cash").reduce((s, a: any) => s + Number(a.current_balance || 0), 0);
      const bankBal = accountsList.filter((a: any) => a.kind === "bank").reduce((s, a: any) => s + Number(a.current_balance || 0), 0);
      const mobileBal = accountsList.filter((a: any) => a.kind === "mobile_banking").reduce((s, a: any) => s + Number(a.current_balance || 0), 0);
      const totalFunds = cashBal + bankBal + mobileBal;

      const monthlySurplus = (monthlyCollection + totalDonations) - monthlyExpense;

      return {
        totalMembers,
        activeMembers,
        monthlyCollection,
        dueAmount,
        dueMembers,
        collectionRate,
        totalDonations,
        monthlyExpense,
        cashBal,
        bankBal,
        mobileBal,
        totalFunds,
        monthlySurplus,
      };
    },
  });

  // 2. Today's Prayer Times
  const { data: todayPrayer } = useQuery({
    queryKey: ["dashboard-today-prayer"],
    queryFn: async () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("prayer_times").select("*").eq("effective_date", todayStr).maybeSingle();
      return data;
    },
  });

  // Upcoming Prayer Slot Calculator
  const upcomingPrayerKey = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of PRAYER_SLOTS.slice(0, 5)) {
      const times = getPrayerSlotTimes(todayPrayer, slot.key, slot.defaultAzan, slot.defaultIqamah);
      const [h, m] = times.azan.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m) && h * 60 + m > currentMinutes) {
        return slot.key;
      }
    }
    return "fajr";
  }, [todayPrayer]);

  // 3. Accurate Analytics Chart Data (Aggregates Income, Donations, Subscriptions, Expenses)
  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ["dashboard-chart-data", lang],
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

      const [incomeRes, expenseRes, donationRes, subRes] = await Promise.all([
        supabase.from("income").select("amount, income_date").gte("income_date", sixMonthsAgoStr),
        supabase.from("expenses").select("amount, expense_date, category").gte("expense_date", sixMonthsAgoStr),
        supabase.from("donations").select("amount, donation_date").gte("donation_date", sixMonthsAgoStr),
        supabase.from("subscriptions").select("paid_amount, year, month, updated_at").gte("year", sixMonthsAgo.getFullYear()),
      ]);

      // 1. Monthly aggregation (last 6 months)
      const monthlyMap: Record<string, { label: string; income: number; expense: number }> = {};
      const monthNamesBn = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
      const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, "0")}`;
        const label = lang === "bn" ? `${monthNamesBn[m]} '${String(y).slice(2)}` : `${monthNamesEn[m]} '${String(y).slice(2)}`;
        monthlyMap[key] = { label, income: 0, expense: 0 };
      }

      (incomeRes.data ?? []).forEach((r: any) => {
        const key = (r.income_date ?? "").slice(0, 7);
        if (monthlyMap[key]) monthlyMap[key].income += Number(r.amount || 0);
      });

      (donationRes.data ?? []).forEach((r: any) => {
        const key = (r.donation_date ?? "").slice(0, 7);
        if (monthlyMap[key]) monthlyMap[key].income += Number(r.amount || 0);
      });

      (subRes.data ?? []).forEach((r: any) => {
        const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
        if (monthlyMap[key]) monthlyMap[key].income += Number(r.paid_amount || 0);
      });

      (expenseRes.data ?? []).forEach((r: any) => {
        const key = (r.expense_date ?? "").slice(0, 7);
        if (monthlyMap[key]) monthlyMap[key].expense += Number(r.amount || 0);
      });

      const monthly = Object.values(monthlyMap);

      // 2. Weekly aggregation (last 5 weeks)
      const weeks = Array.from({ length: 5 }, (_, i) => {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return {
          start,
          end,
          label: lang === "bn" ? `সপ্তাহ ${5 - i}` : `Week ${5 - i}`,
          income: 0,
          expense: 0,
        };
      }).reverse();

      const processDateRecord = (dateStr: string | null, amount: number, isIncome: boolean) => {
        if (!dateStr) return;
        const d = new Date(dateStr);
        for (const w of weeks) {
          if (d >= w.start && d <= w.end) {
            if (isIncome) w.income += Number(amount || 0);
            else w.expense += Number(amount || 0);
            break;
          }
        }
      };

      (incomeRes.data ?? []).forEach((r: any) => processDateRecord(r.income_date, r.amount, true));
      (donationRes.data ?? []).forEach((r: any) => processDateRecord(r.donation_date, r.amount, true));
      (expenseRes.data ?? []).forEach((r: any) => processDateRecord(r.expense_date, r.amount, false));

      const weekly = weeks.map((w) => ({ label: w.label, income: w.income, expense: w.expense }));

      return { monthly, weekly };
    },
  });

  // 4. Combined Real-time Financial Activity (Income + Expense + Donations + Subscriptions)
  const { data: recentTxn, isLoading: isLoadingTxn } = useQuery({
    queryKey: ["dashboard-recent-activity"],
    queryFn: async () => {
      const [incomeRes, expenseRes, donationRes, subRes] = await Promise.all([
        supabase.from("income").select("id, amount, income_date, category, source, notes, created_at").order("created_at", { ascending: false }).limit(6),
        supabase.from("expenses").select("id, amount, expense_date, category, notes, created_at").order("created_at", { ascending: false }).limit(6),
        supabase.from("donations").select("id, amount, donation_date, donor_name, kind, created_at").order("created_at", { ascending: false }).limit(6),
        supabase.from("subscriptions").select("id, paid_amount, month, year, updated_at, members(name)").eq("status", "paid").order("updated_at", { ascending: false }).limit(6),
      ]);

      const items: Array<{
        id: string;
        title: string;
        subtitle?: string;
        amount: number;
        kind: "credit" | "debit";
        date: string;
        badge: string;
        badgeColor: string;
        timestamp: number;
      }> = [];

      (incomeRes.data ?? []).forEach((r: any) => {
        items.push({
          id: `inc-${r.id}`,
          title: r.source || r.category || (lang === "bn" ? "সাধারণ আয়" : "General Income"),
          subtitle: r.category !== r.source ? r.category : undefined,
          amount: Number(r.amount || 0),
          kind: "credit",
          date: r.income_date || r.created_at?.slice(0, 10) || "",
          badge: lang === "bn" ? "আয়" : "Income",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          timestamp: new Date(r.created_at || r.income_date || 0).getTime(),
        });
      });

      (donationRes.data ?? []).forEach((r: any) => {
        items.push({
          id: `don-${r.id}`,
          title: r.donor_name || (lang === "bn" ? "সাধারণ অনুদান" : "General Donation"),
          subtitle: r.kind ? (lang === "bn" ? `প্রকার: ${r.kind}` : `Type: ${r.kind}`) : undefined,
          amount: Number(r.amount || 0),
          kind: "credit",
          date: r.donation_date || r.created_at?.slice(0, 10) || "",
          badge: lang === "bn" ? "দান" : "Donation",
          badgeColor: "bg-primary/10 text-primary border-primary/20",
          timestamp: new Date(r.created_at || r.donation_date || 0).getTime(),
        });
      });

      (subRes.data ?? []).forEach((r: any) => {
        items.push({
          id: `sub-${r.id}`,
          title: (r.members as any)?.name || (lang === "bn" ? "সদস্য চাঁদা" : "Member Subscription"),
          subtitle: lang === "bn" ? `${toBnNum(r.month, lang)}/${toBnNum(r.year, lang)} মাসের চাঁদা` : `Sub ${r.month}/${r.year}`,
          amount: Number(r.paid_amount || 0),
          kind: "credit",
          date: r.updated_at?.slice(0, 10) || "",
          badge: lang === "bn" ? "চাঁদা" : "Subscription",
          badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          timestamp: new Date(r.updated_at || 0).getTime(),
        });
      });

      (expenseRes.data ?? []).forEach((r: any) => {
        items.push({
          id: `exp-${r.id}`,
          title: r.category || (lang === "bn" ? "মসজিদ পরিচালনা ব্যয়" : "Operational Expense"),
          subtitle: r.notes || undefined,
          amount: Number(r.amount || 0),
          kind: "debit",
          date: r.expense_date || r.created_at?.slice(0, 10) || "",
          badge: lang === "bn" ? "ব্যয়" : "Expense",
          badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
          timestamp: new Date(r.created_at || r.expense_date || 0).getTime(),
        });
      });

      items.sort((a, b) => b.timestamp - a.timestamp);
      return items.slice(0, 6);
    },
  });

  // 5. Notices
  const { data: notices, isLoading: isLoadingNotices } = useQuery({
    queryKey: ["dashboard-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").eq("published", true).order("notice_date", { ascending: false }).limit(4);
      return data ?? [];
    },
  });

  // Active chart series
  const activeSeries = timeframe === "monthly" ? chartData?.monthly ?? [] : chartData?.weekly ?? [];
  const chartTotals = useMemo(() => {
    const totalInc = activeSeries.reduce((s, item) => s + item.income, 0);
    const totalExp = activeSeries.reduce((s, item) => s + item.expense, 0);
    const net = totalInc - totalExp;
    return { totalInc, totalExp, net };
  }, [activeSeries]);

  // Fund Distribution Breakdown
  const fundDistribution = useMemo(() => {
    const list = [
      { name: lang === "bn" ? "নগদ পেটি ক্যাশ" : "Cash in Hand", value: stats?.cashBal || 0, color: "#10b981" },
      { name: lang === "bn" ? "ব্যাংক জমা স্থিতি" : "Bank Accounts", value: stats?.bankBal || 0, color: "#3b82f6" },
      { name: lang === "bn" ? "মোবাইল ব্যাংকিং" : "Mobile Banking", value: stats?.mobileBal || 0, color: "#8b5cf6" },
    ].filter(item => item.value > 0);

    return list.length > 0 ? list : [
      { name: lang === "bn" ? "কোন ফান্ড নেই" : "No Funds", value: 1, color: "#94a3b8" }
    ];
  }, [stats, lang]);

  // 8 Balanced KPIs
  const kpis = [
    {
      label: t("total_members"),
      value: toBnNum(stats?.totalMembers ?? 0, lang),
      suffix: t("persons"),
      subtitle: lang === "bn" ? `সক্রিয়: ${toBnNum(stats?.activeMembers ?? 0, lang)} জন` : `Active: ${stats?.activeMembers ?? 0}`,
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      link: "/members",
    },
    {
      label: t("monthly_collection"),
      value: fmtCurrency(stats?.monthlyCollection ?? 0, lang),
      subtitle: lang === "bn" ? `আদায় হার: ${toBnNum(stats?.collectionRate ?? 0, lang)}%` : `Rate: ${stats?.collectionRate ?? 0}%`,
      icon: Coins,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      link: "/subscription",
    },
    {
      label: t("total_donations"),
      value: fmtCurrency(stats?.totalDonations ?? 0, lang),
      subtitle: lang === "bn" ? "চলতি মাসের অনুদান" : "This month's gift",
      icon: Gift,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      link: "/donations",
    },
    {
      label: lang === "bn" ? "চলতি মাসের ব্যয়" : "Monthly Expenses",
      value: fmtCurrency(stats?.monthlyExpense ?? 0, lang),
      subtitle: lang === "bn" ? "মসজিদ পরিচালন ব্যয়" : "Operational costs",
      icon: Receipt,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      link: "/expenses",
    },
    {
      label: t("cash_balance"),
      value: fmtCurrency(stats?.cashBal ?? 0, lang),
      subtitle: lang === "bn" ? "নগদ তহবিল স্থিতি" : "Petty cash in hand",
      icon: Wallet,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
      link: "/cash",
    },
    {
      label: t("bank_balance"),
      value: fmtCurrency(stats?.bankBal ?? 0, lang),
      subtitle: lang === "bn" ? "ব্যাংক জমা স্থিতি" : "Bank accounts total",
      icon: Landmark,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      link: "/bank",
    },
    {
      label: lang === "bn" ? "সর্বমোট বর্তমান তহবিল" : "Total Liquid Funds",
      value: fmtCurrency(stats?.totalFunds ?? 0, lang),
      subtitle: lang === "bn" ? "ক্যাশ + ব্যাংক হিসাব" : "Cash + Bank Total",
      icon: HandHeart,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/40 ring-1 ring-primary/20",
      link: "/reports",
      isHighlight: true,
    },
    {
      label: t("due_amount"),
      value: fmtCurrency(stats?.dueAmount ?? 0, lang),
      subtitle: lang === "bn" ? `${toBnNum(stats?.dueMembers ?? 0, lang)} জন সদস্যের বকেয়া` : `${stats?.dueMembers ?? 0} members due`,
      icon: AlertCircle,
      color: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      link: "/subscription",
    },
  ];

  // Quick action shortcut pills
  const quickActions = [
    { label: lang === "bn" ? "চাঁদা আদায়" : "Collect Sub", icon: HandCoins, color: "text-amber-600", path: "/subscription" },
    { label: lang === "bn" ? "দান গ্রহণ" : "Donation", icon: Gift, color: "text-emerald-600", path: "/donations" },
    { label: lang === "bn" ? "নতুন সদস্য" : "New Member", icon: UserPlus, color: "text-blue-600", path: "/members" },
    { label: lang === "bn" ? "ব্যয় এন্ট্রি" : "Expense", icon: Receipt, color: "text-rose-600", path: "/expenses" },
  ];

  const today = new Date();
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" } as const;
  const formattedDate = today.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", dateOptions);

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-2.5 sm:p-3 shadow-xl space-y-1.5 text-xs z-50 max-w-[220px]">
          <p className="font-semibold text-foreground border-b border-border/50 pb-1 truncate">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5 font-medium truncate" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}:</span>
              </span>
              <span className="font-bold text-foreground font-mono shrink-0">
                {fmtCurrency(Number(entry.value || 0), lang)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 max-w-[1600px] mx-auto pb-10 min-w-0">

      {/* 1. Executive Mosque Header Banner - Fully Responsive */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 p-3 sm:p-5 md:p-6 border border-border/60 shadow-xs min-w-0">
        {/* Top Tier: Greeting, Badge, Date & Executive Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/50">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-primary/20 via-primary/10 to-amber-500/20 border border-primary/25 flex items-center justify-center text-primary shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <MosqueIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  {lang === "bn" ? "আসসালামু আলাইকুম" : "Assalamu Alaikum"}
                </h1>
                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Mosque"}
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Top-Right Executive Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-stretch sm:self-auto">
            <Link to="/reports" className="flex-1 sm:flex-initial">
              <Button size="sm" className="w-full sm:w-auto h-8 sm:h-9 px-3 sm:px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs text-xs font-semibold gap-1.5 cursor-pointer justify-center">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{t("reports")}</span>
              </Button>
            </Link>
            <Link to="/tv-display">
              <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2.5 sm:px-3 border-border/70 hover:border-primary/40 text-xs font-medium gap-1.5 cursor-pointer">
                <Tv className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="hidden sm:inline">{lang === "bn" ? "টিভি ডিসপ্লে" : "TV Mode"}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Tier: Quick Action Shortcuts Grid */}
        <div className="pt-2.5 sm:pt-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground shrink-0 hidden lg:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === "bn" ? "দ্রুত অ্যাকশন:" : "Quick Actions:"}</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 min-w-0">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path as any} className="w-full min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 sm:h-9 px-2 sm:px-2.5 bg-background/70 hover:bg-background border-border/70 hover:border-primary/40 shadow-2xs text-[11px] sm:text-xs font-medium transition-all group justify-center sm:justify-start cursor-pointer min-w-0"
                >
                  <action.icon className={`w-3.5 h-3.5 mr-1.5 ${action.color} transition-transform group-hover:scale-110 shrink-0`} />
                  <span className="truncate">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Today's Prayer Schedule Ribbon */}
      <Card className="p-3 sm:p-4 md:p-5 border-border/60 bg-gradient-to-r from-card via-card to-muted/20 shadow-xs overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-border/50">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">
              {lang === "bn" ? "আজকের নামাজের সময়সূচী" : "Today's Prayer Schedule"}
            </h2>
            <Badge variant="outline" className="text-[10px] py-0 h-5 text-muted-foreground border-border/60 shrink-0 hidden xs:inline-flex">
              {todayPrayer?.effective_date || today.toISOString().slice(0, 10)}
            </Badge>
          </div>

          <Link to="/prayer-times" className="shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 px-1.5 sm:px-2 cursor-pointer">
              <span>{lang === "bn" ? "সময়সূচী পরিবর্তন" : "Manage"}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2.5 min-w-0">
          {PRAYER_SLOTS.map((slot) => {
            const isUpcoming = upcomingPrayerKey === slot.key;
            const slotTimes = getPrayerSlotTimes(todayPrayer, slot.key, slot.defaultAzan, slot.defaultIqamah);
            const azan = format12h(slotTimes.azan);
            const iqamah = format12h(slotTimes.iqamah);
            const SlotIcon = slot.icon;

            return (
              <div
                key={slot.key}
                className={`relative p-2 sm:p-3 rounded-xl border transition-all min-w-0 ${
                  isUpcoming
                    ? "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/30"
                    : "bg-muted/30 border-border/50 hover:border-border"
                }`}
              >
                {isUpcoming && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5 min-w-0">
                  <SlotIcon className={`w-3.5 h-3.5 shrink-0 ${isUpcoming ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[11px] sm:text-xs font-bold truncate ${isUpcoming ? "text-primary" : "text-foreground"}`}>
                    {lang === "bn" ? slot.bn : slot.en}
                  </span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] sm:text-[11px]">
                    <span className="shrink-0">{lang === "bn" ? "আজান:" : "Azan:"}</span>
                    <span className="font-mono text-foreground font-medium tabular-nums pl-1">{azan}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] sm:text-[11px]">
                    <span className="font-medium text-primary shrink-0">{lang === "bn" ? "ইকামত:" : "Iqamah:"}</span>
                    <span className="font-mono font-bold text-foreground tabular-nums pl-1">{iqamah}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. 8 Balanced KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-4 min-w-0">
        {isLoadingStats ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={`kpi-skel-${i}`} className="p-2.5 sm:p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <Skeleton className="h-3 w-16 sm:w-24" />
                  <Skeleton className="h-4 sm:h-5 w-14 sm:w-20" />
                </div>
              </div>
              <Skeleton className="h-2 w-3/4" />
            </Card>
          ))
        ) : (
          kpis.map((k) => (
            <Link key={k.label} to={k.link as any} className="block group min-w-0">
              <Card className={`p-2.5 sm:p-3.5 md:p-4 shadow-2xs hover:shadow-xs transition-all h-full flex flex-col justify-between border min-w-0 ${k.border} ${k.isHighlight ? "bg-primary/5" : "bg-card"}`}>
                <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{k.label}</p>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <h3 className="text-sm sm:text-lg xl:text-xl font-bold tracking-tight text-foreground truncate">
                        {k.value}
                      </h3>
                      {k.suffix && <span className="text-[9px] sm:text-[11px] text-muted-foreground font-normal shrink-0">{k.suffix}</span>}
                    </div>
                  </div>
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${k.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                    <k.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${k.color}`} />
                  </div>
                </div>
                <div className="mt-1.5 pt-1 sm:mt-2.5 sm:pt-2 border-t border-border/40 flex items-center justify-between text-[9px] sm:text-[11px] text-muted-foreground">
                  <span className="truncate">{k.subtitle}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary shrink-0 ml-1" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* 4. Analytics & Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Main Financial Trend Chart (2 Cols) */}
        <Card className="p-3.5 sm:p-5 shadow-sm border-border/60 xl:col-span-2 flex flex-col bg-card overflow-hidden min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-border/50">
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">{t("monthly_income_expense")}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                {lang === "bn" ? "আয়-ব্যয় ও মাসিক উদ্বৃত্ত বিশ্লেষণ" : "Income, expense & balance trends"}
              </p>
            </div>

            {/* Timeframe & Chart Type Switches */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
              <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeframe("monthly")}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                    timeframe === "monthly" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "bn" ? "মাসিক (৬ মাস)" : "Monthly (6M)"}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("weekly")}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                    timeframe === "weekly" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "bn" ? "সাপ্তাহিক (৫ সপ্তাহ)" : "Weekly (5W)"}
                </button>
              </div>

              <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setChartType("area")}
                  className={`p-1 sm:px-2 sm:py-1 rounded-md transition-all cursor-pointer ${
                    chartType === "area" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={lang === "bn" ? "ট্রেন্ড চার্ট" : "Area Chart"}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`p-1 sm:px-2 sm:py-1 rounded-md transition-all cursor-pointer ${
                    chartType === "bar" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={lang === "bn" ? "বার চার্ট" : "Bar Chart"}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Header inside chart */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 sm:p-2.5 mb-3 sm:mb-4 rounded-xl bg-muted/30 border border-border/40 text-center text-xs min-w-0">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground truncate">{lang === "bn" ? "মোট সংগৃহীত আয়" : "Total Income"}</p>
              <p className="font-bold text-[11px] sm:text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {fmtCurrency(chartTotals.totalInc, lang)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground truncate">{lang === "bn" ? "মোট পরিশোধিত ব্যয়" : "Total Expense"}</p>
              <p className="font-bold text-[11px] sm:text-sm text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                {fmtCurrency(chartTotals.totalExp, lang)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground truncate">{lang === "bn" ? "নীট উদ্বৃত্ত / ব্যালেন্স" : "Net Balance"}</p>
              <p className={`font-bold text-[11px] sm:text-sm mt-0.5 truncate ${chartTotals.net >= 0 ? "text-primary" : "text-destructive"}`}>
                {fmtCurrency(chartTotals.net, lang)}
              </p>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="flex-1 min-h-[240px] sm:min-h-[290px] w-full min-w-0 overflow-hidden">
            {isLoadingChart ? (
              <Skeleton className="w-full h-full min-h-[240px] rounded-xl" />
            ) : activeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "area" ? (
                  <AreaChart data={activeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="chartExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#chartIncomeGrad)" name={t("income_label")} />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#chartExpenseGrad)" name={t("expense_label")} />
                  </AreaChart>
                ) : (
                  <BarChart data={activeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={t("income_label")} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t("expense_label")} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground text-xs">
                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                <span>{lang === "bn" ? "গ্রাফ প্রদর্শনের জন্য পর্যাপ্ত তথ্য নেই" : "No chart data available"}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Funds & Accounts Distribution Breakdown (1 Col) */}
        <Card className="p-4 sm:p-5 shadow-sm border-border/60 flex flex-col justify-between bg-card overflow-hidden min-w-0">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <h2 className="font-bold text-base flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary shrink-0" />
                <span className="truncate">{lang === "bn" ? "তহবিল ও ব্যাংক বণ্টন" : "Funds Distribution"}</span>
              </h2>
              <Link to="/bank">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary p-0 cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Donut Chart */}
            <div className="h-[170px] sm:h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fundDistribution}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fundDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => fmtCurrency(Number(val), lang)}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {lang === "bn" ? "মোট তহবিল" : "Total Funds"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[120px] text-center">
                  {fmtCurrency(stats?.totalFunds ?? 0, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Breakdown List */}
          <div className="space-y-2 mt-4 pt-3 border-t border-border/50 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium truncate">{lang === "bn" ? "নগদ পেটি ক্যাশ" : "Cash in Hand"}</span>
              </div>
              <span className="font-bold font-mono text-foreground shrink-0 pl-1">
                {fmtCurrency(stats?.cashBal ?? 0, lang)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="font-medium truncate">{lang === "bn" ? "ব্যাংক অ্যাকাউন্টস" : "Bank Accounts"}</span>
              </div>
              <span className="font-bold font-mono text-foreground shrink-0 pl-1">
                {fmtCurrency(stats?.bankBal ?? 0, lang)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="font-medium truncate">{lang === "bn" ? "মোবাইল ব্যাংকিং" : "Mobile Banking"}</span>
              </div>
              <span className="font-bold font-mono text-foreground shrink-0 pl-1">
                {fmtCurrency(stats?.mobileBal ?? 0, lang)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Bottom Section: Recent Activity & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Recent Transactions List (2 Cols) */}
        <Card className="p-3.5 sm:p-5 shadow-sm border-border/60 lg:col-span-2 flex flex-col bg-card overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-border/50">
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">{t("recent_transactions")}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                {lang === "bn" ? "সর্বশেষ অনুদান, চাঁদা, আয় ও ব্যয় কার্যক্রম" : "Latest income, donation, subscription & expenses"}
              </p>
            </div>
            <Link to="/reports" className="shrink-0">
              <Hint label={lang === "bn" ? "সকল রিপোর্ট ও খতিয়ান" : "View All Reports"} side="top">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary gap-1 cursor-pointer px-2">
                  <span>{t("view_all")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Hint>
            </Link>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {isLoadingTxn ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`txn-skel-${i}`} className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl border border-border/40 min-w-0">
                  <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 shrink-0" />
                </div>
              ))
            ) : recentTxn && recentTxn.length > 0 ? (
              recentTxn.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-all hover:border-primary/25 min-w-0"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.kind === "credit"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      }`}
                    >
                      {tx.kind === "credit" ? (
                        <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                          {tx.title}
                        </p>
                        <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md border font-medium shrink-0 ${tx.badgeColor}`}>
                          {tx.badge}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate mt-0.5">
                        {tx.date} {tx.subtitle ? `• ${tx.subtitle}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className={`font-bold font-mono text-xs sm:text-sm whitespace-nowrap shrink-0 pl-1.5 ${
                    tx.kind === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {tx.kind === "credit" ? "+" : "-"}{fmtCurrency(tx.amount, lang)}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                <Receipt className="w-8 h-8 mb-2 opacity-25" />
                <p className="text-xs">{t("no_data")}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notice Board (1 Col) */}
        <Card className="p-4 sm:p-5 shadow-sm border-border/60 flex flex-col bg-card overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{t("notice_board")}</span>
            </h2>
            <Link to="/notices">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 cursor-pointer">
                <span>{t("view_all")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {isLoadingNotices ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`notice-skel-${i}`} className="p-3 rounded-xl border border-border/40 space-y-2">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : notices && notices.length > 0 ? (
              notices.map((n: any) => (
                <Link key={n.id} to="/notices" className="block group">
                  <div className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40 transition-all space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] font-mono py-0 h-4 bg-background">
                        {n.notice_date}
                      </Badge>
                      <Sparkles className="w-3 h-3 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-medium text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <Bell className="w-8 h-8 mb-2 opacity-25" />
                <p className="text-xs">{lang === "bn" ? "কোন নোটিশ পাওয়া যায়নি" : "No active notices"}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
