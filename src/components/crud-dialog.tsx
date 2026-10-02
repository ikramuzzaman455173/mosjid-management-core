import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { type ReactNode } from "react";

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function CrudDialog({ open, onOpenChange, title, children, onSubmit, saving, submitLabel }: CrudDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[calc(100dvh-2.5rem)] rounded-2xl">
        {/* Fixed Header with Title & Space for Close Button */}
        <div className="px-6 py-4 border-b border-border/50 shrink-0 pr-14 bg-background">
          <DialogTitle className="text-primary text-lg font-semibold tracking-tight">{title}</DialogTitle>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSubmit();
          }}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {children}
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-3.5 border-t border-border/50 bg-muted/20 shrink-0 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary">
              {saving ? t("saving") : (submitLabel ?? t("save"))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
