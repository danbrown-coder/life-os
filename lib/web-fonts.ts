import { Platform } from "react-native";

// On web, the +html.tsx wrapper only fires in static-rendering mode.
// We're on web.output: "single", so we inject the Google Fonts stylesheet
// at startup. Idempotent — safe to call repeatedly. No-op on native.
let injected = false;

export function ensureWebFonts() {
  if (injected) return;
  if (Platform.OS !== "web") return;
  if (typeof document === "undefined") return;
  injected = true;

  const head = document.head;

  // Preconnect for faster font loads.
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  head.appendChild(pre1);

  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "";
  head.appendChild(pre2);

  // Fraunces (variable, with optical sizing + soft axis), Geist, Geist Mono.
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2" +
    "?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700" +
    "&family=Geist:wght@400;500;600;700" +
    "&family=Geist+Mono:wght@400;500;600" +
    "&display=swap";
  head.appendChild(link);

  // Editorial canvas + selection + scrollbar styling. Kept here so we
  // don't need a global stylesheet edit.
  const style = document.createElement("style");
  style.id = "lifeos-editorial-base";
  style.textContent = `
    html, body, #root {
      background-color: #0E0D0B;
      color: #F1ECE2;
    }
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-family: "Geist", system-ui, sans-serif;
    }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #0E0D0B; }
    ::-webkit-scrollbar-thumb { background: #2A2722; }
    ::-webkit-scrollbar-thumb:hover { background: #4A463E; }
    ::selection { background: #C01F26; color: #F1ECE2; }
    /* Strip web focus outlines on inputs — we replace them with a
       lacquer rule in the Input component. */
    input:focus, textarea:focus { outline: none !important; }
  `;
  head.appendChild(style);
}
