import type { Metadata } from "next";
import type { ReactNode } from "react";
import "tedx-amsterdam-design-system/styles.css";
import "tedx-amsterdam-design-system/index.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tedxamsterdam.nl"),
  title: {
    default: "TEDxAmsterdam",
    template: "%s | TEDxAmsterdam",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
