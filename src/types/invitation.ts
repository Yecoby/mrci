export type GalleryItem = {
  src: string;
  full: string;
  alt: string;
};

export type GiftIdea = {
  emoji: string;
  label: string;
  note?: string;
};

export type DressLook = {
  key: string;
  label: string;
  note: string;
  image: string;
};

export type PaletteColor = {
  name: string;
  hex: string;
};

export type EventConfig = {
  childFullName: string;
  childFirstName?: string;
  childNickname?: string;
  sealLetter: string;
  ageWord: string;
  headline: string;
  themeName: string;
  pageTitle: string;
  pageDescription: string;

  dateISO: string;
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;

  venueName: string;
  venueArea: string;
  venueHall: string;
  venueCity?: string;
  mapsLink: string;
  mapsEmbed?: string;

  envelopeEyebrow: string;
  openingAssist: string;
  tapHint: string;

  typingLine: string;
  heroIntro: string;
  enterLabel: string;

  detailsEyebrow: string;
  detailsTitle: string;
  detailsLead: string;

  whenLabel: string;
  whereLabel: string;
  celebrationLabel: string;
  celebrationLine: string;

  countdownEyebrow: string;
  countdownTitle: string;

  celebrantEyebrow: string;
  celebrantTitle: string;
  celebrantLead: string;

  huntEyebrow: string;
  huntTitle: string;
  huntLead: string;
  huntBadgeTitle: string;
  huntBadgeSub: string;

  galleryEyebrow: string;
  galleryTitle: string;

  giftEyebrow: string;
  giftTitle: string;
  giftBody: string;
  giftIntro: string;
  giftIdeas: ReadonlyArray<GiftIdea>;
  giftOutro: string;
  giftClosing: string;

  venueEyebrow: string;
  mapsButton: string;

  dressEyebrow: string;
  dressTitle: string;
  dressLead: string;
  dressLooks: ReadonlyArray<DressLook>;

  paletteEyebrow: string;
  paletteTitle: string;
  palette: ReadonlyArray<PaletteColor>;

  remindersEyebrow: string;
  remindersTitle: string;
  remindersLead: string;
  reminders: ReadonlyArray<string>;

  programEyebrow: string;
  programTitle: string;
  programTime: string;
  program: ReadonlyArray<string>;

  rsvpEyebrow: string;
  rsvpTitle: string;
  rsvpLead: string;
  rsvpMessageLabel: string;
  rsvpSuccessTitle: string;
  rsvpSuccessBody: string;

  closingEyebrow?: string;
  closingTitle?: string;
  closingLead?: string;

  coverEyebrow?: string;
  coverSubtext?: string;
  hashtag?: string;

  audioUrl?: string;
  footerLine?: string;

  images: {
    hero: string;
    heroMobile: string;
    venue: string;
    closing: string;
    wand: string;
    swing: string;
    portrait: string;
    heroImage?: string;
    heroBackground?: string;
  };

  gallery: ReadonlyArray<GalleryItem>;
  meadow: ReadonlyArray<GalleryItem>;
};

export type RsvpSubmission = {
  guestName: string;
  attendance: "attending" | "not-attending";
  adults: number;
  kids: number;
  attendees: number;
  contact: string;
  message: string;
};
