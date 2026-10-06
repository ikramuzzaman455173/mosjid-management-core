import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBnNum } from "@/lib/i18n";
import { MosqueIcon } from "@/components/ui/mosque-icon";
import {
  Clock,
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
  Hourglass,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/tv-display")({
  component: TvDisplayPage,
});

interface PrayerSlot {
  key: string;
  bn: string;
  en: string;
  icon: any;
}

const PRAYERS: PrayerSlot[] = [
  { key: "fajr", bn: "ফজর", en: "Fajr", icon: Sunrise },
  { key: "dhuhr", bn: "যোহর", en: "Dhuhr", icon: Sun },
  { key: "asr", bn: "আসর", en: "Asr", icon: SunMedium },
  { key: "maghrib", bn: "মাগরিব", en: "Maghrib", icon: Sunset },
  { key: "isha", bn: "এশা", en: "Isha", icon: Moon },
  { key: "jummah", bn: "জুমুআ", en: "Jummah", icon: Users },
];

const DAILY_HADITHS = [
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: পাঁচ ওয়াক্ত সালাত হলো এক সালাত থেকে আরেক সালাতের মধ্যবর্তী গুনাহের কাফফারা, যদি কবিরা গুনাহ থেকে বিরত থাকা হয়।",
    source: "সহীহ মুসলিম: ২৩৩",
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: জামাআতে সালাত আদায় করা একাকী সালাত আদায়ের চেয়ে ২৭ গুণ বেশি মর্যাদাপূর্ণ।",
    source: "সহীহ বুখারী: ৬৪৫",
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: যে ব্যক্তি ভোরে ও সন্ধ্যায় মসজিদে যায়, সে যতবার যায় আল্লাহ জান্নাতে তার মেহমানদারির ব্যবস্থা করেন।",
    source: "সহীহ বুখারী: ৬৬২",
  },
  {
    text: "রাসূলুল্লাহ (সা.) বলেছেন: সালাতের কাতার সোজা করো, নিশ্চয়ই কাতার সোজা করা সালাতের পূর্ণতার অংশ।",
    source: "সহীহ বুখারী: ৭২৩",
  },
];

function getHijriDate(date: Date) {
  try {
    const raw = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    return raw.replace("যুগ", "").trim() + " হিজরি";
  } catch (e) {
    return "২২ রবিউস সানি, ১৪৪৬ হিজরি";
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

  // Rotate Hadith every 20 seconds
  useEffect(() => {
    const hadithTimer = setInterval(() => {
      setHadithIndex((prev) => (prev + 1) % DAILY_HADITHS.length);
    }, 20000);
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
    const fajrMinutes = parseInt(fh, 10) * 60 + parseInt(fm, 10);
    const sahurEndMin = Math.max(0, fajrMinutes - 10);
    const sahurH = Math.floor(sahurEndMin / 60);
    const sahurM = sahurEndMin % 60;
    const sahurStr = `${String(sahurH).padStart(2, "0")}:${String(sahurM).padStart(2, "0")}`;

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
    <div className="dark h-screen max-h-screen w-full bg-[#020d08] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Decorative Islamic Geometric Watermark Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.035] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-emerald-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Header: Mosque Banner & Master Digital Clock */}
      <header className="shrink-0 z-20 border-b border-emerald-900/50 bg-gradient-to-r from-[#03170e]/95 via-[#052618]/95 to-[#03170e]/95 backdrop-blur-xl px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xl">
        {/* Left: Mosque Emblem, Title & Quick Back Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" title="ড্যাশবোর্ডে ফিরে যান" className="group">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-emerald-600/25 via-emerald-800/40 to-emerald-950 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:border-amber-400/60 transition-all shrink-0">
              <MosqueIcon className="w-7 h-7 lg:w-8 lg:h-8 text-emerald-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] lg:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                কেন্দ্রীয় জামে মসজিদ
              </span>
              <span className="text-[11px] font-medium text-slate-400 hidden xl:inline whitespace-nowrap">
                • ইসলামিক রিসার্চ সেন্টার
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mt-0.5 whitespace-nowrap">
              বায়তুল মামুর জামে মসজিদ
            </h1>
          </div>
        </div>

        {/* Center: Dual Hijri & Gregorian Calendar Box */}
        <div className="hidden lg:flex items-center gap-2.5 bg-black/50 border border-emerald-800/50 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-inner shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold text-xs xl:text-sm whitespace-nowrap">
            <Moon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{hijriDate}</span>
          </div>
          <div className="h-4 w-px bg-emerald-800/60" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 font-medium text-xs xl:text-sm whitespace-nowrap">
            <CalendarDays className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bengaliDate}</span>
          </div>
        </div>

        {/* Right: Master Digital Clock & Fullscreen Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Luminous Clock Container */}
          <div className="flex items-center bg-gradient-to-b from-black/80 to-black/95 border border-emerald-500/40 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.7)]">
            <div className="flex items-baseline tabular-nums font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">{bdHours}</span>
              <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-amber-400 mx-1 animate-pulse">
                :
              </span>
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">{bdMinutes}</span>
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-emerald-400 ml-1.5 font-bold">
                :{bdSeconds}
              </span>
            </div>
            <div className="ml-2.5 flex flex-col items-center">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-[11px] lg:text-xs tracking-wider border border-emerald-500/40">
                {bdAmPm}
              </span>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "ফুলস্ক্রিন থেকে বের হন" : "ফুলস্ক্রিন করুন"}
            className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all shadow-md cursor-pointer shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Body Section: Strictly fills viewport without scroll */}
      <main className="flex-1 min-h-0 p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4 relative z-10 w-full overflow-hidden">
        {/* Left Column: Prayer Times Board (58% width) */}
        <div className="flex-1 lg:flex-[58] xl:flex-[60] flex flex-col gap-2 min-h-0">
          {/* Header Bar with Next Prayer Countdown Alert */}
          <div className="shrink-0 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/90 to-[#031c11]/90 border border-emerald-800/50 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">
                  আজকের নামাজের সময়সূচি
                </h2>
              </div>
            </div>

            {countdownText && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 ${
                  isUrgent
                    ? "bg-amber-500/20 border-amber-400/60 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                }`}
              >
                <Hourglass
                  className="w-3.5 h-3.5 text-amber-400 animate-spin"
                  style={{ animationDuration: "6s" }}
                />
                <span>ইকামতের বাকি: {countdownText}</span>
              </div>
            )}
          </div>

          {/* Table Column Headers */}
          <div className="shrink-0 grid grid-cols-12 px-4 py-1.5 text-xs font-bold text-emerald-400/90 tracking-wider uppercase bg-black/40 rounded-lg border border-emerald-950">
            <div className="col-span-4 flex items-center gap-2">ওয়াক্ত</div>
            <div className="col-span-4 text-center">আযান</div>
            <div className="col-span-4 text-right pr-2">জামাআত (ইকামত)</div>
          </div>

          {/* 5-6 Prayer Cards - Distributed evenly with NO clipping */}
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2">
            {activePrayers.map((p) => {
              const isNext = nextPrayerKey === p.key;
              const Icon = p.icon;
              const azanTime = formatTime12hBn((prayerTime as any)?.[p.key]);
              const iqamahTime = formatTime12hBn((prayerTime as any)?.[`${p.key}_iqamah`]);

              return (
                <div
                  key={p.key}
                  className={`flex-1 min-h-[54px] grid grid-cols-12 items-center px-4 py-1.5 sm:py-2 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    isNext
                      ? "bg-gradient-to-r from-emerald-950 via-[#073922] to-emerald-950 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/60"
                      : "bg-[#041a10]/80 hover:bg-[#072618]/90 border-emerald-900/40 backdrop-blur-md"
                  }`}
                >
                  {/* Prayer Name & Icon */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isNext
                          ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg sm:text-2xl lg:text-3xl font-black tracking-tight ${
                          isNext
                            ? "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                            : "text-white"
                        }`}
                      >
                        {p.bn}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400/70 uppercase hidden sm:inline">
                        ({p.en})
                      </span>
                      {isNext && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                          পরবর্তী ওয়াক্ত
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Azan Time (Crisp Cyan-White) */}
                  <div className="col-span-4 text-center">
                    <span className="text-base sm:text-xl lg:text-2xl font-bold text-slate-200 tabular-nums">
                      {azanTime}
                    </span>
                  </div>

                  {/* Iqamah / Jamat Time (Prominent Bold) */}
                  <div className="col-span-4 text-right pr-2">
                    <span
                      className={`text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-black tabular-nums tracking-tight ${
                        isNext
                          ? "text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.6)]"
                          : "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                      }`}
                    >
                      {iqamahTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sunnah Times, Hadith, & Mosque Info (42% width) */}
        <div className="flex-1 lg:flex-[42] xl:flex-[40] flex flex-col gap-2.5 min-h-0">
          {/* Card 1: Important Solar & Sunnah Times */}
          <div className="shrink-0 bg-gradient-to-b from-[#052618]/90 to-[#03170e]/95 border border-emerald-800/40 rounded-xl p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/50 mb-2">
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                অন্যান্য গুরুত্বপূর্ণ ওয়াক্ত
              </span>
              <span className="text-[11px] text-emerald-400/80 font-medium">আজকের সময়</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/35 border border-emerald-900/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mb-0.5">
                  <Moon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">সেহরি ও তাহাজ্জুদ শেষ</span>
                </div>
                <div className="text-sm sm:text-base font-black text-white tabular-nums">
                  {sunnahTimes.sahur}
                </div>
              </div>

              <div className="bg-black/35 border border-emerald-900/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mb-0.5">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">সূর্যোদয় (ইশরাক শুরু)</span>
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
                  {sunnahTimes.sunrise}
                </div>
              </div>

              <div className="bg-black/35 border border-emerald-900/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mb-0.5">
                  <SunMedium className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span className="truncate">চাশত ও জাওয়াল</span>
                </div>
                <div className="text-sm sm:text-base font-black text-white tabular-nums">
                  {sunnahTimes.zawal}
                </div>
              </div>

              <div className="bg-black/35 border border-emerald-900/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mb-0.5">
                  <Sunset className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">সূর্যাস্ত ও ইফতার</span>
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
                  {sunnahTimes.iftar}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Hadith of the Day & Mosque Etiquette */}
          <div className="flex-1 min-h-0 bg-gradient-to-b from-[#052618]/90 to-[#03170e]/95 border border-emerald-800/40 rounded-xl p-3 sm:p-3.5 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-hidden">
            <div className="shrink-0 flex items-center justify-between pb-2 border-b border-emerald-900/50 mb-2">
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                দৈনিক হাদিস ও নসীহত
              </span>
              <span className="text-[10px] text-emerald-400/80 font-medium">প্রতিদিনের আমল</span>
            </div>

            <div className="flex-1 min-h-0 bg-black/40 border border-emerald-800/40 rounded-xl p-3 sm:p-3.5 relative overflow-hidden flex flex-col justify-center">
              <div className="text-2xl text-amber-400/20 font-serif select-none mb-1">“</div>
              <p className="text-xs sm:text-sm lg:text-base font-medium text-slate-100 leading-relaxed relative z-10">
                {DAILY_HADITHS[hadithIndex].text}
              </p>
              <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-emerald-900/40 shrink-0">
                <span className="text-[11px] sm:text-xs text-amber-400 font-semibold">
                  — {DAILY_HADITHS[hadithIndex].source}
                </span>
                <span className="text-[10px] text-slate-400">নিয়মিত পাঠ করুন</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] sm:text-xs text-emerald-300/90 font-medium shrink-0">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                <span>মসজিদে প্রবেশের পর মোবাইল সাইলেন্ট রাখুন</span>
              </span>
              <span className="text-amber-400 font-bold hidden xl:inline">জাযাকাল্লাহু খাইরান</span>
            </div>
          </div>

          {/* Card 3: Mosque Fund & Donation Banner */}
          <div className="shrink-0 bg-gradient-to-r from-emerald-950/90 via-[#07321e]/90 to-emerald-950/90 border border-emerald-500/30 rounded-xl p-2.5 lg:p-3 shadow-lg flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">মসজিদের উন্নয়ন ফান্ড ও দান</h4>
                <p className="text-[10px] sm:text-[11px] text-emerald-300/80">
                  বিকাশ / নগদ (মার্চেন্ট): ০১৭১২-৩৪৫৬৭৮
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold">
                সাদাকাহ জারিয়া
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Marquee for Announcements & Hadith Ticker */}
      <footer className="h-10 shrink-0 bg-gradient-to-r from-emerald-950 via-[#052b1b] to-emerald-950 border-t border-emerald-700/40 flex items-center overflow-hidden relative z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {/* Fixed Title Label on Left */}
        <div className="absolute left-0 top-0 bottom-0 z-30 bg-gradient-to-r from-emerald-600 to-emerald-700 px-3.5 lg:px-4 flex items-center justify-center gap-1.5 font-black text-xs text-white shadow-[10px_0_20px_rgba(0,0,0,0.6)] border-r border-emerald-400/40 shrink-0">
          <BellRing className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span className="whitespace-nowrap">জরুরি ঘোষণা</span>
        </div>

        {/* Smooth Scrolling Text Ticker */}
        <div className="whitespace-nowrap animate-[marquee_45s_linear_infinite] ml-[110px] lg:ml-[130px] text-xs font-medium text-slate-100 flex items-center">
          {notices && notices.length > 0 ? (
            notices.map((n) => (
              <span key={n.id} className="mx-8 flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span className="text-amber-200 font-bold">{n.title}:</span>
                <span className="text-slate-200">{n.content || ""}</span>
              </span>
            ))
          ) : (
            <>
              <span className="mx-8 flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span>
                  সালাতের কাতার সোজা ও সুন্দরভাবে দাঁড়ান, নিশ্চয় কাতার সোজা করা সালাতের সৌন্দর্যের
                  অংশ।
                </span>
              </span>
              <span className="mx-8 flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span>মসজিদে প্রবেশের সময় মোবাইল ফোন বন্ধ অথবা সাইলেন্ট রাখুন।</span>
              </span>
              <span className="mx-8 flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span>
                  জামাআতে সালাত আদায় একা পড়ার চেয়ে ২৭ গুণ বেশি সওয়াব (সহীহ বুখারী ও মুসলিম)।
                </span>
              </span>
              <span className="mx-8 flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span>মসজিদ আল্লাহর ঘর, এর পবিত্রতা ও পরিষ্কার-পরিচ্ছন্নতা রক্ষা করুন।</span>
              </span>
            </>
          )}
        </div>
      </footer>

      {/* Marquee CSS Keyframe */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `,
        }}
      />
    </div>
  );
}
