import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Hint } from "@/components/ui/hint";
import { AppSidebar } from "@/components/app-sidebar";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Search,
  LayoutDashboard, Users, HandCoins, Gift, TrendingUp, TrendingDown,
  Wallet, Landmark, Smartphone, Package, Boxes, CalendarDays, UsersRound,
  Megaphone, Moon, CalendarHeart, HandHeart, Beef, Sparkles, Image as ImageIcon,
  BarChart3, Settings, ShieldCheck, FileText, User as UserIcon, MonitorPlay
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
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useRouterState } from "@tanstack/react-router";
import { usePermissions } from "@/hooks/usePermissions";

const routePermissions: Record<string, { module: string; action: string }> = {
  "/dashboard": { module: "Dashboard", action: "View" },
  "/members": { module: "Members", action: "View" },
  "/subscription": { module: "Monthly Chanda", action: "View" },
  "/donations": { module: "Donations & Zakat", action: "View" },
  "/income": { module: "Income & Expense", action: "View" },
  "/expenses": { module: "Income & Expense", action: "View" },
  "/cash": { module: "Cash Management", action: "View" },
  "/bank": { module: "Bank & Mobile Banking", action: "View" },
  "/mobile-banking": { module: "Bank & Mobile Banking", action: "View" },
  "/assets": { module: "Assets", action: "View" },
  "/inventory": { module: "Inventory", action: "View" },
  "/meetings": { module: "Meetings", action: "View" },
  "/committee": { module: "Members", action: "View" },
  "/notices": { module: "Notice Board", action: "View" },
  "/prayer-times": { module: "Prayer Schedule", action: "View" },
  "/events": { module: "Events", action: "View" },
  "/zakat": { module: "Donations & Zakat", action: "View" },
  "/qurbani": { module: "Qurbani", action: "View" },
  "/ramadan": { module: "Ramadan", action: "View" },
  "/gallery": { module: "Gallery", action: "View" },
  "/reports": { module: "Reports", action: "View" },
  "/users": { module: "User Management", action: "View" },
  "/roles-permissions": { module: "Role & Permission", action: "View" },
  "/audit-logs": { module: "Audit Logs", action: "View" },
  "/settings": { module: "Settings", action: "View" },
};

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: permData, isLoading: permLoading } = usePermissions();

  const hasPerm = (path: string) => {
    if (permLoading) return true;
    if (permData?.isSuperAdmin) return true;
    const permInfo = routePermissions[path];
    if (!permInfo) return true;
    const requiredPerm = `${permInfo.module.toLowerCase()}.view`;
    return permData?.permissions?.has(requiredPerm) ?? false;
  };

  const filteredGroups = groups.map(grp => ({
    ...grp,
    items: grp.items.filter(item => hasPerm(item.url))
  })).filter(grp => grp.items.length > 0);

  // Find required permissions based on pathname matching a known route prefix
  const requiredPermission = Object.entries(routePermissions).find(([path]) => 
    pathname === path || pathname.startsWith(path + "/")
  )?.[1];

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
      <div className="min-h-screen flex w-full bg-muted/30 min-w-0 overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="h-14 flex items-center justify-between gap-1.5 sm:gap-2 border-b bg-card px-2.5 sm:px-4 sticky top-0 z-30 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <SidebarTrigger />
              
              <div className="flex-1 max-w-[180px] xs:max-w-xs sm:max-w-md">
                <button
                  onClick={() => setOpenCommand(true)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-muted/50 hover:bg-muted border border-border/50 rounded-md text-xs sm:text-sm text-muted-foreground transition-all duration-300 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{lang === "bn" ? "খুঁজুন..." : "Search..."}</span>
                  <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded-[4px] border border-border/60 bg-background px-1.5 font-sans text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Hint label={lang === "bn" ? "টিভি ডিসপ্লে ওপেন করুন" : "Open TV Display"}>
                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => window.open("/tv-display", "_blank")}>
                  <MonitorPlay className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </Button>
              </Hint>

              <Button size="sm" variant="ghost" className="h-8 px-2 sm:h-9 sm:px-2.5 text-xs sm:text-sm font-semibold" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>
                {lang === "bn" ? "EN" : "বাং"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1.5 px-1 sm:px-2 h-8 sm:h-9">
                    <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-medium hidden md:inline truncate max-w-[120px]">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("admin")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1.5 p-2">
                    <p className="text-sm font-medium leading-none capitalize">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })} className="cursor-pointer">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>{lang === "bn" ? "আমার প্রোফাইল" : "My Profile"}</span>
                  </DropdownMenuItem>
                  {hasPerm("/settings") && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>{lang === "bn" ? "সেটিংস" : "Settings"}</span>
                    </DropdownMenuItem>
                  )}
                  {hasPerm("/roles-permissions") && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/roles-permissions" })} className="cursor-pointer">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      <span>{lang === "bn" ? "রোলস ও পারমিশন" : "Roles & Permissions"}</span>
                    </DropdownMenuItem>
                  )}
                  {(hasPerm("/settings") || hasPerm("/roles-permissions")) && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-2.5 sm:p-4 md:p-6 min-w-0 overflow-x-hidden">
            {requiredPermission ? (
              <PermissionGuard module={requiredPermission.module} action={requiredPermission.action} fallbackType="page">
                <Outlet />
              </PermissionGuard>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder={lang === "bn" ? "মেনু খুঁজুন..." : "Search menu..."} />
        <CommandList>
          <CommandEmpty>{lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}</CommandEmpty>
          {filteredGroups.map((grp) => (
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
