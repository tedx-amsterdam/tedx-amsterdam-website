import { describe, expect, it } from "vitest";
import { splitEvents, type TedxEvent } from "@/content";
import { fixtureSource } from "@/content/fixtures";
import { sortEvents } from "@/content/sort";
import { formatLongDate } from "@/lib/dates";

const event = (slug: string, startsAt: string): TedxEvent => ({ slug, title: slug, startsAt });

describe("sortEvents", () => {
  it("sorts by start, then title", () => {
    const sorted = sortEvents([event("b", "2026-06-02T10:00:00.000Z"), event("c", "2026-06-01T10:00:00.000Z"), event("a", "2026-06-02T10:00:00.000Z")]);
    expect(sorted.map((e) => e.slug)).toEqual(["c", "a", "b"]);
  });
});

describe("splitEvents", () => {
  const events = sortEvents([
    event("last-year", "2025-11-12T13:00:00.000Z"),
    event("last-month", "2026-09-17T18:00:00.000Z"),
    event("tonight", "2026-10-12T18:00:00.000Z"),
    event("next-month", "2026-11-12T13:00:00.000Z"),
  ]);

  it("lists upcoming events earliest first and past events most recent first", () => {
    const { upcoming, past } = splitEvents(events, new Date("2026-10-12T09:00:00.000Z"));
    expect(upcoming.map((e) => e.slug)).toEqual(["tonight", "next-month"]);
    expect(past.map((e) => e.slug)).toEqual(["last-month", "last-year"]);
  });

  it("sorts the events itself, whatever order they come in", () => {
    const { upcoming, past } = splitEvents(events.toReversed(), new Date("2026-10-12T09:00:00.000Z"));
    expect(upcoming.map((e) => e.slug)).toEqual(["tonight", "next-month"]);
    expect(past.map((e) => e.slug)).toEqual(["last-month", "last-year"]);
  });

  it("keeps an event upcoming for the whole day it takes place, in Amsterdam time", () => {
    // 21:30 UTC is 23:30 in Amsterdam: still the day of the event.
    expect(splitEvents(events, new Date("2026-10-12T21:30:00.000Z")).upcoming[0]?.slug).toBe("tonight");
    // 22:30 UTC is already the next day in Amsterdam.
    expect(splitEvents(events, new Date("2026-10-12T22:30:00.000Z")).past[0]?.slug).toBe("tonight");
  });

  it("uses the Amsterdam day of the event, not the UTC day", () => {
    // 23:30 UTC on the 11th is the 12th in Amsterdam.
    const late = [event("late", "2026-10-11T23:30:00.000Z")];
    expect(splitEvents(late, new Date("2026-10-12T08:00:00.000Z")).upcoming).toHaveLength(1);
  });

  it("follows Amsterdam winter time too", () => {
    // In November Amsterdam is UTC+1: 23:30 UTC is 00:30 the next day.
    const winter = [event("winter", "2026-11-12T13:00:00.000Z")];
    expect(splitEvents(winter, new Date("2026-11-12T22:30:00.000Z")).upcoming).toHaveLength(1);
    expect(splitEvents(winter, new Date("2026-11-12T23:30:00.000Z")).past).toHaveLength(1);
  });
});

describe("fixture events", () => {
  it("are sorted and cover upcoming, past and the edge cases pages must handle", async () => {
    const events = await fixtureSource.getEvents();
    expect(events).toEqual(sortEvents(events));
    const { upcoming, past } = splitEvents(events, new Date());
    expect(upcoming.length).toBeGreaterThan(0);
    expect(past.length).toBeGreaterThan(0);
    expect(events.some((e) => !e.url)).toBe(true);
    expect(events.some((e) => e.image)).toBe(true);
    expect(events.some((e) => e.title.length > 60)).toBe(true);
  });
});

describe("formatLongDate", () => {
  it("writes the day in Amsterdam time, also when that is the next day in UTC terms", () => {
    expect(formatLongDate("2026-11-12T13:00:00.000Z")).toBe("Thursday 12 November 2026");
    // 22:30 UTC on 11 October is 00:30 on 12 October in Amsterdam.
    expect(formatLongDate("2026-10-11T22:30:00.000Z")).toBe("Monday 12 October 2026");
  });
});
