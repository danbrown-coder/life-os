/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#0E0D0B",
        raised: "#15130F",
        sunken: "#0A0907",
        bone: {
          DEFAULT: "#F1ECE2",
          50: "#FAF7F1",
          100: "#F1ECE2",
          200: "#D9D2C2",
          300: "#B6AE9F",
          500: "#8C8474",
          700: "#6E665A",
          900: "#3A3530",
        },
        rule: {
          DEFAULT: "#2A2722",
          soft: "#1F1C18",
          loud: "#4A463E",
        },
        lacquer: {
          DEFAULT: "#C01F26",
          dim: "#7B181C",
          ink: "#3F0E10",
        },
        sage: "#7DA67A",
        mustard: "#E2A53C",
        domain: {
          fitness: "#C7B8FF",
          nutrition: "#E2A53C",
          study: "#9CC9D6",
          bjj: "#C01F26",
          recovery: "#7DA67A",
          social: "#E2A6BB",
          hobby: "#B6AE9F",
          work: "#8C8474",
          sleep: "#9395C7",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        micro: "0.16em",
        kicker: "0.12em",
        loose: "0.04em",
      },
      fontSize: {
        "2xs": ["10px", "14px"],
        "micro": ["11px", "14px"],
      },
    },
  },
  plugins: [],
};
