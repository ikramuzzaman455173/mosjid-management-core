import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NotFound } from "@/components/errors/not-found";

import type { ErrorComponentProps } from "@tanstack/react-router";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const errorMessage = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">কিছু একটা সমস্যা হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "বায়তুল মামুর মসজিদ ম্যানেজমেন্ট সফটওয়্যার" },
      {
        name: "description",
        content:
          "মাইজযোনা দক্ষিণ নতুন পাড়া বায়তুল মামুর জামে মসজিদ — আধুনিক ডিজিটাল মসজিদ ব্যবস্থাপনা সিস্টেম",
      },
      { name: "google", content: "notranslate" },
      { name: "googlebot", content: "notranslate" },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=1" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <HeadContent />
        <meta name="google" content="notranslate" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "try{var theme=localStorage.getItem('app-theme');if(theme&&theme!=='default')document.documentElement.classList.add(theme);}catch(e){}",
          }}
        />
      </head>
      <body className="notranslate" translate="no" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Outlet />
            <Toaster position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
