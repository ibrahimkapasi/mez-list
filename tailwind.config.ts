import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B9D",
        secondary: "#FF9E6D",
        accent: "#A88BFF",
        background: "#FFF9FB",
        "card-bg": "#FFFFFF",
        text: "#333333",
        "text-light": "#777777",
        success: "#6BFFB8",
        warning: "#FFD166",
        error: "#FF6B6B",
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"],
        heading: ["Poppins", "Montserrat", "sans-serif"],
        romantic: ["Dancing Script", "cursive"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
