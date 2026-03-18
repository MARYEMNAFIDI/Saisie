"use client";

import { Toaster } from "sonner";

import { AdminProvider } from "@/components/providers/admin-provider";
import { MockDatabaseProvider } from "@/components/providers/mock-db-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AdminProvider>
      <SessionProvider>
        <MockDatabaseProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-border bg-card/95 text-foreground shadow-panel",
              },
            }}
          />
        </MockDatabaseProvider>
      </SessionProvider>
    </AdminProvider>
  </ThemeProvider>
);
