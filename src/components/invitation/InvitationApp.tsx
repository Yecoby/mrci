import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Music, Music2 } from "lucide-react";
import type { EventConfig, RsvpSubmission } from "@/types/invitation";
import { sampleWeddingEvent } from "@/lib/sample-wedding-event";
import { createGardenAudio } from "@/lib/garden-audio";

export type Attendance = "attending" | "not-attending";

type LightboxState = { src: string; alt: string } | null;

const BUTTERFLY_FLIGHTS = [
  { size: 38, color: "#ef83b6", duration: 16, delay: 0, x0: "-8vw", y0: "78vh", x1: "28vw", y1: "42vh", x2: "62vw", y2: "22vh", x3: "108vw", y3: "8vh" },
  { size: 28, color: "#aa70c5", duration: 19, delay: 3, x0: "10vw", y0: "90vh", x1: "40vw", y1: "50vh", x2: "74vw", y2: "18vh", x3: "112vw", y3: "-4vh" },
  { size: 32, color: "#78b98a", duration: 14, delay: 6, x0: "-12vw", y0: "60vh", x1: "22vw", y1: "30vh", x2: "58vw", y2: "12vh", x3: "110vw", y3: "2vh" },
  { size: 24, color: "#f0c35a", duration: 18, delay: 1.5, x0: "4vw", y0: "85vh", x1: "48vw", y1: "55vh", x2: "80vw", y2: "28vh", x3: "115vw", y3: "10vh" },
];

function ButterflyIcon() {
  return (
    <svg viewBox="0 0 64 48" aria-hidden="true">
      <use href="#icon-butterfly" />
    </svg>
  );
}

/*
 * â”€â”€ Closing-cover artwork â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * The cover's florals are drawn in code rather than shipped as a photo: they
 * stay crisp at any width, need no new asset, and reuse the cover palette.
 * It also keeps the cover honest â€” the PWA branding artwork is separate.
 */

/** One five-petal rose, centred on the origin â€” the cover's repeating motif.
 *
 * The three petal layers and the heart are coloured from CSS classes (see the
 * `cover-rose__*` rules in styles.css), so the whole floral ramp is tuned in the
 * `--color-cover-petal*` tokens rather than here. The two halo discs are what
 * make the bloom sit *on* the wash instead of sinking into it. */
function CoverRose({ size = 1 }: { size?: number }) {
  return (
    <g transform={`scale(${size})`}>
      <circle className="cover-rose__halo" r="27" />
      <circle className="cover-rose__halo-tint" r="23" />
      {/* Petal shadow, a half-step behind the petals, so the rose reads as layered. */}
      <g className="cover-rose__shadow">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={`shadow-${angle}`} cx="0" cy="-21.5" rx="12.8" ry="19.2" transform={`rotate(${angle})`} />
        ))}
      </g>
      <g className="cover-rose__petal">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-19" rx="12.2" ry="18.2" transform={`rotate(${angle})`} />
        ))}
      </g>
      {/* Inner petals, rotated half a step so the centre reads as lit. */}
      <g className="cover-rose__petal-soft">
        {[36, 108, 180, 252, 324].map((angle) => (
          <ellipse key={angle} cx="0" cy="-12" rx="8.6" ry="12.4" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle className="cover-rose__core" r="7.2" />
      <circle className="cover-rose__glint" r="3.4" />
    </g>
  );
}

/** Sage leaves tucked behind the blooms: `[x, y, rotation, scale]`. */
const COVER_LEAVES: ReadonlyArray<readonly [number, number, number, number]> = [
  [30, 34, -32, 1.05],
  [98, 22, 20, 0.95],
  [156, 70, 58, 0.9],
  [40, 128, 104, 0.85],
  [122, 152, 26, 0.8],
  [72, 92, -8, 0.72],
];

/**
 * Watercolour bloom cluster for one corner of the cover.
 *
 * The artwork radiates from the top-left of its viewBox but keeps its mass
 * inboard (roughly 40â€“200 of 240), because the element itself is anchored just
 * off the corner of the screen â€” a cluster drawn hard into the SVG corner would
 * land outside the viewport and never be seen.
 *
 * The four corners mirror it with `flipX` / `flipY`, which mirrors the drawing
 * *inside* the SVG â€” not the element with a CSS transform â€” so each corner's CSS
 * fade mask still points at the correct screen edge.
 */
function CoverBlooms({ flipX = false, flipY = false }: { flipX?: boolean; flipY?: boolean }) {
  const mirror = `${flipX ? "translate(240 0) scale(-1 1)" : ""} ${flipY ? "translate(0 240) scale(1 -1)" : ""}`.trim();
  return (
    <svg viewBox="0 0 240 240" focusable="false">
      <g transform={mirror || undefined}>
        {/* Stems arcing out of the corner */}
        <g className="cover-stem" fill="none" strokeLinecap="round">
          <path d="M4 18c44 10 84 40 112 84" strokeWidth="3" opacity="0.6" />
          <path d="M6 104c40-14 70 2 92 40" strokeWidth="2.4" opacity="0.45" />
        </g>
        {/* Leaves */}
        <g className="cover-leaf">
          {COVER_LEAVES.map(([x, y, rotate, scale]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={7 * scale} ry={16 * scale} transform={`rotate(${rotate} ${x} ${y})`} />
          ))}
        </g>
        {/* Roses â€” large, medium, small, and a bud */}
        <g transform="translate(66 62)">
          <CoverRose size={1.1} />
        </g>
        <g transform="translate(148 40)">
          <CoverRose size={0.78} />
        </g>
        <g transform="translate(46 140)">
          <CoverRose size={0.6} />
        </g>
        <g transform="translate(162 130)">
          <CoverRose size={0.44} />
        </g>
        {/* Lilac sprigs â€” the palette's cool note */}
        <g className="cover-spray">
          <circle cx="196" cy="80" r="6.4" />
          <circle cx="208" cy="92" r="5.6" />
          <circle cx="200" cy="104" r="6" />
          <circle cx="216" cy="78" r="4.8" />
          <circle cx="220" cy="96" r="4.4" />
          <circle cx="112" cy="184" r="5.2" />
          <circle cx="126" cy="176" r="4.4" />
          <circle cx="124" cy="194" r="4.6" />
        </g>
        <g className="cover-berry">
          <circle cx="202" cy="88" r="2.2" />
          <circle cx="212" cy="90" r="1.8" />
          <circle cx="118" cy="184" r="1.9" />
          <circle cx="128" cy="178" r="1.6" />
        </g>
        {/* A little champagne sparkle */}
        <g className="cover-sparkle">
          <circle cx="150" cy="20" r="1.8" />
          <circle cx="72" cy="86" r="1.6" />
          <circle cx="140" cy="140" r="1.5" />
        </g>
      </g>
    </svg>
  );
}

/**
 * One sprig for the border rows: a rose, a bud and three leaves on a short stem.
 *
 * `flipY` mirrors the drawing inside the SVG â€” the same trick the corner
 * clusters use â€” so the top row hangs downward from the top edge and the bottom
 * row grows upward from the bottom edge, both from this single drawing.
 */
function CoverSprig({ flipY = false }: { flipY?: boolean }) {
  return (
    <svg viewBox="0 0 72 64" focusable="false">
      <g transform={flipY ? "translate(0 64) scale(1 -1)" : undefined}>
        <g className="cover-stem" fill="none" strokeWidth="2.1" strokeLinecap="round">
          <path d="M9 55c7-21 19-35 38-43" opacity="0.8" />
        </g>
        <g className="cover-leaf">
          <ellipse cx="25" cy="41" rx="5.2" ry="11.4" transform="rotate(-38 25 41)" />
          <ellipse cx="39" cy="24" rx="4.6" ry="10.2" transform="rotate(28 39 24)" />
          <ellipse cx="17" cy="52" rx="4.2" ry="9.2" transform="rotate(-58 17 52)" />
        </g>
        <g transform="translate(46 20)">
          <CoverRose size={0.52} />
        </g>
        <g transform="translate(31 50)">
          <CoverRose size={0.28} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Whimsical vintage carriage, drawn in code. It sits at the very bottom of the
 * cover at low opacity, so it reads as texture in the wash behind the card
 * instead of a second focal point. Coloured by `currentColor`.
 */
function CoverCarriage() {
  return (
    <svg viewBox="0 0 240 150" focusable="false">
      {/* Scalloped canopy */}
      <path d="M62 62c0-30 26-52 58-52s58 22 58 52Z" fill="currentColor" opacity="0.56" />
      <g fill="currentColor" opacity="0.56">
        {[70, 90, 110, 130, 150, 170].map((cx) => (
          <circle key={cx} cx={cx} cy="62" r="9" />
        ))}
      </g>
      {/* Cabin and door */}
      <path d="M72 62h96v32a10 10 0 0 1-10 10H82a10 10 0 0 1-10-10Z" fill="currentColor" opacity="0.5" />
      <rect x="106" y="68" width="28" height="30" rx="6" fill="currentColor" opacity="0.62" />
      {/* Wheels */}
      <g fill="none" stroke="currentColor" strokeWidth="4" opacity="0.6">
        <circle cx="88" cy="116" r="20" />
        <circle cx="158" cy="116" r="20" />
      </g>
      <g stroke="currentColor" strokeWidth="2.4" opacity="0.5">
        <path d="M88 100v32M72 116h32M77 105l22 22M99 105l-22 22" />
        <path d="M158 100v32M142 116h32M147 105l22 22M169 105l-22 22" />
      </g>
      <circle cx="88" cy="116" r="4" fill="currentColor" opacity="0.68" />
      <circle cx="158" cy="116" r="4" fill="currentColor" opacity="0.68" />
      {/* Coach lantern */}
      <rect x="176" y="64" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/**
 * Border sprigs, spread left-to-right across the cover: `[left %, width px,
 * rotation deg, opacity]`.
 *
 * Positions are explicit rather than a flex row so each sprig can sit at its own
 * height and angle â€” a row of evenly-stacked identical flowers would read as a
 * pattern, which is the one thing a hand-painted border must not look like.
 */
const COVER_BORDER: ReadonlyArray<readonly [number, number, number, number]> = [
  [3, 62, -13, 0.9],
  [17, 52, 9, 0.74],
  [33, 68, -7, 0.86],
  [50, 54, 12, 0.7],
  [67, 66, -10, 0.84],
  [83, 50, 8, 0.72],
  [95, 58, -14, 0.88],
];

/** The bottom row keeps its centre free for the carriage. */
const COVER_BORDER_BOTTOM: ReadonlyArray<readonly [number, number, number, number]> = [
  [4, 58, 11, 0.8],
  [21, 50, -8, 0.68],
  [38, 62, 6, 0.76],
  [64, 60, -7, 0.74],
  [81, 52, 9, 0.66],
  [95, 56, -11, 0.78],
];

/** Upper bound for one headcount on the invitation form (the server allows more). */
const MAX_HEADCOUNT = 10;

/**
 * Strip emoji from a host-supplied reminder string.
 *
 * The reminders carry emoji at both ends ("ðŸ§´ Please sanitizeâ€¦ðŸ’•"). Both are
 * removed so the rendered list is emoji-free and each row is marked by the
 * design's own ornament instead. The wording in between is returned exactly as
 * supplied, with its punctuation and spacing intact.
 *
 * Removal is by code-point test rather than a fixed pattern, so it also clears
 * variation selectors and ZWJ sequences, and any emoji the host adds later.
 */
function stripEmoji(value: string): string {
  return value
    // Drop pictographs, their variation selectors, and any joined sequences.
    .replace(/\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}\uFE0F]*/gu, "")
    // Collapse the space left behind, and trim the ends.
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * One `âˆ’ 0 +` headcount row. Shared shape between the guest RSVP form and the
 * Host Desk edit dialog so both read as the same control.
 *
 * `value` is clamped to 0â€¦MAX_HEADCOUNT and never goes negative, however many
 * times minus is pressed.
 */
function HeadcountStepper({
  id,
  label,
  value,
  onChange,
  max = MAX_HEADCOUNT,
  disabled = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  const set = (next: number) => onChange(Math.min(Math.max(Math.trunc(next), 0), max));
  return (
    <div className="rsvp-stepper">
      <span className="rsvp-stepper__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="rsvp-stepper__controls">
        <button
          type="button"
          className="rsvp-stepper__btn"
          aria-label={`Remove one ${label.toLowerCase()}`}
          disabled={disabled || value <= 0}
          onClick={() => set(value - 1)}
        >
          âˆ’
        </button>
        <output
          className="rsvp-stepper__value"
          id={id}
          aria-labelledby={`${id}-label`}
          aria-live="polite"
        >
          {value}
        </output>
        <button
          type="button"
          className="rsvp-stepper__btn"
          aria-label={`Add one ${label.toLowerCase()}`}
          disabled={disabled || value >= max}
          onClick={() => set(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useReveal(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".fairy-invite .reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [active]);
}

function useParallax(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let pending = false;
    const update = () => {
      pending = false;
      const center = window.innerHeight / 2;
      items.forEach((item) => {
        if (reduced) {
          item.style.setProperty("--parallax-y", "0px");
          return;
        }
        const parent = item.parentElement?.getBoundingClientRect() ?? item.getBoundingClientRect();
        if (parent.bottom < -window.innerHeight * 0.25 || parent.top > window.innerHeight * 1.25) return;
        const speed = Number(item.dataset.parallaxSpeed || 0.08);
        const offset = Math.max(-58, Math.min(58, (center - (parent.top + parent.height / 2)) * speed));
        item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      });
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active]);
}

function useSceneActivity(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".motion-scene"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      { threshold: 0.12 },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [active]);
}

function useTypedLine(text: string, start: boolean) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 42);
    return () => window.clearInterval(id);
  }, [text, start]);
  return shown;
}

function useCountdown(iso: string, running: boolean) {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [parts, setParts] = useState({ days: "000", hours: "00", minutes: "00", seconds: "00" });
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setParts({
        days: String(days).padStart(3, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, running]);
  return parts;
}

function spawnGlitter(layer: HTMLElement | null, x: number, y: number, count = 10) {
  if (!layer) return;
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("span");
    el.className = "glitter";
    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 46;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    el.style.background = i % 2 === 0 ? "#ffe9b0" : "#ffd0e8";
    layer.appendChild(el);
    window.setTimeout(() => el.remove(), 900);
  }
}

export type InvitationAppProps = {
  event?: EventConfig;
  onRsvpSubmit?: (data: RsvpSubmission) => Promise<void>;
};

export function InvitationApp({
  event = sampleWeddingEvent,
  onRsvpSubmit,
}: InvitationAppProps = {}) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const opened = phase === "open";
  const [musicOn, setMusicOn] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [hunt, setHunt] = useState(0);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [wand, setWand] = useState({ x: 0, y: 0, on: false });
  // Guest-side headcount. Held in state (not just the form) so the âˆ’/+ steppers
  // and the live "Total guests" line re-render immediately; the values are read
  // back out of state on submit and sent to the server as-is.
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  // Defaults to "Joyfully attending" so a guest confirming their place does not
  // have to switch options first. The radio still toggles both ways freely.
  const [attending, setAttending] = useState(true);
  const audio = useRef<ReturnType<typeof createGardenAudio> | null>(null);
  const glitterRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const finalSceneRef = useRef<HTMLElement | null>(null);

  const typed = useTypedLine(event.typingLine, opened);
  const [timerSettings] = useState({ enabled: true, customDateISO: null });
  const effectiveDate = timerSettings.customDateISO || event.dateISO;
  const count = useCountdown(effectiveDate, opened && timerSettings.enabled);
  useReveal(opened);
  useParallax(opened);
  useSceneActivity(opened);

  useEffect(() => {
    // Use the event's configured audio URL if available, otherwise fallback to default
    const audioSrc =
      (event as { audioUrl?: string }).audioUrl ??
      '/invitation/02. What If There Was Pink - The Pirate Fairy Soundtrack - (320 Kbps) (1).mp3';
    audio.current = createGardenAudio(audioSrc);
    return () => audio.current?.stop();
  }, [event]);

  useEffect(() => {
    /*
     * Intentionally nothing here.
     *
     * A reply used to be remembered per device in `localStorage` and this effect
     * would jump straight to the thank-you note on any later visit, permanently
     * hiding the form. On a public birthday invitation that is wrong: a family
     * passing one phone around, or a shared tablet at the party, could only ever
     * send a single reply.
     *
     * The form is now always offered on open/refresh. A guest sees the
     * confirmation only as the direct result of submitting (see `onRsvp`), and
     * every submission is an independent insert â€” no reply is ever overwritten.
     */
  }, []);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const openInvite = useCallback(() => {
    if (phase !== "closed") return;
    const wait = reduced ? 80 : 2500;
    setPhase("opening");
    void audio.current?.start().then(() => setMusicOn(true));
    const origin = glitterRef.current?.getBoundingClientRect();
    spawnGlitter(glitterRef.current, (origin?.width ?? 400) / 2, (origin?.height ?? 400) / 2, 18);
    window.setTimeout(() => setPhase("open"), wait);
  }, [phase, reduced]);

  const toggleMusic = useCallback(async () => {
    const on = await audio.current?.toggle();
    setMusicOn(Boolean(on));
  }, []);

  const onPointer = useCallback((e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "touch" && e.pointerType !== "pen") return;
    setWand({ x: e.clientX, y: e.clientY, on: true });
  }, []);

  const hideWand = useCallback(() => {
    setWand((current) => ({ ...current, on: false }));
  }, []);

  const openPhoto = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closePhoto = useCallback(() => {
    dialogRef.current?.close();
    setLightbox(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightbox && !dialog.open) dialog.showModal();
    if (!lightbox && dialog.open) dialog.close();
  }, [lightbox]);

  const collect = useCallback((el: HTMLButtonElement) => {
    if (el.classList.contains("is-collected")) return;
    el.classList.add("is-collected");
    const rect = el.getBoundingClientRect();
    spawnGlitter(glitterRef.current, rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
    setHunt((n) => n + 1);
  }, []);

  const onRsvp = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const guestName = String(data.get("guestName") ?? "").trim();
    const attendance = String(data.get("attendance") ?? "") as Attendance;
    const contact = String(data.get("contact") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const isAttending = attendance === "attending";
    // A declined reply stores no headcount: the split belongs to guests who are
    // actually coming, and it must never reach the "Guests coming" total.
    const adultCount = isAttending ? adults : 0;
    const kidCount = isAttending ? kids : 0;
    const totalGuests = adultCount + kidCount;

    const errors: Record<string, string> = {};
    if (guestName.length < 2) errors.guestName = "Please enter the guest name.";
    if (attendance !== "attending" && attendance !== "not-attending") errors.attendance = "Please choose an attendance response.";
    if (isAttending && totalGuests < 1) errors.headcount = "Please add at least one adult or kid.";
    if (contact.replace(/\D/g, "").length < 7) errors.contact = "Please enter a valid contact number.";

    form.querySelectorAll(".field").forEach((field) => field.classList.remove("has-error"));
    form.querySelectorAll(".field-error").forEach((node) => {
      node.textContent = "";
    });
    Object.entries(errors).forEach(([name, msg]) => {
      // The headcount error belongs to the Adults/Kids field group, which is not a
      // single named form control (it is two steppers), so it is targeted by id.
      const field =
        name === "headcount"
          ? form.querySelector("#rsvpHeadcount")?.closest(".field")
          : (() => {
              const input = form.elements.namedItem(name);
              return input instanceof RadioNodeList
                ? form.querySelector('input[name="attendance"]')?.closest(".field")
                : (input as HTMLElement | null)?.closest(".field");
            })();
      field?.classList.add("has-error");
      const err = field?.querySelector(".field-error");
      if (err) err.textContent = msg;
    });
    if (Object.keys(errors).length) {
      setRsvpStatus("Please check the highlighted fields.");
      return;
    }

    setRsvpStatus("Your reply is taking flightâ€¦");
    await new Promise((r) => setTimeout(r, 700));
    try {
      // Sent to the invitation's own server so the organizers see it in the Host
      // Desk. Guests need no account; this endpoint only appends a reply.
      const submission: RsvpSubmission = { guestName, attendance, adults: adultCount, kids: kidCount, attendees: totalGuests, contact, message };
    if (onRsvpSubmit) {
      await onRsvpSubmit(submission);
    } else {
      const existing = JSON.parse(localStorage.getItem("mrci-sample-rsvps") || "[]");
      existing.push({ ...submission, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      localStorage.setItem("mrci-sample-rsvps", JSON.stringify(existing));
    }
  } catch {}
    // Show the confirmation as the direct result of this submission. Nothing is
    // written to localStorage, so reopening or refreshing the invitation always
    // offers the form again and the next guest on this device can reply too.
    setRsvpDone(true);
    setRsvpStatus("");
    const panel = form.getBoundingClientRect();
    spawnGlitter(glitterRef.current, panel.left + panel.width / 2, panel.top + 80, 20);
    window.requestAnimationFrame(() => {
      finalSceneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      finalSceneRef.current?.focus();
    });
  }, [adults, kids]);

  // Build scoped CSS custom properties for dynamic imagery and theme colors
  const scopedStyle = useMemo<CSSProperties>(() => {
    const style: Record<string, string> = {};
    if (event.images.hero) {
      style["--invite-sky-bg"] = `url("${event.images.hero}")`;
      style["--invite-hunt-bg"] = `url("${event.images.hero}")`;
    }
    if (event.images.heroMobile) {
      style["--invite-sky-bg-mobile"] = `url("${event.images.heroMobile}")`;
    }
    if (event.images.closing) {
      style["--invite-countdown-bg"] = `url("${event.images.closing}")`;
    }
    const heroBg = (event.images as { heroBackground?: string }).heroBackground ?? (event as { heroImage?: string }).heroImage;
    if (heroBg) {
      style["--invite-hero-bg"] = `url("${heroBg}")`;
    }
    return style as CSSProperties;
  }, [event]);

  return (
    <div
      className={`fairy-invite ${opened ? "" : "is-locked"}`}
      style={scopedStyle}
      onPointerMove={opened ? onPointer : undefined}
      onPointerDown={opened ? onPointer : undefined}
      onPointerLeave={opened ? hideWand : undefined}
      onPointerUp={opened ? hideWand : undefined}
      onPointerCancel={opened ? hideWand : undefined}
    >
      <svg className="svg-defs" aria-hidden="true" focusable="false">
        <symbol id="icon-butterfly" viewBox="0 0 64 48">
          <path d="M31 24C20 4 3 2 5 17c1 9 12 13 24 10C16 32 9 43 20 46c8 2 12-7 13-18Z" />
          <path d="M33 24C44 4 61 2 59 17c-1 9-12 13-24 10 13 5 20 16 9 19-8 2-12-7-13-18Z" />
          <ellipse cx="32" cy="25" rx="3" ry="13" />
          <path d="M31 13c-5-5-7-8-7-11M33 13c5-5 7-8 7-11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
      </svg>

      <a className="skip-link" href="#details">
        Skip to details
      </a>

      {phase !== "open" && (
        <section className={`opening ${phase === "opening" ? "is-opening" : ""}`} aria-label="Closed invitation envelope">
          <div className="opening__sky" aria-hidden="true" />
          <div className="opening__sparkles" aria-hidden="true" />
          <svg className="opening-butterfly opening-butterfly--one" aria-hidden="true">
            <use href="#icon-butterfly" />
          </svg>
          <svg className="opening-butterfly opening-butterfly--two" aria-hidden="true">
            <use href="#icon-butterfly" />
          </svg>
          <svg className="opening-butterfly opening-butterfly--three" aria-hidden="true">
            <use href="#icon-butterfly" />
          </svg>
          <button className="envelope" type="button" onClick={openInvite} aria-label="Open invitation">
            <span className="envelope__back" aria-hidden="true" />
            <span className="envelope__card" aria-hidden="true">
              <span className="envelope-card__details">
                <small>{event.envelopeEyebrow}</small>
                <strong>{event.childFullName}</strong>
                <em>
                  {event.dateLabel} Â· {event.timeLabel}
                </em>
                <span>{event.venueName}</span>
              </span>
            </span>
            <span className="envelope__flap" aria-hidden="true" />
            <span className="envelope__front" aria-hidden="true" />
            <span className="envelope__seal" aria-hidden="true">
              <span>{event.sealLetter}</span>
            </span>
            <span className="envelope__hint">{event.tapHint}</span>
          </button>
          <div className="opening__wash" aria-hidden="true" />
          <p className="opening__assist">{event.openingAssist}</p>
        </section>
      )}

      {opened && (
        <main id="invitation">
          <section className="hero motion-scene is-active" id="hero">
            <div className="hero__background" data-parallax data-parallax-speed="0.08" aria-hidden="true" />
            <div className="hero__veil" aria-hidden="true" />
            <div className="fairy-lights" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <div className="butterfly-field" aria-hidden="true">
              {BUTTERFLY_FLIGHTS.map((b, i) => (
                <svg
                  key={i}
                  className="floating-butterfly"
                  style={
                    {
                      "--size": `${b.size}px`,
                      "--color": b.color,
                      "--duration": `${b.duration}s`,
                      "--delay": `${b.delay}s`,
                      "--x0": b.x0,
                      "--y0": b.y0,
                      "--x1": b.x1,
                      "--y1": b.y1,
                      "--x2": b.x2,
                      "--y2": b.y2,
                      "--x3": b.x3,
                      "--y3": b.y3,
                    } as CSSProperties
                  }
                >
                  <use href="#icon-butterfly" />
                </svg>
              ))}
            </div>
            <div className="hero__copy reveal is-visible">
              <p className="eyebrow typing-caret" aria-live="polite">
                {typed}
              </p>
              <h1>
                <span className="hero__name">{event.childFullName}</span>
                <em>{event.headline}</em>
              </h1>
              <p className="hero__intro">{event.heroIntro}</p>
              <a className="fg-btn fg-btn--glow" href="#details">
                {event.enterLabel}
              </a>
            </div>
            <div className="hero__petal-floor" aria-hidden="true" />
          </section>

          <section className="details garden-path-scene motion-scene" id="details">
            {/* Fairy-garden atmosphere. Purely decorative and confined to the
                edges/corners so the centre content stays clean and readable. */}
            <div className="fae-bg" aria-hidden="true">
              {["tl", "tr", "bl", "br"].map((pos) => (
                <span key={`bloom-${pos}`} className={`fae-bloom fae-bloom--${pos}`}>
                  <svg viewBox="0 0 200 200" focusable="false">
                    {/* Large five-petal blossom */}
                    <g transform="translate(62 58)">
                      <g fill="#ffd3e6">
                        <ellipse cx="0" cy="-20" rx="12" ry="20" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(72)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(144)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(216)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(288)" />
                      </g>
                      <circle r="7.5" fill="#fff2c4" />
                      <circle r="3" fill="#ffd77a" />
                    </g>
                    {/* Lilac blossom */}
                    <g transform="translate(132 84) scale(0.82)">
                      <g fill="#ddcdf7">
                        <ellipse cx="0" cy="-20" rx="12" ry="20" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(72)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(144)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(216)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(288)" />
                      </g>
                      <circle r="7.5" fill="#fff6de" />
                      <circle r="3" fill="#e8c489" />
                    </g>
                    {/* Small blue blossom */}
                    <g transform="translate(88 140) scale(0.62)">
                      <g fill="#cfe2ff">
                        <ellipse cx="0" cy="-20" rx="12" ry="20" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(72)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(144)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(216)" />
                        <ellipse cx="0" cy="-20" rx="12" ry="20" transform="rotate(288)" />
                      </g>
                      <circle r="7.5" fill="#fffaf0" />
                    </g>
                    {/* Leaves tucked behind the blooms */}
                    <g fill="#b9dcaa" opacity="0.9">
                      <ellipse cx="34" cy="112" rx="8" ry="17" transform="rotate(-38 34 112)" />
                      <ellipse cx="168" cy="140" rx="7" ry="15" transform="rotate(34 168 140)" />
                      <ellipse cx="120" cy="36" rx="7" ry="14" transform="rotate(22 120 36)" />
                    </g>
                  </svg>
                </span>
              ))}
              <span className="fae-vine fae-vine--left" />
              <span className="fae-vine fae-vine--right" />
              <span className="fae-leaves fae-leaves--top" />
              <span className="fae-leaves fae-leaves--bottom" />
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <span key={`moth-${n}`} className={`fae-moth fae-moth--${n}`}>
                  <svg viewBox="0 0 100 76" focusable="false">
                    <path
                      d="M50 40C38 22 20 12 8 18c-9 5-6 24 8 31 8 4 22 3 34-9Z"
                      fill="currentColor"
                      opacity="0.92"
                    />
                    <path
                      d="M50 40c12-18 30-28 42-22 9 5 6 24-8 31-8 4-22 3-34-9Z"
                      fill="currentColor"
                      opacity="0.92"
                    />
                    <path
                      d="M50 44c-8 12-20 20-29 17-7-3-5-15 6-20 6-3 15-2 23 3Z"
                      fill="currentColor"
                      opacity="0.75"
                    />
                    <path
                      d="M50 44c8 12 20 20 29 17 7-3 5-15-6-20-6-3-15-2-23 3Z"
                      fill="currentColor"
                      opacity="0.75"
                    />
                    <path d="M50 34v18" stroke="#6b4a72" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <span key={`spark-${n}`} className={`fae-spark fae-spark--${n}`} />
              ))}
            </div>

            <div className="section-heading reveal">
              <p className="eyebrow">{event.detailsEyebrow}</p>
              <h2>{event.detailsTitle}</h2>
              <p>{event.detailsLead}</p>
            </div>
            <div className="garden-route" aria-label="Celebration details">
              <article className="signpost signpost--date reveal">
                <span className="signpost__icon">âœ¦</span>
                <p className="signpost__label">{event.whenLabel}</p>
                <h3>{event.dateLabel}</h3>
                <p>
                  {event.dayLabel} Â· {event.timeLabel}
                </p>
              </article>
              <figure className="route-portrait reveal">
                <img
                  src={event.images.portrait}
                  width={1200}
                  height={1800}
                  alt={`A flower-draped swing for ${event.childFirstName ?? event.childFullName}`}
                />
              </figure>
              <article className="signpost signpost--venue reveal">
                <span className="signpost__icon">â§</span>
                <p className="signpost__label">{event.whereLabel}</p>
                <h3>{event.venueName}</h3>
                <p>{event.venueHall}</p>
                <p>{event.venueArea}</p>
              </article>
              <article className="signpost signpost--theme reveal">
                <span className="signpost__icon">â€</span>
                <p className="signpost__label">{event.celebrationLabel}</p>
                <h3>{event.childFullName}</h3>
                <p>{event.celebrationLine}</p>
              </article>
              <div className="route-lantern route-lantern--one" aria-hidden="true" />
              <div className="route-lantern route-lantern--two" aria-hidden="true" />
            </div>
          </section>

          {timerSettings.enabled && (
            <section className="countdown-scene motion-scene" aria-labelledby="countdownTitle">
              <div className="section-heading section-heading--light reveal">
                <p className="eyebrow">{event.countdownEyebrow}</p>
                <h2 id="countdownTitle">{event.countdownTitle}</h2>
              </div>
              <div className="countdown" role="timer" aria-live="polite">
                <div className="count-orb reveal">
                  <strong>{count.days}</strong>
                  <span>Days</span>
                </div>
                <div className="count-orb reveal">
                  <strong>{count.hours}</strong>
                  <span>Hours</span>
                </div>
                <div className="count-orb reveal">
                  <strong>{count.minutes}</strong>
                  <span>Minutes</span>
                </div>
                <div className="count-orb reveal">
                  <strong>{count.seconds}</strong>
                  <span>Seconds</span>
                </div>
              </div>
            </section>
          )}

          <section className="celebrant-scene motion-scene" aria-label="Celebrant portrait scene">
            <img
              className="celebrant-scene__image"
              data-parallax
              data-parallax-speed="0.11"
              src={event.images.swing}
              width={1152}
              height={1728}
              alt="A flower-draped swing waiting in the garden"
            />
            <div className="celebrant-scene__shade" aria-hidden="true" />
            <div className="celebrant-scene__copy reveal">
              <p className="eyebrow">{event.celebrantEyebrow}</p>
              <h2>{event.celebrantTitle}</h2>
              <p>{event.celebrantLead}</p>
            </div>
          </section>

          <section className="hunt motion-scene" id="butterflyHunt" aria-labelledby="huntTitle">
            <div className="section-heading reveal">
              <p className="eyebrow">{event.huntEyebrow}</p>
              <h2 id="huntTitle">{event.huntTitle}</h2>
              <p>{event.huntLead}</p>
            </div>
            <div className="hunt__counter" aria-live="polite">
              {hunt} / 5 found
            </div>
            <div className="hunt__garden" aria-label="Butterfly hunt play area">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`hunt-butterfly hunt-butterfly--${n}`}
                  type="button"
                  aria-label={`Collect butterfly ${n}`}
                  onClick={(ev) => collect(ev.currentTarget)}
                >
                  <ButterflyIcon />
                </button>
              ))}
              {hunt >= 5 && (
                <div className="hunt__badge">
                  <ButterflyIcon />
                  <strong>{event.huntBadgeTitle}</strong>
                  <span>{event.huntBadgeSub}</span>
                </div>
              )}
            </div>
          </section>

          <section className="editorial-gallery motion-scene" id="gallery" aria-labelledby="galleryTitle">
            <div className="section-heading reveal">
              <p className="eyebrow">{event.galleryEyebrow}</p>
              <h2 id="galleryTitle">{event.galleryTitle}</h2>
            </div>
            <div className="editorial-layout">
              <button
                className="editorial-feature reveal"
                type="button"
                onClick={() => openPhoto(event.gallery[0].full, event.gallery[0].alt)}
                aria-label={`Open ${event.gallery[0].alt}`}
              >
                <img loading="lazy" src={event.gallery[0].src} alt={event.gallery[0].alt} />
              </button>
              <button
                className="editorial-small editorial-small--one reveal"
                type="button"
                onClick={() => openPhoto(event.gallery[1].full, event.gallery[1].alt)}
              >
                <img loading="lazy" src={event.gallery[1].src} alt={event.gallery[1].alt} />
              </button>
              <button
                className="editorial-small editorial-small--two reveal"
                type="button"
                onClick={() => openPhoto(event.gallery[2].full, event.gallery[2].alt)}
              >
                <img loading="lazy" src={event.gallery[2].src} alt={event.gallery[2].alt} />
              </button>
            </div>
            <div className="photo-strip" aria-hidden="true">
              <div className="photo-strip__track">
                {/*
                 * `loading="eager"` is deliberate, not an oversight. This track is
                 * 2x the meadow list inside an `overflow: hidden` marquee that is
                 * animated with `transform` â€” which fires no scroll or resize event,
                 * so the browser's lazy-load intersection check never re-runs for the
                 * images outside the visible band. They stayed permanently
                 * un-requested, leaving visible GAPS scrolling through the strip
                 * (8 of 12 never loaded on a 390px phone). Only 6 unique files are
                 * involved after de-duplication, so eager loading is cheap and
                 * correct here. `fetchPriority="low"` keeps them behind the hero.
                 */}
                {[...event.meadow, ...event.meadow].map((item, i) => (
                  <img
                    key={`${item.src}-${i}`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="low"
                    src={item.src}
                    alt=""
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="gift-scene motion-scene" aria-labelledby="giftTitle">
            {/*
             * "A Note from the Garden" â€” minimal editorial treatment.
             * Typography and whitespace carry the section: eyebrow â†’ display
             * title â†’ short gold rule â†’ prose â†’ a two-column list of the six
             * gifts on hairline rules â†’ italic sign-off. No decoration.
             */}
            <div className="gift-letter reveal">
              <header className="gift-letter__head">
                <p className="gift-letter__eyebrow">{event.giftEyebrow}</p>
                <h2 id="giftTitle" className="gift-letter__title">
                  {event.giftTitle}
                </h2>
                <span className="gift-letter__rule" aria-hidden="true" />
                <p className="gift-letter__body">{event.giftBody}</p>
                <p className="gift-letter__intro">{event.giftIntro}</p>
              </header>

              {/* Gifts presented as a clean editorial list â€” no vine, no tags. */}
              <div className="gift-list">
                <ul className="gift-list__items">
                  {event.giftIdeas.map((idea, i) => (
                    <li className="gift-item" key={idea.label}>
                      <span className="gift-item__index" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="gift-item__text">
                        <strong>{idea.label}</strong>
                        {idea.note ? <span className="gift-item__note">{idea.note}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="gift-letter__closing">
                <p className="gift-letter__outro">{event.giftOutro}</p>
                <span className="gift-letter__closing-rule" aria-hidden="true" />
                <p className="gift-letter__final">{event.giftClosing}</p>
              </footer>
            </div>
          </section>

          {/*
           * Location â€” "Follow the Garden Path".
           * Composed as a journey rather than a card: a fine gold path curves
           * down through the section, past soft botanical silhouettes, to a
           * destination marker above the venue's editorial nameplate.
           */}
          <section className="venue-scene motion-scene" id="venue" aria-labelledby="venueTitle">
            <div className="venue-scene__wash" data-parallax data-parallax-speed="0.06" aria-hidden="true" />

            {/* Botanical silhouettes framing the path â€” linework only, very faint. */}
            <span className="venue-scene__frond venue-scene__frond--left" aria-hidden="true">
              <svg viewBox="0 0 120 200" fill="none" focusable="false">
                <path d="M60 200C60 150 50 96 26 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M52 150c-16-6-26-18-30-34 16 1 27 12 30 34Z" fill="currentColor" opacity=".45" />
                <path d="M48 118c-15-6-24-17-27-32 15 1 25 11 27 32Z" fill="currentColor" opacity=".35" />
                <path d="M42 84c-13-6-21-16-23-29 13 1 22 10 23 29Z" fill="currentColor" opacity=".28" />
                <path d="M56 168c14-5 22-15 25-29-14 1-23 10-25 29Z" fill="currentColor" opacity=".22" />
              </svg>
            </span>
            <span className="venue-scene__frond venue-scene__frond--right" aria-hidden="true">
              <svg viewBox="0 0 120 200" fill="none" focusable="false">
                <path d="M60 200C60 150 70 96 94 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M68 150c16-6 26-18 30-34-16 1-27 12-30 34Z" fill="currentColor" opacity=".45" />
                <path d="M72 118c15-6 24-17 27-32-15 1-25 11-27 32Z" fill="currentColor" opacity=".35" />
                <path d="M78 84c13-6 21-16 23-29-13 1-22 10-23 29Z" fill="currentColor" opacity=".28" />
                <path d="M64 168c-14-5-22-15-25-29 14 1 23 10 25 29Z" fill="currentColor" opacity=".22" />
              </svg>
            </span>

            <div className="venue-scene__inner">
              <header className="venue-scene__head reveal">
                <p className="eyebrow venue-scene__eyebrow">{event.venueEyebrow}</p>
              </header>

              {/*
               * The path: a single curve drawn from the label down to the
               * destination marker, so the eye travels toward the venue.
               */}
              <div className="venue-path" aria-hidden="true">
                <svg viewBox="0 0 240 420" fill="none" preserveAspectRatio="xMidYMin meet" focusable="false">
                  <path
                    className="venue-path__line"
                    d="M120 6C120 60 74 84 74 140s62 74 62 128-58 62-58 118"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeDasharray="1 7"
                  />
                  {/* Small stones set along the path. */}
                  <circle className="venue-path__stone" cx="104" cy="60" r="2.4" fill="currentColor" />
                  <circle className="venue-path__stone" cx="80" cy="112" r="2" fill="currentColor" />
                  <circle className="venue-path__stone" cx="122" cy="176" r="2.4" fill="currentColor" />
                  <circle className="venue-path__stone" cx="134" cy="238" r="2" fill="currentColor" />
                  <circle className="venue-path__stone" cx="98" cy="300" r="2.4" fill="currentColor" />
                  <circle className="venue-path__stone" cx="80" cy="352" r="2" fill="currentColor" />
                </svg>
              </div>

              {/* Destination marker â€” the path arrives here. */}
              <div className="venue-pin reveal" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false">
                  <path
                    d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10.2" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              {/* The venue nameplate. */}
              <div className="venue-plate reveal">
                <span className="venue-plate__frame" aria-hidden="true" />
                <h2 className="venue-plate__name" id="venueTitle">
                  {event.venueName}
                </h2>

                {/* Bantayan Hall â€” the specific venue guests must find. */}
                <p className="venue-plate__hall">
                  <span className="venue-plate__hall-rule" aria-hidden="true" />
                  <span className="venue-plate__hall-name">{event.venueHall}</span>
                  <span className="venue-plate__hall-rule" aria-hidden="true" />
                </p>

                <p className="venue-plate__area">{event.venueArea}</p>

                <a
                  className="venue-action"
                  href={event.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="venue-action__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" focusable="false">
                      <path
                        d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="10.2" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                  <span className="venue-action__label">{event.mapsButton}</span>
                </a>
              </div>
            </div>
          </section>

          <section className="dress-code motion-scene" id="dressCode" aria-labelledby="dressCodeTitle">
            <div className="section-heading reveal">
              <p className="eyebrow">{event.dressEyebrow}</p>
              <h2 id="dressCodeTitle">{event.dressTitle}</h2>
              <p>{event.dressLead}</p>
            </div>
            <div className="attire-gallery">
              {event.dressLooks.map((look) => (
                <figure className="attire-look reveal" key={look.key}>
                  <img loading="lazy" src={look.image} width={1200} height={1800} alt={`${look.label}: ${look.note}`} />
                  <figcaption>
                    <strong>{look.label}</strong>
                    <span>{look.note}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Theme + exact colour palette supplied by the host. */}
            <div className="palette-block reveal">
              <div className="palette-block__heading">
                <p className="eyebrow">{event.paletteEyebrow}</p>
                <h3>{event.paletteTitle}</h3>
              </div>
              <ul className="palette-grid">
                {event.palette.map((swatch) => (
                  <li className="palette-swatch" key={swatch.hex}>
                    <span
                      className="palette-swatch__chip"
                      style={{ background: swatch.hex }}
                      aria-hidden="true"
                    />
                    <strong>{swatch.name}</strong>
                    <span className="palette-swatch__hex">{swatch.hex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/*
           * Guest guide â€” the host's gentle reminders and the evening's running
           * order presented as one spread: two facing panels under a shared
           * opener, so the section reads as a single page of the invitation
           * rather than two stacked lists.
           */}
          <section className="guest-guide motion-scene" id="reminders" aria-labelledby="remindersTitle">
            <div className="guest-guide__inner">
              {/*
               * Shared opener. The eyebrow here is a section mark, deliberately
               * NOT either panel's name â€” the panel headers below carry those, so
               * nothing on this spread is stated twice.
               */}
              <header className="guest-guide__opener reveal">
                <p className="eyebrow guest-guide__eyebrow">Good to Know</p>
                <h2 id="remindersTitle" className="guest-guide__title">
                  {event.remindersTitle}
                </h2>
                <p className="guest-guide__lead">{event.remindersLead}</p>
                <span className="guest-guide__rule" aria-hidden="true" />
              </header>

              <div className="guest-guide__spread">
                {/* Left panel â€” the reminders.
                 *
                 * The host's reminder strings lead with their own emoji. Rather
                 * than printing those emoji, the prefix is stripped and each row
                 * is marked by an evenly-numbered ornament drawn in CSS, so the
                 * list reads as stationery rather than a chat thread. The
                 * wording itself is untouched.
                 */}
                <div className="guide-panel guide-panel--notes">
                  <h3 className="guide-panel__label">
                    <span className="guide-panel__label-text">Gentle Reminders</span>
                  </h3>
                  <ul className="reminders__list">
                    {event.reminders.map((reminder) => (
                      <li className="reminder reveal" key={reminder}>
                        <span className="reminder__marker" aria-hidden="true" />
                        <span className="reminder__text">{stripEmoji(reminder)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right panel â€” the programme. */}
                <div className="guide-panel guide-panel--program">
                  <div className="guide-panel__head">
                    <div className="guide-panel__titles">
                      <p className="guide-panel__overline">{event.programEyebrow}</p>
                      <h3 className="guide-panel__label" id="programTitle">
                        <span className="guide-panel__label-text">{event.programTitle}</span>
                      </h3>
                    </div>
                    <p className="program__time">{event.programTime}</p>
                  </div>
                  <ul className="program__list">
                    {event.program.map((item) => (
                      <li className="program__item reveal" key={item}>
                        <span className="program__label">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="rsvp motion-scene" id="rsvp" aria-labelledby="rsvpTitle" data-no-glitter="true">
            <div className="rsvp__panel reveal">
              <div className="rsvp__heading">
                <p className="eyebrow">{event.rsvpEyebrow}</p>
                <h2 id="rsvpTitle">{event.rsvpTitle}</h2>
                <p>{event.rsvpLead}</p>
              </div>
              {!rsvpDone ? (
                <form id="rsvpForm" ref={formRef} onSubmit={onRsvp} noValidate>
                  <div className="field">
                    <label htmlFor="guestName">Guest Name</label>
                    <input id="guestName" name="guestName" type="text" autoComplete="name" required maxLength={100} />
                    <small className="field-error" aria-live="polite" />
                  </div>
                  <fieldset className="field field--choice">
                    <legend>Attendance</legend>
                    <label>
                      <input
                        type="radio"
                        name="attendance"
                        value="attending"
                        required
                        checked={attending}
                        onChange={() => setAttending(true)}
                      />{" "}
                      Joyfully attending
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="attendance"
                        value="not-attending"
                        required
                        checked={!attending}
                        onChange={() => setAttending(false)}
                      />{" "}
                      Sending fairy wishes
                    </label>
                    <small className="field-error" aria-live="polite" />
                  </fieldset>
                  {/* The headcount only applies to a party that is coming, so it
                      appears with the attending choice â€” the same way the old
                      single "Number of Attendees" field read. */}
                  {attending && (
                    <div className="field" id="rsvpHeadcount">
                      <span className="field-label">Guests Coming</span>
                      <HeadcountStepper
                        id="guestAdults"
                        label="Adults"
                        value={adults}
                        onChange={setAdults}
                      />
                      <HeadcountStepper
                        id="guestKids"
                        label="Kids"
                        value={kids}
                        onChange={setKids}
                      />
                      <p className="headcount-total">
                        Total guests: <strong>{adults + kids}</strong>
                      </p>
                      <small className="field-error" aria-live="polite" />
                    </div>
                  )}
                  <div className="field">
                    <label htmlFor="contact">Contact Number</label>
                    <input id="contact" name="contact" type="tel" autoComplete="tel" inputMode="tel" placeholder="09xx xxx xxxx" required maxLength={20} />
                    <small className="field-error" aria-live="polite" />
                  </div>
                  <div className="field field--full">
                    <label htmlFor="message">{event.rsvpMessageLabel}</label>
                    <textarea id="message" name="message" rows={4} maxLength={500} placeholder="Leave a sweet birthday wish..." />
                    <small className="field-error" aria-live="polite" />
                  </div>
                  <button className="fg-btn fg-btn--solid" type="submit">
                    Send My RSVP
                  </button>
                  <p className={`form-status ${rsvpStatus.startsWith("Please") ? "is-error" : ""}`} role="status">
                    {rsvpStatus}
                  </p>
                </form>
              ) : (
                <div className="rsvp-success" tabIndex={-1}>
                  <ButterflyIcon />
                  <h3>{event.rsvpSuccessTitle}</h3>
                  <p>{event.rsvpSuccessBody}</p>
                </div>
              )}
            </div>
          </section>

          {/* â”€â”€ Closing cover â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              The last screen of the invitation, and its formal front cover.
              Every line comes from `event` (src/lib/event.ts), so the name,
              date, time, venue and hashtag stay editable there. The flowers,
              butterflies and carriage are decoration only (aria-hidden). */}
          <section ref={finalSceneRef} className="final-scene motion-scene" aria-labelledby="finalTitle" tabIndex={-1}>
            {/* Soft watercolour wash + the bright glow that sits behind the card.
                Keeps the gentle parallax drift it already had. */}
            <div className="final-scene__background" data-parallax data-parallax-speed="0.05" aria-hidden="true" />
            {/* Blossoms framing the top and bottom edges. */}
            <div className="cover-flora" aria-hidden="true">
              <span className="cover-garland cover-garland--tl">
                <CoverBlooms />
              </span>
              <span className="cover-garland cover-garland--tr">
                <CoverBlooms flipX />
              </span>
              <span className="cover-garland cover-garland--bl">
                <CoverBlooms flipY />
              </span>
              <span className="cover-garland cover-garland--br">
                <CoverBlooms flipX flipY />
              </span>
              {/* Sprig borders tying the four corners into one frame. Each is a
                  rose with sage foliage, so the edge reads as a garland rather
                  than as a row of dots. The top row hangs downward; the bottom
                  row grows upward and keeps its centre free for the carriage. */}
              <div className="cover-border cover-border--top">
                {COVER_BORDER.map(([x, width, rotate, opacity]) => (
                  <span
                    key={`top-${x}`}
                    className="cover-border__sprig"
                    style={
                      {
                        "--sprig-x": `${x}%`,
                        "--sprig-w": `${width}px`,
                        "--sprig-r": `${rotate}deg`,
                        "--sprig-o": opacity,
                      } as CSSProperties
                    }
                  >
                    <CoverSprig flipY />
                  </span>
                ))}
              </div>
              <div className="cover-border cover-border--bottom">
                {COVER_BORDER_BOTTOM.map(([x, width, rotate, opacity]) => (
                  <span
                    key={`bottom-${x}`}
                    className="cover-border__sprig"
                    style={
                      {
                        "--sprig-x": `${x}%`,
                        "--sprig-w": `${width}px`,
                        "--sprig-r": `${rotate}deg`,
                        "--sprig-o": opacity,
                      } as CSSProperties
                    }
                  >
                    <CoverSprig />
                  </span>
                ))}
              </div>
              {/* The whim at the very bottom: a vintage carriage in the wash. */}
              <span className="cover-carriage">
                <CoverCarriage />
              </span>
            </div>
            {/* Veil that fades the florals out toward the middle. */}
            <div className="final-scene__shade" aria-hidden="true" />
            {/* Tiny butterflies by the top corners. Slow, small, no distraction. */}
            <div className="cover-butterflies" aria-hidden="true">
              <svg className="cover-butterfly cover-butterfly--1">
                <use href="#icon-butterfly" />
              </svg>
              <svg className="cover-butterfly cover-butterfly--2">
                <use href="#icon-butterfly" />
              </svg>
              <svg className="cover-butterfly cover-butterfly--3">
                <use href="#icon-butterfly" />
              </svg>
            </div>

            <article className="final-cover reveal">
              <p className="eyebrow final-cover__eyebrow">{event.coverEyebrow}</p>
              <h2 className="final-cover__name" id="finalTitle">
                {event.childFullName}
              </h2>
              <p className="final-cover__subtext">{event.coverSubtext}</p>
              <p className="final-cover__when">
                {event.dateLabel} Â· {event.timeLabel}
              </p>
              <p className="final-cover__where">
                {event.venueName} {event.venueArea} Â· {event.venueHall}
              </p>
              <p className="final-cover__hashtag">{event.hashtag}</p>
            </article>
          </section>
        </main>
      )}

      {opened && (
        <footer className="site-footer">
          <p>
            {(event as { footerLine?: string }).footerLine ??
              `A handmade fairy garden invitation for ${event.childFullName}.`}
          </p>
        </footer>
      )}

      {opened && (
        <button
          className={`music-toggle ${musicOn ? "is-on" : ""}`}
          type="button"
          aria-pressed={musicOn}
          aria-label={musicOn ? "Pause garden music" : "Play garden music"}
          onClick={() => void toggleMusic()}
        >
          {musicOn ? <Music2 /> : <Music />}
        </button>
      )}

      {opened && wand.on && (
        <div
          className="wand-fairy"
          aria-hidden="true"
          style={{ transform: `translate(${wand.x - 18}px, ${wand.y - 18}px)` }}
        >
          <img src={event.images.wand} alt="" />
        </div>
      )}

      <div className="particle-layer" id="particleLayer" ref={glitterRef} aria-hidden="true" />

      <dialog className="lightbox" ref={dialogRef} aria-label="Photo viewer" onClick={(e) => e.target === e.currentTarget && closePhoto()}>
        <button className="lightbox__close" type="button" aria-label="Close photo viewer" onClick={closePhoto}>
          Ã—
        </button>
        {lightbox && <img src={lightbox.src} alt={lightbox.alt} />}
      </dialog>
    </div>
  );
}
