import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { useAppSettings } from "@/lib/use-app-settings";
import { Calculator, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFitra: (amount: number) => void;
}

type FitraCategory = "wheat" | "barley" | "raisins" | "dates" | "cheese";

const FITRA_WEIGHTS: Record<FitraCategory, number> = {
  wheat: 1.65, // half Sa' (kg)
  barley: 3.3, // 1 Sa' (kg)
  raisins: 3.3,
  dates: 3.3,
  cheese: 3.3,
};

export function FitraCalculator({ open, onOpenChange, onApplyFitra }: Props) {
  const { lang } = useI18n();
  const { settings } = useAppSettings();
  const tbn = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const [category, setCategory] = useState<FitraCategory>("wheat");
  const [pricePerKg, setPricePerKg] = useState<number>(settings.fitraPrices.wheat);
  const [familyMembers, setFamilyMembers] = useState<number>(1);

  const weight = FITRA_WEIGHTS[category];
  const fitraPerPerson = weight * (pricePerKg || 0);
  const totalFitra = fitraPerPerson * (familyMembers || 0);

  const handleApply = () => {
    onApplyFitra(Math.ceil(totalFitra));
    onOpenChange(false);
  };

  const handleCategoryChange = (val: FitraCategory) => {
    setCategory(val);
    setPricePerKg(settings.fitraPrices[val]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Calculator className="w-5 h-5" />
            {tbn("Fitra Calculator", "ফিতরা ক্যালকুলেটর")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          <div className="space-y-4">
            <div>
              <Label>{tbn("Fitra Category (Standard)", "ফিতরার ধরন (নিসাব)")}</Label>
              <Select value={category} onValueChange={(v) => handleCategoryChange(v as FitraCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={tbn("Select category", "ক্যাটাগরি নির্বাচন করুন")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wheat">{tbn("Wheat / Atta (গম/আটা)", "গম/আটা (Wheat)")}</SelectItem>
                  <SelectItem value="barley">{tbn("Barley (যব)", "যব (Barley)")}</SelectItem>
                  <SelectItem value="raisins">{tbn("Raisins (কিশমিশ)", "কিশমিশ (Raisins)")}</SelectItem>
                  <SelectItem value="dates">{tbn("Dates (খেজুর)", "খেজুর (Dates)")}</SelectItem>
                  <SelectItem value="cheese">{tbn("Cheese (পনির)", "পনির (Cheese)")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {tbn(`Required weight per person: ${weight} kg`, `জনপ্রতি নির্ধারিত পরিমাণ: ${weight} কেজি`)}
              </p>
            </div>

            <div>
              <Label>{tbn("Current Market Price (per KG)", "বর্তমান বাজার মূল্য (প্রতি কেজি)")}</Label>
              <div className="relative mt-1">
                <Input 
                  type="number" 
                  min="0" 
                  value={pricePerKg || ""} 
                  onChange={(e) => setPricePerKg(Number(e.target.value))}
                  placeholder="120"
                  className="pl-8"
                />
                <span className="absolute left-3 top-2.5 text-muted-foreground">৳</span>
              </div>
            </div>

            <div>
              <Label>{tbn("Number of Family Members", "পরিবারের সদস্য সংখ্যা")}</Label>
              <Input 
                type="number" 
                min="1" 
                value={familyMembers || ""} 
                onChange={(e) => setFamilyMembers(Number(e.target.value))}
                placeholder="1"
                className="mt-1"
              />
            </div>
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20 text-center space-y-1">
            <div className="text-sm text-muted-foreground">
              {tbn("Fitra per person:", "জনপ্রতি ফিতরা:")} <span className="font-semibold">{fmtCurrency(fitraPerPerson, lang)}</span>
            </div>
            <div className="text-sm text-muted-foreground">{tbn("Total Fitra Amount", "মোট ফিতরার পরিমাণ")}</div>
            <div className="text-3xl font-bold text-primary">
              {fmtCurrency(Math.ceil(totalFitra), lang)}
            </div>
          </Card>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleApply}
            disabled={totalFitra <= 0}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {tbn("Add as Fitra Entry", "ফিতরা এন্ট্রি হিসেবে যোগ করুন")}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
