// Reanimated 3.16's logger module reads `globalThis.__reanimatedLoggerConfig`
// at top-level import. The value is normally injected by the
// `react-native-reanimated/plugin` Babel plugin, which we deliberately
// don't run (combining it with `react-native-worklets/plugin` previously
// broke the build on this RN 0.76 / RN-Web 0.19 stack).
//
// If any module in the bundle transitively requires the logger (e.g. via
// react-native-css-interop) the missing global throws an uncaught error
// at boot. Defining the global here as a side effect means the module
// loads safely regardless of who requires it.
//
// This must be imported first in app/_layout.tsx so it runs before any
// other module evaluates Reanimated.

const g: any =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
      ? window
      : {};

if (!g.__reanimatedLoggerConfig) {
  g.__reanimatedLoggerConfig = {
    logFunction: (data: { level?: string; message?: string }) => {
      const level = data?.level ?? "log";
      const msg = data?.message ?? "";
      // Best effort — match the levels Reanimated emits.
      if (level === "error" && typeof console !== "undefined") {
        console.error(msg);
      } else if (level === "warn" && typeof console !== "undefined") {
        console.warn(msg);
      } else if (typeof console !== "undefined") {
        console.log(msg);
      }
    },
    level: "warn",
    strict: false,
  };
}

export {};
