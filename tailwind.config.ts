import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Theme tokens — RGB-channel vars keep opacity modifiers working
        // (bg-bg/85, text-text-2/70, ...). card/card-2/border are full-value
        // vars: never use opacity modifiers on them.
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        border: "var(--border)",
        card: "var(--card)",
        "card-2": "var(--card-2)",
        text: "rgb(var(--text-rgb) / <alpha-value>)",
        "text-2": "rgb(var(--text-2-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "#5B8CFF",
          50: "#EEF3FF",
          100: "#DDE7FF",
          200: "#BCD0FF",
          300: "#9AB8FF",
          400: "#79A0FF",
          500: "#5B8CFF",
          600: "#3B82F6",
          700: "#2563EB",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        accent: {
          DEFAULT: "#3B82F6",
          purple: "#7C3AED",
          cyan: "#00D4FF",
        },
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "Space Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg,#3B82F6 0%,#5B8CFF 35%,#7C3AED 100%)",
        "gradient-brand-deep":
          "linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#6D28D9 100%)",
        "gradient-electric": "linear-gradient(135deg,#5B8CFF 0%,#7C3AED 100%)",
        "gradient-glow": "linear-gradient(135deg,#00D4FF 0%,#3B82F6 100%)",
        "gradient-dark": "linear-gradient(180deg,#050816 0%,#0F172A 100%)",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(91,140,255,0.5)",
        "glow-purple": "0 0 60px -10px rgba(124,58,237,0.5)",
        soft: "0 10px 40px -10px rgba(0,0,0,0.6)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-slow": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drift: {
          "0%,100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(40px,-30px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        drift: "drift 32s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
