import { supabase } from "@/integrations/supabase/client";

/**
 * Sends an SMS using the configured API in App Settings.
 * Defaults to Greenweb SMS format which is standard in BD.
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    // 1. Fetch SMS API config from database
    const { data, error } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
    const settings = data as any;

    if (error || !settings || !settings.sms_api_url || !settings.sms_api_key) {
      console.error("SMS Configuration missing");
      return false;
    }

    const apiUrl = settings.sms_api_url;
    const apiKey = settings.sms_api_key;

    // Format the phone number (ensure starting with 880 for BD if it's 11 digits)
    let formattedTo = to.replace(/[^0-9+]/g, "");
    if (formattedTo.length === 11 && formattedTo.startsWith("01")) {
      formattedTo = "88" + formattedTo;
    }

    // Prepare payload (Optimized for Greenweb SMS and similar generic gateways)
    const payload = new URLSearchParams();
    payload.append("token", apiKey);
    payload.append("to", formattedTo);
    payload.append("message", message);

    // Some providers use 'api_key' instead of 'token', or 'number' instead of 'to'
    // To make it slightly more generic we can duplicate common keys:
    payload.append("api_key", apiKey);
    payload.append("number", formattedTo);
    payload.append("text", message);

    // If sender ID is provided, append it. (Some providers use 'sender', some 'sender_id')
    if (settings.sms_sender_id) {
      payload.append("sender", settings.sms_sender_id);
      payload.append("sender_id", settings.sms_sender_id);
    }

    // Make the request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.text();
    // Most APIs return JSON or a success string. We'll just assume success if HTTP 200
    return true;
  } catch (err) {
    console.error("Failed to send SMS:", err);
    return false;
  }
}
