"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { SidebarInset } from "@/components/ui/sidebar";

export function ClientRoot({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="grow-[1] flex flex-col">
          <SidebarInset>
            <Header />
          </SidebarInset>
          <div className="bg-neutral-100 dark:bg-[#1e2734] md:p-6 p-4 flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}
