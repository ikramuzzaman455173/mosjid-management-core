import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hint } from "@/components/ui/hint";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

function AccountsByKind({
  kind,
  icon,
  titleKey,
}: {
  kind: "cash" | "bank" | "mobile_banking";
  icon: any;
  titleKey: any;
}) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const moduleName = kind === "cash" ? "Cash Management" : "Bank & Mobile Banking";
  const canCreate =
    permData?.isSuperAdmin || permData?.permissions?.has(`${moduleName.toLowerCase()}.create`);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bank_name: "", account_no: "", opening_balance: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", kind],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("kind", kind)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...form,
        kind,
        opening_balance: Number(form.opening_balance) || 0,
        ...(editing ? {} : { current_balance: Number(form.opening_balance) || 0 }),
      };
      if (editing) {
        const { error } = await supabase.from("accounts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["accounts", kind] });
      setOpen(false);
      setForm({ name: "", bank_name: "", account_no: "", opening_balance: 0 });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("deleted"));
      qc.invalidateQueries({ queryKey: ["accounts", kind] });
    },
  });

  const total = (data ?? []).reduce((s: number, a: any) => s + Number(a.current_balance || 0), 0);

  const columns: Column<any>[] = [
    { key: "name", header: t("name"), cell: (a) => <span className="font-medium">{a.name}</span> },
    ...(kind !== "cash"
      ? [
          {
            key: "bank",
            header: lang === "bn" ? "ব্যাংক/প্রোভাইডার" : "Bank/Provider",
            cell: (a: any) => a.bank_name ?? "—",
          },
          {
            key: "no",
            header: lang === "bn" ? "অ্যাকাউন্ট নং" : "Account No",
            cell: (a: any) => a.account_no ?? "—",
          },
        ]
      : []),
    {
      key: "bal",
      header: t("balance"),
      className: "text-right",
      cell: (a) => (
        <span className="font-bold text-primary">
          {fmtCurrency(Number(a.current_balance ?? 0), lang)}
        </span>
      ),
    },
    {
      key: "act",
      header: t("actions"),
      className: "text-right",
      cell: (a) => (
        <div className="flex gap-1 justify-end">
          <PermissionGuard module={moduleName} action="Edit" fallback={<></>}>
            <Hint label={t("edit")}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditing(a);
                  setForm({
                    name: a.name,
                    bank_name: a.bank_name ?? "",
                    account_no: a.account_no ?? "",
                    opening_balance: Number(a.opening_balance ?? 0),
                  });
                  setOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </Hint>
          </PermissionGuard>
          <PermissionGuard module={moduleName} action="Delete" fallback={<></>}>
            <Hint label={t("delete")}>
              <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Hint>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={icon}
        title={t(titleKey)}
        subtitle={`${t("total")}: ${fmtCurrency(total, lang)}`}
        actionLabel={canCreate ? t("add") : undefined}
        onAction={
          canCreate
            ? () => {
                setEditing(null);
                setForm({ name: "", bank_name: "", account_no: "", opening_balance: 0 });
                setOpen(true);
              }
            : undefined
        }
      />
      <DataTable
        data={data as any[]}
        columns={columns}
        loading={isLoading}
        searchKeys={["name", "bank_name"]}
      />
      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("edit") : t("add")}
        onSubmit={() => save.mutate()}
        saving={save.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label required>{t("name")}</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={lang === "bn" ? "যেমন: ক্যাশ বাক্স" : "e.g. Cash Box"}
            />
          </div>
          {kind !== "cash" && (
            <>
              <div>
                <Label>{lang === "bn" ? "ব্যাংক/প্রোভাইডার" : "Bank/Provider"}</Label>
                <Input
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  placeholder={
                    kind === "mobile_banking" ? "bKash / Nagad / Rocket" : "Islami Bank, DBBL..."
                  }
                />
              </div>
              <div>
                <Label>{lang === "bn" ? "অ্যাকাউন্ট নং" : "Account No"}</Label>
                <Input
                  value={form.account_no}
                  onChange={(e) => setForm({ ...form, account_no: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </>
          )}
          <div>
            <Label>{lang === "bn" ? "ওপেনিং ব্যালেন্স" : "Opening Balance"} (৳)</Label>
            <Input
              type="number"
              min="0"
              value={form.opening_balance}
              onChange={(e) => setForm({ ...form, opening_balance: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog
        id={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={(id) => del.mutate(id)}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/cash")({
  component: () => <AccountsByKind kind="cash" icon={Wallet} titleKey="cash_accounts" />,
});
