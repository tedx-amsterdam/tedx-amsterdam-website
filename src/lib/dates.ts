// The site is about events in Amsterdam, so dates are always shown and
// compared in Amsterdam time, whatever the time zone of the build machine.
export const TIME_ZONE = "Europe/Amsterdam";

const dayParts = new Intl.DateTimeFormat("en", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

// The calendar day in Amsterdam as YYYY-MM-DD, which sorts as text. Built
// from the parts, because the order a locale formats them in can change.
export function amsterdamDay(date: Date): string {
  const part = (type: Intl.DateTimeFormatPartTypes) => dayParts.formatToParts(date).find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const longDate = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long", year: "numeric" });

// "Thursday 12 November 2026", in Amsterdam time. Built from the parts,
// because punctuation between them differs between ICU versions.
export function formatLongDate(iso: string): string {
  const parts = longDate.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${part("weekday")} ${part("day")} ${part("month")} ${part("year")}`;
}
