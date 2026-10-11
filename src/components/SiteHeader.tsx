"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "@/components/design-system";
import { MAIN_NAV, TICKETS } from "@/config/site";

// NavigationBar uses React state for the mobile menu, so it has to render in
// a client component. usePathname also needs the client.
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
