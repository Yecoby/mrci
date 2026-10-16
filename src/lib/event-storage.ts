import type { EventConfig, RsvpSubmission } from "@/types/invitation";
import { sampleWeddingEvent } from "./sample-wedding-event.ts";

const EVENT_STORAGE_KEY = "mrci-custom-event";
const RSVP_STORAGE_KEY = "mrci-sample-rsvps";

export function loadSavedEvent(): EventConfig {
  if (typeof window === "undefined") return sampleWeddingEvent;
  try {
    const raw = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!raw) return sampleWeddingEvent;
    const parsed = JSON.parse(raw);
    return {
      ...sampleWeddingEvent,
      ...parsed,
      images: {
        ...sampleWeddingEvent.images,
        ...(parsed.images || {}),
      },
      palette: parsed.palette || sampleWeddingEvent.palette,
      program: parsed.program || sampleWeddingEvent.program,
      reminders: parsed.reminders || sampleWeddingEvent.reminders,
      giftIdeas: parsed.giftIdeas || sampleWeddingEvent.giftIdeas,
      dressLooks: parsed.dressLooks || sampleWeddingEvent.dressLooks,
      gallery: parsed.gallery || sampleWeddingEvent.gallery,
      meadow: parsed.meadow || sampleWeddingEvent.meadow,
    };
  } catch {
    return sampleWeddingEvent;
  }
}

export function saveCustomEvent(event: EventConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(event));
  } catch (err) {
    console.error("Failed to save custom event to localStorage:", err);
  }
}

export function resetToDefaultEvent(): EventConfig {
  if (typeof window !== "undefined") {
    localStorage.removeItem(EVENT_STORAGE_KEY);
  }
  return sampleWeddingEvent;
}

export type StoredRsvp = RsvpSubmission & {
  id: string;
  createdAt: string;
};

export function loadSampleRsvps(): StoredRsvp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY);
    if (!raw) {
      // Seed with 2 sample entries if none exist
      const initial: StoredRsvp[] = [
        {
          id: "seed-1",
          guestName: "Isabella Vance",
          attendance: "attending",
          adults: 2,
          kids: 0,
          attendees: 2,
          contact: "0917-555-0192",
          message: "Congratulations Mateo & Sofia! Looking forward to celebrating with you both.",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "seed-2",
          guestName: "Marcus Chen",
          attendance: "attending",
          adults: 1,
          kids: 2,
          attendees: 3,
          contact: "0920-555-4811",
          message: "Can't wait to see the lovely garden setting! See you there.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteSampleRsvp(id: string): StoredRsvp[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadSampleRsvps();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

export function clearAllSampleRsvps(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(RSVP_STORAGE_KEY);
  }
}
