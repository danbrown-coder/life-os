import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// This file is web-only. It customizes the static HTML wrapper that
// Expo Router serves on web. We inject Google Fonts (Fraunces, Geist,
// Geist Mono), set the page background to canvas so there's no white
// flash on load, and disable text scaling so our typography stays tight.

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800,30;9..144,500,30&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
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
  /* Custom scrollbar to match the carbon canvas */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: #0E0D0B; }
  ::-webkit-scrollbar-thumb { background: #2A2722; border-radius: 0; }
  ::-webkit-scrollbar-thumb:hover { background: #4A463E; }
  /* Selection */
  ::selection { background: #C01F26; color: #F1ECE2; }
`;
