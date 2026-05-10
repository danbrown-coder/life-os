import { View, Platform } from "react-native";

// A subtle paper-grain overlay rendered above the canvas. Web uses an
// inline SVG turbulence (cheap, GPU-friendly). Native falls back to a
// near-invisible tint to keep the perf budget honest.
export function Grain({ opacity = 0.06 }: { opacity?: number }) {
  if (Platform.OS !== "web") {
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(241, 236, 226, 0.012)",
        }}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      // @ts-expect-error web style
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        opacity,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`,
        backgroundSize: "180px 180px",
      }}
    />
  );
}

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <filter id='n' x='0' y='0'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
    <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/>
</svg>`;
