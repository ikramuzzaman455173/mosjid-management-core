import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-elevated rounded-xl border font-sans text-sm p-4 backdrop-blur-md transition-all",
          description: "group-[.toast]:text-muted-foreground text-xs font-normal mt-0.5",
          title: "group-[.toast]:text-foreground font-semibold text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium text-xs px-3 py-1.5 rounded-lg",
          closeButton:
            "group-[.toast]:bg-background/80 group-[.toast]:border group-[.toast]:border-border/60 group-[.toast]:text-foreground hover:group-[.toast]:bg-muted hover:scale-105 transition-all rounded-full p-1",
          success:
            "group-[.toaster]:!bg-emerald-50 dark:group-[.toaster]:!bg-emerald-950/40 group-[.toaster]:!border-emerald-500/30 group-[.toaster]:!text-emerald-900 dark:group-[.toaster]:!text-emerald-200",
          error:
            "group-[.toaster]:!bg-rose-50 dark:group-[.toaster]:!bg-rose-950/40 group-[.toaster]:!border-rose-500/30 group-[.toaster]:!text-rose-900 dark:group-[.toaster]:!text-rose-200",
          warning:
            "group-[.toaster]:!bg-amber-50 dark:group-[.toaster]:!bg-amber-950/40 group-[.toaster]:!border-amber-500/30 group-[.toaster]:!text-amber-900 dark:group-[.toaster]:!text-amber-200",
          info:
            "group-[.toaster]:!bg-blue-50 dark:group-[.toaster]:!bg-blue-950/40 group-[.toaster]:!border-blue-500/30 group-[.toaster]:!text-blue-900 dark:group-[.toaster]:!text-blue-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
