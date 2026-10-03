import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Menu, Calendar, Clock, LayoutGrid, Tv, ArrowRight } from "lucide-react";
import { MosqueIcon } from "@/components/ui/mosque-icon";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const { toggleSidebar, isMobile } = useSidebar();
  const [time, setTime] = useState(new Date());
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const loadTimer = setTimeout(() => setIsPageLoading(false), 800);
    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || (lang === "bn" ? "সম্মানিত ব্যবহারকারী" : "Respected User");

  const formattedDate = time.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const formattedTime = time.toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-4 sm:py-8 px-2 sm:px-4 relative overflow-hidden bg-transparent">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 sm:h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-t-3xl" />
      
      {isPageLoading ? (
        <div className="max-w-2xl w-full z-10 flex flex-col items-center">
          <Skeleton className="h-12 sm:h-14 w-[80%] sm:w-[400px] rounded-full mb-4 sm:mb-6" />
          <div className="w-full bg-card border border-border/40 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm flex flex-col items-center">
            <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="w-12 h-px mb-6" />
            <Skeleton className="w-10 h-10 rounded-full mb-3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl w-full z-10 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
          
          {/* Date & Time Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 bg-card/60 backdrop-blur-md border border-border/50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full shadow-sm mb-4 sm:mb-6 w-full sm:w-auto max-w-[90%]">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{formattedDate}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-border shrink-0" />
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{formattedTime}</span>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="w-full bg-card border border-border/40 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm relative overflow-hidden flex flex-col items-center">
            
            {/* Decorative Corner Moon */}
            <MosqueIcon className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 text-primary/[0.03] rotate-12 pointer-events-none" />
            
            {/* Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 sm:mb-6 ring-1 ring-primary/20 shadow-sm">
              <MosqueIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            
            {/* Greetings */}
            <div className="space-y-1.5 sm:space-y-2 w-full px-2 sm:px-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">
                {lang === "bn" ? `স্বাগতম, ` : `Welcome, `}
                <br className="sm:hidden" />
                <span className="text-primary">{name}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto text-balance mt-1 sm:mt-2">
                {lang === "bn" 
                  ? "বায়তুল মামুর জামে মসজিদ ম্যানেজমেন্ট সিস্টেমে আপনাকে স্বাগতম।" 
                  : "Welcome to Baytul Mamur Jame Mosque Management System."}
              </p>
            </div>

            <div className="w-10 sm:w-12 h-px bg-border/80 my-5 sm:my-6" />

            {/* Instructions */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 px-2 sm:px-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/50 mb-0.5 sm:mb-1">
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed text-balance">
                {lang === "bn" 
                  ? "আপনার জন্য নির্ধারিত মডিউলগুলো ব্যবহার করতে বাম পাশের মেনু অথবা উপরের সার্চ বার ব্যবহার করুন।" 
                  : "Please use the left sidebar menu or the top search bar to access your assigned modules."}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link to="/dashboard">
                  <Button
                    className="rounded-xl px-5 py-2.5 h-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-md shadow-amber-500/10 text-sm gap-2 transition-all hover:scale-[1.02]"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>{lang === "bn" ? "ড্যাশবোর্ডে প্রবেশ করুন" : "Go to Dashboard"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/tv-display">
                  <Button
                    variant="outline"
                    className="rounded-xl px-4 py-2.5 h-auto border-border/70 hover:bg-accent text-xs sm:text-sm font-medium gap-2"
                  >
                    <Tv className="w-4 h-4 text-emerald-500" />
                    <span>{lang === "bn" ? "টিভি ডিসপ্লে দেখুন" : "TV Display View"}</span>
                  </Button>
                </Link>

                {isMobile && (
                  <Button 
                    onClick={toggleSidebar} 
                    variant="outline"
                    className="rounded-xl px-4 py-2.5 h-auto bg-background border-border/50 text-muted-foreground hover:text-foreground text-xs sm:text-sm gap-2"
                  >
                    <Menu className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "মেনু খুলুন" : "Open Menu"}</span>
                  </Button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
