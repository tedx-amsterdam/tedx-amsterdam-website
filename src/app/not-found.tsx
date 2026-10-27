import type { Metadata } from "next";
import { ArrowLink } from "tedx-amsterdam-design-system";
import { PageNotFoundEvent } from "@/components/PageNotFoundEvent";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="main-content" className={styles.main}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>This page does not exist or has moved.</p>
      <ArrowLink href="/">Go to the homepage</ArrowLink>
      <PageNotFoundEvent />
    </main>
  );
}
