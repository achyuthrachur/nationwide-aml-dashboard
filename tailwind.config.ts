import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nationwide brand primaries
        nw: {
          navy:   '#003571',
          blue:   '#1C57A5',
          mid:    '#0065B3',
          light:  '#E8F1FB',
          xlight: '#F0F4F9',
        },
        // Dashboard status palette
        breach: '#E61030',
        // Surface colors
        surface: {
          page:  '#F5F7FA',
          card:  '#FFFFFF',
          input: '#FFFFFF',
          muted: '#F0F4F9',
        },
        // Text hierarchy
        text: {
          primary:   '#0A1628',
          secondary: '#4A5D75',
          muted:     '#8699AF',
          link:      '#0065B3',
          inverse:   '#FFFFFF',
        },
        // Borders
        border: {
          DEFAULT: '#D0D9E8',
          light:   '#E8EDF2',
          muted:   '#F0F2F5',
        },
        // Status semantic
        "status-green":    "#16A34A",
        "status-green-dark":"#1A6632",
        "status-green-bg": "#E6F4EA",
        "status-amber":    "#D97706",
        "status-amber-bg": "#FEF3C7",
        "status-orange":   "#F97316",
        "status-orange-bg":"#FFF3E0",
        "status-red":      "#E61030",
        "status-red-bg":   "#FDEAED",
        "status-neutral":  "#8699AF",
        // Data viz
        "viz-rel":     "#0065B3",
        "viz-trx":     "#C45A00",
        "viz-rel-bg":  "#E8F1FB",
        "viz-trx-bg":  "#FFF3E0",
      },
      fontFamily: {
        sans:      ["Open Sans", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        condensed: ["IBM Plex Sans Condensed", "Arial Narrow", "sans-serif"],
        mono:      ["IBM Plex Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
      },
      keyframes: {
        "pulse-border": {
          "0%, 100%": { borderColor: "rgba(230,16,48,0.5)" },
          "50%":       { borderColor: "rgba(230,16,48,1.0)" },
        },
        "fade-in-down": {
          "0%":   { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "row-expand": {
          "0%":   { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-border":   "pulse-border 2s ease-in-out infinite",
        "fade-in-down":   "fade-in-down 0.15s ease-out forwards",
        "row-expand":     "row-expand 0.25s ease-out",
      },
      boxShadow: {
        card:      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md": "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)",
        "card-lg": "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
        "red-glow":"0 4px 12px rgba(230,16,48,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
