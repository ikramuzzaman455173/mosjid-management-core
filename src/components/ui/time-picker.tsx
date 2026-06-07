import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

export interface TimePickerProps {
  value?: string; // HH:mm format (24-hour)
  onChange?: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({ value, onChange, className, placeholder }: TimePickerProps) {
  const { lang, t } = useI18n();

  const [hour24Str, minuteStr] = (value || "").split(":");
  const h24Num = parseInt(hour24Str, 10);

  let displayHour = "";
  let ampm = "";

  if (!isNaN(h24Num)) {
    ampm = h24Num >= 12 ? "PM" : "AM";
    const h12Num = h24Num % 12 || 12;
    displayHour = String(h12Num).padStart(2, "0");
  }

  const handleHourChange = (newDisplayHour: string) => {
    if (onChange) {
      const currentAmPm = ampm || "AM";
      const h12Num = parseInt(newDisplayHour, 10);
      let newH24 = h12Num;
      if (currentAmPm === "PM" && h12Num < 12) newH24 += 12;
      if (currentAmPm === "AM" && h12Num === 12) newH24 = 0;
      onChange(`${String(newH24).padStart(2, "0")}:${minuteStr || "00"}`);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    if (onChange) {
      onChange(`${hour24Str || "00"}:${newMinute}`);
    }
  };

  const handleAmPmChange = (newAmPm: string) => {
    if (onChange) {
      const currentH12Num = parseInt(displayHour || "12", 10);
      let newH24 = currentH12Num;
      if (newAmPm === "PM" && currentH12Num < 12) newH24 += 12;
      if (newAmPm === "AM" && currentH12Num === 12) newH24 = 0;
      onChange(`${String(newH24).padStart(2, "0")}:${minuteStr || "00"}`);
    }
  };

  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="relative flex items-center">
        <Clock className="absolute left-2.5 h-4 w-4 text-muted-foreground z-10" />
        <Select value={displayHour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[75px] pl-8 border-r-0 rounded-r-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hours12.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Select value={minuteStr} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[60px] border-l-0 rounded-l-none rounded-r-none px-2 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={ampm} onValueChange={handleAmPmChange}>
        <SelectTrigger className="w-[65px] rounded-l-none px-2">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
