import { supabase } from "@/integrations/supabase/client";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export const rolesService = {
  async getRoles() {
    const { data, error } = await supabase
      .from("roles" as any)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as unknown as Role[];
  },

  async getPermissions() {
    const { data, error } = await supabase
      .from("permissions" as any)
      .select("*")
      .order("module", { ascending: true })
      .order("action", { ascending: true });
    if (error) throw error;
    return data as unknown as Permission[];
  },

  async getRolePermissions(roleId: string) {
    const { data, error } = await supabase
      .from("role_permissions" as any)
      .select("permission_id")
      .eq("role_id", roleId);
    if (error) throw error;
    return (data as any[]).map((rp) => rp.permission_id);
  },

  async toggleRolePermission(roleId: string, permissionId: string, assign: boolean) {
    // Prevent modifying super admin permissions
    const { data: role } = await supabase
      .from("roles" as any)
      .select("name")
      .eq("id", roleId)
      .single();
    if ((role as any)?.name === "super_admin") {
      throw new Error("Super Admin permissions cannot be modified");
    }

    if (assign) {
      const { error } = await supabase
        .from("role_permissions" as any)
        .insert({ role_id: roleId, permission_id: permissionId });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("role_permissions" as any)
        .delete()
        .eq("role_id", roleId)
        .eq("permission_id", permissionId);
      if (error) throw error;
    }
  },

  async bulkAssignRolePermissions(roleId: string, permissionIds: string[]) {
    // Delete all existing
    const { error: deleteErr } = await supabase
      .from("role_permissions" as any)
      .delete()
      .eq("role_id", roleId);
    if (deleteErr) throw deleteErr;

    // Insert new
    if (permissionIds.length > 0) {
      const inserts = permissionIds.map((pid) => ({ role_id: roleId, permission_id: pid }));
      const { error: insertErr } = await supabase.from("role_permissions" as any).insert(inserts);
      if (insertErr) throw insertErr;
    }
  },

  async getAssignedUsers(roleId: string) {
    const { data, error } = await supabase
      .from("user_roles" as any)
      .select(
        `
        user_id,
        role_id,
        profiles (
          id,
          full_name,
          email,
          avatar_url
        )
      `,
      )
      .eq("role_id", roleId);
    if (error) throw error;
    // Map to flatter structure
    return data.map((ur: any) => ({
      user_id: ur.user_id,
      role_id: ur.role_id,
      ...ur.profiles,
    }));
  },

  async createRole(role: Partial<Role>) {
    const { data, error } = await supabase
      .from("roles" as any)
      .insert({
        name: role.name,
        description: role.description,
        is_system: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Role;
  },

  async updateRole(id: string, updates: Partial<Role>) {
    // Prevent modifying super admin metadata
    const { data: role } = await supabase
      .from("roles" as any)
      .select("name")
      .eq("id", id)
      .single();
    if ((role as any)?.name === "super_admin") {
      throw new Error("Super Admin role cannot be modified");
    }

    const { data, error } = await supabase
      .from("roles" as any)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Role;
  },

  async deleteRole(id: string) {
    // Check if it's a system role
    const { data: role } = await supabase
      .from("roles" as any)
      .select("is_system")
      .eq("id", id)
      .single();
    if ((role as any)?.is_system) {
      throw new Error("System roles cannot be deleted");
    }

    const { error } = await supabase
      .from("roles" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getStats() {
    const [rolesRes, usersRes] = await Promise.all([
      supabase.from("roles" as any).select("*", { count: "exact", head: true }),
      supabase.from("user_roles" as any).select("*", { count: "exact", head: true }),
    ]);

    // Get custom roles count
    const { count: customRolesCount } = await supabase
      .from("roles" as any)
      .select("*", { count: "exact", head: true })
      .eq("is_system", false);

    return {
      totalRoles: rolesRes.count || 0,
      activeUsers: usersRes.count || 0,
      customRoles: customRolesCount || 0,
      pendingRequests: 0, // Mock for now
    };
  },
};
