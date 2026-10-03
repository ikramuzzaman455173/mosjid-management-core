<div align="center">
  <h1>🕌 Baytul Mamur Mosque Management System</h1>
  <p>
    <strong>A high-performance, full-stack enterprise digital management platform streamlining mosque operations, member registries, multi-fund financial accounting, and live smart TV prayer schedules.</strong>
  </p>
  <p>
    <a href="https://smart-mosjid-core.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Platform-00C7B7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Framework-React_19_+_TanStack_Start-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Framework" />
    <img src="https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Database" />
    <img src="https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License" />
  </p>
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-live-demo--credentials">Live Demo</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#️-tech-stack">Tech Stack</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-author">Author</a> •
    <a href="#-license--copyright">License</a>
  </p>
</div>

---

## 📖 Overview

The **Baytul Mamur Mosque Management System** is an end-to-end digital governance platform built specifically for **Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque**. Traditional mosque administration relies heavily on physical registers, fragmented cash notebooks, manual prayer timetable clocks, and offline paper receipts. This system eliminates administrative friction by unifying financial management, member contributions, governance meetings, asset inventories, and digital congregation displays into one centralized, real-time ecosystem.

Engineered with **React 19**, **TanStack Start**, **Vite**, and **Supabase (PostgreSQL)**, the application delivers instant page loads via server-side rendering (SSR), resilient Row Level Security (RLS), and zero-configuration bilingual localization (Bengali & English). It features both a responsive back-office operations suite and a zero-clutter, standalone **Smart TV Display Mode** designed to project daily prayer timetables, countdowns, and rotating Hadiths onto widescreen monitors inside the mosque prayer hall.

---

## 🌐 Live Demo & Credentials

- **Live Application:** [https://smart-mosjid-core.vercel.app](https://smart-mosjid-core.vercel.app)
- **1-Click Guest Admin Access:** Available directly on the login portal for client and HR evaluations.
  - **Email:** `mosqueadmin@info.com`
  - **Password:** `MosqueAdmin@123`
  - *Note:* The guest demo account has full view, creation, and editing capabilities across all modules with destructive deletion safeguards enabled.

---

## ✨ Key Features

- 📊 **Real-Time Financial Aggregation & Analytics:** Consolidates multi-source revenues (`monthly subscriptions`, `general donations`, `cash collections`, `bank transfers`, and `mobile banking`) against expenditures. Visualized via dynamic Area and Bar charts with timeframe filtering and interactive fund distribution donuts powered by Recharts.
- 📺 **Standalone Smart TV Display Screen:** Dedicated widescreen display (`/tv-display`) engineered for prayer hall LED/Smart TVs. Features real-time high-contrast digital clocks, next-prayer dynamic countdowns, automated prayer time tables, rotating Hadith carousels, and emergency announcement tickers.
- 👥 **Member & Committee Directory with QR Verification:** Comprehensive digital census of general and executive committee members. Automatically generates printable biometric identity cards with unique encrypted QR tokens (`/verify/:qrToken`) for instant membership validation.
- 🧾 **Automated Receipts & PDF Generation:** Built-in PDF rendering engine producing professional, printable donation slips, membership fee vouchers, and monthly financial balance sheets with single-click browser printing.
- 🌙 **Dedicated Islamic Operational Modules:**
  - **Prayer Schedule Manager:** Easily adjust Azan and Jama'at timings across all five daily prayers and Friday Jummah.
  - **Ramadan Calendar:** Digital Sehri and Iftar timetables with automated daily countdown notifications.
  - **Zakat & Fitra Calculator:** Dynamic asset evaluation calculator adhering to standard Islamic Nisab thresholds.
  - **Qurbani Share Management:** Tracks animal procurement costs, shareholder distributions, meat allocations, and financial reconciliations.
- 🔐 **Fine-Grained RBAC & Supabase Row Level Security:** Multi-tier authorization structure separating Super Administrators, Committee Executives, Accountants, and General Viewers with database-level security policies.
- 🌐 **Instant Bilingual Localization:** Full seamless toggle between native Bengali (বাংলা) and English across every modal, form, data table, and analytics chart.

---

## 🛠️ Tech Stack

### Frontend & Application Architecture
- **Core Library:** [React (v19)](https://react.dev/)
- **Full-Stack Framework & SSR:** [TanStack Start](https://tanstack.com/start) powered by [Nitro](https://nitro.build/) (Vercel Preset)
- **Client Bundler:** [Vite (v7)](https://vitejs.dev/)
- **Routing:** [TanStack Router](https://tanstack.com/router) — 100% Type-safe, file-based routing
- **State & Data Fetching:** [TanStack Query (v5)](https://tanstack.com/query) with optimized server-cache invalidation

### Styling & Design System
- **CSS Framework:** [Tailwind CSS (v4)](https://tailwindcss.com/)
- **Primitives & UI Kit:** [Radix UI](https://www.radix-ui.com/) accessible primitives & [shadcn/ui](https://ui.shadcn.com/)
- **Visual Iconography:** [Lucide React](https://lucide.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/) (Responsive Area, Bar, and Pie components)
- **Typography:** Google Fonts (`Hind Siliguri`, `Noto Sans Bengali`, and `Inter`)

### Backend, Database & Infrastructure
- **Database & Auth:** [Supabase](https://supabase.com/) (Managed PostgreSQL 15, Auth engine, and File Storage buckets)
- **Security Layer:** PostgreSQL Row Level Security (RLS) policies & Dynamic RBAC schemas
- **PDF & Canvas Processing:** `jspdf`, `jspdf-autotable`, `html2canvas`, and `react-to-print`
- **QR Generation:** `qrcode.react` with token-based cryptographic lookup

---

## 📁 System Architecture & Directory Structure

```text
baytul-mamur-core-mosque/
├── .vercel/                      # Nitro SSR production output & serverless functions
├── public/                       # Static assets and browser favicons
├── supabase/
│   ├── config.toml               # Supabase local environment configuration
│   └── migrations/               # PostgreSQL DDL, RBAC roles, and RLS security policies
├── src/
│   ├── components/
│   │   ├── auth/                 # Authentication wrappers and role guards
│   │   ├── ui/                   # Reusable UI component library (shadcn/ui + Radix)
│   │   ├── app-sidebar.tsx       # Collapsible navigation drawer with permission filters
│   │   ├── data-table.tsx        # Generalized search, filter, and paginated table
│   │   ├── fitra-calculator.tsx  # Dynamic Ramadan Fitra calculator
│   │   ├── printable-id-card.tsx # Member physical badge template with QR code
│   │   ├── printable-receipt.tsx # Standardized transaction slip printer
│   │   ├── qurbani-share-management.tsx # Eid-ul-Adha share distribution engine
│   │   └── zakat-calculator.tsx  # Nisab-compliant Zakat calculator
│   ├── hooks/
│   │   ├── use-mobile.tsx        # Adaptive viewport breakpoint listener
│   │   └── usePermissions.tsx    # Live RBAC role & module permission hook
│   ├── integrations/
│   │   └── supabase/             # Supabase client instantiation, session hook, and DB types
│   ├── lib/
│   │   ├── auth-context.tsx      # Global session & authentication state provider
│   │   ├── i18n.tsx              # Bilingual translation dictionaries and language context
│   │   ├── sms.ts                # Integrated SMS notification dispatcher
│   │   └── utils.ts              # Class merging (clsx/tailwind-merge) and formatting helpers
│   ├── routes/
│   │   ├── _authenticated/       # Protected dashboard operational routes
│   │   │   ├── dashboard.tsx     # High-level executive KPI metrics & charts
│   │   │   ├── members.tsx       # Member directory, registrations, and ID printing
│   │   │   ├── income.tsx        # Multi-category revenue ledger
│   │   │   ├── expenses.tsx      # Mosque utility and operational expense journal
│   │   │   ├── donations.tsx     # One-off general donations tracking
│   │   │   ├── subscription.tsx  # Recurring monthly membership collection
│   │   │   ├── bank.tsx          # Bank accounts and reconciliation
│   │   │   ├── cash.tsx          # Physical petty cash tracking
│   │   │   ├── mobile-banking.tsx# bKash / Nagad / Rocket merchant transaction logs
│   │   │   ├── prayer-times.tsx  # Timetable configuration
│   │   │   ├── ramadan.tsx       # Fasting calendar management
│   │   │   ├── qurbani.tsx       # Eid Qurbani livestock & share allocation
│   │   │   ├── roles-permissions.tsx # Dynamic role privileges matrix
│   │   │   └── welcome.tsx       # Post-login greeting and launchpad
│   │   ├── __root.tsx            # Global HTML document shell, fonts, and query context
│   │   ├── auth.tsx              # Split-screen secure login and guest sign-in
│   │   ├── tv-display.tsx        # Standalone TV display view with auto-rotating ticker
│   │   └── verify.$qrToken.tsx   # Public member verification gateway
│   ├── styles.css                # Tailwind CSS v4 design tokens and theme rules
│   ├── router.tsx                # TanStack Router configuration
│   └── server.ts                 # Nitro server entrypoint
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies and execution scripts
├── tsconfig.json                 # Strict TypeScript configuration
└── vite.config.ts                # Vite plugins and module aliases
```

---

## 🚀 Getting Started

Follow these instructions to configure and run the project in your local development environment.

### 📋 Prerequisites
- **Node.js:** `v20.x` or higher installed
- **Package Manager:** `npm` (v10+)
- **Git**
- **Supabase Account:** Access to a Supabase project instance

### ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ikramuzzaman455173/mosjid-management-core.git
   cd mosjid-management-core
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the provided `.env.example` file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Supabase connection parameters:
   ```env
   # Supabase Credentials
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"

   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
   VITE_SUPABASE_PROJECT_ID="your-project-id"

   # Optional Cron Keep-Alive Secret
   CRON_SECRET="your_optional_cron_secret"
   ```

4. **Apply Database Migrations:**
   Execute the migration scripts located in `supabase/migrations/` inside your Supabase SQL editor to create the schema, tables, RBAC roles, and Row Level Security policies.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

6. **Validate Production Build:**
   ```bash
   npm run build
   ```

---

## 🏢 Client Project & Maintenance Notice

> **Commercial / Client Project:** This codebase was custom-engineered as a dedicated enterprise solution for **Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque**.
>
> Open external pull requests are currently closed. For technical inquiries, maintenance requests, bug reports, or feature enhancements, please contact the maintainer or the mosque executive management committee directly.

---

## 👨‍💻 Author

- **Lead Engineer:** Ikramuzzaman
- **GitHub:** [@ikramuzzaman455173](https://github.com/ikramuzzaman455173)
- **Email:** [jakaria455173@gmail.com](mailto:jakaria455173@gmail.com)

---

## 📄 License & Copyright

**Copyright © 2026 Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque. All rights reserved.**

This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, modification, public display, or commercial reuse of this software via any medium is strictly prohibited without explicit written permission from the mosque management authority.
