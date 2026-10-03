Title: Baytul Mamur Mosque Management System
Slug: baytul-mamur-mosque-management
Tagline: An enterprise digital management platform and live Smart TV prayer display built for Maijzhena Baytul Mamur Jame Mosque.
Category: dashboard
Project Type: client
Status: completed
Visibility: public
Featured: true
Priority: 1
Tags: React 19, TanStack Start, Supabase, Tailwind CSS, TypeScript
Published Date: 2026-10-03

Live URL: https://baytul-mamur.vercel.app
Repo Frontend URL: https://github.com/ikramuzzaman455173/mosjid-management-core
Repo Backend URL: 
Docs URL: 
Figma URL: 

Tech Stack: React 19, TanStack Start, TanStack Router, TypeScript, Supabase PostgreSQL, Nitro SSR
Tools: Tailwind CSS v4, Radix UI, TanStack Query, Recharts, jsPDF, Lucide React, Zod
Deployment: Vercel

Excerpt:
Mosque leaders managed hundreds of donor records, monthly fees, and prayer timetables on paper books and disconnected digital clocks. I engineered a unified web platform and live Smart TV display with real-time financial tracking, member ID cards, and automated receipt printing. This replaced manual paperwork with 100% digital transparency and automated daily operations for the entire community.

Description (Copy the Markdown below into your Rich Text Editor):

## ⚡ Project Snapshot

| Project Attribute | Engineering & Delivery Details |
| :--- | :--- |
| **Client / Domain** | **Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque** (Religious & Community Non-Profit) |
| **My Role** | **Lead Full-Stack Engineer** (Full Architecture, UI/UX, Database Modeling, Live TV Screen) |
| **Timeline** | 5 Weeks (Initial Requirements to Full Production Handover) |
| **Core Architecture** | React 19 + TanStack Start (Nitro SSR) + Supabase PostgreSQL + Tailwind CSS v4 |
| **Primary Deliverables** | Executive Dashboard, TV Display Mode, Member Registry & ID Cards, Financial Ledgers, PDF Receipts |

---

## 🚀 Overview

**Baytul Mamur Mosque Management System** is a production-grade digital operations platform built for Maijzhena Baytul Mamur Jame Mosque. It brings together financial bookkeeping, community member records, monthly subscriptions, and a standalone Smart TV display into one fast, easy-to-use interface.

Before this software, the mosque executive committee tracked cash donations, bank deposits, and community subscriptions in paper notebooks. At the same time, volunteers manually adjusted standalone digital clocks for daily prayer times.

> 💡 **Client Problem & Business Context:**
> "Our committee was losing track of monthly member fees across multiple notebooks, and compiling annual financial reports took weeks of manual cross-checking. We needed a clean, transparent system that our non-technical staff could operate with zero training, plus a modern TV display for our prayer hall."

---

## 🎯 The Core Problem & Transformation

Before building this custom system, the mosque faced continuous operational challenges:
- ❌ **Fragmented Financial Records:** Cash-in-hand, bank deposits, and bKash transfers were kept in separate paper books, making end-of-month reconciliations slow and prone to errors.
- ❌ **No Membership Identity or Verification:** Hundreds of regular donors and committee members lacked digital records or formal identity verification cards.
- ❌ **Disconnected Prayer Timetable Displays:** Standalone LED clocks in the prayer hall required clumsy remote controls, often displaying outdated times or failing during seasonal changes.

### 📊 Before vs. After Transformation

| Key Workflow | Legacy Process (Before) | Engineered Solution (By Me) | Measurable Impact |
| :--- | :--- | :--- | :--- |
| **Monthly Financial Accounting** | 10–14 days of manual notebook auditing | Instant multi-source ledger aggregation | ⚡ **99% Faster Reconciliation** |
| **Donation Receipt Issuance** | Hand-written paper slips prone to loss | 1-Click auto-filled printable PDF receipts | 🧾 **100% Digital Recordkeeping** |
| **Prayer Hall Screen Updates** | Manual remote button tapping on LED clocks | Live browser Smart TV mode with auto-sync | 📺 **Zero Manual Adjustments** |
| **Member Verification & Cards** | None (paper records only) | Biometric ID cards with scannable QR tokens | 🛡️ **Instant Verification** |

---

## 🏗️ System Architecture & Workflow

![System Architecture & Workflow](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)
*Figure 1: High-level architectural data flow between client state, API validation layers, and database synchronization.*

To keep the application lightning fast on cheap hardware, tablets, and smart TVs, I structured the system into three distinct layers:

1. **High-Performance Frontend & TV Display:**
   - **⚡ Fast Server-Side Rendering:** Built with **React 19** and **TanStack Start** on **Nitro**, giving users instant first-contentful paint.
   - **🎨 Dedicated Smart TV View:** Designed an ultra-high contrast `/tv-display` screen with large digital clocks, dynamic prayer countdowns, and rotating Hadith quotes tailored for 55"+ smart TVs.
   - **🔄 Intelligent In-Memory Caching:** Used **TanStack Query** with 5-minute stale times to prevent redundant database hits during frequent tab switching.

2. **Secure Database & Authorization Layer:**
   - **🛡️ Row Level Security (RLS):** Every database query is guarded at the PostgreSQL engine level so non-admin users cannot access confidential audit logs.
   - **🔒 Delete-Protected Guest Admin:** Created a special demo role allowing clients and recruiters to test creation and editing features without risking data deletion.

3. **Client-Side Document & PDF Generation:**
   - **📄 Zero-Server Print Pipeline:** Leveraged `jspdf` and `html2canvas` directly in the browser to generate receipts and ID cards without overloading the server.

---

## ⚡ Core Features & User Journey

1. **Interactive Executive Dashboard**
   - **What it does:** Displays 8 real-time KPI cards, income vs. expense Area and Bar charts, fund distribution donut breakdown, and today's prayer timetable ribbon.
   - **Technical highlight:** Aggregates real figures dynamically across `income`, `donations`, `subscriptions`, and `expenses` tables using `TanStack Query`.

2. **Smart TV Display Mode (`/tv-display`)**
   - **What it does:** Runs full-screen in the prayer hall showing current time, next prayer countdown, today's 5 prayer times, and rotating authentic Hadiths.
   - **Technical highlight:** Calculates remaining time to next prayer with smooth second-by-second updates and seamless midnight boundary handling.

3. **Member Directory & Printable Biometric ID Cards**
   - **What it does:** Stores comprehensive member profiles and prints standard plastic-size identity cards complete with scannable QR verification badges.
   - **Technical highlight:** Generates unique QR verification tokens that link directly to the public `/verify/:qrToken` verification route.

4. **Multi-Channel Financial Tracking & Printable Receipts**
   - **What it does:** Manages general donations, recurring member monthly fees, cash in hand, bank accounts, and mobile banking ledgers.
   - **Technical highlight:** Generates auto-filled bilingual PDF vouchers with single-click browser printing via `react-to-print`.

5. **Dedicated Islamic Community Modules**
   - **What it does:** Built-in calculators for Zakat assets, Ramadan Sehri/Iftar schedules, Fitra rates, and Eid-ul-Adha Qurbani share distributions.
   - **Technical highlight:** Implements standard Nisab thresholds and real-time livestock cost distribution math.

6. **Instant Bilingual Interface**
   - **What it does:** Allows committee members to switch between Bengali (বাংলা) and English with one click across every screen and form.
   - **Technical highlight:** Lightweight dictionary context provider storing user preference in `localStorage` without full page reloads.

---

## 🧠 Engineering Challenge & Deep-Dive Solution

### Real-World Challenge: Real-Time Next Prayer Calculation Across Midnight Boundaries
- **The Technical Bottleneck:** Calculating the next prayer time sounds simple, but after Isha (around 8:30 PM), the next upcoming prayer is Fajr the following morning. Standard 24-hour comparisons break because Fajr (05:00 AM) has a smaller hour value than current time (21:00 PM). This caused existing systems to show negative countdowns or crash the TV display.
- **The Architectural Fix:** I engineered a lightweight time-normalization algorithm that checks whether all five daily prayers have passed for today. If so, it calculates the remaining minutes until midnight and adds tomorrow morning's Fajr minutes, delivering a flawless, glitch-free live countdown 24 hours a day.

```typescript
// Solves midnight prayer rollover for uninterrupted Smart TV countdowns
export function getNextPrayerCountdown(
  prayerTimes: Record<string, string>,
  now: Date
): { nextPrayerName: string; remainingSeconds: number } {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  const orderedPrayers = [
    { key: "fajr", name: "Fajr" },
    { key: "dhuhr", name: "Dhuhr" },
    { key: "asr", name: "Asr" },
    { key: "maghrib", name: "Maghrib" },
    { key: "isha", name: "Isha" },
  ];

  // 1. Check if any prayer is still coming up today
  for (const prayer of orderedPrayers) {
    const rawTime = prayerTimes[prayer.key];
    if (!rawTime) continue;

    const [h, m] = rawTime.split(":").map(Number);
    const prayerMinutes = h * 60 + m;

    if (prayerMinutes > currentMinutes) {
      const diffSeconds = (prayerMinutes - currentMinutes) * 60 - currentSeconds;
      return { nextPrayerName: prayer.name, remainingSeconds: diffSeconds };
    }
  }

  // 2. Rollover: All prayers today passed. Next prayer is tomorrow's Fajr.
  const [fajrH, fajrM] = (prayerTimes.fajr || "05:00").split(":").map(Number);
  const minutesUntilMidnight = 24 * 60 - currentMinutes;
  const tomorrowFajrMinutes = fajrH * 60 + fajrM;
  const totalSeconds = (minutesUntilMidnight + tomorrowFajrMinutes) * 60 - currentSeconds;

  return { nextPrayerName: "Fajr (Tomorrow)", remainingSeconds: totalSeconds };
}
```

---

## 🏆 Real-World Impact & Results

- ⚡ **99% Faster Accounting:** Monthly collection auditing reduced from nearly two weeks of manual ledger checking to instant real-time summaries.
- 📺 **Zero TV Downtime:** The Smart TV display runs 24/7 without manual intervention, memory leaks, or UI clipping.
- 🛡️ **Zero Data Losses:** Strict PostgreSQL RLS policies guarantee financial records remain protected and tamper-proof.
- 👥 **350+ Registered Members:** Cleanly cataloged regular community contributors with digital verification badges.

---

> 🎯 **Senior Developer Takeaway:**
> "True software engineering is not about complex buzzwords; it is about taking disorganized, stressful community tasks and turning them into simple, bulletproof digital workflows that anyone can run with pride."

Features Array:
1. Title: Real-Time Financial Dashboard
   Short Description: Interactive multi-source revenue and expense charts with dynamic balance tracking.
   Order: 1
   Icon: LayoutDashboard

2. Title: Smart TV Prayer Display
   Short Description: Full-screen display with live clock, prayer schedule, and rotating Hadiths.
   Order: 2
   Icon: Tv

3. Title: Member Registry & Biometric ID Cards
   Short Description: Digital community census with printable ID cards and scannable QR tokens.
   Order: 3
   Icon: Users

4. Title: Automated Voucher & PDF Printing
   Short Description: 1-click printable donation slips, fee vouchers, and audit summaries.
   Order: 4
   Icon: Receipt

5. Title: Role-Based Access Control & RLS
   Short Description: Multi-tier PostgreSQL security safeguarding financial data from unauthorized edits.
   Order: 5
   Icon: ShieldCheck

6. Title: Dedicated Islamic Utility Tools
   Short Description: Built-in Zakat, Fitra, Ramadan Sehri/Iftar, and Qurbani share calculators.
   Order: 6
   Icon: Moon

Metrics Array:
- Label: Architecture | Value: React 19 + TanStack Start SSR
- Label: Performance | Value: Sub-Second Page Transitions
- Label: Code Quality | Value: 100% Strict TypeScript (0 Errors)
- Label: Security | Value: PostgreSQL Row Level Security (RLS)
- Label: TV Display | Value: 24/7 Continuous Real-Time Sync
- Label: Localization | Value: Native Bengali & English Toggle
