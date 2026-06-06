import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const { lang } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
        <FileQuestion className="w-32 h-32 text-primary/80 relative z-10 animate-pulse" strokeWidth={1} />
      </div>
      <h1 className="text-7xl font-bold tracking-tighter mt-8 text-foreground drop-shadow-sm">404</h1>
      <h2 className="text-2xl font-semibold tracking-tight mt-4 text-foreground/90">
        {lang === "bn" ? "পৃষ্ঠা পাওয়া যায়নি" : "Page Not Found"}
      </h2>
      <p className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
        {lang === "bn" 
          ? "আপনি যে পেইজটি খুঁজছেন তা মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।"
          : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Button variant="outline" className="h-12 px-6 rounded-full w-full sm:w-auto shadow-sm hover:bg-muted/50" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === "bn" ? "আগের পৃষ্ঠায় ফিরে যান" : "Go Back"}
        </Button>
        <Link to="/">
          <Button className="h-12 px-6 rounded-full w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
            <Home className="w-4 h-4 mr-2" />
            {lang === "bn" ? "হোমে ফিরে যান" : "Back to Home"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
