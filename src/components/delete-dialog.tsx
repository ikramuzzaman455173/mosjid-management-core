import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

interface DeleteDialogProps {
  id: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  title?: string;
  description?: string;
}

export function DeleteDialog({ id, onClose, onConfirm, title, description }: DeleteDialogProps) {
  const { lang } = useI18n();

  return (
    <AlertDialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || (lang === "bn" ? "আপনি কি নিশ্চিত?" : "Are you sure?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || (lang === "bn" 
              ? "এই তথ্যটি ডিলিট করলে তা আর ফিরে পাওয়া যাবে না।" 
              : "This action cannot be undone. This will permanently delete the record.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {lang === "bn" ? "বাতিল" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (id) {
                onConfirm(id);
                onClose();
              }
            }}
          >
            {lang === "bn" ? "ডিলিট" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
