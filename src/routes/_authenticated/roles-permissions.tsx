import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n, fmtDate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
  Shield, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Settings2,
  Save,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Edit2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { rolesService, Role } from "@/services/roles.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PermissionGuard } from "@/components/auth/PermissionGuard";

export const Route = createFileRoute("/_authenticated/roles-permissions")({
  component: RolesPermissionsPage,
});

function RolesPermissionsPage() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [moduleSearch, setModuleSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  
  // Draft permissions state
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Fetch Data
  const { data: rolesData, isLoading: rolesLoading } = useQuery({ queryKey: ["roles"], queryFn: rolesService.getRoles });
  const { data: permissionsData } = useQuery({ queryKey: ["permissions"], queryFn: rolesService.getPermissions });
  
  const { data: rolePermissionsData, isLoading: permsLoading } = useQuery({ 
    queryKey: ["role-permissions", selectedRoleId], 
    queryFn: () => selectedRoleId ? rolesService.getRolePermissions(selectedRoleId) : Promise.resolve([]),
    enabled: !!selectedRoleId
  });

  const { data: assignedUsersData } = useQuery({
    queryKey: ["role-users", selectedRoleId],
    queryFn: () => selectedRoleId ? rolesService.getAssignedUsers(selectedRoleId) : Promise.resolve([]),
    enabled: !!selectedRoleId
  });

  const roles = rolesData || [];
  const permissions = permissionsData || [];
  const rolePermissions = rolePermissionsData || [];
  const assignedUsers = assignedUsersData || [];

  // Select first role by default
  if (!selectedRoleId && roles.length > 0) {
    setSelectedRoleId(roles[0].id);
  }

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Sync draft permissions when rolePermissions data loads
  useEffect(() => {
    if (selectedRole?.name === "super_admin") {
      if (permissionsData) {
        setDraftPermissions(permissionsData.map(p => p.id));
      }
    } else {
      if (rolePermissionsData) {
        setDraftPermissions(rolePermissionsData);
      }
    }
    setHasChanges(false);
  }, [rolePermissionsData, selectedRoleId, permissionsData, selectedRole?.name]);

  // Define exactly what actions make sense per module
  const ALLOWED_ACTIONS: Record<string, string[]> = {
    "Dashboard": ["View"],
    "Members": ["View", "Create", "Edit", "Delete"],
    "Monthly Chanda": ["View", "Create", "Edit", "Delete"],
    "Donations & Zakat": ["View", "Create", "Edit", "Delete"],
    "Income & Expense": ["View", "Create", "Edit", "Delete"],
    "Cash Management": ["View", "Create", "Edit", "Delete"],
    "Bank & Mobile Banking": ["View", "Create", "Edit", "Delete"],
    "Assets": ["View", "Create", "Edit", "Delete"],
    "Inventory": ["View", "Create", "Edit", "Delete"],
    "Meetings": ["View", "Create", "Edit", "Delete"],
    "Notice Board": ["View", "Create", "Edit", "Delete"],
    "Prayer Schedule": ["View", "Edit"],
    "Events": ["View", "Create", "Edit", "Delete"],
    "Qurbani": ["View", "Create", "Edit", "Delete"],
    "Ramadan": ["View", "Create", "Edit", "Delete"],
    "Gallery": ["View", "Create", "Delete"],
    "Reports": ["View", "Export"],
    "User Management": ["View", "Create", "Edit", "Delete"],
    "Role & Permission": ["View", "Create", "Edit", "Delete"],
    "Audit Logs": ["View", "Export"],
    "Settings": ["View", "Edit"]
  };

  // Group permissions by module and strictly filter/sort them
  const moduleMap = useMemo(() => {
    const map = new Map<string, Array<{id: string, action: string}>>();
    permissionsData?.forEach(p => {
      // If the module exists in our strict list, only allow defined actions
      const allowedActions = ALLOWED_ACTIONS[p.module] || ["View", "Create", "Edit", "Delete"];
      
      if (allowedActions.includes(p.action)) {
        if (!map.has(p.module)) map.set(p.module, []);
        map.get(p.module)?.push({ id: p.id, action: p.action });
      }
    });

    // Sort the actions logically (View -> Create -> Edit -> Delete -> Others)
    const actionOrder = ["View", "Create", "Edit", "Delete", "Export", "Settings"];
    map.forEach((actions) => {
      actions.sort((a, b) => {
        let indexA = actionOrder.indexOf(a.action);
        let indexB = actionOrder.indexOf(b.action);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
      });
    });

    return map;
  }, [permissionsData]);

  // Exact Sidebar Order
  const SIDEBAR_MODULE_ORDER = [
    "Dashboard",
    "Members",
    "Monthly Chanda",
    "Donations & Zakat",
    "Income & Expense",
    "Cash Management",
    "Bank & Mobile Banking",
    "Assets",
    "Inventory",
    "Meetings",
    "Notice Board",
    "Prayer Schedule",
    "Events",
    "Qurbani",
    "Ramadan",
    "Gallery",
    "Reports",
    "User Management",
    "Role & Permission",
    "Audit Logs",
    "Settings"
  ];

  // Filter and Sort modules by exact sidebar order
  const filteredModules = Array.from(moduleMap.entries())
    .filter(([mod]) => mod.toLowerCase().includes(moduleSearch.toLowerCase()))
    .sort(([modA], [modB]) => {
       const indexA = SIDEBAR_MODULE_ORDER.indexOf(modA);
       const indexB = SIDEBAR_MODULE_ORDER.indexOf(modB);
       // If both are found in the list, sort by list order
       if (indexA !== -1 && indexB !== -1) return indexA - indexB;
       // If only one is found, put the known one first
       if (indexA !== -1) return -1;
       if (indexB !== -1) return 1;
       // Fallback to alphabetical for any unknown modules
       return modA.localeCompare(modB);
    });

  // Filter roles by search
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));

  // Mutations
  const savePermsMutation = useMutation({
    mutationFn: ({ roleId, permIds }: { roleId: string, permIds: string[] }) => 
      rolesService.bulkAssignRolePermissions(roleId, permIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", selectedRoleId] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] }); 
      setHasChanges(false);
      toast.success(lang === "bn" ? "পারমিশন সেভ হয়েছে" : "Permissions saved successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update permissions")
  });

  const createRoleMutation = useMutation({
    mutationFn: () => rolesService.createRole({ name: newRoleName.trim().toLowerCase().replace(/\s+/g, '_'), description: newRoleDesc }),
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-stats"] });
      setIsCreateOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setSelectedRoleId(newRole.id);
      toast.success(lang === "bn" ? "রোল তৈরি হয়েছে" : "Role created successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create role")
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-stats"] });
      setRoleToDelete(null);
      if (selectedRoleId === roleToDelete?.id) {
        setSelectedRoleId(null);
      }
      toast.success(lang === "bn" ? "রোল ডিলিট হয়েছে" : "Role deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete role")
  });

  const updateRoleMutation = useMutation({
    mutationFn: (updates: {name: string, description: string}) => rolesService.updateRole(selectedRoleId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-stats"] });
      setIsEditOpen(false);
      toast.success(lang === "bn" ? "রোল আপডেট হয়েছে" : "Role updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update role")
  });

  const isSuper = selectedRole?.name === "super_admin";

  const handleToggleLocal = (permissionId: string, checked: boolean) => {
    if (isSuper) {
      toast.error(lang === "bn" ? "সুপার অ্যাডমিনের পারমিশন পরিবর্তন করা যাবে না" : "Cannot modify Super Admin permissions");
      return;
    }
    setDraftPermissions(prev => {
      const next = checked ? [...prev, permissionId] : prev.filter(id => id !== permissionId);
      return next;
    });
    setHasChanges(true);
  };

  const isAllSelected = permissionsData && permissionsData.length > 0 && draftPermissions.length === permissionsData.length;
  
  const handleToggleGlobalSelect = () => {
    if (isSuper || !permissionsData) return;
    if (isAllSelected) {
      setDraftPermissions([]);
    } else {
      setDraftPermissions(permissionsData.map(p => p.id));
    }
    setHasChanges(true);
  };

  const isAllExpanded = filteredModules.length > 0 && expandedModules.length === filteredModules.length;

  const handleToggleExpand = () => {
    if (isAllExpanded) {
      setExpandedModules([]);
    } else {
      setExpandedModules(filteredModules.map(([name]) => name));
    }
  };

  const handleModuleSelectAll = (e: React.MouseEvent, moduleActions: any[]) => {
    e.stopPropagation();
    if (isSuper) return;
    const actionIds = moduleActions.map(a => a.id);
    const newDraft = new Set(draftPermissions);
    actionIds.forEach(id => newDraft.add(id));
    setDraftPermissions(Array.from(newDraft));
    setHasChanges(true);
  };

  const handleModuleUnselectAll = (e: React.MouseEvent, moduleActions: any[]) => {
    e.stopPropagation();
    if (isSuper) return;
    const actionIds = moduleActions.map(a => a.id);
    setDraftPermissions(draftPermissions.filter(id => !actionIds.includes(id)));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedRoleId || isSuper) return;
    savePermsMutation.mutate({ roleId: selectedRoleId, permIds: draftPermissions });
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast.error(lang === "bn" ? "রোলের নাম দিন" : "Role name is required");
      return;
    }
    createRoleMutation.mutate();
  };

  const handleUpdateRole = () => {
    if (!editRoleName.trim()) {
      toast.error(lang === "bn" ? "রোলের নাম দিন" : "Role name is required");
      return;
    }
    updateRoleMutation.mutate({
      name: editRoleName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: editRoleDesc
    });
  };

  const openEditDialog = () => {
    if (!selectedRole) return;
    setEditRoleName(selectedRole.name.replace(/_/g, ' '));
    setEditRoleDesc(selectedRole.description || "");
    setIsEditOpen(true);
  };

  return (
    <PermissionGuard module="Role & Permission" action="View" fallbackType="page">
      <div className="h-full flex flex-col pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lang === "bn" ? "রোল ও পারমিশন" : "Role Management"}</h1>
          <p className="text-muted-foreground">{lang === "bn" ? "রোল ভিত্তিক পারমিশন সেট করুন এবং ব্যবহারকারীদের এক্সেস নিয়ন্ত্রণ করুন" : "Manage roles and configure granular access controls"}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0 overflow-y-auto lg:overflow-visible lg:pb-0">
        
        {/* Left Sidebar - Roles */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{lang === "bn" ? "ভূমিকা সমূহ" : "All Roles"}</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <PermissionGuard module="Role & Permission" action="Create" fallback={<></>}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </PermissionGuard>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === "bn" ? "নতুন রোল তৈরি" : "Create New Role"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{lang === "bn" ? "রোলের নাম" : "Role Name"}</Label>
                    <Input 
                      placeholder={lang === "bn" ? "যেমন: Assistant Admin" : "e.g. Assistant Admin"} 
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">The name will be converted to lowercase format automatically.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "bn" ? "বিবরণ (ঐচ্ছিক)" : "Description (Optional)"}</Label>
                    <Textarea 
                      placeholder={lang === "bn" ? "এই রোলের কাজ কী..." : "What this role is for..."} 
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
                  <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
                    {createRoleMutation.isPending ? "Saving..." : (lang === "bn" ? "সংরক্ষণ করুন" : "Save Role")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={lang === "bn" ? "রোল খুঁজুন..." : "Search roles..."} 
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="pl-9 bg-card border-muted-foreground/20 rounded-xl" 
            />
          </div>

          <div className="relative flex-1 max-h-[250px] lg:max-h-full lg:h-full min-h-0">
            {/* Scroll Hints (Top & Bottom fades) */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-muted/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-muted/30 to-transparent z-10 pointer-events-none" />
            
            <div className="h-full overflow-y-auto scroll-smooth overscroll-contain px-1 pb-4 pt-2 space-y-2 rounded-xl custom-scrollbar">
              {filteredRoles.map(role => (
                <button 
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "w-full flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-200 group",
                    selectedRoleId === role.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card text-foreground hover:bg-accent hover:border-accent/50 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold capitalize tracking-tight">{role.name.replace("_", " ")}</span>
                    {role.is_system && <Shield className={cn("w-4 h-4", selectedRoleId === role.id ? "text-primary-foreground/80" : "text-primary/70 group-hover:text-primary")} />}
                  </div>
                  <span className={cn("text-[11px] font-medium", selectedRoleId === role.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {role.is_system ? (lang === "bn" ? "সিস্টেম ডিফল্ট" : "System Default") : (lang === "bn" ? "কাস্টম রোল" : "Custom Role")}
                  </span>
                </button>
              ))}
              {filteredRoles.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  {lang === "bn" ? "কোন রোল পাওয়া যায়নি" : "No roles found"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Permissions Layout */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl border shadow-sm overflow-hidden min-w-0 mb-4 lg:mb-0">
           {/* Header */}
           <div className="px-5 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start gap-4 bg-gradient-to-b from-muted/30 to-background border-b">
              <div>
                <h2 className="text-2xl font-bold capitalize flex items-center gap-3">
                  {selectedRole?.name.replace("_", " ") || "Select a role"}
                  {selectedRole?.name === "super_admin" && <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Full Access</Badge>}
                  {selectedRole?.is_system && selectedRole?.name !== "super_admin" && <Badge variant="secondary">System Role</Badge>}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm max-w-2xl leading-relaxed">
                  {selectedRole?.description || (lang === "bn" ? "এই রোলের কোন বিবরণ দেওয়া নেই।" : "No description provided for this role.")}
                </p>
                <div className="flex gap-4 mt-5 text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md inline-flex items-center">
                   <Users className="w-4 h-4 text-primary" /> 
                   <span>{assignedUsers.length} {lang === "bn" ? "জন ব্যবহারকারী যুক্ত আছেন" : "Users Assigned"}</span>
                </div>
              </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {!selectedRole?.is_system && selectedRole && (
                    <>
                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <PermissionGuard module="Role & Permission" action="Edit" fallback={<></>}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={openEditDialog} className="hover:bg-primary/5 hover:text-primary border-primary/20">
                              <Edit2 className="w-4 h-4 mr-2" /> {lang === "bn" ? "এডিট" : "Edit"}
                            </Button>
                          </DialogTrigger>
                        </PermissionGuard>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{lang === "bn" ? "রোল আপডেট" : "Update Role"}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>{lang === "bn" ? "রোলের নাম" : "Role Name"}</Label>
                              <Input 
                                placeholder={lang === "bn" ? "যেমন: Assistant Admin" : "e.g. Assistant Admin"} 
                                value={editRoleName}
                                onChange={(e) => setEditRoleName(e.target.value)}
                              />
                              <p className="text-[10px] text-muted-foreground">The name will be converted to lowercase format automatically.</p>
                            </div>
                            <div className="space-y-2">
                              <Label>{lang === "bn" ? "বিবরণ (ঐচ্ছিক)" : "Description (Optional)"}</Label>
                              <Textarea 
                                placeholder={lang === "bn" ? "এই রোলের কাজ কী..." : "What this role is for..."} 
                                value={editRoleDesc}
                                onChange={(e) => setEditRoleDesc(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
                            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
                              {updateRoleMutation.isPending ? "Updating..." : (lang === "bn" ? "আপডেট করুন" : "Update Role")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <PermissionGuard module="Role & Permission" action="Delete" fallback={<></>}>
                        <Button variant="outline" size="sm" onClick={() => setRoleToDelete(selectedRole)} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                          <Trash2 className="w-4 h-4 mr-2" /> {lang === "bn" ? "ডিলিট" : "Delete"}
                        </Button>
                      </PermissionGuard>
                    </>
                  )}
                <PermissionGuard module="Role & Permission" action="Edit" fallback={<></>}>
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges || isSuper || savePermsMutation.isPending}
                    className={cn("shadow-sm transition-all", hasChanges ? "bg-primary animate-in fade-in zoom-in" : "opacity-50")}
                  >
                    {savePermsMutation.isPending ? "Saving..." : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {lang === "bn" ? "সংরক্ষণ করুন" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </PermissionGuard>
              </div>
           </div>
           
           {/* Permissions Toolbar */}
           <div className="px-5 py-4 sm:px-6 lg:px-8 border-b flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-muted/10">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground/90 shrink-0">
                <Settings2 className="w-5 h-5 text-primary" /> {lang === "bn" ? "মডিউল পারমিশন" : "Module Permissions"}
              </h3>
              
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleGlobalSelect} 
                  disabled={isSuper} 
                  className={cn(
                    "h-9 text-xs font-medium transition-all shadow-sm rounded-lg flex-1 sm:flex-none", 
                    isAllSelected 
                      ? "bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive" 
                      : "bg-emerald-500/5 text-emerald-700 border-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-800"
                  )}
                >
                  {isAllSelected ? (
                    <><Square className="w-3.5 h-3.5 mr-2" /> {lang === "bn" ? "সব বাতিল" : "Unselect All"}</>
                  ) : (
                    <><CheckSquare className="w-3.5 h-3.5 mr-2" /> {lang === "bn" ? "সব নির্বাচন" : "Select All"}</>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleExpand} 
                  className="h-9 text-xs font-medium transition-all shadow-sm rounded-lg bg-background hover:bg-muted flex-1 sm:flex-none text-foreground/80"
                >
                  {isAllExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> {lang === "bn" ? "সব গুটিয়ে নিন" : "Collapse All"}</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> {lang === "bn" ? "সব সম্প্রসারিত করুন" : "Expand All"}</>
                  )}
                </Button>

                <div className="relative w-full sm:w-64 sm:ml-auto">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={moduleSearch} 
                    onChange={(e) => setModuleSearch(e.target.value)} 
                    placeholder={lang === "bn" ? "মডিউল খুঁজুন..." : "Search modules..."}
                    className="pl-9 bg-background h-9 text-sm rounded-lg shadow-sm border-muted-foreground/20 w-full focus-visible:ring-primary/20" 
                  />
                </div>
              </div>
           </div>

           <ScrollArea className="flex-1 bg-muted/5">
              <div className="p-8 max-w-4xl mx-auto">
                <Accordion type="multiple" value={expandedModules} onValueChange={setExpandedModules} className="space-y-4 pb-6">
                   {filteredModules.map(([moduleName, moduleActions]) => {
                      // Count allowed actions in this module
                      const allowedCount = moduleActions.filter(a => draftPermissions.includes(a.id)).length;
                      const totalActions = moduleActions.length;
                      const isAllAllowed = allowedCount === totalActions;

                      return (
                         <AccordionItem key={moduleName} value={moduleName} className={cn("bg-card border rounded-lg shadow-sm overflow-hidden", isAllAllowed ? "border-emerald-500/30" : "")}>
                            <AccordionTrigger className={cn("px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors", isAllAllowed ? "bg-emerald-500/5" : "")}>
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-semibold text-sm">{moduleName}</span>
                                <div className="flex items-center gap-4">
                                  {/* Select/Unselect All Toggle for Module */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className={cn(
                                        "h-6 px-2.5 text-[10px] uppercase font-bold transition-all border",
                                        isAllAllowed 
                                          ? "text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                          : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                      )}
                                      disabled={isSuper}
                                      onClick={(e) => {
                                        if (isAllAllowed) {
                                          handleModuleUnselectAll(e, moduleActions);
                                        } else {
                                          handleModuleSelectAll(e, moduleActions);
                                        }
                                      }}
                                    >
                                      {isAllAllowed ? "None" : "All"}
                                    </Button>
                                  </div>
                                  <Badge variant="secondary" className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", isAllAllowed ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted-foreground/10 text-muted-foreground")}>
                                      {allowedCount} / {totalActions}
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0 border-t">
                               <div className="divide-y divide-border/40">
                                  {moduleActions.map(({id, action}) => {
                                     const isChecked = draftPermissions.includes(id);
                                     return (
                                        <div key={id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors">
                                           <span className={cn("text-sm font-medium transition-colors", isChecked ? "text-foreground" : "text-muted-foreground")}>{action}</span>
                                           <Switch 
                                              checked={isChecked}
                                              disabled={isSuper}
                                              onCheckedChange={(checked) => handleToggleLocal(id, checked)}
                                              className={cn("shadow-sm scale-90 m-0", isChecked ? "data-[state=checked]:bg-emerald-500" : "")}
                                           />
                                        </div>
                                     )
                                  })}
                               </div>
                            </AccordionContent>
                         </AccordionItem>
                      )
                   })}
                   {filteredModules.length === 0 && (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
                        <Settings2 className="w-12 h-12 mb-4 opacity-20" />
                        <p>{lang === "bn" ? "কোন মডিউল পাওয়া যায়নি" : "No modules found matching your search."}</p>
                      </div>
                   )}
                </Accordion>
              </div>
           </ScrollArea>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{lang === "bn" ? "আপনি কি নিশ্চিত?" : "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "bn" 
                ? "এই রোলটি সম্পূর্ণভাবে মুছে ফেলা হবে। এই রোলটি যাদের অ্যাসাইন করা আছে তাদের এক্সেস বাতিল হয়ে যাবে।" 
                : "This role will be permanently deleted. Users assigned to this role will lose their access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{lang === "bn" ? "বাতিল" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => roleToDelete && deleteRoleMutation.mutate(roleToDelete.id)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteRoleMutation.isPending ? "Deleting..." : (lang === "bn" ? "হ্যাঁ, মুছুন" : "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </PermissionGuard>
  );
}
