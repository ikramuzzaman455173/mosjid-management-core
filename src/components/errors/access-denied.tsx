import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  const { lang } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-destructive/20 blur-[100px] rounded-full" />
        <ShieldAlert className="w-32 h-32 text-destructive/80 relative z-10" strokeWidth={1} />
      </div>
      <h1 className="text-7xl font-bold tracking-tighter mt-8 text-foreground drop-shadow-sm">
        403
      </h1>
      <h2 className="text-2xl font-semibold tracking-tight mt-4 text-foreground/90">
        {lang === "bn" ? "অ্যাক্সেস ডিনাইড" : "Access Denied"}
      </h2>
      <p className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
        {lang === "bn"
          ? "দুঃখিত! এই পেইজটি দেখার জন্য বা এই কাজটি করার জন্য আপনার পর্যাপ্ত পারমিশন নেই। যদি মনে করেন এটি কোনো ভুল, তবে আপনার অ্যাডমিনের সাথে যোগাযোগ করুন।"
          : "Sorry! You don't have sufficient permission to view this page or perform this action. If you think this is a mistake, contact your administrator."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Button
          variant="outline"
          className="h-12 px-6 rounded-full w-full sm:w-auto shadow-sm hover:bg-muted/50"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === "bn" ? "আগের পৃষ্ঠায় ফিরে যান" : "Go Back"}
        </Button>
        <Link to="/">
          <Button className="h-12 px-6 rounded-full w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Home className="w-4 h-4 mr-2" />
            {lang === "bn" ? "হোমে ফিরে যান" : "Back to Home"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
