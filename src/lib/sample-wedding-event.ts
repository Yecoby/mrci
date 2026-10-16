import type { EventConfig, GalleryItem } from "../types/invitation";

/**
 * Fictional sample wedding event configuration to demonstrate theme
 * independence and multi-event capability using the same Invitation template.
 */
export const sampleWeddingEvent: EventConfig = {
  childFullName: "Mateo & Sofia",
  childFirstName: "Sofia",
  childNickname: "Sofia",
  sealLetter: "M",
  ageWord: "Together",
  headline: "Are Getting Married",
  themeName: "Romantic Garden Wedding",
  pageTitle: "Mateo & Sofia — A Garden Wedding",
  pageDescription:
    "You are warmly invited to celebrate the wedding of Mateo and Sofia in an enchanting afternoon garden celebration.",

  dateISO: "2027-02-14T15:30:00+08:00",
  dateLabel: "February 14, 2027",
  dayLabel: "Sunday",
  timeLabel: "3:30 PM",

  venueName: "Bella Rosa Gardens",
  venueArea: "Silang",
  venueHall: "The Glass Pavilion",
  venueCity: "Cavite",
  mapsLink: "https://maps.google.com/?q=Bella+Rosa+Gardens+Silang+Cavite",
  mapsEmbed: "https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Bella+Rosa+Gardens+Cavite",

  envelopeEyebrow: "Wedding Invitation",
  openingAssist: "A celebration of love awaits.",
  tapHint: "Tap to Open",

  typingLine: "We invite you to celebrate our beginning",
  heroIntro:
    "Join us under the open sky and bloom of lanterns as we exchange our vows and step into forever.",
  enterLabel: "View Wedding Invitation",

  detailsEyebrow: "The Wedding Celebration",
  detailsTitle: "Mateo & Sofia's Vows",
  detailsLead:
    "Surrounded by family, fragrant blooms, and golden afternoon light, we say 'I do.'",

  whenLabel: "Ceremony & Reception",
  whereLabel: "Location",
  celebrationLabel: "The Union",
  celebrationLine: "A Romantic Garden Wedding",

  countdownEyebrow: "Counting the Moments",
  countdownTitle: "Until We Say I Do",

  celebrantEyebrow: "Our Love Story",
  celebrantTitle: "Mateo & Sofia",
  celebrantLead:
    "From college coffee chats to quiet mountaintop sunsets, our journey has brought us to this joyful day.",

  huntEyebrow: "Wedding Token",
  huntTitle: "Collect Five Golden Rings",
  huntLead: "Tap each hidden ring to share your blessing with the newlyweds.",
  huntBadgeTitle: "You unlocked the Wedding Blessing",
  huntBadgeSub: "Honored Guest of Honor",

  galleryEyebrow: "Moments of Joy",
  galleryTitle: "Our Favorite Memories",

  giftEyebrow: "A Gentle Note on Gifts",
  giftTitle: "Our Wedding Registry & Wishing Well",
  giftBody:
    "Your presence and warm prayers on our wedding day are the greatest gifts we could ever receive. 💕",
  giftIntro: "If you wish to bless us with a gift to help us start our home together:",
  giftIdeas: [
    { emoji: "🏡", label: "Home Essentials", note: "Kitchenware, dining sets, or cozy linens" },
    { emoji: "✈️", label: "Honeymoon Adventure Fund", note: "Contributions toward our dream trip" },
    { emoji: "☕", label: "Coffee & Dining", note: "A date night voucher or coffee gear" },
    { emoji: "🌱", label: "Indoor Plants", note: "Potted greens for our new living room" },
  ],
  giftOutro: "Most of all, we cannot wait to dance and dine with you on our big day! 🥂",
  giftClosing: "With all our love and gratitude, Mateo & Sofia.",

  venueEyebrow: "Finding Your Way",
  mapsButton: "Get Driving Directions",

  dressEyebrow: "Dress Code",
  dressTitle: "FORMAL GARDEN ATTIRE",
  dressLead: "Light, elegant, and comfortable for an outdoor lawn celebration.",
  dressLooks: [
    { key: "ladies", label: "Ladies", note: "Midi or maxi floral / pastel dresses", image: "/invitation/dress-woman.svg" },
    { key: "gentlemen", label: "Gentlemen", note: "Barong Tagalog or linen suits", image: "/invitation/dress-man.svg" },
    { key: "girls", label: "Girls", note: "Pastel flower girl dresses", image: "/invitation/dress-girl.svg" },
    { key: "boys", label: "Boys", note: "Button-downs with dress trousers", image: "/invitation/dress-boy.svg" },
  ],

  paletteEyebrow: "Wedding Palette",
  paletteTitle: "Champagne, Rose & Sage",
  palette: [
    { name: "Champagne Gold", hex: "#D8C19A" },
    { name: "Blush Rose", hex: "#F3B7D2" },
    { name: "Sage Green", hex: "#B8C9B0" },
    { name: "Pearl White", hex: "#FFF9F5" },
    { name: "Dusty Cedar", hex: "#D99AB8" },
  ],

  remindersEyebrow: "Guest Guide",
  remindersTitle: "Reminders for Our Guests",
  remindersLead: "A Few Thoughtful Details for the Ceremony",
  reminders: [
    "🕊️ Unplugged Ceremony: Kindly keep phones in silent mode and let our photographers capture the vows.",
    "⏰ Arrival: Please arrive 30 minutes before 3:30 PM to find your seat in the garden chapel.",
    "🥂 Toast: Join us directly after for cocktails and canapés on the terrace.",
    "💃 Dancing Shoes: The lawn is soft grass — wedges or block heels are recommended!",
  ],

  programEyebrow: "Wedding Itinerary",
  programTitle: "Order of Events",
  programTime: "3:30 PM – 10:00 PM",
  program: [
    "3:30 PM · Guest Arrival & Welcome Refreshments",
    "4:00 PM · Garden Vows Ceremony",
    "5:00 PM · Sunset Cocktails & Pictorial",
    "6:30 PM · Grand Entrance & Dinner Banquet",
    "7:45 PM · Speeches & First Dance",
    "8:30 PM · Cake Cutting & Bouquet Toss",
    "9:00 PM · Open Dance Floor & Celebration",
  ],

  rsvpEyebrow: "RSVP",
  rsvpTitle: "Will You Celebrate With Us?",
  rsvpLead: "Please confirm your attendance by January 15, 2027.",
  rsvpMessageLabel: "A Wedding Wish for the Couple",
  rsvpSuccessTitle: "Seat Reserved!",
  rsvpSuccessBody:
    "Thank you! Your reply has been received. We cannot wait to celebrate our special day with you.",

  closingEyebrow: "Forever & Always",
  closingTitle: "See You in the Garden",
  closingLead:
    "Thank you for being part of our story and standing with us as we begin our next chapter as husband and wife.",

  coverEyebrow: "The Wedding of Mateo & Sofia",
  coverSubtext: "We request the honor of your presence as we celebrate our marriage.",
  hashtag: "#MateoAndSofiaForever",

  audioUrl: undefined,
  footerLine: "A handcrafted wedding celebration for Mateo & Sofia.",

  images: {
    hero: "/invitation/hero.svg",
    heroMobile: "/invitation/hero.svg",
    venue: "/invitation/venue.svg",
    closing: "/invitation/hero.svg",
    wand: "/invitation/wand.svg",
    swing: "/invitation/hero.svg",
    portrait: "/invitation/hero.svg",
  },

  gallery: [
    { src: "/invitation/hero.svg", full: "/invitation/hero.svg", alt: "Garden stroll" },
    { src: "/invitation/hero.svg", full: "/invitation/hero.svg", alt: "Sunset canopy" },
    { src: "/invitation/venue.svg", full: "/invitation/venue.svg", alt: "Ceremony archway" },
  ] satisfies GalleryItem[],

  meadow: [
    { src: "/invitation/hero.svg", full: "/invitation/hero.svg", alt: "Garden path" },
    { src: "/invitation/venue.svg", full: "/invitation/venue.svg", alt: "Reflection pond" },
    { src: "/invitation/hero.svg", full: "/invitation/hero.svg", alt: "Celebration lawn" },
    { src: "/invitation/venue.svg", full: "/invitation/venue.svg", alt: "Wisteria pavilion" },
    { src: "/invitation/hero.svg", full: "/invitation/hero.svg", alt: "Lantern terrace" },
    { src: "/invitation/venue.svg", full: "/invitation/venue.svg", alt: "Floral chapel" },
  ] satisfies GalleryItem[],
};
