import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, TrendingDown, Wallet, Users, Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { t, lang } = useI18n();
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Mosque_Report",
  });

  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [income, expenses, members, accounts] = await Promise.all([
        supabase.from("income").select("amount, income_date"),
        supabase.from("expenses").select("amount, expense_date"),
        supabase.from("members").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("accounts").select("current_balance"),
      ]);
      const totalIncome = (income.data ?? []).reduce((s, x: any) => s + Number(x.amount || 0), 0);
      const totalExpense = (expenses.data ?? []).reduce((s, x: any) => s + Number(x.amount || 0), 0);
      const balance = (accounts.data ?? []).reduce((s, x: any) => s + Number(x.current_balance || 0), 0);

      // Monthly chart (last 6 months)
      const months: Record<string, { income: number; expense: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const k = `${y}-${m}`;
        months[k] = { income: 0, expense: 0 };
      }
      (income.data ?? []).forEach((x: any) => {
        const k = (x.income_date ?? "").slice(0, 7);
        if (months[k]) months[k].income += Number(x.amount || 0);
      });
      (expenses.data ?? []).forEach((x: any) => {
        const k = (x.expense_date ?? "").slice(0, 7);
        if (months[k]) months[k].expense += Number(x.amount || 0);
      });
      const chart = Object.entries(months).map(([k, v]) => ({ month: k.slice(5), ...v }));

      return { totalIncome, totalExpense, balance, memberCount: members.count ?? 0, chart };
    },
  });

  const isLoading = !data;

  const cards = [
    { label: t("total_members"), value: String(data?.memberCount ?? 0), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: lang === "bn" ? "মোট আয়" : "Total Income", value: fmtCurrency(data?.totalIncome ?? 0, lang), icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: lang === "bn" ? "মোট ব্যয়" : "Total Expense", value: fmtCurrency(data?.totalExpense ?? 0, lang), icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
    { label: t("balance"), value: fmtCurrency(data?.balance ?? 0, lang), icon: Wallet, color: "text-gold", bg: "bg-gold/15" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={BarChart3}
        title={t("reports")}
        subtitle={lang === "bn" ? "সারসংক্ষেপ ও বিশ্লেষণ" : "Summary & analytics"}
        actions={
          <Button onClick={() => handlePrint()} variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 h-8 sm:h-9 text-xs sm:text-sm">
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            {lang === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}
          </Button>
        }
      />

      <div ref={printRef} className="space-y-6 print:p-8 print:bg-white">
        <div className="hidden print:block text-center border-b-2 border-primary pb-4 mb-6">
          <h1 className="text-2xl font-bold text-primary mb-1">
            {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Jame Mosque"}
          </h1>
          <p className="text-sm text-gray-600">
            {lang === "bn" ? "মাইজঘোনা দক্ষিণ নতুন পাড়া, বাংলাদেশ" : "Maizghona Dakkhin Natun Para, Bangladesh"}
          </p>
          <h2 className="text-xl font-semibold mt-4">
            {lang === "bn" ? "সারসংক্ষেপ রিপোর্ট" : "Summary Report"}
          </h2>
          <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label} className="p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20 mt-1" />
                ) : (
                  <div className={`text-lg font-bold ${c.color} mt-0.5 truncate`}>{c.value}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 shadow-card">
        <h3 className="font-semibold text-primary mb-3">{lang === "bn" ? "গত ৬ মাসের আয়-ব্যয়" : "Last 6 months income vs expense"}</h3>
        {isLoading ? (
          <Skeleton className="w-full h-[260px] sm:h-[300px] rounded-lg" />
        ) : (
          <div className="w-full min-w-0 overflow-hidden h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 155)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" fill="oklch(0.55 0.16 150)" name={t("income_label")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="oklch(0.62 0.20 27)" name={t("expense_label")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
