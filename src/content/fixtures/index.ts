import type { ContentSource } from "../source";
import { sortEvents, sortPartners, sortSpeakers } from "../sort";
import { FIXTURE_EVENTS } from "./events";
import { FIXTURE_PARTNERS } from "./partners";
import { FIXTURE_SPEAKERS } from "./speakers";

export const fixtureSource: ContentSource = {
  async getSpeakers() {
    return sortSpeakers(FIXTURE_SPEAKERS);
  },
  async getSpeaker(slug) {
    return FIXTURE_SPEAKERS.find((speaker) => speaker.slug === slug);
  },
  async getEvents() {
    return sortEvents(FIXTURE_EVENTS);
  },
  async getPartners() {
    return sortPartners(FIXTURE_PARTNERS);
  },
};
