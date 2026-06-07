import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBnNum } from "@/lib/i18n";
import { Clock, MapPin, CalendarDays, BellRing, Sparkles } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/tv-display")({
  component: TvDisplayPage,
});

const PRAYERS = [
  { key: "fajr", bn: "ফজর", en: "Fajr" },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr" },
  { key: "asr", bn: "আসর", en: "Asr" },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib" },
  { key: "isha", bn: "এশা", en: "Isha" },
  { key: "jummah", bn: "জুম্মা", en: "Jummah" },
];

function TvDisplayPage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toISOString().slice(0, 10);

  // Fetch Prayer Times
  const { data: prayerTime } = useQuery({
    queryKey: ["prayer", "active", dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("prayer_times")
        .select("*")
        .lte("effective_date", dateStr)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 60000,
  });

  // Fetch Events
  const { data: events } = useQuery({
    queryKey: ["events", "tv-display"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", dateStr)
        .order("event_date", { ascending: true })
        .limit(5);
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  // Fetch Notices
  const { data: notices } = useQuery({
    queryKey: ["notices", "tv-display"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("published", true)
        .order("notice_date", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  const formatTime = (t: Date) => {
    let hours = t.getHours();
    const minutes = t.getMinutes();
    const seconds = t.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
    return { hours, minutes: minutesStr, seconds: secondsStr, ampm };
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);
  const bdHours = toBnNum(hours.toString(), "bn");
  const bdMinutes = toBnNum(minutes.toString(), "bn");
  const bdSeconds = toBnNum(seconds.toString(), "bn");
  const bdAmPm = ampm === "AM" ? "AM" : "PM";

  const nextPrayer = () => {
    if (!prayerTime) return null;
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    
    for (const p of PRAYERS) {
      if (p.key === "jummah" && time.getDay() !== 5) continue;
      
      const pTime = (prayerTime as any)[`${p.key}_iqamah`];
      if (!pTime) continue;
      const [h, m] = pTime.split(":");
      const pMinutes = parseInt(h) * 60 + parseInt(m);
      if (pMinutes > currentMinutes) return p.key;
    }
    return "fajr"; // defaults to next day fajr
  };

  const np = nextPrayer();

  const convertTo12Hour = (timeStr: string) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${toBnNum(hours.toString(), "bn")}:${toBnNum(m, "bn")} ${ampm === "AM" ? "AM" : "PM"}`;
  };

  return (
    // Force dark mode wrapper for TV Display for a premium cinema-like feel
    <div className="dark min-h-screen lg:h-screen w-full bg-background text-foreground flex flex-col font-sans overflow-x-hidden lg:overflow-hidden selection:bg-primary/30">
      {/* Background ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="h-auto py-6 lg:py-0 lg:h-24 xl:h-28 border-b border-border/40 bg-card/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between px-6 md:px-8 xl:px-12 gap-6 md:gap-4 relative z-10 shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
            <Clock className="w-8 h-8 drop-shadow-md" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent drop-shadow-sm pb-1">
              বায়তুল মামুর জামে মসজিদ
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg xl:text-xl font-medium flex items-center justify-center sm:justify-start gap-2.5">
              <CalendarDays className="w-4 sm:w-5 h-4 sm:h-5 text-gold" />
              {toBnNum(format(time, "dd MMMM yyyy"), "bn")}
            </p>
          </div>
        </div>
        <div className="text-right flex items-baseline justify-center gap-2 sm:gap-3 bg-card/30 px-5 sm:px-6 py-3 rounded-3xl border border-border/50 shadow-inner">
          <span className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tighter text-foreground drop-shadow-lg tabular-nums flex items-baseline">
            {bdHours}<span className="text-primary/70 mx-1">:</span>{bdMinutes}
            <span className="text-primary/70 mx-1 opacity-60">:</span>
            <span className="text-3xl sm:text-4xl xl:text-5xl text-muted-foreground/80 font-bold">{bdSeconds}</span>
          </span>
          <span className="text-xl sm:text-2xl xl:text-3xl font-bold text-muted-foreground ml-1">{bdAmPm}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 sm:p-6 md:p-8 xl:p-10 relative z-10 lg:min-h-0">
        
        {/* Left: Prayer Times */}
        <div className="flex-[5] flex flex-col lg:min-h-0 gap-4">
          <div className="flex items-center gap-3 shrink-0 justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-foreground tracking-tight">
              আজকের নামাজের সময়সূচি
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 lg:min-h-0">
            {/* Header row for prayers */}
            <div className="grid grid-cols-3 px-3 sm:px-6 pb-2 text-muted-foreground font-semibold text-sm sm:text-lg shrink-0">
              <div>ওয়াক্ত</div>
              <div className="text-center">আযান</div>
              <div className="text-right">জামাআত (ইকামত)</div>
            </div>
            
            {/* Individual Prayer Cards */}
            <div className="flex-1 flex flex-col gap-3 lg:min-h-0">
              {PRAYERS.map((p, idx) => {
                if (p.key === "jummah" && time.getDay() !== 5) return null; // Only show Jummah on Friday
                const isNext = np === p.key;
                
                return (
                  <div 
                    key={p.key} 
                    className={`flex-1 grid grid-cols-3 items-center p-3 sm:px-6 rounded-2xl border transition-all duration-500 relative overflow-hidden
                      ${isNext 
                        ? "bg-primary/10 border-primary/40 shadow-[0_4px_20px_rgba(var(--primary),0.15)] scale-[1.02]" 
                        : "bg-card/40 border-border/40 backdrop-blur-md hover:bg-card/60"
                      }`}
                  >
                    {/* Active highlight glow */}
                    {isNext && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-primary to-primary-glow shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pl-2 sm:pl-0">
                      <span className={`text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight ${isNext ? "text-primary drop-shadow-sm" : "text-foreground"}`}>
                        {p.bn}
                      </span>
                      {isNext && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs xl:text-sm font-bold rounded-full animate-pulse shadow-sm whitespace-nowrap self-start sm:self-auto">
                          পরবর্তী
                        </span>
                      )}
                    </div>
                    <div className="text-center text-lg sm:text-xl xl:text-2xl font-semibold text-muted-foreground tabular-nums">
                      {convertTo12Hour((prayerTime as any)?.[p.key])}
                    </div>
                    <div className={`text-right text-xl sm:text-2xl xl:text-3xl font-black tabular-nums ${isNext ? 'text-primary' : 'text-foreground'}`}>
                      {convertTo12Hour((prayerTime as any)?.[`${p.key}_iqamah`])}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Events & Info */}
        <div className="flex-[3] flex flex-col lg:min-h-0 gap-4 mt-6 lg:mt-0">
          <div className="flex items-center gap-3 shrink-0 justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-foreground tracking-tight">
              আগামী ইভেন্ট
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 lg:min-h-0 lg:overflow-hidden">
            {events?.length === 0 ? (
              <div className="flex-1 border-2 border-border/40 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-card/10 backdrop-blur-sm p-8">
                <CalendarDays className="w-10 h-10 opacity-20 mb-3" />
                <span className="text-base sm:text-lg font-medium text-center">আগামীতে কোনো ইভেন্ট নেই</span>
              </div>
            ) : (
              events?.map((e, i) => {
                const isCompact = events.length > 3;
                return (
                <div 
                  key={e.id} 
                  className={`bg-card/40 backdrop-blur-md border border-border/40 ${isCompact ? 'p-4' : 'p-4 sm:p-5'} rounded-2xl flex flex-col gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl hover:border-gold/30 transition-all duration-300 relative overflow-hidden group shrink-0`}
                >
                  <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gold/5 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 transition-transform group-hover:scale-150" />
                  <h3 className={`${isCompact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-extrabold text-gold drop-shadow-sm leading-tight relative z-10 truncate`}>{e.title}</h3>
                  <div className={`flex items-center gap-2 text-muted-foreground ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-medium relative z-10`}>
                    <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gold/70 shrink-0" />
                    <span className="truncate">{toBnNum(format(new Date(e.event_date), "dd MMM, hh:mm a"), "bn")}</span>
                  </div>
                  {e.location && !isCompact && (
                    <div className="flex items-center gap-2 text-muted-foreground text-base sm:text-lg font-medium relative z-10">
                      <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gold/70 shrink-0" />
                      <span className="truncate">{e.location}</span>
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
        </div>

      </main>

      {/* Footer Marquee for Notices */}
      {notices && notices.length > 0 && (
        <footer className="h-14 md:h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center overflow-hidden relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] shrink-0">
          <div className="absolute left-0 top-0 bottom-0 z-30 bg-primary px-5 flex items-center justify-center gap-2 font-extrabold text-lg md:text-xl text-primary-foreground shadow-[10px_0_20px_rgba(0,0,0,0.5)] border-r border-primary-glow">
            <BellRing className="w-5 h-5 animate-[ring_2s_ease-in-out_infinite] origin-top" /> নোটিশ 
          </div>
          <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] ml-[150px] text-lg md:text-xl font-semibold text-foreground flex items-center">
            {notices.map((n, i) => (
              <span key={n.id} className="mx-8 flex items-center gap-3">
                <span className="text-gold opacity-80 text-base">✦</span> {n.title}
              </span>
            ))}
          </div>
        </footer>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
      `}} />
    </div>
  );
}
