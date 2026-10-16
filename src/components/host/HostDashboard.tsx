import { useState, useId } from "react";
import type { EventConfig, PaletteColor } from "@/types/invitation";
import {
  loadSavedEvent,
  saveCustomEvent,
  resetToDefaultEvent,
  loadSampleRsvps,
  deleteSampleRsvp,
  clearAllSampleRsvps,
  type StoredRsvp,
} from "@/lib/event-storage";
import { InvitationApp } from "@/components/invitation/InvitationApp";
import {
  Calendar,
  MapPin,
  Palette,
  Users,
  Eye,
  RotateCcw,
  Save,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export function HostDashboard() {
  const [event, setEvent] = useState<EventConfig>(() => loadSavedEvent());
  const [rsvps, setRsvps] = useState<StoredRsvp[]>(() => loadSampleRsvps());
  const [activeTab, setActiveTab] = useState<"event" | "colors" | "text" | "rsvps">("event");
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const formId = useId();

  const handleFieldChange = (field: keyof EventConfig, value: unknown) => {
    setEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaletteChange = (index: number, key: keyof PaletteColor, value: string) => {
    const updated = [...event.palette];
    updated[index] = { ...updated[index], [key]: value };
    setEvent((prev) => ({ ...prev, palette: updated }));
  };

  const addPaletteColor = () => {
    if (event.palette.length >= 8) return;
    setEvent((prev) => ({
      ...prev,
      palette: [...prev.palette, { name: "New Shade", hex: "#B8C9B0" }],
    }));
  };

  const removePaletteColor = (index: number) => {
    if (event.palette.length <= 1) return;
    setEvent((prev) => ({
      ...prev,
      palette: prev.palette.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    saveCustomEvent(event);
    setSaveNotice("Changes saved locally to browser storage!");
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleReset = () => {
    if (window.confirm("Reset all customizations back to the sample wedding configuration?")) {
      const def = resetToDefaultEvent();
      setEvent(def);
      setSaveNotice("Reset to default sample configuration.");
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  const handleDeleteRsvp = (id: string) => {
    const updated = deleteSampleRsvp(id);
    setRsvps(updated);
  };

  const handleClearRsvps = () => {
    if (window.confirm("Clear all local sample RSVPs?")) {
      clearAllSampleRsvps();
      setRsvps([]);
    }
  };

  const totalAttendees = rsvps
    .filter((r) => r.attendance === "attending")
    .reduce((sum, r) => sum + (r.adults + r.kids), 0);
  const attendingCount = rsvps.filter((r) => r.attendance === "attending").length;
  const declinedCount = rsvps.filter((r) => r.attendance === "not-attending").length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans flex flex-col">
      {/* Top Prototype Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>LOCAL PROTOTYPE:</strong> Changes are saved to your browser's localStorage for testing. No production database, authentication, or external API is attached.
          </span>
        </div>
        <a
          href="#/"
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline"
        >
          View Live Invitation <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase">
              MERCI Host Desk
            </span>
            <span className="text-xs text-stone-600">Local Configuration Mode</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            {event.childFullName} — Event Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition ${
              showLivePreview
                ? "bg-purple-700 text-white border-purple-800 shadow-inner"
                : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
            }`}
          >
            <Eye className="w-4 h-4" />
            {showLivePreview ? "Hide Preview" : "Split Preview"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50"
            title="Reset to default sample configuration"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </header>

      {/* Feedback Toast */}
      {saveNotice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2.5 text-sm flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Workspace Area: Left Editor / Right Live Preview (if active) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Column */}
        <div className={`flex-1 flex flex-col overflow-y-auto ${showLivePreview ? "max-w-2xl border-r border-stone-300" : "max-w-5xl mx-auto w-full"} p-6`}>
          {/* Navigation Tabs */}
          <nav className="flex space-x-2 border-b border-stone-200 pb-3 mb-6" aria-label="Dashboard Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("event")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "event"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              Event Basics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("colors")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "colors"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              Palette &amp; Visuals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "text"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              Headlines &amp; Copy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rsvps")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${
                activeTab === "rsvps"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <span>RSVP Inbox</span>
              <span className="bg-stone-300 text-stone-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {rsvps.length}
              </span>
            </button>
          </nav>

          {/* TAB 1: Event Basics */}
          {activeTab === "event" && (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b pb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Celebrant / Couple Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${formId}-childFullName`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Event / Couple Full Name
                    </label>
                    <input
                      id={`${formId}-childFullName`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.childFullName}
                      onChange={(e) => handleFieldChange("childFullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-headline`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Headline / Sub-title
                    </label>
                    <input
                      id={`${formId}-headline`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.headline}
                      onChange={(e) => handleFieldChange("headline", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-themeName`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Theme Name
                    </label>
                    <input
                      id={`${formId}-themeName`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.themeName}
                      onChange={(e) => handleFieldChange("themeName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-sealLetter`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Wax Seal Monogram
                    </label>
                    <input
                      id={`${formId}-sealLetter`}
                      type="text"
                      maxLength={3}
                      className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.sealLetter}
                      onChange={(e) => handleFieldChange("sealLetter", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b pb-2">
                  <Calendar className="w-4 h-4 text-purple-600" /> Date &amp; Time
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor={`${formId}-dateLabel`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Date Display
                    </label>
                    <input
                      id={`${formId}-dateLabel`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.dateLabel}
                      onChange={(e) => handleFieldChange("dateLabel", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-dayLabel`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Day of Week
                    </label>
                    <input
                      id={`${formId}-dayLabel`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.dayLabel}
                      onChange={(e) => handleFieldChange("dayLabel", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-timeLabel`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Time
                    </label>
                    <input
                      id={`${formId}-timeLabel`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.timeLabel}
                      onChange={(e) => handleFieldChange("timeLabel", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor={`${formId}-dateISO`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Countdown ISO Timestamp
                    </label>
                    <input
                      id={`${formId}-dateISO`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.dateISO}
                      onChange={(e) => handleFieldChange("dateISO", e.target.value)}
                    />
                    <span className="text-xs text-stone-600">Used by the live countdown clock (e.g. 2027-02-14T15:30:00+08:00)</span>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b pb-2">
                  <MapPin className="w-4 h-4 text-purple-600" /> Venue &amp; Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${formId}-venueName`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Venue Name
                    </label>
                    <input
                      id={`${formId}-venueName`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.venueName}
                      onChange={(e) => handleFieldChange("venueName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-venueHall`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Specific Hall / Area
                    </label>
                    <input
                      id={`${formId}-venueHall`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.venueHall}
                      onChange={(e) => handleFieldChange("venueHall", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-venueArea`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      City / Municipality
                    </label>
                    <input
                      id={`${formId}-venueArea`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.venueArea}
                      onChange={(e) => handleFieldChange("venueArea", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-mapsLink`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Google Maps URL
                    </label>
                    <input
                      id={`${formId}-mapsLink`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.mapsLink}
                      onChange={(e) => handleFieldChange("mapsLink", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: Palette & Visuals */}
          {activeTab === "colors" && (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" /> Event Color Palette Swatches
                  </h2>
                  <button
                    type="button"
                    onClick={addPaletteColor}
                    className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded border border-purple-200"
                  >
                    + Add Color
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.palette.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200"
                    >
                      <input
                        type="color"
                        value={color.hex}
                        aria-label={`Color picker for ${color.name || "swatch"}`}
                        onChange={(e) => handlePaletteChange(index, "hex", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          aria-label={`Name for swatch ${index + 1}`}
                          value={color.name}
                          onChange={(e) => handlePaletteChange(index, "name", e.target.value)}
                          placeholder="Color Name"
                          className="w-full text-xs font-semibold border border-stone-300 rounded px-2 py-1 bg-white"
                        />
                        <input
                          type="text"
                          aria-label={`Hex code for swatch ${index + 1}`}
                          value={color.hex}
                          onChange={(e) => handlePaletteChange(index, "hex", e.target.value)}
                          className="w-full text-xs font-mono border border-stone-300 rounded px-2 py-1 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePaletteColor(index)}
                        className="text-stone-400 hover:text-red-500 p-1"
                        title="Remove color"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 border-b pb-2">Social &amp; Closing Card</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${formId}-hashtag`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Event Hashtag
                    </label>
                    <input
                      id={`${formId}-hashtag`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.hashtag || ""}
                      onChange={(e) => handleFieldChange("hashtag", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-footerLine`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Footer Credit Line
                    </label>
                    <input
                      id={`${formId}-footerLine`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.footerLine || ""}
                      onChange={(e) => handleFieldChange("footerLine", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: Headlines & Copy */}
          {activeTab === "text" && (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 border-b pb-2">Hero &amp; Invitation Intro</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`${formId}-typingLine`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Hero Typing Line
                    </label>
                    <input
                      id={`${formId}-typingLine`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.typingLine}
                      onChange={(e) => handleFieldChange("typingLine", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-heroIntro`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Hero Intro Paragraph
                    </label>
                    <textarea
                      id={`${formId}-heroIntro`}
                      rows={3}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.heroIntro}
                      onChange={(e) => handleFieldChange("heroIntro", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-detailsLead`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Details Lead Paragraph
                    </label>
                    <textarea
                      id={`${formId}-detailsLead`}
                      rows={2}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.detailsLead}
                      onChange={(e) => handleFieldChange("detailsLead", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-stone-900 border-b pb-2">RSVP Copy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${formId}-rsvpTitle`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      RSVP Section Title
                    </label>
                    <input
                      id={`${formId}-rsvpTitle`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.rsvpTitle}
                      onChange={(e) => handleFieldChange("rsvpTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-rsvpLead`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      RSVP Deadline Lead
                    </label>
                    <input
                      id={`${formId}-rsvpLead`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.rsvpLead}
                      onChange={(e) => handleFieldChange("rsvpLead", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor={`${formId}-rsvpMessageLabel`} className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                      Message Field Label
                    </label>
                    <input
                      id={`${formId}-rsvpMessageLabel`}
                      type="text"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={event.rsvpMessageLabel}
                      onChange={(e) => handleFieldChange("rsvpMessageLabel", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: RSVP Inbox */}
          {activeTab === "rsvps" && (
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-sm">
                  <span className="text-2xl font-bold text-purple-700">{totalAttendees}</span>
                  <p className="text-xs uppercase font-semibold text-stone-600 mt-0.5">Total Guests Coming</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-sm">
                  <span className="text-2xl font-bold text-emerald-600">{attendingCount}</span>
                  <p className="text-xs uppercase font-semibold text-stone-600 mt-0.5">Attending Replies</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-sm">
                  <span className="text-2xl font-bold text-rose-500">{declinedCount}</span>
                  <p className="text-xs uppercase font-semibold text-stone-600 mt-0.5">Declined Replies</p>
                </div>
              </div>

              {/* RSVP Table / List */}
              <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" /> Received Replies ({rsvps.length})
                  </h2>
                  {rsvps.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearRsvps}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {rsvps.length === 0 ? (
                  <div className="p-12 text-center text-stone-500 text-sm">
                    No RSVP submissions recorded yet in local storage.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {rsvps.map((rsvp) => (
                      <div key={rsvp.id} className="p-4 hover:bg-stone-50 transition flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900">{rsvp.guestName}</span>
                            <span
                              className={`text-[0.68rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                                rsvp.attendance === "attending"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {rsvp.attendance === "attending" ? "Attending" : "Declined"}
                            </span>
                            {rsvp.attendance === "attending" && (
                              <span className="text-xs text-stone-600">
                                ({rsvp.adults} Adults, {rsvp.kids} Kids · Total: {rsvp.attendees})
                              </span>
                            )}
                          </div>
                          {rsvp.contact && (
                            <p className="text-xs text-stone-600">Contact: {rsvp.contact}</p>
                          )}
                          {rsvp.message && (
                            <p className="text-xs text-stone-700 italic bg-stone-100/80 p-2 rounded mt-1">
                              &ldquo;{rsvp.message}&rdquo;
                            </p>
                          )}
                          <p className="text-[0.65rem] text-stone-600">
                            Submitted: {new Date(rsvp.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRsvp(rsvp.id)}
                          className="text-stone-400 hover:text-red-600 p-1.5"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* Live Preview Column */}
        {showLivePreview && (
          <div className="flex-1 bg-stone-900 flex flex-col h-full border-l border-stone-300">
            <div className="bg-stone-800 text-stone-200 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Live Invitation Preview
              </span>
              <a
                href="#/"
                target="_blank"
                rel="noreferrer"
                className="text-purple-300 hover:text-purple-100 flex items-center gap-1"
              >
                Open in Full Window <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="min-h-full">
                <InvitationApp event={event} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
