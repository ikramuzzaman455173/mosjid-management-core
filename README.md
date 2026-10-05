<div align="center">
  <h1>🕌 Baytul Mamur Mosque Management System</h1>
  <p>
    <strong>A full-stack mosque operations platform, automated multi-fund financial ledger, and 24/7 Smart TV prayer display engineered under Shopnojal IT.</strong>
  </p>
  <p>
    <a href="https://smart-mosjid-core.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Platform-00C7B7?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="https://shopnojalit.com/">
      <img src="https://img.shields.io/badge/Agency_Partner-Shopnojal_IT-0A66C2?style=for-the-badge" alt="Shopnojal IT" />
    </a>
    <img src="https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Framework-React_19_+_TanStack_Start-61DAFB?style=for-the-badge&logo=react" alt="React 19 & TanStack Start" />
    <img src="https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Backend-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase PostgreSQL" />
  </p>
  <p>
    <a href="#-quick-snapshot-the-30-second-overview">Quick Snapshot</a> •
    <a href="#-core-problem--measurable-impact-3-key-wins">Core Impact</a> •
    <a href="#-key-screens--live-interactive-testing">Screens & Demo</a> •
    <a href="#️-tech-stack--architecture">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-author--delivery-credits">Author</a>
  </p>
</div>

---

> [!NOTE]
> 💡 **Product Showcase & Architecture Demo:**
> Developed under **Shopnojal IT** as a dedicated Mosque Management ERP product. Modeled after real-world operational workflows of community mosques (specifically inspired by Maijzhena Baytul Mamur Jame Mosque), this public repository and live deployment serve as a complete, working showcase demonstrating modern full-stack architecture, real-time TV displays, and automated accounting systems.

## ⚡ Quick Snapshot (The 30-Second Overview)

| Attribute | Details |
| :--- | :--- |
| **Product / Domain** | **Mosque Operations & Accounts ERP** (Modeled for Maijzhena Baytul Mamur Jame Mosque) |
| **Agency Partner** | **[Shopnojal IT](https://shopnojalit.com/)** (Smart ERP, POS & Business Automation) |
| **Role & Execution** | **Lead Full-Stack Developer** (Delivered in a 5-week part-time sprint alongside full-time role) |
| **Core Architecture** | **React 19** + **TanStack Start (SSR)** + **Supabase (PostgreSQL with RLS)** + **Tailwind CSS v4** |
| **Live Interactive Test** | **[smart-mosjid-core.vercel.app](https://smart-mosjid-core.vercel.app)** (Guest Login: `mosqueadmin@info.com` / `MosqueAdmin@123`) |

---

## 🎯 Core Problem & Measurable Impact (3 Key Wins)

- ⚡ **Manual Accounts ➔ Automated Income & Expense Tracking:** Replaced handwritten paper notebooks, unverified cash boxes, and manual receipts with unified multi-channel ledgers (Cash, Bank, bKash/Nagad) and instant browser-rendered PDF vouchers ➔ 🚀 **Instant balance aggregation with zero manual arithmetic errors and zero cloud server PDF costs**.
- 📺 **Manual Wall Clocks ➔ 24/7 Smart TV Prayer Display:** Eliminated manual handheld remote adjustments and outdated physical timetable boards with an automated 55"+ Smart TV prayer display featuring dynamic next-prayer countdowns and rotating Hadiths ➔ 📈 **Continuous 24/7 synchronization with zero manual clock calibration and automated midnight rollover**.
- 🛡️ **Paper Member Records ➔ Member Directory with QR ID Cards:** Upgraded physical register books into a central member directory with printable ID badges and smartphone QR verification (`/verify/:qrToken`) ➔ ⚡ **Instant online member verification and protected data access using secure Supabase PostgreSQL roles**.

---

## 🖼️ Key Screens & Live Interactive Testing

### 1. 📊 Accounts & Financial Analytics Dashboard
<!-- [IMAGE_PLACEHOLDER: Executive Financial Analytics Dashboard Screen] -->
- **What it does:** Displays total cash in hand, bank balance, monthly collection charts, and today's prayer schedule.
*⚡ [Click to Test Live Dashboard](https://smart-mosjid-core.vercel.app/dashboard) — Guest Login: 1-Click Guest Admin (`mosqueadmin@info.com` / `MosqueAdmin@123`)*

### 2. 📺 Standalone 55"+ Smart TV Prayer Hall Screen
<!-- [IMAGE_PLACEHOLDER: Standalone 55"+ Smart TV Prayer Hall Screen] -->
- **What it does:** Full-screen layout made for prayer hall TVs showing large clock, next prayer countdown, and authentic Hadiths.
*⚡ [Click to Test Smart TV Display Live](https://smart-mosjid-core.vercel.app/tv-display) — Public live display with dynamic prayer countdown & Hadith rotation*

### 3. 👥 Member Census Directory & QR ID Cards
<!-- [IMAGE_PLACEHOLDER: Member Census Directory & Biometric QR ID Cards] -->
- **What it does:** Add and edit mosque members, track monthly subscriptions, and print ID cards with verifiable QR codes.
*⚡ [Click to Test Member Directory Live](https://smart-mosjid-core.vercel.app/members) — Featuring 1-click printable ID badges and QR validation gateway*

### 4. 🧾 Financial Ledgers & 1-Click Printable PDF Receipts
<!-- [IMAGE_PLACEHOLDER: Financial Ledgers & 1-Click Printable PDF Receipts] -->
- **What it does:** Record donations and fees by cash, bank, or mobile banking, and print instant PDF vouchers.
*⚡ [Click to Test Financial Ledgers Live](https://smart-mosjid-core.vercel.app/income) — Multi-channel revenue tracking and instant client-side printable PDF vouchers*

### 5. 🌙 Islamic Operations Suite (Ramadan, Zakat & Qurbani)
<!-- [IMAGE_PLACEHOLDER: Islamic Operations Suite (Ramadan, Zakat & Qurbani)] -->
- **What it does:** 30-day Sehri/Iftar calendar, Nisab Zakat calculator, and Eid Qurbani livestock share distributor.
*⚡ [Click to Test Islamic Operations Suite Live](https://smart-mosjid-core.vercel.app/ramadan) — Sehri/Iftar calendar, Nisab Zakat calculator, and Qurbani share distributor*

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React 19, TanStack Start (SSR), Vite 7
- **Routing & State Management:** TanStack Router (100% type-safe file-based routing), TanStack Query v5
- **Styling & UI Components:** Tailwind CSS v4, Radix UI Primitives, shadcn/ui, Lucide React
- **Backend & Database:** Supabase (Managed PostgreSQL 15, Auth Engine, File Storage buckets)
- **Security & Authorization:** PostgreSQL Row-Level Security (RLS) policies, Dynamic role privileges
- **Reporting & Data Visualization:** Recharts, jsPDF, jsPDF-AutoTable, react-to-print, qrcode.react
- **Hosting & Infrastructure:** Vercel (Edge / Serverless SSR deployment via Nitro engine)

### 📁 Directory Structure (Tailored to Detected Stack)

```text
baytul-mamur-core-mosque/
├── src/
│   ├── components/       # Reusable UI primitives (shadcn/Radix), printable ID cards, calculators
│   │   ├── auth/         # Authentication guards and role-based wrappers
│   │   ├── ui/           # Radix UI primitives and core design system
│   │   ├── printable-id-card.tsx # Member ID badge template with QR code
│   │   ├── printable-receipt.tsx # 1-click transaction slip voucher generator
│   │   ├── zakat-calculator.tsx  # Nisab-compliant Zakat calculator
│   │   └── qurbani-share-management.tsx # Eid-ul-Adha share distribution engine
│   ├── hooks/            # Custom hooks (permissions, responsive breakpoints)
│   ├── integrations/     # Supabase client instantiation, session hook, and DB types
│   ├── lib/              # Auth context, i18n localization (Bengali/English), utilities
│   ├── routes/           # TanStack Router file-based route tree
│   │   ├── _authenticated/ # Protected admin routes (dashboard, income, expenses, members, etc.)
│   │   │   ├── dashboard.tsx     # High-level executive KPI metrics & charts
│   │   │   ├── members.tsx       # Member directory, registrations, and ID printing
│   │   │   ├── income.tsx        # Multi-category revenue ledger
│   │   │   ├── expenses.tsx      # Mosque utility and operational expense journal
│   │   │   ├── prayer-times.tsx  # Timetable configuration
│   │   │   ├── ramadan.tsx       # Fasting calendar management
│   │   │   └── qurbani.tsx       # Eid Qurbani livestock & share allocation
│   │   ├── __root.tsx    # Global HTML document shell, fonts, and query context
│   │   ├── auth.tsx      # Split-screen auth and 1-click guest login
│   │   ├── tv-display.tsx# Standalone 55"+ Smart TV prayer display
│   │   └── verify.$qrToken.tsx # Public member QR token verification gateway
│   ├── router.tsx        # TanStack Router configuration
│   ├── server.ts         # Nitro server entrypoint
│   └── styles.css        # Tailwind CSS v4 design tokens and theme rules
├── supabase/
│   ├── config.toml       # Supabase local environment configuration
│   └── migrations/       # PostgreSQL DDL schemas, RBAC roles, and RLS policies
├── public/               # Static assets and browser favicons
├── .env.example          # Environment variables template
├── package.json          # Dependencies and npm execution scripts
├── tsconfig.json         # Strict TypeScript compiler options
└── vite.config.ts        # Vite plugins and module aliases
```

---

## 🚀 Getting Started

Follow these steps to run the showcase locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/ikramuzzaman455173/mosjid-management-core.git
cd mosjid-management-core

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env.local

# 4. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

---

## 👨‍💻 Author & Delivery Credits

- **Lead Full-Stack Developer:** Md. Ikramuzzaman
- **Agency Partner:** [Shopnojal IT](https://shopnojalit.com/) (Smart ERP, POS & Business Automation)
- **Portfolio:** [https://ikramuzzaman.vercel.app](https://ikramuzzaman.vercel.app)
- **GitHub:** [@ikramuzzaman455173](https://github.com/ikramuzzaman455173)
- **Email:** [jakaria455173@gmail.com](mailto:jakaria455173@gmail.com)
