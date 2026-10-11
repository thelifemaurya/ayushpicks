import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg: "#FBF9F5", s1: "#F5F1E9", s2: "#EEE9DE", s3: "#E4DED1", line: "#E4DED2", muted: "#6B665C", ink: "#1E1C18", accent: "#4B5A3F", gold: "#B08D57" },
    boxShadow: { soft: "0 1px 2px rgba(30,28,24,.04), 0 10px 28px -12px rgba(30,28,24,.12)" },
    fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"], display: ["var(--font-display)", "Georgia", "serif"] },
    keyframes: { rise: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } }, pop: { "0%": { opacity: "0", transform: "scale(.94)" }, "60%": { transform: "scale(1.04)" }, "100%": { opacity: "1", transform: "none" } }, slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "none" } }, slideUp: { from: { transform: "translateY(100%)" }, to: { transform: "none" } }, backdrop: { from: { opacity: "0" }, to: { opacity: "1" } }, page: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } }, fade: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } } },
    animation: { fade: "fade .18s ease-out", rise: "rise .8s cubic-bezier(.2,.7,.2,1) both", pop: "pop .35s cubic-bezier(.2,.8,.2,1) both", "slide-in": "slideIn .35s cubic-bezier(.2,.8,.2,1)", "slide-up": "slideUp .35s cubic-bezier(.2,.8,.2,1)", backdrop: "backdrop .25s ease-out", page: "page .3s ease-out" },
  } },
} satisfies Config;
