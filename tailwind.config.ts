import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // Replaced, not extended: the stock shadow scale is gone on purpose. Depth on this
    // site is a hairline, never a drop shadow or a glow. Focus rings are untouched
    // (ring-* does not read this scale).
    boxShadow: {
      none: "none",
      hairline: "0 0 0 1px hsl(var(--border))",
    },
    dropShadow: {
      none: "0 0 #0000",
    },
    extend: {
      fontFamily: {
        // Set once here; components use font-display / font-sans / font-mono, never a
        // literal family. Self-hosted through @fontsource — see src/index.css.
        // "Instrument Serif Fallback" is Georgia re-measured to the webfont (src/fonts.css).
        display: ['"Instrument Serif"', '"Instrument Serif Fallback"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans Variable"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
      },
      // The site's three motion curves (see --ease-* in src/index.css and EASE in
      // src/lib/motion.ts): ease-expo-out, ease-quart-out, ease-expo-in-out. expo-out at
      // 300ms is the DEFAULT, so a bare `transition-colors` is already on the house
      // curve; entrance choreography states its own longer durations.
      transitionTimingFunction: {
        DEFAULT: "var(--ease-expo-out)",
        "expo-out": "var(--ease-expo-out)",
        "quart-out": "var(--ease-quart-out)",
        "expo-in-out": "var(--ease-expo-in-out)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // Brand extras — see src/index.css for what each is for.
        // sage: a light tint of the accent, for small signals on ink only.
        sage: "hsl(var(--sage) / <alpha-value>)",
        tile: {
          DEFAULT: "hsl(var(--tile) / <alpha-value>)",
          foreground: "hsl(var(--tile-foreground) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          foreground: "hsl(var(--ink-foreground) / <alpha-value>)",
          muted: "hsl(var(--ink-muted) / <alpha-value>)",
          border: "hsl(var(--ink-border) / <alpha-value>)",
        },
      },
      // One radius: 2px. Every named step resolves to it, so a stray rounded-lg cannot
      // bring a soft card back. rounded-full stays for the few true circles (a node on
      // a thread, the cursor ring) — never for a button.
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
        "3xl": "var(--radius)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
