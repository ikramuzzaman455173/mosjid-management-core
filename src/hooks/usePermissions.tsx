import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePermissions() {
  return useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        return { permissions: new Set<string>(), roles: [], isAdmin: false };
      }

      // 1. Get user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles" as any)
        .select(`
          role_id,
          roles (
            name
          )
        `)
        .eq("user_id", userId);

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        return { permissions: new Set<string>(), roles: [], isAdmin: false };
      }

      const roles = (userRoles || []).flatMap((ur: any) => {
        if (Array.isArray(ur.roles)) {
          return ur.roles.map((r: any) => r.name);
        }
        return ur.roles?.name ? [ur.roles.name] : [];
      }).filter(Boolean) as string[];
      
      const normalizedRoles = roles.map(r => r.toLowerCase().trim().replace(/ /g, "_"));
      const roleIds = (userRoles || []).map((ur: any) => ur.role_id).filter(Boolean) as string[];
      
      const isAdmin = normalizedRoles.includes("super_admin") || normalizedRoles.includes("mosque_admin");
      const isSuperAdmin = normalizedRoles.includes("super_admin");
      
      const permSet = new Set<string>();

      // 2. Get permissions for those roles
      if (roleIds.length > 0) {
        const { data: perms, error: permsError } = await supabase
          .from("role_permissions" as any)
          .select(`
            permissions (
              module,
              action
            )
          `)
          .in("role_id", roleIds);

        if (!permsError && perms) {
          perms.forEach((rp: any) => {
            const p = rp.permissions;
            if (Array.isArray(p)) {
              p.forEach((px: any) => {
                if (px && px.module && px.action) {
                  permSet.add(`${px.module.toLowerCase()}.${px.action.toLowerCase()}`);
                }
              });
            } else if (p && p.module && p.action) {
              permSet.add(`${p.module.toLowerCase()}.${p.action.toLowerCase()}`);
            }
          });
        }
      }

      return { permissions: permSet, roles, isAdmin, isSuperAdmin };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
