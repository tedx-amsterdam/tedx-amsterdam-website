import type { SafeHtml } from "@/content";
import { withHeadingsFrom, type HeadingLevel } from "@/lib/sanitize-html";
import styles from "./RichText.module.css";

type RichTextProps = {
  // Only SafeHtml, which the content layer produces with sanitizeHtml, so
  // raw CMS HTML cannot reach the page.
  html: SafeHtml;
  // Level for the highest heading in the text: one below the heading the
  // text sits under, so CMS headings never skip a level in the page outline.
  headingsFrom: HeadingLevel;
  className?: string;
};

export function RichText({ html, headingsFrom, className }: RichTextProps) {
  return (
    <div
      className={className ? `${styles.richText} ${className}` : styles.richText}
      dangerouslySetInnerHTML={{ __html: withHeadingsFrom(html, headingsFrom) }}
    />
  );
}
