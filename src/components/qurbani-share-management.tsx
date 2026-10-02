import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export type Shareholder = {
  id: string;
  animal_id: string;
  name: string;
  phone: string;
  shares_taken: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QurbaniShareManagement({ open, onOpenChange }: Props) {
  const { lang } = useI18n();
  const tbn = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const qc = useQueryClient();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [form, setForm] = useState({ name: "", phone: "", shares_taken: 1 });

  const { data: animals = [] } = useQuery({
    queryKey: ["qurbani_animals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("qurbani_animals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data.length > 0 && !selectedAnimalId) setSelectedAnimalId(data[0].id);
      return data;
    },
    enabled: open
  });

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["qurbani_shares", selectedAnimalId],
    queryFn: async () => {
      const { data, error } = await supabase.from("qurbani_shares").select("*").eq("animal_id", selectedAnimalId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!selectedAnimalId
  });

  const addMutation = useMutation({
    mutationFn: async (newShare: any) => {
      const { error } = await supabase.from("qurbani_shares").insert([newShare]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qurbani_shares", selectedAnimalId] });
      setForm({ name: "", phone: "", shares_taken: 1 });
      toast.success(tbn("Added successfully", "সফলভাবে যুক্ত হয়েছে"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qurbani_shares").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qurbani_shares", selectedAnimalId] });
      toast.success(tbn("Deleted successfully", "মুছে ফেলা হয়েছে"));
    }
  });

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
  const animalMaxShares = selectedAnimal ? selectedAnimal.total_shares : 0;
  const currentSharesForAnimal = shares;
  const totalSharesTaken = currentSharesForAnimal.reduce((sum: number, s: any) => sum + Number(s.share_amount), 0);
  const availableShares = animalMaxShares - totalSharesTaken;

  const handleAdd = () => {
    if (!form.name || !form.shares_taken || !selectedAnimalId) return;
    if (form.shares_taken > availableShares) {
      alert(tbn(`Only ${availableShares} shares left!`, `আর মাত্র ${availableShares} টি ভাগ বাকি আছে!`));
      return;
    }

    addMutation.mutate({
      animal_id: selectedAnimalId,
      member_name: form.name,
      contact: form.phone,
      share_amount: Number(form.shares_taken),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(tbn("Are you sure you want to delete this share?", "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?"))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-primary/10 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            {tbn("Share (Bhag) Management", "ভাগ (Share) ম্যানেজমেন্ট")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
          
          {animals.length === 0 ? (
            <div className="text-center p-10 border border-dashed rounded-lg text-muted-foreground flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 mb-3 opacity-20 text-destructive" />
              <p className="font-semibold">{tbn("No animals available.", "কোনো পশু পাওয়া যায়নি।")}</p>
              <p className="text-sm mt-1">{tbn("Please add animals in 'Purchase & Costs' first.", "দয়া করে আগে 'পশু ক্রয় ও খরচ' থেকে পশু যুক্ত করুন।")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form & Animal Selection */}
              <div className="md:col-span-1 space-y-4 h-fit sticky top-0">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <Label className="text-primary font-semibold">{tbn("Select Animal", "পশু নির্বাচন করুন")}</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2 cursor-pointer"
                    value={selectedAnimalId} 
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                  >
                    {animals.map((a, i) => (
                      <option key={a.id} value={a.id}>
                        {tbn(a.type, a.type === "Cow" ? "গরু" : a.type === "Goat" ? "ছাগল" : a.type === "Sheep" ? "ভেড়া" : "উট")} #{animals.length - i}
                      </option>
                    ))}
                  </select>
                </Card>

                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold">{tbn("Add Shareholder", "অংশীদার যোগ করুন")}</h3>
                  
                  <div>
                    <Label>{tbn("Name", "নাম")} *</Label>
                    <Input value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} placeholder={tbn("e.g. Abdur Rahman", "যেমন: আব্দুর রহমান")} className="mt-1" />
                  </div>

                  <div>
                    <Label>{tbn("Phone", "ফোন নম্বর")}</Label>
                    <Input value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01XXXXXXXXX" className="mt-1" />
                  </div>

                  <div>
                    <Label>{tbn("Number of Shares", "ভাগের সংখ্যা")} *</Label>
                    <Input type="number" min="1" max={availableShares} value={form.shares_taken} onChange={e => setForm({...form, shares_taken: Number(e.target.value)})} placeholder="1" className="mt-1" disabled={availableShares <= 0} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {tbn(`Available: ${availableShares}`, `বাকি আছে: ${availableShares}`)}
                    </p>
                  </div>

                  <Button className="w-full" onClick={handleAdd} disabled={!form.name || availableShares <= 0 || Number(form.shares_taken) > availableShares || addMutation.isPending}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {tbn("Add Share", "ভাগ যোগ করুন")}
                  </Button>
                </Card>
              </div>

              {/* List & Visualization */}
              <div className="md:col-span-2 space-y-4">
                
                {selectedAnimal && (
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: animalMaxShares }).map((_, i) => {
                      const isTaken = i < totalSharesTaken;
                      return (
                        <div 
                          key={i} 
                          className={`flex-1 h-12 rounded-md flex items-center justify-center font-bold text-lg border-2 transition-colors
                            ${isTaken ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-dashed border-muted-foreground/30 text-muted-foreground/30'}`}
                        >
                          {i + 1}
                        </div>
                      )
                    })}
                  </div>
                )}

                <h3 className="font-semibold text-lg">{tbn("Shareholders List", "অংশীদারদের তালিকা")} ({currentSharesForAnimal.length})</h3>
                
                {isLoading ? (
                  <div className="text-center p-8 text-muted-foreground">{tbn("Loading...", "লোড হচ্ছে...")}</div>
                ) : currentSharesForAnimal.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                    <p>{tbn("No shares added for this animal yet.", "এই পশুর জন্য এখনও কোনো ভাগ যোগ করা হয়নি।")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentSharesForAnimal.map((s: any, i: number) => (
                      <Card key={s.id} className="p-4 flex items-center justify-between gap-4 border-l-4 border-l-primary">
                        <div>
                          <div className="font-bold">{s.member_name}</div>
                          {s.contact && <div className="text-sm text-muted-foreground">{s.contact}</div>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">{tbn("Shares Taken", "ভাগ নিয়েছে")}</div>
                            <div className="font-bold text-lg text-primary">{s.share_amount}</div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
