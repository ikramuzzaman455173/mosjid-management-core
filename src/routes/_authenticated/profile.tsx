import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Save, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function ProfilePage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [form, setForm] = useState({ full_name: "", email: "" });

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
    if (profile || user) {
      setForm({ full_name: profile?.full_name ?? "", email: user?.email ?? "" });
    }
  }, [profile, user]);

  const [passwordForm, setPasswordForm] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateAuthMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      if (passwordForm !== confirmPassword) throw new Error(lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match");
      if (passwordForm.length < 6) throw new Error(lang === "bn" ? "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      
      const { error } = await supabase.auth.updateUser({ password: passwordForm });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "bn" ? "পাসওয়ার্ড আপডেট হয়েছে" : "Password updated");
      setPasswordForm("");
      setConfirmPassword("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("profiles").update({ full_name: form.full_name }).eq("id", user.id);
      if (error) throw error;

      if (form.email && form.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: form.email });
        if (authError) throw authError;
      }
    },
    onSuccess: () => {
      toast.success(lang === "bn" ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader icon={User} title={lang === "bn" ? "আমার প্রোফাইল" : "My Profile"} subtitle={lang === "bn" ? "ব্যক্তিগত তথ্য ও অ্যাকাউন্টের নিরাপত্তা" : "Personal details and account security"} />

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
                  <Label>{lang === "bn" ? "ইমেইল অ্যাড্রেস" : "Email Address"}</Label>
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="mt-1" />
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

      <Card className="p-6 shadow-card space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600"><Lock className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{lang === "bn" ? "অ্যাকাউন্ট সিকিউরিটি" : "Account Security"}</h3>
            <p className="text-sm text-muted-foreground mb-4">{lang === "bn" ? "লগইন পাসওয়ার্ড পরিবর্তন করুন" : "Update your login password"}</p>
            
            <div className="space-y-4 max-w-sm">
              <div>
                <Label>{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</Label>
                <div className="relative mt-1">
                  <Input value={passwordForm} onChange={e => setPasswordForm(e.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>{lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}</Label>
                <div className="relative mt-1">
                  <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={() => updateAuthMutation.mutate()} disabled={updateAuthMutation.isPending || !passwordForm || !confirmPassword}>
                {updateAuthMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {lang === "bn" ? "আপডেট করুন" : "Update Credentials"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });
