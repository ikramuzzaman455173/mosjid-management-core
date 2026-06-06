import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, HandCoins, Gift, TrendingUp, TrendingDown,
  Wallet, Landmark, Smartphone, Package, Boxes, CalendarDays, UsersRound,
  Megaphone, Moon, CalendarHeart, HandHeart, Beef, Sparkles, Image as ImageIcon,
  BarChart3, Settings, ShieldCheck, FileText, Search, X
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useI18n, type DictKey } from "@/lib/i18n";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

type Item = { key: DictKey; url: string; icon: any; module: string };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "main",
    items: [
      { key: "dashboard", url: "/dashboard", icon: LayoutDashboard, module: "Dashboard" },
      { key: "members", url: "/members", icon: Users, module: "Members" },
      { key: "subscription", url: "/subscription", icon: HandCoins, module: "Monthly Chanda" },
      { key: "donations", url: "/donations", icon: Gift, module: "Donations & Zakat" },
    ],
  },
  {
    label: "finance",
    items: [
      { key: "income", url: "/income", icon: TrendingUp, module: "Income & Expense" },
      { key: "expenses", url: "/expenses", icon: TrendingDown, module: "Income & Expense" },
      { key: "cash_accounts", url: "/cash", icon: Wallet, module: "Cash Management" },
      { key: "bank_accounts", url: "/bank", icon: Landmark, module: "Bank & Mobile Banking" },
      { key: "mobile_banking", url: "/mobile-banking", icon: Smartphone, module: "Bank & Mobile Banking" },
    ],
  },
  {
    label: "assets",
    items: [
      { key: "assets", url: "/assets", icon: Package, module: "Assets" },
      { key: "inventory", url: "/inventory", icon: Boxes, module: "Inventory" },
    ],
  },
  {
    label: "operations",
    items: [
      { key: "meetings", url: "/meetings", icon: CalendarDays, module: "Meetings" },
      { key: "committee", url: "/committee", icon: UsersRound, module: "Members" },
      { key: "notices", url: "/notices", icon: Megaphone, module: "Notice Board" },
      { key: "prayer_times", url: "/prayer-times", icon: Moon, module: "Prayer Schedule" },
      { key: "events", url: "/events", icon: CalendarHeart, module: "Events" },
    ],
  },
  {
    label: "islamic",
    items: [
      { key: "zakat", url: "/zakat", icon: HandHeart, module: "Donations & Zakat" },
      { key: "qurbani", url: "/qurbani", icon: Beef, module: "Qurbani" },
      { key: "ramadan", url: "/ramadan", icon: Sparkles, module: "Ramadan" },
    ],
  },
  {
    label: "system",
    items: [
      { key: "gallery", url: "/gallery", icon: ImageIcon, module: "Gallery" },
      { key: "reports", url: "/reports", icon: BarChart3, module: "Reports" },
      { key: "users", url: "/users", icon: ShieldCheck, module: "User Management" },
      { key: "role_permissions", url: "/roles-permissions", icon: ShieldCheck, module: "Role & Permission" },
      { key: "audit_logs", url: "/audit-logs", icon: FileText, module: "Audit Logs" },
      { key: "settings", url: "/settings", icon: Settings, module: "Settings" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t, lang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: permData, isLoading } = usePermissions();

  // We are not capturing Cmd+K in the sidebar anymore, we will leave it for the global search.
  // The sidebar search is just a local filter now.

  const filteredGroups = groups.map(grp => ({
    ...grp,
    items: grp.items.filter(item => {
      // 1. Text filter
      const matchesSearch = t(item.key).toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.key.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Permission filter
      if (isLoading) return true; // Prevent layout shift while loading
      if (permData?.isSuperAdmin) return true;
      const requiredPerm = `${item.module.toLowerCase()}.view`;
      return permData?.permissions?.has(requiredPerm) ?? false;
    })
  })).filter(grp => grp.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className={cn("border-b border-sidebar-border py-4 transition-all duration-200", collapsed ? "px-0 items-center" : "px-3")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
          <div className={cn("rounded-md bg-gradient-gold flex items-center justify-center shrink-0 transition-all duration-200", collapsed ? "w-8 h-8" : "w-9 h-9")}>
            <Moon className={cn("text-primary", collapsed ? "w-4 h-4" : "w-5 h-5")} />
          </div>
          {!collapsed && (
            <div className="leading-tight truncate">
              <div className="text-sm font-bold text-sidebar-foreground truncate">মসজিদ</div>
              <div className="text-xs text-sidebar-foreground/70 truncate">ম্যানেজমেন্ট</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="relative mt-5 mb-2 group px-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50 group-focus-within:text-sidebar-foreground transition-colors duration-300" />
            <Input
              ref={searchInputRef}
              placeholder={lang === "bn" ? "মেনু ফিল্টার করুন..." : "Filter menu..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 bg-sidebar-accent/30 hover:bg-sidebar-accent/50 border border-sidebar-border/50 text-sidebar-foreground focus-visible:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:border-sidebar-border shadow-sm text-sm rounded-md transition-all duration-300 placeholder:text-sidebar-foreground/50"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-foreground transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-auto gap-0">
        {filteredGroups.map((grp) => (
          <SidebarGroup key={grp.label} className={cn(collapsed ? "p-1" : "px-2 py-1")}>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-2 py-1">{grp.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {grp.items.map((item) => {
                  const active = pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <PermissionGuard key={item.url} module={item.module} action="View">
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={active} tooltip={t(item.key)} className={cn(collapsed && "justify-center")}>
                          <Link to={item.url} className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                            <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                            {!collapsed && <span className="truncate text-sm">{t(item.key)}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </PermissionGuard>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {!collapsed && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Search className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              {lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
