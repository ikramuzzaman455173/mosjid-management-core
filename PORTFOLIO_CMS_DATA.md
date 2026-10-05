Title: Baytul Mamur Mosque Management System
Slug: baytul-mamur-mosque-management
Tagline: An all-in-one mosque management system and live Smart TV prayer display built with Shopnojal IT.
Category: dashboard
Project Type: product
Status: completed
Visibility: public
Featured: true
Priority: 1
Tags: React 19, TanStack Start, Supabase, Tailwind CSS, TypeScript
Published Date: 2026-10-03

Live URL: https://smart-mosjid-core.vercel.app
Admin URL: https://smart-mosjid-core.vercel.app/dashboard
Repo Frontend URL: https://github.com/ikramuzzaman455173/mosjid-management-core
Repo Backend URL: 
Docs URL: 
Figma URL: 

Tech Stack: React 19, TanStack Start, TanStack Router, TypeScript, Supabase PostgreSQL, Nitro SSR
Tools: Tailwind CSS v4, Radix UI, TanStack Query, Recharts, jsPDF, Lucide React, Zod
Deployment: Vercel

Excerpt:
A complete mosque management web application and live Smart TV prayer display built with software agency Shopnojal IT. Modeled after the real-world operational needs of Maijzhena Baytul Mamur Jame Mosque and delivered in a 5-week part-time sprint alongside full-time work. It replaces manual paper khata with automated income/expense tracking, 1-click printable PDF receipts, member QR ID cards, and an automatic 24/7 prayer time screen.

Description (Copy the Markdown below into your Rich Text Editor):

## ⚡ Project Snapshot

| Project Attribute | Details |
| :--- | :--- |
| **Product / Domain** | **Mosque Operations & Accounts ERP** (Modeled for Maijzhena Baytul Mamur Jame Mosque) |
| **Agency Partner** | **[Shopnojal IT](https://shopnojalit.com/)** (Software & ERP Solutions) |
| **Role & Execution** | **Lead Full-Stack Developer** (Built in 5 weeks, working part-time alongside a full-time job) |
| **Core Architecture** | React 19 + TanStack Start (SSR) + Supabase PostgreSQL + Tailwind CSS v4 |
| **Key Integrations** | Supabase Auth, Recharts, Browser PDF Printing, QR Code Generator |
| **Live Interactive Test** | **[smart-mosjid-core.vercel.app](https://smart-mosjid-core.vercel.app)** (Guest Login: `mosqueadmin@info.com` / `MosqueAdmin@123`) |

> 💡 **Product Showcase Note:**
> Developed under **Shopnojal IT** as a specialized Mosque ERP product. This public repository and live staging website serve as a fully functional showcase with demo data, allowing recruiters and engineering teams to inspect the full architecture, code quality, and live features.

---

## 🎯 The 30-Second Executive Summary

**Baytul Mamur Mosque Management System** is a production-grade web application and live Smart TV prayer display developed under **Shopnojal IT**. Built around the real-world operational needs of community mosques, it replaces manual paper khata and manual wall clocks with a centralized, automated digital system for accounting, members, and prayer schedules.

### 📊 3 Core Problems We Solved

1. ⚡ **Manual Notebook Accounts ➔ Automated Income & Expense Tracking:**
   - **Old Problem:** Donations, monthly member fees, and mosque expenses were written by hand in paper notebooks, causing calculation errors and slow monthly audits.
   - **Our Solution:** A central ledger tracking cash, bank deposits, and mobile banking (bKash/Nagad), with 1-click printable PDF money receipts directly from the browser.
   - **Real Result:** 🚀 **Instant balance reports anytime without manual arithmetic errors, missing paper slips, or cloud server PDF costs.**

2. 📺 **Manual Clock Adjustments ➔ 24/7 Smart TV Prayer Display:**
   - **Old Problem:** Volunteers had to use remote controls to manually adjust prayer time clocks on the wall every few weeks when prayer times changed.
   - **Our Solution:** A dedicated full-screen TV view (`/tv-display`) that runs on any smart TV, showing live time, today's prayer timetable, next prayer countdown, and daily Hadiths.
   - **Real Result:** 📈 **The TV screen runs continuously with zero manual adjustments and automatically updates prayer times for the congregation.**

3. 🛡️ **Lost Paper Member Records ➔ Member Directory with QR ID Cards:**
   - **Old Problem:** Mosque member records were kept in paper books, making it hard to verify member identity or track monthly fee payments.
   - **Our Solution:** A digital member list with 1-click printable ID cards. Each card has a unique QR code that anyone can scan with a phone to verify member details online.
   - **Real Result:** ⚡ **Instant member verification on `/verify/:qrToken` and protected data access using secure user roles.**

---

## 🖼️ Key Interfaces & Live Interactive Testing

### 1. 📊 Accounts & Analytics Dashboard
<!-- [IMAGE_PLACEHOLDER: Accounts & Analytics Dashboard] -->
- **What it does:** Displays total cash in hand, bank balance, monthly collection charts, and today's prayer schedule.
- **Who can access:** Mosque Committee & Admin.
- **Live Test Link:** *⚡ [Open Live Dashboard](https://smart-mosjid-core.vercel.app/dashboard) — 1-Click Guest Admin login available.*

### 2. 📺 Smart TV Prayer Screen (For Mosque Prayer Hall)
<!-- [IMAGE_PLACEHOLDER: Smart TV Prayer Hall Screen] -->
- **What it does:** Full-screen layout made for 55"+ TVs showing large clock, next prayer countdown, and authentic Hadiths.
- **Who can access:** Public screen for the mosque prayer hall (no login needed).
- **Live Test Link:** *⚡ [Open Smart TV Display](https://smart-mosjid-core.vercel.app/tv-display) — Real-time live countdown.*

### 3. 👥 Member List & Printable QR ID Cards
<!-- [IMAGE_PLACEHOLDER: Member List & Printable QR ID Cards] -->
- **What it does:** Add and edit mosque members, track monthly subscriptions, and print plastic ID cards with QR codes.
- **Who can access:** Committee Secretary & Admin.
- **Live Test Link:** *⚡ [Open Member Directory](https://smart-mosjid-core.vercel.app/members) — View members and print cards.*

### 4. 🧾 Money Receipts & Financial Records
<!-- [IMAGE_PLACEHOLDER: Money Receipts & Financial Records] -->
- **What it does:** Record donations and monthly fees by cash, bank, or bKash/Nagad, and print instant PDF money receipts.
- **Who can access:** Cashier, Accountant, and Admin.
- **Live Test Link:** *⚡ [Open Income & Receipts](https://smart-mosjid-core.vercel.app/income) — Test 1-click receipt printing.*

### 5. 🌙 Islamic Tools (Ramadan, Zakat & Qurbani)
<!-- [IMAGE_PLACEHOLDER: Islamic Tools (Ramadan, Zakat & Qurbani)] -->
- **What it does:** 30-day Sehri and Iftar schedule, simple Zakat/Fitra calculator, and Eid Qurbani meat share management.
- **Who can access:** Mosque Imam & Committee.
- **Live Test Link:** *⚡ [Open Islamic Tools](https://smart-mosjid-core.vercel.app/ramadan) — Explore Ramadan and calculators.*

---

## 🧠 Real Engineering Challenges & Smart Solutions

- **Free & Instant PDF Receipts:** The system needed to print receipts and member ID cards immediately on ordinary desktop computers without paying monthly fees for cloud PDF services. We built the receipt and card printing directly inside the browser using `react-to-print` and `jspdf`, making printing 100% free and instant.
- **Memory-Safe 24/7 TV Display:** A TV screen running all day and night in a prayer hall can slow down or crash if code has memory leaks. We built lightweight timer hooks that keep the countdown perfectly accurate without overloading the browser.
- **Safe Financial Access:** By using Supabase database security rules, regular viewers cannot change financial records, keeping mosque money records safe from accidental edits.
- **Reliable Agency Delivery:** Working as a part-time engineer alongside a full-time job, I maintained clear communication with Shopnojal IT and delivered all required features on schedule in 5 weeks.

> 🎯 **Key Takeaway:**
> "By keeping the code simple, focusing on what the mosque users actually need, and avoiding unnecessary complexity, we built a reliable system that replaced months of paper hassle in just 5 weeks."

Features Array:
1. Title: Accounts & Financial Dashboard
   Short Description: Shows total income, expenses, cash in hand, bank balance, and monthly collection charts in one place.
   Order: 1
   Icon: LayoutDashboard

2. Title: Smart TV Prayer Display
   Short Description: A full-screen display for mosque TVs showing large digital clocks, next prayer countdowns, and daily Hadiths.
   Order: 2
   Icon: Tv

3. Title: Member Directory & QR ID Cards
   Short Description: Manage mosque members and print official ID cards with unique QR codes for instant smartphone verification.
   Order: 3
   Icon: Users

4. Title: 1-Click Printable PDF Receipts
   Short Description: Print clean money receipts for donations and monthly member fees straight from the web browser.
   Order: 4
   Icon: Receipt

5. Title: Secure User Roles & Permissions
   Short Description: Separate access for Admin, Accountant, and Viewer so only authorized people can edit financial entries.
   Order: 5
   Icon: ShieldCheck

6. Title: Islamic Tools (Ramadan, Zakat & Qurbani)
   Short Description: Built-in 30-day Ramadan Sehri/Iftar calendar, Zakat calculator, and Eid Qurbani share distributor.
   Order: 6
   Icon: Moon

Metrics Array:
- Label: Architecture | Value: React 19 + TanStack Start SSR
- Label: Agency & Delivery | Value: Shopnojal IT (100% On-Time 5-Week Sprint)
- Label: Work Model | Value: Part-Time Contract alongside Full-Time Job
- Label: Receipt Printing | Value: 100% Free In-Browser Vector PDF (No Cloud API Fee)
- Label: TV Prayer Screen | Value: 24/7 Automatic Prayer Countdown Sync
- Label: Code Quality | Value: 100% Strict TypeScript (0 Errors)
- Label: Data Security | Value: Supabase PostgreSQL Role-Based Security
- Label: Language Support | Value: Bengali (বাংলা) & English One-Click Toggle
