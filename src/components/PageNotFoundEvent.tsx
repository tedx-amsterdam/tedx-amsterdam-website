"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// The 404 page is static, so the visited path and the page that linked to
// it are only known in the browser.
export function PageNotFoundEvent() {
  useEffect(() => {
    trackEvent("page_not_found", {
      page_location_path: window.location.pathname,
      referrer_url: document.referrer,
    });
  }, []);

  return null;
}
