import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useAppSettings } from "@/lib/use-app-settings";
import { Clock, Sunrise, Sunset, Loader2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Timings = {
  Fajr: string; // Sehri ends
  Maghrib: string; // Iftar
  Date: string;
};

export function IftarSehriSchedule({ open, onOpenChange }: Props) {
  const { lang } = useI18n();
  const { settings } = useAppSettings();
  const tbn = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const [timings, setTimings] = useState<Timings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ type: "Iftar" | "Sehri"; hours: number; minutes: number; seconds: number } | null>(null);
  
  const city = settings.prayerCity || "Dhaka";
  const country = settings.prayerCountry || "Bangladesh";

  useEffect(() => {
    if (open && !timings) {
      fetchTimings();
    }
  }, [open]);

  useEffect(() => {
    if (!timings || !open) return;

    const interval = setInterval(() => {
      calculateTimeLeft(timings);
    }, 1000);

    calculateTimeLeft(timings); // Initial call

    return () => clearInterval(interval);
  }, [timings, open]);

  const fetchTimings = async () => {
    setLoading(true);
    setError(false);
    try {
      // Using Aladhan API (Free, no key required)
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`);
      const data = await res.json();
      if (data.code === 200) {
        setTimings({
          Fajr: data.data.timings.Fajr,
          Maghrib: data.data.timings.Maghrib,
          Date: data.data.date.readable,
        });
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (t: Timings) => {
    const now = new Date();
    
    // Parse Fajr (Sehri) and Maghrib (Iftar) times for today
    const [fajrHour, fajrMin] = t.Fajr.split(":").map(Number);
    const [maghribHour, maghribMin] = t.Maghrib.split(":").map(Number);

    const fajrTime = new Date();
    fajrTime.setHours(fajrHour, fajrMin, 0, 0);

    const maghribTime = new Date();
    maghribTime.setHours(maghribHour, maghribMin, 0, 0);

    let targetTime: Date;
    let type: "Iftar" | "Sehri";

    if (now < fajrTime) {
      // Before Sehri ends
      targetTime = fajrTime;
      type = "Sehri";
    } else if (now < maghribTime) {
      // After Sehri, before Iftar
      targetTime = maghribTime;
      type = "Iftar";
    } else {
      // After Iftar, next is tomorrow's Sehri (approx 24h cycle for simplicity)
      targetTime = new Date(fajrTime);
      targetTime.setDate(targetTime.getDate() + 1);
      type = "Sehri";
    }

    const diff = targetTime.getTime() - now.getTime();
    
    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ type, hours, minutes, seconds });
    }
  };

  // Convert 24h to 12h format
  const formatTime12h = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gold">
            <Clock className="w-5 h-5" />
            {tbn("Iftar & Sehri Schedule", "ইফতার ও সেহরি সময়সূচি")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <MapPin className="w-3 h-3" />
              {city}, {country}
            </Badge>
            <div className="text-sm font-medium text-muted-foreground">
              {timings?.Date || "..."}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>{tbn("Loading today's schedule...", "আজকের সময়সূচি লোড হচ্ছে...")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <p>{tbn("Failed to load schedule. Please check your internet connection.", "সময়সূচি লোড করতে ব্যর্থ। ইন্টারনেট সংযোগ চেক করুন।")}</p>
            </div>
          ) : timings ? (
            <>
              {/* Countdown Timer */}
              {timeLeft && (
                <Card className="p-6 bg-gradient-to-br from-gold/20 to-primary/10 border-0 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    {timeLeft.type === "Iftar" ? <Sunset className="w-24 h-24" /> : <Sunrise className="w-24 h-24" />}
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {tbn(`Time remaining for ${timeLeft.type}`, `পরবর্তী ${timeLeft.type === "Iftar" ? "ইফতারের" : "সেহরির"} বাকি`)}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-3xl sm:text-4xl font-bold font-mono text-primary">
                    <div className="flex flex-col items-center">
                      <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-xs text-muted-foreground font-sans mt-1">{tbn("hrs", "ঘণ্টা")}</span>
                    </div>
                    <span className="pb-5 animate-pulse">:</span>
                    <div className="flex flex-col items-center">
                      <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-xs text-muted-foreground font-sans mt-1">{tbn("min", "মিনিট")}</span>
                    </div>
                    <span className="pb-5 animate-pulse">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-gold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-xs text-muted-foreground font-sans mt-1">{tbn("sec", "সেকেন্ড")}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Schedule Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 flex flex-col items-center text-center space-y-2 border-primary/20 bg-primary/5">
                  <Sunrise className="w-6 h-6 text-primary" />
                  <div className="font-semibold">{tbn("Sehri Ends", "সেহরি শেষ")}</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatTime12h(timings.Fajr)}
                  </div>
                  <div className="text-xs text-muted-foreground">{tbn("Fajr Time", "ফজর ওয়াক্ত শুরু")}</div>
                </Card>

                <Card className="p-4 flex flex-col items-center text-center space-y-2 border-gold/20 bg-gold/5">
                  <Sunset className="w-6 h-6 text-gold" />
                  <div className="font-semibold">{tbn("Iftar Time", "ইফতার শুরু")}</div>
                  <div className="text-2xl font-bold text-gold">
                    {formatTime12h(timings.Maghrib)}
                  </div>
                  <div className="text-xs text-muted-foreground">{tbn("Maghrib Time", "মাগরিব ওয়াক্ত শুরু")}</div>
                </Card>
              </div>
            </>
          ) : null}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
