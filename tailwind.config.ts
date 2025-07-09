import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: "#252525",
        dark_gray: "#8D9192",
        light_gray: "#EDEDED",
        dark_blue: "#28809A",
      },
    },
  },
  plugins: [],
} satisfies Config;
