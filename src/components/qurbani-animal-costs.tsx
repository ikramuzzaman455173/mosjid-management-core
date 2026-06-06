import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Beef, Plus, Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QurbaniAnimalCosts({ open, onOpenChange }: Props) {
  const { lang } = useI18n();
  const tbn = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    type: "Cow",
    cost: "",
    processing_cost: "",
    vendor: "",
    purchase_date: new Date().toISOString().slice(0, 10),
  });

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ["qurbani_animals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("qurbani_animals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const addMutation = useMutation({
    mutationFn: async (newAnimal: any) => {
      const { error } = await supabase.from("qurbani_animals").insert([newAnimal]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qurbani_animals"] });
      setForm({ type: "Cow", cost: "", processing_cost: "", vendor: "", purchase_date: new Date().toISOString().slice(0, 10) });
      toast.success(tbn("Added successfully", "সফলভাবে যুক্ত হয়েছে"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qurbani_animals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qurbani_animals"] });
      toast.success(tbn("Deleted successfully", "মুছে ফেলা হয়েছে"));
    }
  });

  const handleAdd = () => {
    if (!form.cost || Number(form.cost) <= 0) return;
    addMutation.mutate({
      type: form.type,
      cost: Number(form.cost),
      processing_cost: Number(form.processing_cost) || 0,
      vendor: form.vendor,
      purchase_date: form.purchase_date
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(tbn("Are you sure you want to delete this record?", "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?"))) {
      deleteMutation.mutate(id);
    }
  };

  const totalAnimalCost = animals.reduce((sum: number, a: any) => sum + Number(a.cost), 0);
  const totalOtherCosts = animals.reduce((sum: number, a: any) => sum + Number(a.processing_cost || 0), 0);
  const grandTotal = totalAnimalCost + totalOtherCosts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-destructive/10 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Beef className="w-5 h-5" />
            {tbn("Animal Purchase & Costs", "পশু ক্রয় ও খরচ")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="p-4 md:col-span-1 space-y-4 h-fit sticky top-0">
              <h3 className="font-semibold">{tbn("Add New Expense", "নতুন খরচ যোগ করুন")}</h3>
              
              <div>
                <Label>{tbn("Animal Type", "পশুর ধরন")}</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={form.type} 
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Cow">{tbn("Cow (গরু)", "গরু (Cow)")}</option>
                  <option value="Goat">{tbn("Goat (ছাগল)", "ছাগল (Goat)")}</option>
                  <option value="Sheep">{tbn("Sheep (ভেড়া)", "ভেড়া (Sheep)")}</option>
                  <option value="Camel">{tbn("Camel (উট)", "উট (Camel)")}</option>
                </select>
              </div>

              <div>
                <Label>{tbn("Animal Price", "পশুর মূল্য")} (৳) *</Label>
                <Input type="number" min="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} placeholder="0" className="mt-1" />
              </div>

              <div>
                <Label>{tbn("Processing/Transport Cost", "অন্যান্য খরচ")} (৳)</Label>
                <Input type="number" min="0" value={form.processing_cost} onChange={e => setForm({...form, processing_cost: e.target.value})} placeholder="0" className="mt-1" />
              </div>
              
              <div>
                <Label>{tbn("Vendor/Source", "বিক্রেতা/উৎস")}</Label>
                <Input value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} placeholder={tbn("e.g. Gabtoli Haat", "যেমন: গাবতলী হাট")} className="mt-1" />
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={!form.cost || addMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {tbn("Add to List", "তালিকায় যুক্ত করুন")}
              </Button>
            </Card>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="text-xs text-muted-foreground">{tbn("Total Animal Cost", "মোট পশুর মূল্য")}</div>
                  <div className="font-bold text-lg text-primary">{fmtCurrency(totalAnimalCost, lang)}</div>
                </Card>
                <Card className="p-3 bg-warning/5 border-warning/20">
                  <div className="text-xs text-muted-foreground">{tbn("Other Costs", "অন্যান্য খরচ")}</div>
                  <div className="font-bold text-lg">{fmtCurrency(totalOtherCosts, lang)}</div>
                </Card>
                <Card className="p-3 bg-destructive/5 border-destructive/20 col-span-2 sm:col-span-1">
                  <div className="text-xs text-muted-foreground">{tbn("Grand Total", "সর্বমোট")}</div>
                  <div className="font-bold text-lg text-destructive">{fmtCurrency(grandTotal, lang)}</div>
                </Card>
              </div>

              <h3 className="font-semibold text-lg mt-6">{tbn("Purchased Animals", "ক্রয়কৃত পশু")} ({animals.length})</h3>
              
              {isLoading ? (
                <div className="text-center p-8">{tbn("Loading...", "লোড হচ্ছে...")}</div>
              ) : animals.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>{tbn("No animals added yet.", "এখনও কোনো পশু যুক্ত করা হয়নি।")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {animals.map((a: any, i: number) => (
                    <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-primary/5">#{animals.length - i}</Badge>
                          <span className="font-bold">{tbn(a.type, a.type === "Cow" ? "গরু" : a.type === "Goat" ? "ছাগল" : a.type === "Sheep" ? "ভেড়া" : "উট")}</span>
                          <span className="text-sm text-muted-foreground">• {a.purchase_date}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{tbn("Source:", "উৎস:")} </span>
                          <span>{a.vendor || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <div className="text-right">
                          <div className="font-bold text-success">{fmtCurrency(a.cost, lang)}</div>
                          <div className="text-xs text-muted-foreground">
                            +{fmtCurrency(a.processing_cost || 0, lang)} {tbn("costs", "খরচ")}
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
