import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FitraPrices = {
  wheat: number;
  barley: number;
  raisins: number;
  dates: number;
  cheese: number;
};

export type AppSettings = {
  defaultNisab: number;
  fitraPrices: FitraPrices;
  prayerCity: string;
  prayerCountry: string;
  smsApiUrl: string;
  smsApiKey: string;
  smsSenderId: string;
};

const defaultSettings: AppSettings = {
  defaultNisab: 80000,
  fitraPrices: {
    wheat: 70,
    barley: 120,
    raisins: 500,
    dates: 400,
    cheese: 800,
  },
  prayerCity: "Dhaka",
  prayerCountry: "Bangladesh",
  smsApiUrl: "http://api.greenweb.com.bd/api.php",
  smsApiKey: "",
  smsSenderId: "",
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbId, setDbId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (data) {
          const dbData = data as any;
          setDbId(dbData.id);
          setSettings({
            defaultNisab: Number(dbData.default_nisab) || defaultSettings.defaultNisab,
            fitraPrices:
              (dbData.fitra_prices as unknown as FitraPrices) || defaultSettings.fitraPrices,
            prayerCity: dbData.prayer_city || defaultSettings.prayerCity,
            prayerCountry: dbData.prayer_country || defaultSettings.prayerCountry,
            smsApiUrl: dbData.sms_api_url || defaultSettings.smsApiUrl,
            smsApiKey: dbData.sms_api_key || defaultSettings.smsApiKey,
            smsSenderId: dbData.sms_sender_id || defaultSettings.smsSenderId,
          });
        }
      } catch (e) {
        console.error("Failed to fetch app settings from database", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    // Optimistic update
    setSettings(updated);

    // Convert to DB format
    const dbUpdate = {
      default_nisab: updated.defaultNisab,
      fitra_prices: updated.fitraPrices as any,
      prayer_city: updated.prayerCity,
      prayer_country: updated.prayerCountry,
      sms_api_url: updated.smsApiUrl,
      sms_api_key: updated.smsApiKey,
      sms_sender_id: updated.smsSenderId,
      updated_at: new Date().toISOString(),
    } as any;

    if (dbId) {
      await supabase.from("app_settings").update(dbUpdate).eq("id", dbId);
    } else {
      const { data } = await supabase.from("app_settings").insert([dbUpdate]).select("id").single();
      if (data) setDbId(data.id);
    }

    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent("app-settings-updated", { detail: updated }));
  };

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AppSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener("app-settings-updated", handleUpdate);
    return () => window.removeEventListener("app-settings-updated", handleUpdate);
  }, []);

  return { settings, updateSettings, isLoaded };
}
