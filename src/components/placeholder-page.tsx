import { Card } from "@/components/ui/card";
import { useI18n, type DictKey } from "@/lib/i18n";
import { Sparkles, CheckCircle2, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

interface PlaceholderPageProps {
  titleKey: DictKey;
  icon?: LucideIcon;
  description?: string;
  features?: string[];
}

export function PlaceholderPage({ titleKey, icon, description, features }: PlaceholderPageProps) {
  const { t, lang } = useI18n();
  const defaultDesc = lang === "bn"
    ? "এই module শীঘ্রই চালু হবে। নিচে আসন্ন ফিচারগুলো দেখুন।"
    : "This module will launch soon. Preview of upcoming features below.";

  return (
    <div className="space-y-4 max-w-5xl">
      <PageHeader icon={icon ?? Sparkles} title={t(titleKey)} subtitle={t("feature_preview")} />

      <Card className="p-6 shadow-card">
        <p className="text-sm text-muted-foreground mb-5">{description ?? defaultDesc}</p>

        <div>
          <h3 className="font-semibold text-primary mb-3 text-sm">{t("upcoming_features")}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(features ?? []).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
