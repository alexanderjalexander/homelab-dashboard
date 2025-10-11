/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { },
  screens: {
    sm: "480px",
    md: "720px",
    lg: "920px",
    xl: "1280px",
    "2xl": "1536px",
  },
  darkMode: "class",
}