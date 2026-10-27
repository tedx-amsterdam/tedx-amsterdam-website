import type { Metadata } from "next";
import type { ReactNode } from "react";
import "tedx-amsterdam-design-system/styles.css";
import "tedx-amsterdam-design-system/index.css";
import "./globals.css";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TEDxAmsterdam",
    template: "%s | TEDxAmsterdam",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
