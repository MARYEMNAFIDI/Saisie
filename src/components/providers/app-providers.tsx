"use client";

import { Toaster } from "sonner";

import { AdminProvider } from "@/components/providers/admin-provider";
import { MockDatabaseProvider } from "@/components/providers/mock-db-provider";
import { SessionProvider } from "@/components/providers/session-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <AdminProvider>
    <SessionProvider>
      <MockDatabaseProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "rounded-2xl border border-slate-200/80 bg-slate-50/92 text-slate-900 shadow-panel",
            },
          }}
        />
      </MockDatabaseProvider>
    </SessionProvider>
  </AdminProvider>
);
