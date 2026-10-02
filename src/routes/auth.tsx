import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, Copy, Check } from "lucide-react";
import { MosqueIcon } from "@/components/ui/mosque-icon";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "লগইন | বায়তুল মামুর মসজিদ" }] }),
  component: AuthPage,
});

const DEMO_EMAIL = "mosqueadmin@info.com";
const DEMO_PASSWORD = "MosqueAdmin@123";

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/welcome", replace: true });
  }, [session, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success(lang === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে" : "Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(lang === "bn" ? "স্বাগতম" : "Welcome");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setBusy(true);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) throw error;
      toast.success(
        lang === "bn"
          ? "ডেমো অ্যাডমিন হিসেবে স্বাগতম!"
          : "Welcome as Demo Admin!"
      );
    } catch (err: any) {
      toast.error(err.message ?? (lang === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCreds = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Email: ${DEMO_EMAIL}\nPassword: ${DEMO_PASSWORD}`);
    setCopied(true);
    toast.success(lang === "bn" ? "ক্রেডেনশিয়াল কপি করা হয়েছে" : "Credentials copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/welcome`,
      },
    });
    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-primary relative overflow-hidden"
      style={{ background: "var(--gradient-primary)" }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }} />

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10"
          onClick={() => setLang(lang === "bn" ? "en" : "bn")}>
          {lang === "bn" ? "EN" : "বাং"}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md p-8 shadow-elevated">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
              style={{ background: "var(--gradient-gold)" }}>
              <MosqueIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">{t("app_name")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("tagline")}</p>
          </div>

          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")}>
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">{t("login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <h2 className="text-lg font-semibold mb-3">{t("welcome_back")}</h2>
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <h2 className="text-lg font-semibold mb-3">{t("create_account")}</h2>
            </TabsContent>

            <form onSubmit={handleEmail} className="space-y-3">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">{t("full_name")}</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("placeholder_name")}
                      className="pl-9"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("placeholder_email")}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pw">{t("password")}</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="pw"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("placeholder_password")}
                    className="pl-9 pr-10"
                    required
                    minLength={6}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t("hide_password") : t("show_password")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={busy}>
                {busy ? t("loading") : (isSignUp ? t("signup") : t("login"))}
              </Button>
            </form>

            {!isSignUp && (
              <div className="mt-5 pt-4 border-t border-dashed border-border/80">
                <div className="rounded-xl p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-primary/10 border border-emerald-500/25 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "ডেমো ভিজিটর এক্সেস" : "Demo Visitor Access"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCreds}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-background/80"
                      title={lang === "bn" ? "ক্রেডেনশিয়াল কপি করুন" : "Copy credentials"}
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? (lang === "bn" ? "কপি হয়েছে" : "Copied") : (lang === "bn" ? "কপি" : "Copy")}</span>
                    </button>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium shadow-sm flex items-center justify-center gap-2 group transition-all cursor-pointer"
                    onClick={handleDemoLogin}
                    disabled={busy}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 transition-transform group-hover:scale-110" />
                    <span>{lang === "bn" ? "১-ক্লিকে ডেমো লগইন করুন" : "1-Click Demo Login"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <div className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded border border-border/50 text-[10px]">
                      {DEMO_EMAIL}
                    </span>
                    <span>•</span>
                    <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded border border-border/50 text-[10px]">
                      ••••••••••
                    </span>
                    <span className="text-[10px] text-muted-foreground/80">
                      ({lang === "bn" ? "টেস্টের জন্য উন্মুক্ত" : "Ready to explore"})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}


