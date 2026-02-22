/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{tsx,ts,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 100ms ease",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar")
  ],
}
