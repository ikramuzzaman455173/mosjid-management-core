# 🕌 Baytul Mamur Mosque Management System

![Project Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-19.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

A modern, comprehensive digital management software tailored for **Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque**. This application streamlines mosque administration, financial tracking, member subscriptions, and daily operational activities with bilingual support (Bengali & English).

---

## ✨ Key Features

- **📊 Interactive Dashboard:** Real-time financial insights, total members, cash/bank balance, and monthly collection overview using interactive charts (Recharts).
- **👥 Member Management:** Complete digital registry of all mosque and committee members.
- **💰 Financial Tracking (Income/Expense):** Manage subscriptions, one-time donations, cash inflows, and daily expenses.
- **🏦 Accounts Management:** Track both cash-in-hand and bank account balances securely.
- **📝 Automated Reporting & Receipts:** Generate and print PDF reports, transaction receipts, and audit logs.
- **🔐 Roles & Permissions:** Fine-grained access control ensuring secure administration.
- **📅 Events & Notice Board:** Keep members updated with digital notices and upcoming events.
- **🌙 Specialized Modules:** Dedicated sections for Prayer Times, Ramadan, Zakat calculation, and Qurbani management.
- **🌍 Bilingual Interface:** Seamlessly switch between Bengali (বাংলা) and English.

---

## 🛠 Tech Stack

**Frontend Framework:**
- [React (v19)](https://react.dev/) - UI Library
- [TanStack Start](https://tanstack.com/start) & [Vite](https://vitejs.dev/) - SSR/Build Tooling
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query](https://tanstack.com/query) - Data fetching and state management

**Styling & UI Components:**
- [Tailwind CSS (v4)](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) - Accessible, customizable UI components
- [Lucide React](https://lucide.dev/) - Beautiful iconography

**Backend & Database:**
- [Supabase](https://supabase.com/) - Open source Firebase alternative (PostgreSQL, Auth, Storage)

**Forms & Validation:**
- [React Hook Form](https://react-hook-form.com/) - Form state management
- [Zod](https://zod.dev/) - Schema validation

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js** (v18.x or higher)
- **npm** or **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd baytul-mamur-core-mosque
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL="your-supabase-project-url"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
   VITE_SUPABASE_PROJECT_ID="your-supabase-project-id"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or using your custom alias
   devx
   ```
   The application will be available at `http://localhost:5173` (or the port specified by Vite).

---

## 📂 Project Structure

```text
├── .github/
│   └── workflows/          # GitHub Actions CI/CD & Auto Cron Jobs
├── src/
│   ├── assets/             # Static assets (images, fonts)
│   ├── components/         # Reusable UI components (shadcn, forms, layout)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service configurations (Supabase)
│   ├── lib/                # Utility functions, helpers, and i18n
│   ├── routes/             # TanStack Router page components & layouts
│   ├── services/           # API and database interaction logic
│   ├── router.tsx          # Router configuration
│   └── styles.css          # Global Tailwind styles
├── .env                    # Environment variables (ignored in Git)
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite configuration
```

---

## ⚙️ Automated Background Jobs (Cron)

This project utilizes **GitHub Actions** to perform automated database maintenance. 

A scheduled workflow (`.github/workflows/keep-alive.yml`) runs every 2 days to ping the Supabase REST API directly. This ensures the Supabase free-tier database remains active and prevents it from pausing due to inactivity.

To configure this in a new repository environment, ensure the following GitHub Secrets are set:
- `SUPABASE_URL`
- `SUPABASE_KEY`

---

## 📜 License & Copyright

This software is developed exclusively for the administration of **Maijzhena Dakshin Notun Para Baytul Mamur Jame Mosque**. All rights reserved.

---
*Developed with ❤️ for the community.*
