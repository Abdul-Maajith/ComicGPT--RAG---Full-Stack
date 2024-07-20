"use client";
import React from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <Provider>{children}</Provider>
            </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
