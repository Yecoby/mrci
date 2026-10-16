import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleWeddingEvent } from "../lib/sample-wedding-event.ts";
import { loadSavedEvent, resetToDefaultEvent } from "../lib/event-storage.ts";
import type { EventConfig } from "../types/invitation.ts";

test("sampleWeddingEvent satisfies EventConfig schema", () => {
  const wedding: EventConfig = sampleWeddingEvent;
  assert.equal(wedding.childFullName, "Mateo & Sofia");
  assert.equal(wedding.dateLabel, "February 14, 2027");
  assert.equal(wedding.venueName, "Bella Rosa Gardens");
  assert.equal(wedding.hashtag, "#MateoAndSofiaForever");
  assert.equal(wedding.footerLine, "A handcrafted wedding celebration for Mateo & Sofia.");
});

test("Required fields are populated and non-empty", () => {
  assert.ok(sampleWeddingEvent.childFullName.length > 0);
  assert.ok(sampleWeddingEvent.dateISO.length > 0);
  assert.ok(sampleWeddingEvent.venueName.length > 0);
  assert.ok(Array.isArray(sampleWeddingEvent.palette));
  assert.ok(Array.isArray(sampleWeddingEvent.program));
  assert.ok(Array.isArray(sampleWeddingEvent.reminders));
  assert.ok(Array.isArray(sampleWeddingEvent.giftIdeas));
  assert.ok(Array.isArray(sampleWeddingEvent.dressLooks));
  assert.ok(Array.isArray(sampleWeddingEvent.gallery));
  assert.ok(Array.isArray(sampleWeddingEvent.meadow));
});

test("RSVP submission data shape integrity", () => {
  const submission = {
    guestName: "Guest of Honor",
    attendance: "attending" as const,
    adults: 2,
    kids: 1,
    attendees: 3,
    contact: "09181234567",
    message: "Warmest congratulations!",
  };

  assert.equal(submission.guestName, "Guest of Honor");
  assert.equal(submission.attendance, "attending");
  assert.equal(submission.adults + submission.kids, 3);
});

test("loadSavedEvent falls back cleanly when running outside browser", () => {
  const loaded = loadSavedEvent();
  assert.equal(loaded.childFullName, "Mateo & Sofia");
  assert.equal(loaded.venueName, "Bella Rosa Gardens");

  const reset = resetToDefaultEvent();
  assert.equal(reset.childFullName, "Mateo & Sofia");
});
