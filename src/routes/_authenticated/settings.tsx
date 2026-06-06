import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Globe, User, LogOut, Palette, Save, Loader2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAppSettings } from "@/lib/use-app-settings";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { settings, updateSettings, isLoaded } = useAppSettings();

  const [form, setForm] = useState({ full_name: "", phone: "" });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "bn" ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleLogout = async () => {
    await signOut();
    toast.success(lang === "bn" ? "লগআউট সফল" : "Logged out");
    navigate({ to: "/auth" });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader icon={SettingsIcon} title={t("settings")} subtitle={lang === "bn" ? "অ্যাকাউন্ট ও সিস্টেম প্রেফারেন্স" : "Account & system preferences"} />

      <Card className="p-6 shadow-card space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{lang === "bn" ? "প্রোফাইল সেটিংস" : "Profile Settings"}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user?.email ?? "—"}</p>
            
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <div className="space-y-4 max-w-sm">
                <div>
                  <Label>{t("name")}</Label>
                  <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1" placeholder="Abdur Rahman" />
                </div>
                <div>
                  <Label>{t("phone")}</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" placeholder="01XXXXXXXXX" />
                </div>
                <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {lang === "bn" ? "সেভ করুন" : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold"><Globe className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{lang === "bn" ? "ভাষা" : "Language"}</h3>
            <p className="text-sm text-muted-foreground mb-3">{lang === "bn" ? "ইন্টারফেসের ভাষা নির্বাচন করুন" : "Choose interface language"}</p>
            <div className="flex gap-2">
              <Button size="sm" variant={lang === "bn" ? "default" : "outline"} onClick={() => setLang("bn")}>বাংলা</Button>
              <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>English</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Palette className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{lang === "bn" ? "থিম ও রঙ" : "Theme & Colors"}</h3>
            <p className="text-sm text-muted-foreground mb-4">{lang === "bn" ? "আপনার পছন্দের থিম নির্বাচন করুন" : "Select your preferred theme color"}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "default", name: "Emerald", color: "bg-[#0b5c46]" },
                { id: "theme-ocean", name: "Ocean", color: "bg-[#005e9e]" },
                { id: "theme-royal", name: "Royal", color: "bg-[#6d28d9]" },
                { id: "theme-sunset", name: "Sunset", color: "bg-[#c2410c]" }
              ].map(th => {
                const isSelected = (localStorage.getItem('app-theme') || 'default') === th.id;
                return (
                  <button 
                    key={th.id}
                    onClick={() => {
                      const root = document.documentElement;
                      root.classList.remove('theme-ocean', 'theme-royal', 'theme-sunset');
                      if (th.id !== 'default') root.classList.add(th.id);
                      localStorage.setItem('app-theme', th.id);
                      toast.success(lang === "bn" ? "থিম আপডেট হয়েছে" : "Theme updated");
                      // Force a re-render to update the checkmark
                      setForm(f => ({...f})); 
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-primary bg-primary/5 scale-[1.02] shadow-sm' : 'border-transparent hover:bg-muted'}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${th.color} shadow-sm ring-2 ring-offset-2 ${isSelected ? 'ring-primary' : 'ring-transparent'}`} />
                    <span className="text-xs font-medium">{th.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <PermissionGuard module="Settings" action="View" fallback={<></>}>
        <Card className="p-6 shadow-card space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600"><SettingsIcon className="w-5 h-5" /></div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{lang === "bn" ? "সিস্টেম ডিফল্ট (System Defaults)" : "System Defaults"}</h3>
              <p className="text-sm text-muted-foreground mb-4">{lang === "bn" ? "যাকাত, ফিতরা এবং নামাজের ডিফল্ট মানগুলো সেট করুন" : "Set default values for Zakat, Fitra, and Prayers"}</p>
              
              {isLoaded && (
                <div className="space-y-6">
                  
                  {/* Zakat */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-medium text-sm text-primary">{lang === "bn" ? "যাকাত নিসাব (Zakat Nisab)" : "Zakat Nisab"}</h4>
                    <div>
                      <Label>{lang === "bn" ? "ডিফল্ট নিসাবের পরিমাণ" : "Default Nisab Value"}</Label>
                      <Input 
                        type="number" 
                        value={settings.defaultNisab} 
                        onChange={(e) => updateSettings({ defaultNisab: Number(e.target.value) })}
                        className="max-w-[200px] mt-1" 
                      />
                    </div>
                  </div>

                  {/* Fitra */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-medium text-sm text-primary">{lang === "bn" ? "ফিতরা মূল্য (প্রতি কেজি)" : "Fitra Prices (per KG)"}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <Label>{lang === "bn" ? "গম/আটা" : "Wheat"}</Label>
                        <Input type="number" value={settings.fitraPrices.wheat} onChange={(e) => updateSettings({ fitraPrices: { ...settings.fitraPrices, wheat: Number(e.target.value) }})} className="mt-1" />
                      </div>
                      <div>
                        <Label>{lang === "bn" ? "যব" : "Barley"}</Label>
                        <Input type="number" value={settings.fitraPrices.barley} onChange={(e) => updateSettings({ fitraPrices: { ...settings.fitraPrices, barley: Number(e.target.value) }})} className="mt-1" />
                      </div>
                      <div>
                        <Label>{lang === "bn" ? "কিশমিশ" : "Raisins"}</Label>
                        <Input type="number" value={settings.fitraPrices.raisins} onChange={(e) => updateSettings({ fitraPrices: { ...settings.fitraPrices, raisins: Number(e.target.value) }})} className="mt-1" />
                      </div>
                      <div>
                        <Label>{lang === "bn" ? "খেজুর" : "Dates"}</Label>
                        <Input type="number" value={settings.fitraPrices.dates} onChange={(e) => updateSettings({ fitraPrices: { ...settings.fitraPrices, dates: Number(e.target.value) }})} className="mt-1" />
                      </div>
                      <div>
                        <Label>{lang === "bn" ? "পনির" : "Cheese"}</Label>
                        <Input type="number" value={settings.fitraPrices.cheese} onChange={(e) => updateSettings({ fitraPrices: { ...settings.fitraPrices, cheese: Number(e.target.value) }})} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Prayer */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-medium text-sm text-primary">{lang === "bn" ? "ইফতার ও সেহরি লোকেশন" : "Iftar & Sehri Location"}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{lang === "bn" ? "শহর" : "City"}</Label>
                        <Input value={settings.prayerCity} onChange={(e) => updateSettings({ prayerCity: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>{lang === "bn" ? "দেশ" : "Country"}</Label>
                        <Input value={settings.prayerCountry} onChange={(e) => updateSettings({ prayerCountry: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* SMS Provider Settings */}
                  <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm text-primary">{lang === "bn" ? "এসএমএস এপিআই (SMS API)" : "SMS API Settings"}</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>{lang === "bn" ? "এপিআই ইউআরএল (API URL)" : "API URL"}</Label>
                        <Input 
                          value={settings.smsApiUrl} 
                          onChange={(e) => updateSettings({ smsApiUrl: e.target.value })} 
                          className="mt-1"
                          placeholder="http://api.greenweb.com.bd/api.php" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{lang === "bn" ? "এপিআই কি (Token/Key)" : "API Key/Token"}</Label>
                          <Input type="password" value={settings.smsApiKey} onChange={(e) => updateSettings({ smsApiKey: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label>{lang === "bn" ? "সেন্ডার আইডি (ঐচ্ছিক)" : "Sender ID (Optional)"}</Label>
                          <Input value={settings.smsSenderId} onChange={(e) => updateSettings({ smsSenderId: e.target.value })} className="mt-1" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lang === "bn" 
                          ? "Greenweb SMS বা অন্যান্য যেকোনো HTTP API সাপোর্ট করে। অটোমেশনের জন্য এটি সেটআপ করা জরুরি।" 
                          : "Supports Greenweb SMS or similar generic HTTP APIs. Required for sending alerts."}
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </Card>
      </PermissionGuard>

      <Card className="p-6 shadow-card border-destructive/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1 text-destructive">{lang === "bn" ? "অ্যাকাউন্ট" : "Account"}</h3>
            <p className="text-sm text-muted-foreground">{lang === "bn" ? "সিস্টেম থেকে সাইন আউট করুন" : "Sign out of the system"}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />{t("logout")}</Button>
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });
