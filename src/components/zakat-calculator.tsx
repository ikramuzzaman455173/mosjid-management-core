import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { useAppSettings } from "@/lib/use-app-settings";
import { Calculator, AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ZakatCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyZakat: (amount: number) => void;
}

export function ZakatCalculator({ open, onOpenChange, onApplyZakat }: ZakatCalculatorProps) {
  const { lang } = useI18n();
  const { settings } = useAppSettings();

  const [nisab, setNisab] = useState<number>(settings.defaultNisab);
  
  // Assets
  const [cash, setCash] = useState<number>(0);
  const [goldSilver, setGoldSilver] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [business, setBusiness] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);

  // Liabilities
  const [debts, setDebts] = useState<number>(0);

  const totalAssets = useMemo(() => {
    return (cash || 0) + (goldSilver || 0) + (investments || 0) + (business || 0) + (receivables || 0);
  }, [cash, goldSilver, investments, business, receivables]);

  const totalLiabilities = useMemo(() => {
    return debts || 0;
  }, [debts]);

  const netWealth = totalAssets - totalLiabilities;
  const isEligible = netWealth >= (nisab || 0) && netWealth > 0;
  const zakatAmount = isEligible ? netWealth * 0.025 : 0;

  const tbn = (en: string, bn: string) => lang === "bn" ? bn : en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {tbn("Zakat Calculator", "যাকাত ক্যালকুলেটর")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          {/* Left Side: Inputs */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="space-y-6 max-w-xl mx-auto">
              
              <div className="space-y-3">
                <h4 className="font-semibold text-primary border-b pb-2">{tbn("Nisab (Threshold)", "নিসাব (ন্যূনতম পরিমাণ)")}</h4>
                <Alert className="bg-primary/5 border-primary/20 text-primary">
                  <AlertCircle className="h-4 w-4" color="currentColor" />
                  <AlertTitle className="text-xs font-semibold mb-1">{tbn("Current Nisab Value", "বর্তমান নিসাবের মান")}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {tbn(
                      "Enter the current market value of 85 grams of gold or 595 grams of silver. If your net wealth is equal to or exceeds this amount, Zakat is obligatory.",
                      "বর্তমান বাজারে ৮৫ গ্রাম স্বর্ণ বা ৫৯৫ গ্রাম রৌপ্যের মূল্য লিখুন। আপনার নিট সম্পদ এই পরিমাণের সমান বা বেশি হলে যাকাত ফরজ হবে।"
                    )}
                  </AlertDescription>
                </Alert>
                <div>
                  <Label>{tbn("Nisab Value", "নিসাবের পরিমাণ")} (৳)</Label>
                  <Input type="number" min="0" value={nisab || ""} onChange={(e) => setNisab(Number(e.target.value))} placeholder={tbn("e.g. 80000", "যেমন: ৮০০০০")} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-primary border-b pb-2">{tbn("Assets (Wealth)", "সম্পদ")}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{tbn("Cash in Hand/Bank", "নগদ ও ব্যাংকে জমা")}</Label>
                    <Input type="number" min="0" value={cash || ""} onChange={(e) => setCash(Number(e.target.value))} placeholder="0" />
                  </div>
                  <div>
                    <Label>{tbn("Gold & Silver Value", "স্বর্ণ ও রৌপ্যের মূল্য")}</Label>
                    <Input type="number" min="0" value={goldSilver || ""} onChange={(e) => setGoldSilver(Number(e.target.value))} placeholder="0" />
                  </div>
                  <div>
                    <Label>{tbn("Investments/Shares", "বিনিয়োগ ও শেয়ার")}</Label>
                    <Input type="number" min="0" value={investments || ""} onChange={(e) => setInvestments(Number(e.target.value))} placeholder="0" />
                  </div>
                  <div>
                    <Label>{tbn("Business Inventory", "ব্যবসার পণ্য/মজুদ")}</Label>
                    <Input type="number" min="0" value={business || ""} onChange={(e) => setBusiness(Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>{tbn("Receivables (Money owed to you)", "পাওনা টাকা (যা ফেরত পাওয়ার আশা আছে)")}</Label>
                    <Input type="number" min="0" value={receivables || ""} onChange={(e) => setReceivables(Number(e.target.value))} placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-destructive border-b pb-2 border-destructive/20">{tbn("Liabilities (Deductions)", "দায় বা ঋণ (বাদ যাবে)")}</h4>
                <div>
                  <Label>{tbn("Debts & Pending Bills", "ঋণ এবং বকেয়া বিল")}</Label>
                  <Input type="number" min="0" value={debts || ""} onChange={(e) => setDebts(Number(e.target.value))} placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="w-full md:w-[320px] bg-background/95 md:bg-muted/30 backdrop-blur-sm md:backdrop-blur-none border-t md:border-t-0 md:border-l p-4 sm:p-6 flex flex-col shrink-0 md:justify-between sticky bottom-0 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-none">
            
            {/* Desktop Full Summary */}
            <div className="space-y-4 hidden md:block">
              <h3 className="font-semibold mb-4">{tbn("Calculation Summary", "হিসাবের সারাংশ")}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tbn("Total Assets:", "মোট সম্পদ:")}</span>
                  <span className="font-medium">{fmtCurrency(totalAssets, lang)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>{tbn("Liabilities:", "মোট ঋণ:")}</span>
                  <span>- {fmtCurrency(totalLiabilities, lang)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>{tbn("Net Wealth:", "নিট সম্পদ:")}</span>
                  <span>{fmtCurrency(netWealth > 0 ? netWealth : 0, lang)}</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border mt-6 ${isEligible ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border'}`}>
                <p className="text-xs font-medium text-center mb-1 text-muted-foreground">
                  {isEligible 
                    ? tbn("Zakat to Pay (2.5%)", "প্রদেয় যাকাত (২.৫%)") 
                    : tbn("Not Eligible for Zakat", "যাকাত ফরজ হয়নি")}
                </p>
                <div className={`text-2xl font-bold text-center ${isEligible ? 'text-primary' : 'text-muted-foreground'}`}>
                  {fmtCurrency(zakatAmount, lang)}
                </div>
              </div>
            </div>

            {/* Mobile Compact Summary */}
            <div className="md:hidden flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-muted-foreground">{tbn("Net Wealth", "নিট সম্পদ")}</div>
                <div className="font-semibold text-sm">{fmtCurrency(netWealth > 0 ? netWealth : 0, lang)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{isEligible ? tbn("Zakat (2.5%)", "যাকাত (২.৫%)") : tbn("Not Eligible", "যাকাত ফরজ হয়নি")}</div>
                <div className={`font-bold text-lg leading-tight ${isEligible ? 'text-primary' : 'text-muted-foreground'}`}>
                  {fmtCurrency(zakatAmount, lang)}
                </div>
              </div>
            </div>

            <Button 
              className="w-full md:mt-6" 
              disabled={!isEligible || zakatAmount <= 0}
              onClick={() => {
                onApplyZakat(zakatAmount);
                onOpenChange(false);
              }}
            >
              {tbn("Add as Zakat Entry", "যাকাত এন্ট্রি করুন")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
