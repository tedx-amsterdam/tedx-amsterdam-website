import type { TedxEvent } from "../types";

// Fictional events for tests, CI and offline development. Dates are far in
// the future or the past, so the upcoming and past split does not change
// as time goes by. They cover an event with an image, one without a link,
// one without a location, a tag and a long title.

const POSTER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="#eb0028"/></svg>',
  );

export const FIXTURE_EVENTS: readonly TedxEvent[] = [
  {
    slug: "tedxamsterdam-2099",
    title: "TEDxAmsterdam 2099: Main Event",
    startsAt: "2099-11-12T13:00:00.000Z",
    location: "Pakhuis de Zwijger, Amsterdam",
    description: "The main event of the year: a full day of talks on one stage.",
    url: "https://www.eventbrite.com/e/tedxamsterdam-2099",
    tag: "Main event",
    image: { url: POSTER, alt: "TEDxAmsterdam 2099 poster" },
  },
  {
    slug: "open-mic-2099",
    title: "Rooftop Open Mic Storytelling Night with a title long enough to wrap over several lines",
    startsAt: "2099-06-25T18:00:00.000Z",
    location: "Zoku",
    description: "Take the stage and share your story, or sit back and listen.",
  },
  {
    slug: "conversations-2020",
    title: "TEDxAmsterdam Conversations: Spaces",
    startsAt: "2020-09-16T18:00:00.000Z",
    location: "Sir Adam",
    description: "An interactive evening about the spaces we live and work in.",
    url: "https://www.ted.com/tedx/events/1",
  },
  {
    slug: "impact-event-2020",
    title: "Impact Program Event",
    startsAt: "2020-06-26T18:00:00.000Z",
    url: "https://www.eventbrite.nl/e/impact-program-event",
  },
];
