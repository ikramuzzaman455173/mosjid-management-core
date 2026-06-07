import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

import { rolesService } from "@/services/roles.service";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: availableRoles = [] } = useQuery({
    queryKey: ["available-roles"],
    queryFn: () => rolesService.getRoles(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["users-roles"],
    queryFn: async () => {
      const [profiles, userRoles, rolesData] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles" as any).select("*"),
        supabase.from("roles" as any).select("*"),
      ]);
      return (profiles.data ?? []).map((p: any) => {
        const userRoleIds = (userRoles.data ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role_id);
        const roleList = (rolesData.data as any[]) ?? [];
        const roleNames = userRoleIds.map(rId => roleList.find((role: any) => role.id === rId)?.name).filter(Boolean);
        return {
          ...p,
          roleIds: userRoleIds,
          roles: roleNames,
        };
      });
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async ({ id, full_name, email, password, roles }: { id?: string, full_name: string, email: string, password?: string, roles: string[] }) => {
      const isNew = !id;
      let userId = id;

      if (!full_name.trim() || !email.trim()) {
        throw new Error(lang === "bn" ? "নাম এবং ইমেইল দেওয়া আবশ্যক" : "Name and Email are required");
      }
      
      if (!roles || roles.length === 0) {
        throw new Error(lang === "bn" ? "অন্তত একটি রোল সিলেক্ট করতে হবে" : "At least one role is required");
      }
      
      if (isNew) {
        if (!password) throw new Error(lang === "bn" ? "পাসওয়ার্ড দেওয়া আবশ্যক" : "Password is required for new users");
        // Use a temporary client to avoid logging out the current admin
        const tempClient = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        
        const { data, error } = await tempClient.auth.signUp({
          email,
          password,
          options: { data: { full_name } }
        });
        if (error) throw error;
        if (!data.user) throw new Error("Failed to create auth user");
        userId = data.user.id;
        
        // Upsert the profile to avoid conflicts if an auto-trigger already created it
        const { error: profileErr } = await supabase.from("profiles").upsert({ id: userId, full_name, email }, { onConflict: "id" });
        if (profileErr) throw profileErr;
      } else {
        const { error } = await supabase.from("profiles").update({ full_name, email }).eq("id", userId as string);
        if (error) throw error;
      }

      // Sync roles properly to avoid losing admin rights instantly
      // ❌ Block role change for protected super admin
      if (userId !== PROTECTED_SUPER_ADMIN_ID) {
        const { data: currentRoles } = await supabase.from("user_roles" as any).select("role_id").eq("user_id", userId as string);
        const existingRoles = (currentRoles as any[])?.map(r => r.role_id) || [];
        
        const rolesToAdd = roles.filter(r => !(existingRoles as string[]).includes(r));
        const rolesToRemove = existingRoles.filter(r => !roles.includes(r));

        if (rolesToRemove.length > 0) {
          const { error } = await supabase.from("user_roles" as any).delete().eq("user_id", userId as string).in("role_id", rolesToRemove);
          if (error) throw error;
        }
        if (rolesToAdd.length > 0) {
          const inserts = rolesToAdd.map(r => ({ user_id: userId as string, role_id: r }));
          const { error } = await supabase.from("user_roles" as any).insert(inserts);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-roles"] });
      toast.success(lang === "bn" ? "ইউজার সেভ হয়েছে" : "User saved successfully");
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Error saving user");
    }
  });

  // Fixed UUID of the protected default super admin — cannot be deleted
  const PROTECTED_SUPER_ADMIN_ID = "a0000000-0000-0000-0000-000000000001";

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      // ❌ Block deletion of protected super admin at frontend level
      if (id === PROTECTED_SUPER_ADMIN_ID) {
        throw new Error(
          lang === "bn"
            ? "এই ডিফল্ট সুপার অ্যাডমিন ডিলিট করা যাবে না।"
            : "The default super admin cannot be deleted."
        );
      }
      await supabase.from("user_roles" as any).delete().eq("user_id", id);
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-roles"] });
      toast.success(lang === "bn" ? "ইউজার ডিলিট হয়েছে" : "User deleted successfully");
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Error deleting user");
      setDeleteId(null);
    }
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ full_name: "", email: "", password: "", confirm_password: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Find the member role ID to set as default
    const memberRole = availableRoles.find((r: any) => r.name === "member");
    setSelectedRoles(memberRole ? [memberRole.id] : []); 
    setDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({ full_name: user.full_name ?? "", email: user.email ?? "", password: "", confirm_password: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // user.roleIds contains the database role_ids now
    if (user.roleIds && user.roleIds.length > 0) {
      setSelectedRoles(user.roleIds);
    } else {
      const memberRole = availableRoles.find((r: any) => r.name === "member");
      setSelectedRoles(memberRole ? [memberRole.id] : []);
    }
    setDialogOpen(true);
  };

  const toggleRole = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      // Prevent unchecking if it's the last role
      if (selectedRoles.length === 1) {
        toast.error(lang === "bn" ? "অন্তত একটি রোল সিলেক্ট থাকতে হবে" : "At least one role must be selected");
        return;
      }
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const columns: Column<any>[] = [
    { key: "name", header: t("name"), cell: (u) => <span className="font-medium">{u.full_name ?? "—"}</span> },
    { key: "email", header: lang === "bn" ? "ইমেইল" : "Email", cell: (u) => u.email ?? "—" },
    { key: "roles", header: t("role"), cell: (u) => (
      <div className="flex gap-1 flex-wrap">
        {u.roles.length === 0 ? <span className="text-xs text-muted-foreground">—</span> :
          u.roles.map((r: string) => <Badge key={r} className="bg-primary text-primary-foreground">{r}</Badge>)}
      </div>
    )},
    { key: "joined", header: lang === "bn" ? "যোগদান" : "Joined", cell: (u) => fmtDate(u.created_at, lang) },
    { key: "actions", header: "", cell: (u) => {
      const isProtected = u.id === PROTECTED_SUPER_ADMIN_ID;
      return (
        <div className="flex items-center gap-2 justify-end">
          <PermissionGuard module="User Management" action="Edit" fallback={<></>}>
            <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
              <Edit className="w-4 h-4 text-primary" />
            </Button>
          </PermissionGuard>
          {/* Hide delete button for the protected default super admin */}
          {!isProtected && (
            <PermissionGuard module="User Management" action="Delete" fallback={<></>}>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(u.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </PermissionGuard>
          )}
          {isProtected && (
            <span title={lang === "bn" ? "সুরক্ষিত সুপার অ্যাডমিন" : "Protected super admin"}
              className="w-8 h-8 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary opacity-60" />
            </span>
          )}
        </div>
      );
    }},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader icon={Shield} title={t("users")} subtitle={`${data?.length ?? 0} ${t("persons")}`} />
        <PermissionGuard module="User Management" action="Create" fallback={<></>}>
          <Button onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            {lang === "bn" ? "নতুন ইউজার" : "New User"}
          </Button>
        </PermissionGuard>
      </div>
      <DataTable data={data as any[]} columns={columns} loading={isLoading} searchKeys={["full_name", "email"]} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? (lang === "bn" ? "ইউজার আপডেট" : "Update User") : (lang === "bn" ? "নতুন ইউজার" : "New User")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("name")} <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.full_name} 
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={lang === "bn" ? "নাম লিখুন" : "Enter name"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === "bn" ? "ইমেইল" : "Email"} <span className="text-destructive">*</span></Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={lang === "bn" ? "ইমেইল অ্যাড্রেস" : "Email address"}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {lang === "bn" ? "পাসওয়ার্ড" : "Password"} 
                  {!selectedUser && <span className="text-destructive"> *</span>}
                </Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
                  {!selectedUser && <span className="text-destructive"> *</span>}
                </Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password} 
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {formData.password && formData.password !== formData.confirm_password && (
              <p className="text-xs text-destructive">{lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match"}</p>
            )}
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <Label>{t("role")} <span className="text-destructive">*</span></Label>
                {selectedUser?.id === PROTECTED_SUPER_ADMIN_ID && (
                  <span className="text-xs text-destructive font-medium">
                    {lang === "bn" ? "সুপার অ্যাডমিনের রোল পরিবর্তন করা যাবে না" : "Cannot change role of default super admin"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
                {availableRoles.map((roleObj: any) => {
                  const roleName = roleObj.name;
                  const roleId = roleObj.id;
                  const isDisabled = selectedUser?.id === PROTECTED_SUPER_ADMIN_ID;
                  return (
                    <div key={roleId} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`role-${roleId}`} 
                        checked={selectedRoles.includes(roleId)} 
                        disabled={isDisabled}
                        onCheckedChange={(checked) => toggleRole(roleId, checked as boolean)} 
                      />
                      <Label 
                        htmlFor={`role-${roleId}`} 
                        className={`text-sm capitalize ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {roleName.replace(/_/g, " ")}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saveUserMutation.isPending}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              onClick={() => saveUserMutation.mutate({ id: selectedUser?.id, full_name: formData.full_name, email: formData.email, password: formData.password, roles: selectedRoles })}
              disabled={
                saveUserMutation.isPending || 
                !formData.full_name.trim() || 
                !formData.email.trim() || 
                selectedRoles.length === 0 ||
                (!!formData.password && formData.password !== formData.confirm_password) || 
                (!selectedUser?.id && !formData.password)
              }
            >
              {lang === "bn" ? "সেভ করুন" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Strict Delete Confirmation Dialog ── */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) { setDeleteId(null); setDeleteConfirmText(""); }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {lang === "bn" ? "ইউজার ডিলিট নিশ্চিত করুন" : "Confirm User Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-sm">
                {lang === "bn"
                  ? "এই ইউজারকে স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি আর পূর্বাবস্থায় ফেরানো যাবে না।"
                  : "This user will be permanently deleted. This action cannot be undone."}
              </p>
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive font-medium">
                {lang === "bn"
                  ? "নিশ্চিত করতে নিচে 'delete' টাইপ করুন"
                  : "Type 'delete' below to confirm"}
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-destructive/40 font-mono"
                autoComplete="off"
                autoFocus
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={deleteConfirmText !== "delete" || deleteUserMutation.isPending}
              onClick={() => {
                if (deleteId && deleteConfirmText === "delete") {
                  deleteUserMutation.mutate(deleteId);
                  setDeleteConfirmText("");
                }
              }}
            >
              {deleteUserMutation.isPending
                ? (lang === "bn" ? "ডিলিট হচ্ছে..." : "Deleting...")
                : (lang === "bn" ? "স্থায়ীভাবে ডিলিট করুন" : "Permanently Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
