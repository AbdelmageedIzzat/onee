import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Tajawal", "system-ui", "sans-serif"] },
      colors: {
        primary: { DEFAULT: "#0ea5e9" },
        accent: { DEFAULT: "#10b981" }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
export default config;
