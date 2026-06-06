import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n, fmtCurrency, toBnNum } from "@/lib/i18n";
import {
  Users, Coins, UserX, AlertCircle, Gift, Wallet, Landmark,
  HandCoins, UserPlus, HandHeart, Receipt, Printer, BarChart3, Bell, ArrowUpRight, ArrowDownRight, ArrowRight, Calendar as CalendarIcon, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const [isTestingCron, setIsTestingCron] = useState(false);

  const handleTestCron = async () => {
    setIsTestingCron(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('app_health_checks' as any)
        .update({
          status: 'active',
          lastCheckedAt: now,
          updatedAt: now
        } as any)
        .eq('serviceName', 'main');

      if (error) throw error;
      toast.success("Cron test successful!");
    } catch (error: any) {
      toast.error(`Cron test failed: ${error.message}`);
    } finally {
      setIsTestingCron(false);
    }
  };

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [members, subs, donations, accounts] = await Promise.all([
        supabase.from("members").select("id, status", { count: "exact" }),
        supabase.from("subscriptions").select("amount, paid_amount, status").gte("year", now.getFullYear()).eq("month", now.getMonth() + 1),
        supabase.from("donations").select("amount").gte("donation_date", firstOfMonth.slice(0, 10)),
        supabase.from("accounts").select("kind, current_balance"),
      ]);

      const totalMembers = members.count ?? 0;
      const monthlyCollection = (subs.data ?? []).reduce((s, r: any) => s + Number(r.paid_amount || 0), 0);
      const dueAmount = (subs.data ?? []).reduce((s, r: any) => s + Math.max(0, Number(r.amount || 0) - Number(r.paid_amount || 0)), 0);
      const dueMembers = (subs.data ?? []).filter((r: any) => r.status !== "paid").length;
      const totalDonations = (donations.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const cashBal = (accounts.data ?? []).filter((a: any) => a.kind === "cash").reduce((s, a: any) => s + Number(a.current_balance || 0), 0);
      const bankBal = (accounts.data ?? []).filter((a: any) => a.kind === "bank").reduce((s, a: any) => s + Number(a.current_balance || 0), 0);

      return { totalMembers, monthlyCollection, dueAmount, dueMembers, totalDonations, cashBal, bankBal };
    },
  });

  const { data: notices } = useQuery({
    queryKey: ["dashboard-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").eq("published", true).order("notice_date", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: recentTxn } = useQuery({
    queryKey: ["recent-txn"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").order("txn_date", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["dashboard-chart"],
    queryFn: async () => {
      const today = new Date();
      const fiveWeeksAgo = new Date(today);
      fiveWeeksAgo.setDate(today.getDate() - 35);
      const { data } = await supabase.from("transactions")
        .select("amount, kind, txn_date")
        .gte("txn_date", fiveWeeksAgo.toISOString().split("T")[0]);

      const weeks = Array.from({ length: 5 }, (_, i) => {
        const end = new Date(today);
        end.setDate(today.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return { start, end, label: lang === "bn" ? `সপ্তাহ ${5 - i}` : `W${5 - i}`, income: 0, expense: 0 };
      }).reverse();

      (data ?? []).forEach((tx: any) => {
        const txDate = new Date(tx.txn_date);
        for (const w of weeks) {
          if (txDate >= w.start && txDate <= w.end) {
            if (tx.kind === "credit") w.income += Number(tx.amount);
            if (tx.kind === "debit") w.expense += Number(tx.amount);
            break;
          }
        }
      });

      return weeks.map(w => ({ week: w.label, income: w.income, expense: w.expense }));
    },
  });



  const kpis = [
    { label: t("total_members"), value: toBnNum(stats?.totalMembers ?? 0, lang), suffix: t("persons"), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: t("monthly_collection"), value: fmtCurrency(stats?.monthlyCollection ?? 0, lang), icon: Coins, color: "text-info", bg: "bg-info/10" },
    { label: t("due_members"), value: toBnNum(stats?.dueMembers ?? 0, lang), suffix: t("persons"), icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    { label: t("due_amount"), value: fmtCurrency(stats?.dueAmount ?? 0, lang), icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: t("total_donations"), value: fmtCurrency(stats?.totalDonations ?? 0, lang), icon: Gift, color: "text-primary", bg: "bg-primary/10" },
    { label: t("cash_balance"), value: fmtCurrency(stats?.cashBal ?? 0, lang), icon: Wallet, color: "text-success", bg: "bg-success/10" },
    { label: t("bank_balance"), value: fmtCurrency(stats?.bankBal ?? 0, lang), icon: Landmark, color: "text-info", bg: "bg-info/10" },
  ];

  const quickActions = [
    { key: "collect_subscription", icon: HandCoins, color: "text-gold", path: "/subscription" },
    { key: "new_member", icon: UserPlus, color: "text-primary", path: "/members" },
    { key: "receive_donation", icon: HandHeart, color: "text-info", path: "/donations" },
    { key: "expense_entry", icon: Receipt, color: "text-warning", path: "/expenses" },
    { key: "print_receipt", icon: Printer, color: "text-destructive", path: "/reports" },
    { key: "reports", icon: BarChart3, color: "text-success", path: "/reports" },
  ] as const;

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as const;
  const formattedDate = today.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', dateOptions);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Hero / Header Section */}
      <div className="bg-card p-6 border-b sm:border border-border/60 sm:rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {lang === "bn" ? "আসসালামু আলাইকুম" : "Assalamu Alaikum"}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2" suppressHydrationWarning>
            <CalendarIcon className="w-4 h-4" />
            {formattedDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.slice(0, 4).map((a) => (
            <Link key={a.key} to={a.path as any}>
              <Button variant="outline" size="sm" className="shadow-sm">
                <a.icon className={`w-4 h-4 mr-2 ${a.color}`} />
                {t(a.key as any)}
              </Button>
            </Link>
          ))}
          <Button 
            variant="secondary" 
            size="sm" 
            className="shadow-sm"
            onClick={handleTestCron}
            disabled={isTestingCron}
          >
            <Activity className={`w-4 h-4 mr-2 ${isTestingCron ? "animate-spin" : "text-primary"}`} />
            {isTestingCron ? "Testing..." : "Test Cron"}
          </Button>
          <Link to="/reports">
            <Button variant="default" size="sm" className="shadow-sm">
              {t("reports")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 shadow-sm hover:border-primary/30 transition-colors flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-md ${k.bg} flex items-center justify-center shrink-0`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground font-medium truncate">{k.label}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h4 className="text-xl font-bold text-foreground truncate">{k.value}</h4>
                {k.suffix && <span className="text-xs text-muted-foreground">{k.suffix}</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Chart */}
        <Card className="p-5 shadow-sm border-border/50 xl:col-span-2 flex flex-col bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">{t("monthly_income_expense")}</h3>
          </div>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success, 142.1 76.2% 36.3%))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success, 142.1 76.2% 36.3%))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive, 0 84.2% 60.2%))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive, 0 84.2% 60.2%))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--success, 142.1 76.2% 36.3%))" strokeWidth={3} fill="url(#colorIncome)" name={t("income_label")} />
                <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive, 0 84.2% 60.2%))" strokeWidth={3} fill="url(#colorExpense)" name={t("expense_label")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-5 shadow-sm border-border/50 flex flex-col bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{t("recent_transactions")}</h3>
            <Link to="/reports">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-1 space-y-4">
            {recentTxn && recentTxn.length > 0 ? recentTxn.map((tx: any) => (
              <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.kind === "credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {tx.kind === "credit" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{tx.description ?? tx.reference ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{tx.txn_date}</p>
                </div>
                <div className={`font-semibold whitespace-nowrap ${tx.kind === "credit" ? "text-success" : "text-destructive"}`}>
                  {tx.kind === "credit" ? "+" : "-"}{fmtCurrency(Number(tx.amount), lang)}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                <Receipt className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">{t("no_data")}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Notice Board */}
      <Card className="p-5 shadow-sm bg-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-gold/10 flex items-center justify-center text-gold">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-lg">{t("notice_board")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices && notices.length > 0 ? notices.map((n: any) => (
            <div key={n.id} className="group p-4 rounded-lg border border-border/60 bg-card hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] uppercase font-medium">{n.notice_date}</Badge>
              </div>
              <h4 className="font-medium text-foreground line-clamp-2">{n.title}</h4>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-10">
              <Bell className="w-10 h-10 mb-3 opacity-20" />
              <p>{t("no_data")}</p>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
