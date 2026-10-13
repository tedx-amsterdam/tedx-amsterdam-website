"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "tedx-amsterdam-design-system";
import { MAIN_NAV, TICKETS } from "@/config/site";

// A client component for usePathname, which marks the current page in the
// navigation.
export function SiteHeader() {
  const pathname = usePathname();
  const activeItem = MAIN_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <NavigationBar
      links={[...MAIN_NAV]}
      activePath={activeItem?.href}
      ctaLabel={TICKETS.label}
      ctaHref={TICKETS.href}
      base="/"
    />
  );
}
