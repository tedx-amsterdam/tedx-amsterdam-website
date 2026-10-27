"use client";

import { useEffect } from "react";
import { linkEvent, placement, trackEvent } from "@/lib/analytics";

// One listener for the whole page, so the links themselves stay in server
// components. It listens in the capture phase, so a component that stops a
// click from bubbling cannot hide it.
export function AnalyticsEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const name = linkEvent(link);
      if (!name) return;
      trackEvent(name, {
        link_url: link.href,
        link_text: (link.textContent ?? "").trim().slice(0, 100),
        placement: placement(link),
        page_location_path: window.location.pathname,
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
