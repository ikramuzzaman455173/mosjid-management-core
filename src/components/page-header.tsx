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

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actions,
}: PageHeaderProps) {
  return (
    <Card
      className="p-3 sm:p-4 border-0 text-white shadow-elevated rounded-xl min-w-0"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-white/80 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
          {onAction && actionLabel && (
            <Button
              size="sm"
              onClick={onAction}
              className="bg-white text-primary hover:bg-white/90 shadow-sm font-semibold h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
