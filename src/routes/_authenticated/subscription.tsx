import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hint } from "@/components/ui/hint";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, toBnNum } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Coins, Printer, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PrintableReceipt, type ReceiptData } from "@/components/printable-receipt";
import { sendSms } from "@/lib/sms";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/_authenticated/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [sendingAlerts, setSendingAlerts] = useState(false);

  // States for custom popups
  const [alertConfirmOpen, setAlertConfirmOpen] = useState(false);
  const [alertDefaulters, setAlertDefaulters] = useState<any[]>([]);
  
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectData, setCollectData] = useState<{member: any, amount: number, paid: string} | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<ReceiptData | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Subscription_Receipt",
  });

  const triggerPrint = (data: ReceiptData) => {
    setPrintData(data);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const { data: members } = useQuery({
    queryKey: ["members-active"],
    queryFn: async () => (await supabase.from("members").select("id, full_name, member_code, monthly_subscription, phone").eq("status", "active").order("full_name")).data ?? [],
  });
  const { data: subs } = useQuery({
    queryKey: ["subs", year, month],
    queryFn: async () => (await supabase.from("subscriptions").select("*").eq("year", year).eq("month", month)).data ?? [],
  });

  const collect = useMutation({
    mutationFn: async ({ member, amount, paid }: { member: any; amount: number; paid: number }) => {
      const existing = subs?.find((s: any) => s.member_id === member.id);
      const status = paid >= amount ? "paid" : paid > 0 ? "partial" : "due";
      const payload: any = {
        member_id: member.id, year, month, amount, paid_amount: paid, status,
        paid_date: paid > 0 ? new Date().toISOString().slice(0, 10) : null,
      };
      if (existing) {
        const { error } = await supabase.from("subscriptions").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("saved")); qc.invalidateQueries({ queryKey: ["subs", year, month] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const totalDue = (members ?? []).reduce((s: number, m: any) => s + Number(m.monthly_subscription || 0), 0);
  const totalPaid = (subs ?? []).reduce((s: number, x: any) => s + Number(x.paid_amount || 0), 0);

  const months = lang === "bn"
    ? ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const confirmSendDueAlerts = () => {
    if (!members) return;
    const defaulters = members.filter((m: any) => {
      const sub = subs?.find((s: any) => s.member_id === m.id);
      const paid = Number(sub?.paid_amount ?? 0);
      const amt = Number(m.monthly_subscription ?? 0);
      return paid < amt && m.phone;
    });

    if (defaulters.length === 0) {
      return toast.info(lang === "bn" ? "কোনো বকেয়া সদস্য নেই" : "No due members found");
    }

    setAlertDefaulters(defaulters);
    setAlertConfirmOpen(true);
  };

  const handleSendDueAlerts = async () => {
    setAlertConfirmOpen(false);
    setSendingAlerts(true);
    let successCount = 0;
    
    for (const m of alertDefaulters) {
      const sub = subs?.find((s: any) => s.member_id === m.id);
      const paid = Number(sub?.paid_amount ?? 0);
      const amt = Number(m.monthly_subscription ?? 0);
      const due = amt - paid;
      
      const msg = lang === "bn"
        ? `আসসালামু আলাইকুম ${m.full_name}, আপনার ${months[month - 1]} ${year} এর মাসিক চাঁদা ${due} টাকা বকেয়া রয়েছে। অনুগ্রহ করে পরিশোধ করুন। - বায়তুল মামুর জামে মসজিদ`
        : `Assalamu Alaikum ${m.full_name}, your subscription of ${due} BDT for ${months[month - 1]} ${year} is due. Please pay soon. - Baytul Mamur Jame Mosque`;
        
      const sent = await sendSms(m.phone as string, msg);
      if (sent) successCount++;
    }
    
    setSendingAlerts(false);
    toast.success(lang === "bn" ? `${successCount} টি SMS পাঠানো হয়েছে` : `${successCount} SMS sent successfully`);
  };

  const openCollectDialog = (m: any, amt: number) => {
    setCollectData({ member: m, amount: amt, paid: String(amt) });
    setCollectOpen(true);
  };

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (collectData) {
      collect.mutate({
        member: collectData.member,
        amount: collectData.amount,
        paid: Number(collectData.paid) || 0
      });
    }
    setCollectOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader icon={Coins} title={t("subscription")} subtitle={`${toBnNum(totalPaid, lang)} / ${toBnNum(totalDue, lang)} ৳`} />
      <Card className="p-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input type="number" min="2020" max="2099" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28" />
          <div className="flex gap-1 flex-wrap">
            {months.map((m, i) => (
              <Button key={i} size="sm" variant={month === i + 1 ? "default" : "outline"} onClick={() => setMonth(i + 1)} className={month === i + 1 ? "bg-primary" : ""}>{m}</Button>
            ))}
          </div>
        </div>
        <PermissionGuard module="Monthly Chanda" action="Create" fallback={<></>}>
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={confirmSendDueAlerts} disabled={sendingAlerts}>
            {sendingAlerts ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
            {lang === "bn" ? "বকেয়া SMS পাঠান" : "Send Due Alerts"}
          </Button>
        </PermissionGuard>
      </Card>
      <Card className="overflow-x-auto shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">{t("name")}</th>
              <th className="text-right p-3">{t("amount")}</th>
              <th className="text-right p-3">{lang === "bn" ? "প্রাপ্ত" : "Paid"}</th>
              <th className="p-3">{t("status")}</th>
              <th className="p-3 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m: any) => {
              const sub = subs?.find((s: any) => s.member_id === m.id);
              const paid = Number(sub?.paid_amount ?? 0);
              const amt = Number(m.monthly_subscription ?? 0);
              const status = sub?.status ?? "due";
              return (
                <tr key={m.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{m.full_name}</div>
                    <div className="text-xs text-muted-foreground">{m.member_code ?? "—"}</div>
                  </td>
                  <td className="p-3 text-right">{fmtCurrency(amt, lang)}</td>
                  <td className="p-3 text-right text-success font-semibold">{fmtCurrency(paid, lang)}</td>
                  <td className="p-3">
                    <Badge className={status === "paid" ? "bg-success text-success-foreground" : status === "partial" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}>
                      {status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {paid > 0 && (
                      <Hint label={lang === "bn" ? "প্রিন্ট রসিদ" : "Print Receipt"}>
                        <Button size="icon" variant="outline" className="text-primary border-primary hover:bg-primary/10" onClick={() => {
                          triggerPrint({
                            id: sub?.id ?? `SUB-${m.id}-${year}-${month}`,
                            type: "subscription",
                            date: sub?.paid_date ?? new Date().toISOString().slice(0, 10),
                            amount: paid,
                            name: m.full_name,
                            memberId: m.member_code ?? "",
                            details: lang === "bn" ? `${months[month - 1]} ${year} এর চাঁদা` : `Subscription for ${months[month - 1]} ${year}`
                          });
                        }}>
                          <Printer className="w-4 h-4" />
                        </Button>
                      </Hint>
                      )}
                      <PermissionGuard module="Monthly Chanda" action="Create" fallback={<></>}>
                        <Button size="sm" className="bg-primary h-9" onClick={() => openCollectDialog(m, amt)}>
                          {lang === "bn" ? "আদায়" : "Collect"}
                        </Button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(members ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">{t("no_data")}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      
      {/* Hidden Print Area */}
      <div className="hidden">
        {printData && <PrintableReceipt ref={printRef} data={printData} />}
      </div>

      {/* Custom Alert Dialog for Sending Due SMS */}
      <Dialog open={alertConfirmOpen} onOpenChange={setAlertConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === "bn" ? "এসএমএস নিশ্চিতকরণ" : "Confirm SMS"}</DialogTitle>
            <DialogDescription className="py-4 text-base">
              {lang === "bn" 
                ? `মোট ${alertDefaulters.length} জনকে বকেয়া SMS পাঠানো হবে। আপনি কি নিশ্চিত?` 
                : `Send due SMS to ${alertDefaulters.length} members? Are you sure?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAlertConfirmOpen(false)}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button onClick={handleSendDueAlerts} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Bell className="w-4 h-4 mr-2" />
              {lang === "bn" ? "পাঠান" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Dialog for Collect Prompt */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent>
          <form onSubmit={handleCollect}>
            <DialogHeader>
              <DialogTitle>{lang === "bn" ? "চাঁদা আদায়" : "Collect Subscription"}</DialogTitle>
              <DialogDescription>
                {collectData && (lang === "bn" 
                  ? `${collectData.member.full_name} এর চাঁদা আদায় করছেন।`
                  : `Collecting subscription for ${collectData.member.full_name}.`)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="grid gap-2">
                <Label htmlFor="amount">{lang === "bn" ? "প্রাপ্ত টাকা:" : "Paid amount:"}</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0"
                  autoFocus
                  value={collectData?.paid || ""}
                  onChange={(e) => setCollectData(prev => prev ? {...prev, paid: e.target.value} : null)} 
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCollectOpen(false)}>
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" className="bg-primary">
                {lang === "bn" ? "সেভ করুন" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
