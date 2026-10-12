// Structured data for search engines and agents, as recommended in the
// Next.js JSON-LD guide (node_modules/next/dist/docs/01-app/02-guides/json-ld.md).
// JSON.stringify does not escape "<", so CMS text containing "</script>"
// could end the tag early; < keeps it inside the JSON string.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
