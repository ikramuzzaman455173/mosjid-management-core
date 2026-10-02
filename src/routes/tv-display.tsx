import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBnNum } from "@/lib/i18n";
import { 
  Clock, 
  MapPin, 
  CalendarDays, 
  BellRing, 
  Sparkles,
  Sunrise,
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Users,
  Maximize2,
  Minimize2,
  Smartphone,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  Hourglass
} from "lucide-react";

export const Route = createFileRoute("/tv-display")({
  component: TvDisplayPage,
});

interface PrayerSlot {
  key: string;
  bn: string;
  en: string;
  icon: any;
  desc: string;
}

const PRAYERS: PrayerSlot[] = [
  { key: "fajr", bn: "ফজর", en: "Fajr", icon: Sunrise, desc: "ভোরের সালাত" },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr", icon: Sun, desc: "মধ্যাহ্নের সালাত" },
  { key: "asr", bn: "আসর", en: "Asr", icon: SunMedium, desc: "অপরাহ্নের সালাত" },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib", icon: Sunset, desc: "সূর্যাস্তের সালাত" },
  { key: "isha", bn: "এশা", en: "Isha", icon: Moon, desc: "রাতের সালাত" },
  { key: "jummah", bn: "জুমুআ", en: "Jummah", icon: Users, desc: "শুক্রবার জুমার সালাত" },
];

const DAILY_HADITHS = [
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: পাঁচ ওয়াক্ত সালাত হলো এক সালাত থেকে আরেক সালাতের মধ্যবর্তী গুনাহের কাফফারা, যদি কবিরা গুনাহ থেকে বিরত থাকা হয়।",
    source: "সহীহ মুসলিম: ২৩৩"
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: জামাআতে সালাত আদায় করা একাকী সালাত আদায়ের চেয়ে ২৭ গুণ বেশি মর্যাদাপূর্ণ।",
    source: "সহীহ বুখারী: ৬৪৫"
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: যে ব্যক্তি ভোরে ও সন্ধ্যায় মসজিদে যায়, সে যতবার যায় আল্লাহ জান্নাতে তার মেহমানদারির ব্যবস্থা করেন।",
    source: "সহীহ বুখারী: ৬৬২"
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: সালাতের কাতার সোজা করো, নিশ্চয়ই কাতার সোজা করা সালাতের পূর্ণতার অংশ।",
    source: "সহীহ বুখারী: ৭২৩"
  },
];

function getHijriDate(date: Date) {
  try {
    const raw = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    // Replace "যুগ" or trailing oddities
    return raw.replace("যুগ", "").trim() + " হিজরি";
  } catch (e) {
    return "১৪৪৭ হিজরি";
  }
}

function getBengaliFullDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return date.toDateString();
  }
}

function TvDisplayPage() {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hadithIndex, setHadithIndex] = useState(0);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate Hadith every 25 seconds
  useEffect(() => {
    const hadithTimer = setInterval(() => {
      setHadithIndex((prev) => (prev + 1) % DAILY_HADITHS.length);
    }, 25000);
    return () => clearInterval(hadithTimer);
  }, []);

  const dateStr = time.toISOString().slice(0, 10);
  const isFriday = time.getDay() === 5;

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

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
        .limit(4);
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

  // Format 12-hour clock
  const currentHours = time.getHours();
  const currentMinutes = time.getMinutes();
  const currentSeconds = time.getSeconds();
  const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

  const h12 = currentHours % 12 || 12;
  const bdHours = toBnNum(String(h12).padStart(2, "0"), "bn");
  const bdMinutes = toBnNum(String(currentMinutes).padStart(2, "0"), "bn");
  const bdSeconds = toBnNum(String(currentSeconds).padStart(2, "0"), "bn");
  const bdAmPm = currentHours >= 12 ? "PM" : "AM";

  // Active prayers list: on Friday show Jummah instead of Dhuhr
  const activePrayers = useMemo(() => {
    return PRAYERS.filter((p) => {
      if (isFriday && p.key === "dhuhr") return false;
      if (!isFriday && p.key === "jummah") return false;
      return true;
    });
  }, [isFriday]);

  // Convert "HH:mm" 24h to Bengali 12h representation
  const formatTime12hBn = (timeStr?: string) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    const hNum = parseInt(h, 10);
    if (isNaN(hNum)) return "—";
    const ampm = hNum >= 12 ? "PM" : "AM";
    const h12Val = hNum % 12 || 12;
    return `${toBnNum(String(h12Val).padStart(2, "0"), "bn")}:${toBnNum(m, "bn")} ${ampm}`;
  };

  // Determine Next Prayer & Remaining Time Countdown
  const { nextPrayerKey, countdownText, isUrgent } = useMemo(() => {
    if (!prayerTime) {
      return { nextPrayerKey: "fajr", countdownText: null, isUrgent: false };
    }

    for (const p of activePrayers) {
      const iqamahStr = (prayerTime as any)[`${p.key}_iqamah`];
      if (!iqamahStr) continue;

      const [ih, im] = iqamahStr.split(":");
      const iqamahTotalSec = parseInt(ih, 10) * 3600 + parseInt(im, 10) * 60;

      if (iqamahTotalSec > currentTotalSeconds) {
        const diffSec = iqamahTotalSec - currentTotalSeconds;
        const diffHours = Math.floor(diffSec / 3600);
        const diffMins = Math.floor((diffSec % 3600) / 60);
        const diffSecs = diffSec % 60;

        let countdown = "";
        if (diffHours > 0) {
          countdown = `${toBnNum(String(diffHours), "bn")} ঘণ্টা ${toBnNum(String(diffMins), "bn")} মিনিট`;
        } else {
          countdown = `${toBnNum(String(diffMins), "bn")} মিনিট ${toBnNum(String(diffSecs), "bn")} সেকেন্ড`;
        }

        return {
          nextPrayerKey: p.key,
          countdownText: countdown,
          isUrgent: diffSec <= 600, // less than 10 mins
        };
      }
    }

    // If all prayers today passed, next is tomorrow's Fajr
    return {
      nextPrayerKey: "fajr",
      countdownText: "পরবর্তী ওয়াক্ত ফজর",
      isUrgent: false,
    };
  }, [prayerTime, activePrayers, currentTotalSeconds]);

  // Derived Astronomical & Sunnah Times
  const sunnahTimes = useMemo(() => {
    const fajrAzan = (prayerTime as any)?.fajr || "04:30";
    const maghribAzan = (prayerTime as any)?.maghrib || "18:00";

    const [fh, fm] = fajrAzan.split(":");
    const [mh, mm] = maghribAzan.split(":");

    // Sahur ends 10 mins before Fajr Azan
    const fajrMinutes = parseInt(fh, 10) * 60 + parseInt(fm, 10);
    const sahurEndMin = Math.max(0, fajrMinutes - 10);
    const sahurH = Math.floor(sahurEndMin / 60);
    const sahurM = sahurEndMin % 60;
    const sahurStr = `${String(sahurH).padStart(2, "0")}:${String(sahurM).padStart(2, "0")}`;

    // Sunrise / Ishraq ~1h 15m after Fajr Azan
    const sunriseMin = fajrMinutes + 75;
    const sunriseH = Math.floor(sunriseMin / 60);
    const sunriseM = sunriseMin % 60;
    const sunriseStr = `${String(sunriseH).padStart(2, "0")}:${String(sunriseM).padStart(2, "0")}`;

    return {
      sahur: formatTime12hBn(sahurStr),
      sunrise: formatTime12hBn(sunriseStr),
      zawal: "১১:৪৫ AM",
      iftar: formatTime12hBn(maghribAzan),
    };
  }, [prayerTime]);

  const hijriDate = useMemo(() => getHijriDate(time), [time]);
  const bengaliDate = useMemo(() => getBengaliFullDate(time), [time]);

  return (
    <div className="dark min-h-screen w-full bg-[#020d08] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Decorative Islamic Geometric Watermark Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.035] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-emerald-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Navigation & Mosque Banner Header */}
      <header className="relative z-20 border-b border-emerald-900/40 bg-gradient-to-r from-[#03170e]/95 via-[#052618]/95 to-[#03170e]/95 backdrop-blur-xl px-5 sm:px-8 lg:px-10 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Left: Mosque Emblem & Title */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-600/25 via-emerald-800/40 to-emerald-950 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0 group">
            <Clock className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#03170e]" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                কেন্দ্রীয় জামে মসজিদ
              </span>
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                • ইসলামিক রিসার্চ সেন্টার
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mt-0.5">
              বায়তুল মামুর জামে মসজিদ
            </h1>
          </div>
        </div>

        {/* Center: Dual Hijri & Gregorian Calendar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-black/30 border border-emerald-800/40 px-4 py-2 rounded-2xl backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-sm sm:text-base">
            <Moon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{hijriDate}</span>
          </div>
          <div className="h-4 w-px bg-emerald-800/60 hidden sm:block" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-medium text-sm sm:text-base">
            <CalendarDays className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bengaliDate}</span>
          </div>
        </div>

        {/* Right: Master Clock & Status Reminders */}
        <div className="flex items-center gap-3">
          
          {/* Master Digital Clock Display */}
          <div className="flex items-center bg-gradient-to-b from-black/60 to-black/90 border border-emerald-500/30 px-5 sm:px-6 py-2 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-baseline tabular-nums font-black">
              <span className="text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {bdHours}
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl text-amber-400 mx-1 animate-pulse">
                :
              </span>
              <span className="text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {bdMinutes}
              </span>
              <span className="text-2xl sm:text-3xl text-emerald-400/80 mx-1 font-bold">
                :
              </span>
              <span className="text-2xl sm:text-3xl lg:text-4xl text-emerald-400 font-extrabold">
                {bdSeconds}
              </span>
            </div>
            <div className="ml-3 flex flex-col items-center">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-xs sm:text-sm tracking-wider border border-emerald-500/40">
                {bdAmPm}
              </span>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "ফুলস্ক্রিন থেকে বের হন" : "ফুলস্ক্রিন করুন"}
            className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all shadow-md cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

      </header>

      {/* Main Body Section */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10 max-w-[1920px] mx-auto w-full">
        
        {/* Left Side: Prayer Times Main Board (62% width on desktop) */}
        <div className="flex-1 lg:flex-[62] flex flex-col gap-3.5">
          
          {/* Section Header with Next Prayer Countdown Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/80 to-[#031c11]/80 border border-emerald-800/40 px-5 py-3 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  আজকের নামাজের সময়সূচি
                </h2>
                <p className="text-xs text-emerald-300/80 font-medium">
                  ওয়াক্ত অনুযায়ী নিয়মিত সালাত কায়েম করুন
                </p>
              </div>
            </div>

            {/* Live Iqamah Countdown Pill */}
            {countdownText && (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-md transition-all ${
                isUrgent 
                  ? "bg-amber-500/20 border-amber-400/60 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              }`}>
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span>ইকামতের বাকি: {countdownText}</span>
              </div>
            )}
          </div>

          {/* Table Column Headers */}
          <div className="grid grid-cols-12 px-5 py-2 text-xs sm:text-sm font-bold text-emerald-400/90 tracking-wider uppercase bg-black/20 rounded-xl border border-emerald-950">
            <div className="col-span-5 sm:col-span-4 flex items-center gap-2">ওয়াক্ত</div>
            <div className="col-span-3 sm:col-span-4 text-center">আযান</div>
            <div className="col-span-4 text-right pr-2">জামাআত (ইকামত)</div>
          </div>

          {/* Prayers List */}
          <div className="flex-1 flex flex-col gap-2.5">
            {activePrayers.map((p) => {
              const isNext = nextPrayerKey === p.key;
              const Icon = p.icon;
              const azanTime = formatTime12hBn((prayerTime as any)?.[p.key]);
              const iqamahTime = formatTime12hBn((prayerTime as any)?.[`${p.key}_iqamah`]);

              return (
                <div
                  key={p.key}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 sm:py-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isNext
                      ? "bg-gradient-to-r from-emerald-900/60 via-[#073822]/80 to-emerald-900/60 border-amber-400/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-amber-400/50 scale-[1.01]"
                      : "bg-[#041a10]/80 hover:bg-[#072618]/90 border-emerald-900/40 backdrop-blur-md"
                  }`}
                >
                  {/* Glowing Indicator bar for active prayer */}
                  {isNext && (
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-emerald-400 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                  )}

                  {/* Prayer Name & Status Badge */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isNext 
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]" 
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
                          isNext ? "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" : "text-white"
                        }`}>
                          {p.bn}
                        </span>
                        {isNext && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 bg-amber-400 text-black text-[11px] font-black rounded-md uppercase tracking-wider animate-pulse shadow-sm">
                            পরবর্তী ওয়াক্ত
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium block">
                        {p.en} • {p.desc}
                      </span>
                    </div>
                  </div>

                  {/* Azan Time */}
                  <div className="col-span-3 sm:col-span-4 text-center">
                    <span className="text-base sm:text-xl lg:text-2xl font-bold text-slate-200 tabular-nums">
                      {azanTime}
                    </span>
                  </div>

                  {/* Iqamah / Jamat Time */}
                  <div className="col-span-4 text-right pr-2">
                    <span className={`text-xl sm:text-2xl lg:text-3xl font-black tabular-nums tracking-tight ${
                      isNext
                        ? "text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                        : "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                    }`}>
                      {iqamahTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Additional Sunnah Times, Hadith, & Mosque Announcements (38% width on desktop) */}
        <div className="flex-1 lg:flex-[38] flex flex-col gap-4">
          
          {/* Card 1: Additional Important Solar & Sunnah Times */}
          <div className="bg-gradient-to-b from-[#052618]/90 to-[#03170e]/95 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 mb-3">
              <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                অন্যান্য গুরুত্বপূর্ণ ওয়াক্ত
              </span>
              <span className="text-xs text-emerald-400/80 font-medium">আজকের সময়</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-black/30 border border-emerald-900/50 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  সেহরি ও তাহাজ্জুদ শেষ
                </div>
                <div className="text-base sm:text-lg font-black text-white tabular-nums">
                  {sunnahTimes.sahur}
                </div>
              </div>

              <div className="bg-black/30 border border-emerald-900/50 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                  সূর্যোদয় (ইশরাক শুরু)
                </div>
                <div className="text-base sm:text-lg font-black text-amber-300 tabular-nums">
                  {sunnahTimes.sunrise}
                </div>
              </div>

              <div className="bg-black/30 border border-emerald-900/50 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <SunMedium className="w-3.5 h-3.5 text-yellow-400" />
                  চাশত ও জাওয়াল
                </div>
                <div className="text-base sm:text-lg font-black text-white tabular-nums">
                  {sunnahTimes.zawal}
                </div>
              </div>

              <div className="bg-black/30 border border-emerald-900/50 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Sunset className="w-3.5 h-3.5 text-rose-400" />
                  সূর্যাস্ত ও ইফতার
                </div>
                <div className="text-base sm:text-lg font-black text-rose-300 tabular-nums">
                  {sunnahTimes.iftar}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming Events OR Rotating Hadith of the Day */}
          <div className="bg-gradient-to-b from-[#052618]/90 to-[#03170e]/95 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex-1 flex flex-col">
            
            {events && events.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 mb-3">
                  <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-amber-400" />
                    মসজিদের আগামী ইভেন্ট
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {toBnNum(String(events.length), "bn")} টি ইভেন্ট
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
                  {events.map((e) => (
                    <div 
                      key={e.id}
                      className="bg-black/30 border border-emerald-900/60 rounded-xl p-3.5 flex flex-col gap-1 hover:border-amber-400/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-amber-300 text-sm sm:text-base truncate">
                          {e.title}
                        </h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 shrink-0">
                          {toBnNum(new Date(e.event_date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }), "bn")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                          {toBnNum(new Date(e.event_date).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }), "bn")}
                        </span>
                        {e.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400/80" />
                            {e.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // When no events, display rich Islamic Hadith & Adab
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 mb-3">
                  <span className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    দৈনিক হাদিস ও নসীহত
                  </span>
                  <span className="text-[11px] text-emerald-400/80 font-medium">প্রতিদিনের আমল</span>
                </div>

                <div className="bg-black/40 border border-emerald-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden flex-1 flex flex-col justify-center">
                  <div className="text-4xl text-amber-400/10 font-serif absolute -top-1 left-2 select-none">“</div>
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-slate-100 leading-relaxed relative z-10">
                    {DAILY_HADITHS[hadithIndex].text}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-900/40">
                    <span className="text-xs text-amber-400 font-semibold">
                      — {DAILY_HADITHS[hadithIndex].source}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      নিয়মিত পাঠ করুন
                    </span>
                  </div>
                </div>

                {/* Mosque Etiquette Reminder Pill */}
                <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300/90 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
                    মসজিদে প্রবেশের পর মোবাইল ফোন সাইলেন্ট রাখুন
                  </span>
                  <span className="text-amber-400 font-bold hidden sm:inline">জাজাকাল্লাহু খাইরান</span>
                </div>
              </div>
            )}

          </div>

          {/* Card 3: Mosque Fund & Donation Info Banner */}
          <div className="bg-gradient-to-r from-emerald-950/90 via-[#07321e]/90 to-emerald-950/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  মসজিদের উন্নয়ন ফান্ড ও দান
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-300/80">
                  বিকাশ / নগদ (মার্চেন্ট): ০১৭১২-৩৪৫৬৭৮
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                সাদাকাহ জারিয়া
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Marquee for Announcements & Hadith Ticker */}
      <footer className="h-12 sm:h-14 bg-gradient-to-r from-emerald-950 via-[#052b1b] to-emerald-950 border-t border-emerald-700/40 flex items-center overflow-hidden relative z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        
        {/* Fixed Title Label on Left */}
        <div className="absolute left-0 top-0 bottom-0 z-30 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 flex items-center justify-center gap-2 font-black text-sm sm:text-base text-white shadow-[10px_0_20px_rgba(0,0,0,0.6)] border-r border-emerald-400/40">
          <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>জরুরি ঘোষণা</span>
        </div>

        {/* Smooth Scrolling Text Ticker */}
        <div className="whitespace-nowrap animate-[marquee_40s_linear_infinite] ml-[150px] sm:ml-[180px] text-sm sm:text-base font-semibold text-slate-100 flex items-center">
          {notices && notices.length > 0 ? (
            notices.map((n) => (
              <span key={n.id} className="mx-8 flex items-center gap-2.5">
                <span className="text-amber-400 font-bold text-base">✦</span>
                <span className="text-amber-200">{n.title}:</span>
                <span className="text-slate-200">{n.content || ""}</span>
              </span>
            ))
          ) : (
            <>
              <span className="mx-8 flex items-center gap-2.5">
                <span className="text-amber-400 font-bold text-base">✦</span>
                <span>সালাতের কাতার সোজা ও সুন্দরভাবে দাঁড়ান, নিশ্চয় কাতার সোজা করা সালাতের সৌন্দর্যের অংশ।</span>
              </span>
              <span className="mx-8 flex items-center gap-2.5">
                <span className="text-amber-400 font-bold text-base">✦</span>
                <span>মসজিদে প্রবেশের সময় মোবাইল ফোন বন্ধ অথবা সাইলেন্ট রাখুন।</span>
              </span>
              <span className="mx-8 flex items-center gap-2.5">
                <span className="text-amber-400 font-bold text-base">✦</span>
                <span>জামাআতে সালাত আদায় একা পড়ার চেয়ে ২৭ গুণ বেশি সওয়াব (সহীহ বুখারী ও মুসলিম)।</span>
              </span>
              <span className="mx-8 flex items-center gap-2.5">
                <span className="text-amber-400 font-bold text-base">✦</span>
                <span>মসজিদ আল্লাহর ঘর, এর পবিত্রতা ও পরিষ্কার-পরিচ্ছন্নতা রক্ষা করুন।</span>
              </span>
            </>
          )}
        </div>

      </footer>

      {/* Marquee CSS Keyframe */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
