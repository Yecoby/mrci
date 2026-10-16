import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { InvitationApp } from "./components/invitation/InvitationApp";
import { HostDashboard } from "./components/host/HostDashboard";
import { loadSavedEvent } from "./lib/event-storage";
import "./styles.css";

function App() {
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const path = window.location.pathname;
    if (hash === "/host" || hash === "host" || path === "/host") return "host";
    return "guest";
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const path = window.location.pathname;
      if (hash === "/host" || hash === "host" || path === "/host") {
        setRoute("host");
      } else {
        setRoute("guest");
      }
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (route === "host") {
    return <HostDashboard />;
  }

  // Load saved customizations if any exist, otherwise sampleWeddingEvent
  const savedEvent = loadSavedEvent();

  return (
    <div className="relative">
      {/* Floating Host Desk Switcher with z-[1000] to sit cleanly above envelope opening */}
      <div className="fixed top-3 right-3 z-[1000]">
        <a
          href="#/host"
          className="bg-stone-900/90 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md border border-stone-600 transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Host Desk</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </a>
      </div>

      <InvitationApp event={savedEvent} />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
