import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, actionLabel, onAction, actions }: PageHeaderProps) {
  return (
    <Card
      className="p-4 border-0 text-white shadow-elevated"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-gold" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{title}</h1>
            {subtitle && <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onAction && actionLabel && (
            <Button onClick={onAction} className="bg-white text-primary hover:bg-white/90 shadow-sm font-semibold">
              <Plus className="w-4 h-4 mr-1" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
