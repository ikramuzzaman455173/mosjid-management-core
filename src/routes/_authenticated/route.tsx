import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Search,
  LayoutDashboard, Users, HandCoins, Gift, TrendingUp, TrendingDown,
  Wallet, Landmark, Smartphone, Package, Boxes, CalendarDays, UsersRound,
  Megaphone, Moon, CalendarHeart, HandHeart, Beef, Sparkles, Image as ImageIcon,
  BarChart3, Settings, ShieldCheck, FileText
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

// We need to import the sidebar groups or recreate them here to power the command menu
type Item = { key: any; url: string; icon: any };
const groups: { label: string; items: Item[] }[] = [
  {
    label: "main",
    items: [
      { key: "dashboard", url: "/dashboard", icon: LayoutDashboard },
      { key: "members", url: "/members", icon: Users },
      { key: "subscription", url: "/subscription", icon: HandCoins },
      { key: "donations", url: "/donations", icon: Gift },
    ],
  },
  {
    label: "finance",
    items: [
      { key: "income", url: "/income", icon: TrendingUp },
      { key: "expenses", url: "/expenses", icon: TrendingDown },
      { key: "cash_accounts", url: "/cash", icon: Wallet },
      { key: "bank_accounts", url: "/bank", icon: Landmark },
      { key: "mobile_banking", url: "/mobile-banking", icon: Smartphone },
    ],
  },
  {
    label: "assets",
    items: [
      { key: "assets", url: "/assets", icon: Package },
      { key: "inventory", url: "/inventory", icon: Boxes },
    ],
  },
  {
    label: "operations",
    items: [
      { key: "meetings", url: "/meetings", icon: CalendarDays },
      { key: "committee", url: "/committee", icon: UsersRound },
      { key: "notices", url: "/notices", icon: Megaphone },
      { key: "prayer_times", url: "/prayer-times", icon: Moon },
      { key: "events", url: "/events", icon: CalendarHeart },
    ],
  },
  {
    label: "islamic",
    items: [
      { key: "zakat", url: "/zakat", icon: HandHeart },
      { key: "qurbani", url: "/qurbani", icon: Beef },
      { key: "ramadan", url: "/ramadan", icon: Sparkles },
    ],
  },
  {
    label: "system",
    items: [
      { key: "gallery", url: "/gallery", icon: ImageIcon },
      { key: "reports", url: "/reports", icon: BarChart3 },
      { key: "users", url: "/users", icon: ShieldCheck },
      { key: "audit_logs", url: "/audit-logs", icon: FileText },
      { key: "settings", url: "/settings", icon: Settings },
    ],
  },
];

function Layout() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [openCommand, setOpenCommand] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-2 border-b bg-card px-3 sticky top-0 z-30">
            <SidebarTrigger />
            
            <div className="flex-1 flex justify-center max-w-md ml-4">
              <button
                onClick={() => setOpenCommand(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border/50 rounded-md text-sm text-muted-foreground transition-all duration-300 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{lang === "bn" ? "যেকোনো কিছু খুঁজুন..." : "Search anything..."}</span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-[4px] border border-border/60 bg-background px-1.5 font-sans text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
            
            <div className="flex-1" />
            <Button size="sm" variant="ghost" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>
              {lang === "bn" ? "EN" : "বাং"}
            </Button>
            <Button size="icon" variant="ghost">
              <Bell className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">{t("admin")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder={lang === "bn" ? "মেনু খুঁজুন..." : "Search menu..."} />
        <CommandList>
          <CommandEmpty>{lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}</CommandEmpty>
          {groups.map((grp) => (
            <CommandGroup key={grp.label} heading={grp.label}>
              {grp.items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={t(item.key) + " " + item.key}
                  onSelect={() => {
                    navigate({ to: item.url });
                    setOpenCommand(false);
                  }}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 w-4 h-4" />
                  {t(item.key)}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
